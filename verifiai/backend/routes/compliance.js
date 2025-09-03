// routes/compliance.js
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../db"); // adjust path if needed

const router = express.Router();

// Helper: scrape Amazon product page
async function scrapeAmazonProduct(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);

    // Extract common fields
    const title = $("#productTitle").text().trim();
    const mrp =
      $("#priceblock_ourprice").text().trim() ||
      $("#priceblock_dealprice").text().trim();
    const manufacturer = $("#bylineInfo").text().trim();

    return {
      title: title || "N/A",
      mrp: mrp || "N/A",
      manufacturer: manufacturer || "N/A",
      rawHtml: data.length, // just to debug
    };
  } catch (err) {
    console.error("Scraping error:", err.message);
    return null;
  }
}

// POST /compliance
router.post("/", async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "Product URL is required" });

  let productData = null;

  if (url.includes("amazon")) {
    productData = await scrapeAmazonProduct(url);
  } else {
    return res
      .status(400)
      .json({ error: "Only Amazon scraping implemented for now" });
  }

  if (!productData)
    return res.status(500).json({ error: "Failed to scrape product" });

  // Fetch rules from DB
  const rules = await db.all("SELECT * FROM rules");

  // Validate rules
  const violations = [];
  for (let r of rules) {
    const fieldValue = productData[r.field] || "";
    const regex = new RegExp(r.rule);
    if (!regex.test(fieldValue)) {
      violations.push({
        field: r.field,
        rule: r.rule,
        description: r.description,
        actualValue: fieldValue,
      });
    }
  }

  res.json({
    url,
    productData,
    complianceScore:
      rules.length > 0
        ? `${((rules.length - violations.length) / rules.length) * 100}%`
        : "No rules defined",
    violations,
  });
});

module.exports = router;
