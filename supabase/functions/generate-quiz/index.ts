import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { chapterId, chapterTitle, existingQuestions, count } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const prompt = `You are an Arabic grammar (Nahw/Sarf) quiz generator for Bengali-speaking students.

Generate exactly ${count || 5} MCQ questions for the chapter: "${chapterTitle || 'Arabic Grammar'}".

Rules:
- Questions must be in Bengali
- Each question must have exactly 4 options
- Questions must NOT duplicate these existing questions: ${JSON.stringify(existingQuestions || [])}
- Include explanation in Bengali for each answer
- Focus on Arabic grammar concepts (Nahw & Sarf)

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "question_text": "প্রশ্ন বাংলায়",
      "options": ["অপশন ১", "অপশন ২", "অপশন ৩", "অপশন ৪"],
      "correct_answer": "সঠিক অপশন",
      "explanation": "ব্যাখ্যা বাংলায়"
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a precise Arabic grammar quiz generator. Always return valid JSON." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_questions",
            description: "Generate quiz questions",
            parameters: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      question_text: { type: "string" },
                      options: { type: "array", items: { type: "string" } },
                      correct_answer: { type: "string" },
                      explanation: { type: "string" },
                    },
                    required: ["question_text", "options", "correct_answer", "explanation"],
                  },
                },
              },
              required: ["questions"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "generate_questions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const args = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(args), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ questions: [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-quiz error:", e);
    return new Response(JSON.stringify({ error: e.message, questions: [] }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
