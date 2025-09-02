const patterns = {
  mrp: /(₹|Rs|INR)\s?[\d,]+(?:\.\d{1,2})?/i,
  qty: /(\d+(?:\.\d+)?)\s*(g|kg|ml|l|pcs|nos|pieces)/i,
  date: /(\b\d{1,2}[\/\-\.\s]\d{1,2}[\/\-\.\s]\d{2,4}\b)/,
  country: /(Made in|Country of Origin)\s*[:\-]?\s*([A-Za-z ]{2,30})/i
};

function regexExtract(text){
  if(!text) return {};
  const mrp = text.match(patterns.mrp);
  const qty = text.match(patterns.qty);
  const date = text.match(patterns.date);
  const country = text.match(patterns.country);
  return {
    MRV: mrp ? mrp[0] : null,
    NetQuantity: qty ? qty[0] : null,
    Date: date ? date[0] : null,
    CountryOfOrigin: country ? (country[2] || country[0]) : null
  };
}

module.exports = { regexExtract };
