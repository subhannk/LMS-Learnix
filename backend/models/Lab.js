const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  points: { type: Number, default: 10 },
  language: { type: String, default: 'JavaScript' },
  instructions: { type: String, default: '' },
  starterCode: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Lab', labSchema);