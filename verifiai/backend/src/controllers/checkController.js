const express = require('express');
const router = express.Router();
const { crawlProduct } = require('../services/crawler');
const { callLLM } = require('../services/llmClient');
const { regexExtract } = require('../services/extractor');
const { buildPrompt } = require('../utils/promptBuilder');
const Rule = require('../models/Rule');
const Report = require('../models/Report');

router.post('/', async (req,res) => {
  try {
    const { url } = req.body;
    if(!url) return res.status(400).json({ error: 'url required' });

    // 1. Crawl
    const product = await crawlProduct(url);

    // 2. Load rules
    const rules = await Rule.find({}).lean();

    // 3. Build prompt and call LLM
    const prompt = buildPrompt(product, rules);
    let llmText;
    try {
      llmText = await callLLM({ prompt, model: process.env.LLM_MODEL });
    } catch (err) {
      console.error('LLM error', err.message || err);
      // fallback to regex extractor
      const fallback = regexExtract((product.description || '') + '\n' + (product.title || ''));
      const reportObj = { url, scraped: product, extraction: fallback, checks: [], finalVerdict: 'UNCERTAIN' };
      const saved = await new Report(reportObj).save();
      return res.json({ report: saved, fallback: true, error: 'LLM call failed' });
    }

    // 4. Parse LLM JSON — tolerant parsing
    let parsed;
    try {
      parsed = JSON.parse(llmText);
    } catch (err) {
      // try to extract JSON block
      const jStart = llmText.indexOf('{');
      const jsonText = jStart >= 0 ? llmText.slice(jStart) : llmText;
      try { parsed = JSON.parse(jsonText); }
      catch (err2) {
        // final fallback to regex
        const fallback = regexExtract((product.description || '') + '\n' + (product.title || ''));
        const reportObj = { url, scraped: product, extraction: fallback, checks: [], finalVerdict: 'UNCERTAIN' };
        const saved = await new Report(reportObj).save();
        return res.json({ report: saved, fallback: true, error: 'LLM returned non-JSON' });
      }
    }

    // 5. Save report
    const reportObj = {
      url,
      scraped: product,
      extraction: parsed.extractions || {},
      checks: parsed.checks || [],
      finalVerdict: parsed.finalVerdict || 'UNCERTAIN'
    };
    const saved = await new Report(reportObj).save();
    return res.json({ report: saved, rawModel: llmText });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'server error' });
  }
});

module.exports = router;
