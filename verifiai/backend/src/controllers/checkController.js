const express = require('express');
const router = express.Router();
const { crawlProduct } = require('../services/crawler');
const { callLLM } = require('../services/llmClient');
const { regexExtract } = require('../services/extractor');
const { buildPrompt } = require('../utils/promptBuilder');
const Rule = require('../models/Rule');
const Report = require('../models/Report');

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });

    // 1. Crawl product page
    const product = await crawlProduct(url);

    // ✂️ Truncate long fields before LLM
    const safeProduct = {
      title: (product.title || '').slice(0, 300),
      description: (product.description || '').slice(0, 2000),
      specs: product.specs || {},
    };

    // 2. Load rules
    const rules = await Rule.find({}).lean();

    // 3. Build prompt
    const prompt = buildPrompt(safeProduct, rules);

    // 4. Call LLM
    let llmText;
    try {
      const response = await callLLM({ prompt, model: process.env.LLM_MODEL });

      if (response?.choices && response.choices[0]?.message?.content) {
        llmText = response.choices[0].message.content.trim();
      } else if (typeof response === 'string') {
        llmText = response;
      } else {
        throw new Error('Unexpected LLM response format');
      }
    } catch (err) {
      console.error('❌ LLM call failed:', err.message || err);
      // fallback
      const fallback = regexExtract((safeProduct.description || '') + '\n' + (safeProduct.title || ''));
      const reportObj = { url, scraped: safeProduct, extraction: fallback, checks: [], finalVerdict: 'UNCERTAIN' };
      const saved = await new Report(reportObj).save();
      return res.json({ report: saved, fallback: true, error: 'LLM call failed' });
    }

    // 5. Try to parse JSON
    let parsed;
    try {
      parsed = JSON.parse(llmText);
    } catch (err) {
      // salvage JSON from mixed text
      const jStart = llmText.indexOf('{');
      const jEnd = llmText.lastIndexOf('}');
      const jsonText = jStart >= 0 && jEnd >= 0 ? llmText.slice(jStart, jEnd + 1) : null;
      if (jsonText) {
        try {
          parsed = JSON.parse(jsonText);
        } catch (err2) {
          console.warn('⚠️ LLM output not valid JSON, falling back to regex');
        }
      }
    }

    // 6. Save final report
    const reportObj = {
      url,
      scraped: safeProduct,
      extraction: parsed?.extractions || {},
      checks: parsed?.checks || [],
      finalVerdict: parsed?.finalVerdict || 'UNCERTAIN',
    };
    const saved = await new Report(reportObj).save();

    return res.json({ report: saved, rawModel: llmText });

  } catch (err) {
    console.error('❌ Server error:', err);
    res.status(500).json({ error: err.message || 'server error' });
  }
});

module.exports = router;
