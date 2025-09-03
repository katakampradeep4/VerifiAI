const axios = require("axios");

async function callLLM({ prompt, model }) {
  const url = process.env.LLM_API_URL || "https://openrouter.ai/api/v1/chat/completions";
  const key = (process.env.LLM_API_KEY || "").trim();
  const type = (process.env.LLM_API_TYPE || "openai_chat").trim();

  if (!url || !key) {
    throw new Error("❌ LLM_API_URL or LLM_API_KEY not configured");
  }

  try {
    if (type === "openai_chat") {
      const body = {
        model: model || process.env.LLM_MODEL || "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a compliance checker AI. Always output JSON." },
          { role: "user", content: prompt },
        ],
        max_tokens: 800,
        temperature: 0,
      };

      const headers = {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "VerifiAI Compliance Checker",
      };

      const resp = await axios.post(url, body, { headers, timeout: 120000 });
      return resp.data?.choices?.[0]?.message?.content?.trim() || JSON.stringify(resp.data);
    } else {
      const body = { inputs: prompt, parameters: { max_new_tokens: 400 } };

      const headers = {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "VerifiAI Compliance Checker",
      };

      const resp = await axios.post(url, body, { headers, timeout: 120000 });
      if (typeof resp.data === "string") return resp.data.trim();
      if (Array.isArray(resp.data) && resp.data[0]?.generated_text) return resp.data[0].generated_text.trim();
      if (resp.data.generated_text) return resp.data.generated_text.trim();
      return JSON.stringify(resp.data);
    }
  } catch (err) {
    if (err.response) {
      console.error("❌ LLM API error:", err.response.status, err.response.data);
      throw new Error(`LLM call failed: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
    }
    console.error("❌ LLM client error:", err.message);
    throw err;
  }
}

module.exports = { callLLM };
