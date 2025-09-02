const mongoose = require('mongoose');
const ReportSchema = new mongoose.Schema({
  url: String,
  scraped: Object,
  extraction: Object,
  checks: Array,
  finalVerdict: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Report', ReportSchema);
