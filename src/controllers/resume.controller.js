const { GeminiService } = require('../services/gemini.service');
const { AnalysisService } = require('../services/analysis.service');
const { createResumeSchema, compareResumesSchema } = require('../validators/schemas');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');

class ResumeController {
  static async analyze(req, res, next) {
    try {
      const file = req.file;
      const fileUrl = req.body?.img || req.body?.fileUrl;
      const targetRole = req.body?.targetRole || 'Software Engineering';
      const jobDescription = req.body?.jobDescription || '';

      if (!file && !fileUrl) {
        throw ApiError.badRequest('Please upload a resume file (PDF/Image) or provide a file URL.');
      }

      const analysisResult = await GeminiService.analyzeResume({
        fileBuffer: file ? file.buffer : null,
        mimeType: file ? file.mimetype : null,
        fileUrl,
        targetRole,
        jobDescription,
      });

      // Save to persistence
      const savedDoc = await AnalysisService.saveAnalysis({
        userId: req.user?._id || req.user?.id || null,
        fileName: file ? file.originalname : 'URL Document',
        fileType: file ? file.mimetype : 'image/jpeg',
        targetRole,
        analysisResult,
      });

      return ApiResponse.success(
        res,
        {
          id: savedDoc._id,
          ...analysisResult,
          createdAt: savedDoc.createdAt,
        },
        'Resume analyzed successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  static async compare(req, res, next) {
    try {
      compareResumesSchema.parse(req.body);

      const files = req.files || {};
      const file1 = files.resume1 ? files.resume1[0] : null;
      const file2 = files.resume2 ? files.resume2[0] : null;

      const url1 = req.body?.img1 || req.body?.url1;
      const url2 = req.body?.img2 || req.body?.url2;
      const targetRole = req.body?.targetRole;

      if ((!file1 && !url1) || (!file2 && !url2)) {
        throw ApiError.badRequest('Please provide two resumes to compare (files or URLs).');
      }

      const result = await GeminiService.compareResumes({
        file1,
        file2,
        url1,
        url2,
        targetRole,
      });

      return ApiResponse.success(res, result, 'Resumes compared successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const validated = createResumeSchema.parse(req.body);
      const result = await GeminiService.generateResume(validated);
      return ApiResponse.success(res, result, 'Resume generated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getHistory(req, res, next) {
    try {
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        throw ApiError.unauthorized('Authentication required to view history');
      }
      const history = await AnalysisService.getUserHistory(userId);
      return ApiResponse.success(res, history, 'Analysis history retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const analysis = await AnalysisService.getById(req.params.id);
      if (!analysis) {
        throw ApiError.notFound('Analysis record not found');
      }
      return ApiResponse.success(res, analysis, 'Analysis record retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { ResumeController };
