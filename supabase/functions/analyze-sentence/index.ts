// @ts-nocheck — This file runs on Supabase's Deno Edge Runtime, not the local TypeScript compiler.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { sentence, action, mode } = await req.json();
    const resolvedAction = action || mode;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: settings, error: settingsError } = await supabaseClient
      .from("app_settings")
      .select("key, value");

    if (settingsError) {
      console.error("[analyze-sentence] Settings error:", settingsError.message);
      throw new Error("Could not fetch AI settings: " + settingsError.message);
    }

    const getSetting = (k: string) => settings?.find((s: any) => s.key === k)?.value;
    const provider = getSetting("ai_provider") || "google";
    const modelId = getSetting("ai_model_id") || getSetting("ai_model") || "gemini-2.5-flash";
    const systemPrompt = getSetting("ai_system_prompt") || "আপনি একজন আরবি ব্যাকরণ বিশেষজ্ঞ।";

    console.log("[analyze-sentence] provider:", provider, "model:", modelId, "action:", resolvedAction);

    // --- Helper: Call AI provider ---
    async function callAI(userPrompt: string): Promise<string> {
      let apiKey = "";
      let url = "";
      let fetchBody: any = {};
      let fetchHeaders: Record<string, string> = { "Content-Type": "application/json" };
        apiKey = getSetting("gemini_api_key") || "";
        if (!apiKey) throw new Error("Gemini API Key সেট করা হয়নি। Admin Settings থেকে সেট করুন।");
        url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
        fetchBody = {
          contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
        };
      } else if (provider === "openai") {
        apiKey = getSetting("openai_api_key") || "";
        if (!apiKey) throw new Error("OpenAI API Key সেট করা হয়নি। Admin Settings থেকে সেট করুন।");
        url = "https://api.openai.com/v1/chat/completions";
        fetchHeaders["Authorization"] = `Bearer ${apiKey}`;
        fetchBody = { model: modelId, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: 0.1, response_format: { type: "json_object" } };
      } else if (provider === "openrouter") {
        apiKey = getSetting("openrouter_api_key") || "";
        if (!apiKey) throw new Error("OpenRouter API Key সেট করা হয়নি। Admin Settings থেকে সেট করুন।");
        url = "https://openrouter.ai/api/v1/chat/completions";
        fetchHeaders["Authorization"] = `Bearer ${apiKey}`;
        fetchHeaders["HTTP-Referer"] = "https://nahushikhi.app";
        fetchBody = { model: modelId, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], response_format: { type: "json_object" } };
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
        console.error("[analyze-sentence] AI API Error:", response.status, JSON.stringify(responseData));
        const errMsg = responseData.error?.message || responseData.error?.status || `AI API returned status ${response.status}`;
        throw new Error(errMsg);
      }

      let rawText = "";
      if (provider === "google") {
        if (responseData.candidates?.[0]?.finishReason === "SAFETY") {
          throw new Error("AI নিরাপত্তা ফিল্টারে বাক্যটি ব্লক হয়েছে। অন্য বাক্য চেষ্টা করুন।");
        }
        rawText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } else {
        rawText = responseData.choices?.[0]?.message?.content || "";
      }

      if (!rawText || rawText.trim().length === 0) {
        throw new Error("AI থেকে কোনো উত্তর পাওয়া যায়নি। পুনরায় চেষ্টা করুন।");
      }

      return rawText;
    }

    // --- Action: parse_tarkib ---
    if (resolvedAction === "parse_tarkib") {
      const tarkibPrompt = `Arabic Tarkib Tree Analysis: "${sentence}"
Requirement: Break the sentence down into words (level 0) AND combine them into grammatical phrases (level 1, 2, 3...) until the full sentence is formed (level Max).
Format: Return ONLY a valid JSON object containing a "nodes" array. NO markdown, NO explanation.
Structure: { "nodes": [ {"id":"1","text":"Arabic Text","role":"Arabic Role","level":0,"children":["child_id1"]} ] }

Example for "الحمد لله":
{
  "nodes": [
    {"id":"w1","text":"الحمد","role":"مبتداء","level":0,"children":[]},
    {"id":"w2","text":"لـ","role":"حرف جار","level":0,"children":[]},
    {"id":"w3","text":"الله","role":"لفظ الجلالة","level":0,"children":[]},
    {"id":"p1","text":"لله","role":"جار ومجرور","level":1,"children":["w2","w3"]},
    {"id":"p2","text":"لله (متعلق)","role":"خبر (شبه جملة)","level":2,"children":["p1"]},
    {"id":"s1","text":"الحمد لله","role":"جملة اسمية","level":3,"children":["w1","p2"]}
  ]
}
Roles: مضاف إليه, مضاف, صفت, موصوف, جار, مجرور, مبتداء, خبر, جملة اسمية.
CRITICAL: You MUST include children IDs to form the tree. Link all words to the final sentence.`;

      const rawText = await callAI(tarkibPrompt);

      console.log("[analyze-sentence] Raw AI response length:", rawText.length);

      let parsed;
      try {
        parsed = JSON.parse(rawText.trim());
      } catch(e) {
        // Fallback robust extraction
        let jsonStr = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
        const objStart = jsonStr.indexOf("{");
        const objEnd = jsonStr.lastIndexOf("}");
        if (objStart !== -1 && objEnd !== -1) {
          jsonStr = jsonStr.substring(objStart, objEnd + 1);
        }
        parsed = JSON.parse(jsonStr);
      }
      
      // Ensure it is returned in a consistent structure
      if (Array.isArray(parsed)) {
        parsed = { nodes: parsed };
      } else if (parsed && !parsed.nodes) {
        // If the AI returned an object but used a different key like "tarkib" or "analysis"
        const possibleArrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
        if (possibleArrayKey) {
          parsed = { nodes: parsed[possibleArrayKey] };
        } else {
           parsed = { nodes: [] };
        }
      }

      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Action: tahkik (Word Analysis) ---
    if (resolvedAction === "tahkik") {
      const tahkikPrompt = `আরবি শব্দ বিশ্লেষণ (তাহকিক): "${sentence}"

শব্দটি বিশ্লেষণ করে নিচের সুনির্দিষ্ট ফরম্যাটে উত্তর দাও। ইমেজে দেওয়া উদাহরণ অনুসরণ করো:

যদি শব্দটি فعل (Verb) হয়:
-----------------------
শব্দ: ${sentence}
صیغة (Sigha) = ...
بحث (Bahth) = ...
باب (Bab) = ...
مصدر (Masdar) = ...
ماده (Madda) = ...
جنس (Jins) = ...

যদি শব্দটি اسم (Noun) হয়:
-----------------------
শব্দ: ${sentence}
(যদি একবচন হয়):
جمع (Plural) = ...
معنى (Meaning) = ...

(যদি বহুবচন হয়):
واحد (Singular) = ...
معنى (Meaning) = ...

নির্দেশনা:
১. শুধুমাত্র প্রাসঙ্গিক অংশটি দেখাও (অর্থাৎ فعل হলে শুধু فعل এর অংশ, اسم হলে শুধু اسم এর অংশ)।
২. উত্তর বাংলায় দাও (আরবি টার্মগুলো আরবিতে রেখে)।
৩. কোনো অতিরিক্ত কথা বা ব্যাখ্যা দিও না।`;

      const rawText = await callAI(tahkikPrompt);

      return new Response(JSON.stringify({ analysis: rawText.trim() }), {
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
