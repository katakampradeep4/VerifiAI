const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // or GROK_API_KEY, etc.
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
});

async function getComplianceSuggestions(report) {
  const prompt = `
You are a compliance expert for e-commerce product listings.
Here is the compliance report (JSON):

${JSON.stringify(report, null, 2)}

Please summarize whether the product is compliant with Indian Legal Metrology rules.
Also provide 3-5 specific improvement suggestions for missing or incorrect fields.
`;

  try {
    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content;
  } catch (err) {
    console.error("LLM Error:", err);
    return "Could not generate AI suggestions.";
  }
}

module.exports = { getComplianceSuggestions };
