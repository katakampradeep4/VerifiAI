const axios = require('axios');

async function callLLM({ prompt, model }) {
  const url = process.env.LLM_API_URL;
  const key = process.env.LLM_API_KEY;
  const type = (process.env.LLM_API_TYPE || 'openai_chat'); // "openai_chat" or "text_generation"

  if(!url || !key) throw new Error('LLM_API_URL or LLM_API_KEY not configured');

  if(type === 'openai_chat'){
    // send OpenAI-compatible chat request
    const body = {
      model: model || process.env.LLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0
    };
    const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
    const resp = await axios.post(url, body, { headers, timeout: 120000 });
    // Attempt to read choices[0].message.content or other fields
    if(resp.data?.choices && resp.data.choices[0]?.message?.content) return resp.data.choices[0].message.content;
    if(resp.data?.choices && resp.data.choices[0]?.text) return resp.data.choices[0].text;
    return JSON.stringify(resp.data);
  } else {
    // text-generation style (e.g., HF / other inference endpoints)
    const body = { inputs: prompt, parameters: { max_new_tokens: 400 } };
    const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
    const resp = await axios.post(url, body, { headers, timeout: 120000 });
    // adapt to different response shapes
    if(typeof resp.data === 'string') return resp.data;
    if(Array.isArray(resp.data) && resp.data[0]?.generated_text) return resp.data[0].generated_text;
    if(resp.data.generated_text) return resp.data.generated_text;
    return JSON.stringify(resp.data);
  }
}

module.exports = { callLLM };
