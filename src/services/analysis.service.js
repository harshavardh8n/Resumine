const { Analysis } = require('../models/Analysis');
const { getIsConnected } = require('../config/db');

// In-memory store fallback for development without MongoDB
const memoryHistory = [];

class AnalysisService {
  static async saveAnalysis({ userId, fileName, fileType, targetRole, analysisResult }) {
    const docData = {
      userId: userId || null,
      fileName: fileName || 'Uploaded Resume',
      fileType: fileType || 'application/pdf',
      targetRole: targetRole || 'General',
      candidateName: analysisResult.candidateName || 'Unknown',
      atsScore: analysisResult.atsScore || 0,
      summary: analysisResult.summary || '',
      strengths: analysisResult.strengths || [],
      weaknesses: analysisResult.weaknesses || [],
      improvements: analysisResult.improvements || [],
      suggestedKeywords: analysisResult.suggestedKeywords || [],
      scoringBreakdown: analysisResult.scoringBreakdown || {
        formatting: 0,
        impactAndMetrics: 0,
        skillsAndKeywords: 0,
        experienceRelevance: 0,
      },
    };

    if (getIsConnected()) {
      return await Analysis.create(docData);
    } else {
      const savedDoc = { ...docData, _id: 'mem_' + Date.now(), createdAt: new Date() };
      memoryHistory.unshift(savedDoc);
      return savedDoc;
    }
  }

  static async getUserHistory(userId) {
    if (getIsConnected()) {
      return await Analysis.find({ userId }).sort({ createdAt: -1 }).limit(20);
    } else {
      return memoryHistory.filter((doc) => String(doc.userId) === String(userId));
    }
  }

  static async getById(id) {
    if (getIsConnected()) {
      return await Analysis.findById(id);
    } else {
      return memoryHistory.find((doc) => String(doc._id) === String(id)) || null;
    }
  }
}

module.exports = { AnalysisService };
