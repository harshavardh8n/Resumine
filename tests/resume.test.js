const request = require('supertest');
const { app } = require('../src/app');
const { getGeminiClient } = require('../src/config/gemini');

jest.mock('../src/config/gemini', () => {
  const mockGenerateContent = jest.fn();
  return {
    getGeminiClient: jest.fn(() => ({
      models: {
        generateContent: mockGenerateContent,
      },
    })),
    __mockGenerateContent: mockGenerateContent,
  };
});

const { __mockGenerateContent: mockGenerateContent } = require('../src/config/gemini');

describe('ResuMine API - Resume Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 OK and health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/resume/analyze', () => {
    it('should return 400 when neither file nor URL is provided', async () => {
      const res = await request(app).post('/api/resume/analyze').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Please upload a resume file/);
    });

    it('should return structured ATS response on happy path (with PDF buffer upload)', async () => {
      const mockAtsResponse = {
        candidateName: 'Jane Doe',
        atsScore: 88,
        summary: 'Strong backend engineer with distributed systems expertise.',
        strengths: ['Great metric-driven bullet points', 'Clear architecture experience'],
        weaknesses: ['Missing CI/CD tool keywords'],
        improvements: ['Include GitHub Actions experience in the skills section'],
        suggestedKeywords: ['Kubernetes', 'Docker', 'Redis'],
        scoringBreakdown: {
          formatting: 23,
          impactAndMetrics: 22,
          skillsAndKeywords: 21,
          experienceRelevance: 22,
        },
      };

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(mockAtsResponse),
      });

      const fakePdfBuffer = Buffer.from('%PDF-1.4 Fake PDF Content');

      const res = await request(app)
        .post('/api/resume/analyze')
        .attach('resume', fakePdfBuffer, {
          filename: 'resume.pdf',
          contentType: 'application/pdf',
        })
        .field('targetRole', 'Senior Backend Engineer');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.candidateName).toBe('Jane Doe');
      expect(res.body.data.atsScore).toBe(88);
      expect(res.body.data.scoringBreakdown.formatting).toBe(23);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when Gemini API throws an error', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('Gemini Quota Exceeded'));

      const fakePdfBuffer = Buffer.from('%PDF-1.4 Fake PDF Content');

      const res = await request(app)
        .post('/api/resume/analyze')
        .attach('resume', fakePdfBuffer, {
          filename: 'resume.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/AI Analysis failed: Gemini Quota Exceeded/);
    });
  });

  describe('POST /api/resume/create', () => {
    it('should return 400 when required fields are missing or invalid', async () => {
      const res = await request(app).post('/api/resume/create').send({
        name: 'J', // too short (< 2 chars)
        email: 'invalid-email', // invalid email
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(Array.isArray(res.body.errors)).toBe(true);
    });

    it('should generate resume markdown on valid payload', async () => {
      const mockMarkdown = '# Jane Doe\n## Experience\n- Built scalable REST APIs';
      mockGenerateContent.mockResolvedValueOnce({
        text: mockMarkdown,
      });

      const res = await request(app)
        .post('/api/resume/create')
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          skills: ['Node.js', 'Express', 'MongoDB'],
          education: 'BS Computer Science',
          exp: '2 years as fullstack developer',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.markdown).toBe(mockMarkdown);
    });
  });
});

