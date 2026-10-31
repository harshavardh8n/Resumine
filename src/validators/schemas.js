const { z } = require('zod');

// Request Validation Schemas
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const createResumeSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().email('Valid email is required'),
  skills: z.union([z.string(), z.array(z.string())]),
  education: z.string().optional().default(''),
  exp: z.string().optional().default(''),
  projects: z.string().optional().default(''),
  targetRole: z.string().optional().default('Software Engineer'),
});

const compareResumesSchema = z.object({
  targetRole: z.string().optional().default('General Role'),
  jobDescription: z.string().optional().default(''),
});

// Gemini Structured Output Schema for ATS Resume Analysis
const atsAnalysisJsonSchema = {
  type: 'object',
  properties: {
    candidateName: { type: 'string' },
    atsScore: {
      type: 'integer',
      description: 'Overall ATS score between 0 and 100 based on formatting, keywords, experience, and impact',
    },
    summary: { type: 'string', description: 'Brief 2-3 sentence overview of candidate profile' },
    strengths: {
      type: 'array',
      items: { type: 'string' },
      description: 'Key positive aspects of the resume',
    },
    weaknesses: {
      type: 'array',
      items: { type: 'string' },
      description: 'Areas lacking detail, metrics, or clarity',
    },
    improvements: {
      type: 'array',
      items: { type: 'string' },
      description: 'Concrete, actionable recommendations to increase the ATS score',
    },
    suggestedKeywords: {
      type: 'array',
      items: { type: 'string' },
      description: 'High-value technical or industry keywords to add',
    },
    scoringBreakdown: {
      type: 'object',
      properties: {
        formatting: { type: 'integer', description: 'Score out of 25' },
        impactAndMetrics: { type: 'integer', description: 'Score out of 25' },
        skillsAndKeywords: { type: 'integer', description: 'Score out of 25' },
        experienceRelevance: { type: 'integer', description: 'Score out of 25' },
      },
      required: ['formatting', 'impactAndMetrics', 'skillsAndKeywords', 'experienceRelevance'],
    },
  },
  required: ['candidateName', 'atsScore', 'summary', 'strengths', 'weaknesses', 'improvements', 'scoringBreakdown'],
};

// Gemini Structured Output Schema for Resume Comparison
const comparisonJsonSchema = {
  type: 'object',
  properties: {
    winner: { type: 'string', description: 'Resume 1, Resume 2, or Tie' },
    reasoning: { type: 'string', description: 'Comprehensive rationale for the winner' },
    resume1Review: {
      type: 'object',
      properties: {
        candidateName: { type: 'string' },
        atsScore: { type: 'integer' },
        keyStrengths: { type: 'array', items: { type: 'string' } },
        majorWeaknesses: { type: 'array', items: { type: 'string' } },
      },
      required: ['candidateName', 'atsScore', 'keyStrengths', 'majorWeaknesses'],
    },
    resume2Review: {
      type: 'object',
      properties: {
        candidateName: { type: 'string' },
        atsScore: { type: 'integer' },
        keyStrengths: { type: 'array', items: { type: 'string' } },
        majorWeaknesses: { type: 'array', items: { type: 'string' } },
      },
      required: ['candidateName', 'atsScore', 'keyStrengths', 'majorWeaknesses'],
    },
    headToHeadComparison: {
      type: 'object',
      properties: {
        visualAppeal: { type: 'string' },
        contentRelevance: { type: 'string' },
        quantifiedImpact: { type: 'string' },
      },
      required: ['visualAppeal', 'contentRelevance', 'quantifiedImpact'],
    },
  },
  required: ['winner', 'reasoning', 'resume1Review', 'resume2Review', 'headToHeadComparison'],
};

module.exports = {
  registerSchema,
  loginSchema,
  createResumeSchema,
  compareResumesSchema,
  atsAnalysisJsonSchema,
  comparisonJsonSchema,
};

