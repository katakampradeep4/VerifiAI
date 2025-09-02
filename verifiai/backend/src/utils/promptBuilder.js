function buildPrompt(product, rules){
  const rulesText = (rules || []).map(r => `${r.code}: ${r.description}`).join('\n');
  return `
You are a JSON-only extractor and validator. Use the RULES below to check the PRODUCT. Output ONLY valid JSON with this schema:

{
  "product": {"title":"...", "description":"...", "price":"..."},
  "extractions": {"MRP":"...", "NetQuantity":"...", "Manufacturer":"...", "CountryOfOrigin":"...", "Date":"..."},
  "checks": [
    {"ruleCode":"R01","ruleDescription":"...","compliant": true|false,"evidence":"..."}
  ],
  "finalVerdict":"COMPLIANT" | "NON_COMPLIANT" | "UNCERTAIN"
}

RULES:
${rulesText}

PRODUCT:
Title: ${product.title || ''}
Description: ${product.description || ''}
Price: ${product.price || ''}

IMPORTANT: Return only JSON; no extra commentary. If you cannot find a field, set it to null.
  `.trim();
}

module.exports = { buildPrompt };
