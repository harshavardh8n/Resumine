const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    fileName: {
      type: String,
      default: 'Uploaded Resume',
    },
    fileType: {
      type: String,
      default: 'application/pdf',
    },
    candidateName: {
      type: String,
      default: 'Unknown Candidate',
    },
    atsScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
      default: '',
    },
    strengths: [
      {
        type: String,
      },
    ],
    weaknesses: [
      {
        type: String,
      },
    ],
    improvements: [
      {
        type: String,
      },
    ],
    suggestedKeywords: [
      {
        type: String,
      },
    ],
    scoringBreakdown: {
      formatting: { type: Number, default: 0 },
      impactAndMetrics: { type: Number, default: 0 },
      skillsAndKeywords: { type: Number, default: 0 },
      experienceRelevance: { type: Number, default: 0 },
    },
    targetRole: {
      type: String,
      default: 'General',
    },
  },
  {
    timestamps: true,
  }
);

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = { Analysis };
