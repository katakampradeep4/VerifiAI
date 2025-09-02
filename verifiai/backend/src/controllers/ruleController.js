const express = require('express');
const router = express.Router();
const Rule = require('../models/Rule');

router.get('/', async (req,res) => {
  const rules = await Rule.find({});
  res.json(rules);
});

router.post('/', async (req,res) => {
  try {
    const payload = req.body;
    const r = new Rule(payload);
    await r.save();
    res.json(r);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
