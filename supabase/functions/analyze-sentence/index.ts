// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

declare const Deno: { env: { get(key: string): string | undefined } };

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { sentence, action } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settings, error: settingsError } = await supabaseClient
      .from("app_settings")
      .select("key, value");

    if (settingsError) throw new Error("Could not fetch AI settings: " + settingsError.message);

    const getSetting = (k: string) => settings?.find((s: any) => s.key === k)?.value;
    const provider = getSetting("ai_provider") || "google";
    const modelId = getSetting("ai_model_id") || getSetting("ai_model") || "gemini-1.5-flash";
    const systemPrompt = getSetting("ai_system_prompt") || "আপনি একজন আরবি ব্যাকরণ বিশেষজ্ঞ।";

    console.log("[analyze-sentence] provider:", provider, "model:", modelId);

    if (action === "parse_tarkib") {
      const tarkibPrompt = `Analyze the Arabic sentence: "${sentence}"
Return ONLY a valid JSON array (no markdown, no explanation).
Each object: {"id":"1","text":"word","role":"grammatical role","level":0,"children":[]}
level 0 = individual words, level 1+ = phrase groups that contain children.
Example for "ذهب الطالب":
[{"id":"1","text":"ذهب","role":"فعل","level":0,"children":[]},{"id":"2","text":"الطالب","role":"فاعل","level":0,"children":[]},{"id":"3","text":"ذهب الطالب","role":"جملة فعلية","level":1,"children":["1","2"]}]`;

      let apiKey = "";
      let url = "";
      let fetchBody: any = {};
      let fetchHeaders: Record<string, string> = { "Content-Type": "application/json" };

      if (provider === "google") {
        apiKey = getSetting("gemini_api_key") || "";
        if (!apiKey) throw new Error("Gemini API Key সেট করা হয়নি। Admin Settings থেকে সেট করুন।");
        url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        fetchBody = { contents: [{ parts: [{ text: systemPrompt + "\n\n" + tarkibPrompt }] }] };
      } else if (provider === "openai") {
        apiKey = getSetting("openai_api_key") || "";
        if (!apiKey) throw new Error("OpenAI API Key সেট করা হয়নি। Admin Settings থেকে সেট করুন।");
        url = "https://api.openai.com/v1/chat/completions";
        fetchHeaders["Authorization"] = `Bearer ${apiKey}`;
        fetchBody = { model: modelId, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: tarkibPrompt }], temperature: 0.1 };
      } else if (provider === "openrouter") {
        apiKey = getSetting("openrouter_api_key") || "";
        if (!apiKey) throw new Error("OpenRouter API Key সেট করা হয়নি। Admin Settings থেকে সেট করুন।");
        url = "https://openrouter.ai/api/v1/chat/completions";
        fetchHeaders["Authorization"] = `Bearer ${apiKey}`;
        fetchHeaders["HTTP-Referer"] = "https://nahushikhi.app";
        fetchBody = { model: modelId, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: tarkibPrompt }] };
      } else {
        throw new Error(`Unknown provider: ${provider}`);
      }

      console.log("[analyze-sentence] Calling:", url.split("?")[0]);

      const response = await fetch(url, {
        method: "POST",
        headers: fetchHeaders,
        body: JSON.stringify(fetchBody)
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error("[analyze-sentence] AI Error:", JSON.stringify(responseData));
        throw new Error(responseData.error?.message || `AI returned status ${response.status}`);
      }

      let rawText = "";
      if (provider === "google") {
        rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      } else {
        rawText = responseData.choices?.[0]?.message?.content || "[]";
      }

      console.log("[analyze-sentence] Raw AI response length:", rawText.length);

      // Strip markdown fences and find the JSON array
      let jsonStr = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      // Find the array boundaries
      const arrStart = jsonStr.indexOf("[");
      const arrEnd = jsonStr.lastIndexOf("]");
      if (arrStart !== -1 && arrEnd !== -1) {
        jsonStr = jsonStr.substring(arrStart, arrEnd + 1);
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
      } catch {
        console.error("[analyze-sentence] JSON parse failed. Raw:", jsonStr.substring(0, 200));
        throw new Error("AI থেকে সঠিক JSON পাওয়া যায়নি। পুনরায় চেষ্টা করুন।");
      }

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("বিশ্লেষণে কোনো নোড পাওয়া যায়নি।");
      }

      console.log("[analyze-sentence] Success! Nodes:", parsed.length);

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("[analyze-sentence] Error:", e.message);
    return new Response(JSON.stringify({ error: e.message || "Internal Server Error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
