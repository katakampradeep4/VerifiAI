const mongoose = require('mongoose');
const RuleSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // e.g., R01
  description: String,
  pattern: String,
  keywords: [String],
  required: { type: Boolean, default: true },
  severity: { type: String, enum: ['LOW','MEDIUM','HIGH'], default: 'HIGH' }
});
module.exports = mongoose.model('Rule', RuleSchema);
