const axios = require('axios');
const cheerio = require('cheerio');

async function crawlProduct(url){
  const headers = { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)' };
  const resp = await axios.get(url, { headers, timeout: 15000 });
  const $ = cheerio.load(resp.data || '');

  // Try typical selectors (best-effort) and fallbacks
  const title = ($('#productTitle').text().trim()) || ($('meta[property="og:title"]').attr('content')) || $('title').text().trim();
  const description = ($('#feature-bullets').text().trim()) || ($('meta[property="og:description"]').attr('content')) || $('meta[name="description"]').attr('content') || '';
  // Price heuristics
  const price = $('#priceblock_ourprice').text().trim() || $('#priceblock_dealprice').text().trim() || $('meta[itemprop="price"]').attr('content') || '';

  return { title, description, price, rawHtml: resp.data };
}

module.exports = { crawlProduct };
