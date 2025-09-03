const axios = require('axios');
const cheerio = require('cheerio');

async function crawlProduct(url) {
  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" } // avoid bot block
  });

  const $ = cheerio.load(html);

  const title = $('#productTitle').text().trim();
  const price = $('#priceblock_ourprice, #priceblock_dealprice').text().trim();
  const description = $('#feature-bullets').text().trim();
  const details = $('#detailBullets_feature_div').text().trim();

  // Keep it small: only the fields we need
  return {
    title,
    price,
    description,
    details
  };
}

module.exports = { crawlProduct };
