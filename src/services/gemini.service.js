const axios = require('axios');
const { getGeminiClient } = require('../config/gemini');
const { env } = require('../config/env');
const { ApiError } = require('../utils/apiError');
const { atsAnalysisJsonSchema, comparisonJsonSchema } = require('../validators/schemas');

async function urlToBase64(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    const base64Data = Buffer.from(response.data, 'binary').toString('base64');
    return { data: base64Data, mimeType };
  } catch (error) {
    throw ApiError.badRequest(`Failed to download file from URL: ${error.message}`);
  }
}

class GeminiService {
  static async analyzeResume({ fileBuffer, mimeType, fileUrl, targetRole, jobDescription }) {
    const ai = getGeminiClient();

    let filePart;
    if (fileBuffer) {
      filePart = {
        inlineData: {
          data: fileBuffer.toString('base64'),
          mimeType: mimeType || 'application/pdf',
        },
      };
    } else if (fileUrl) {
      const fetched = await urlToBase64(fileUrl);
      filePart = {
        inlineData: {
          data: fetched.data,
          mimeType: fetched.mimeType,
        },
      };
    } else {
      throw ApiError.badRequest('Either a resume file or file URL must be provided');
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) scanner and seasoned technical recruiter.
Thoroughly inspect the provided resume document.
Target Role: ${targetRole || 'Software Engineering / Tech Professional'}
${jobDescription ? `Target Job Description: ${jobDescription}` : ''}

Evaluate the resume across:
1. Overall ATS compatibility and readability.
2. Impactful bullet points with quantified business metrics (e.g. percentages, scale, revenue).
3. Technical skill coverage, keyword relevance, and section organization.
4. Red flags, formatting flaws, or weak phrasing.

Provide an accurate, honest ATS score between 0 and 100 with comprehensive constructive feedback.`;

    try {
      const response = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [prompt, filePart],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: atsAnalysisJsonSchema,
          temperature: 0.2,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw ApiError.internal('Received empty response from Gemini AI');
      }

      return JSON.parse(responseText);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.error('[GeminiService.analyzeResume error]:', err.message);
      throw ApiError.internal(`AI Analysis failed: ${err.message}`);
    }
  }

  static async compareResumes({ file1, file2, url1, url2, targetRole }) {
    const ai = getGeminiClient();

    const part1 = file1
      ? { inlineData: { data: file1.buffer.toString('base64'), mimeType: file1.mimetype } }
      : await urlToBase64(url1).then((f) => ({ inlineData: { data: f.data, mimeType: f.mimeType } }));

    const part2 = file2
      ? { inlineData: { data: file2.buffer.toString('base64'), mimeType: file2.mimetype } }
      : await urlToBase64(url2).then((f) => ({ inlineData: { data: f.data, mimeType: f.mimeType } }));

    const prompt = `Compare these two resumes head-to-head for the role: ${targetRole || 'Software Engineer'}.
Evaluate their experience depth, clarity, action verbs, quantified accomplishments, and ATS suitability.
Determine which resume is superior and supply a detailed comparative breakdown.`;

    try {
      const response = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [prompt, part1, part2],
        config: {
          responseMimeType: 'application/json',
          responseJsonSchema: comparisonJsonSchema,
          temperature: 0.2,
        },
      });

      const text = response.text;
      return JSON.parse(text);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      console.error('[GeminiService.compareResumes error]:', err.message);
      throw ApiError.internal(`AI Comparison failed: ${err.message}`);
    }
  }

  static async generateResume({ name, email, skills, education, exp, projects, targetRole }) {
    const ai = getGeminiClient();

    const skillsStr = Array.isArray(skills) ? skills.join(', ') : skills;

    const prompt = `You are a professional executive resume writer.
Create a high-impact, modern, ATS-optimized resume in clean Markdown for:
- Full Name: ${name}
- Email: ${email}
- Target Role: ${targetRole || 'Software Engineer'}
- Core Skills: ${skillsStr}
- Education: ${education || 'Not provided'}
- Experience & Background: ${exp || 'Not provided'}
- Projects: ${projects || 'Not provided'}

Guidelines:
- Output clean, structured Markdown.
- Transform bullet points to use the Google XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]".
- Do not output conversational filler. Start directly with the candidate header and markdown sections.`;

    try {
      const response = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: prompt,
        config: {
          temperature: 0.3,
        },
      });

      return {
        markdown: response.text,
      };
    } catch (err) {
      console.error('[GeminiService.generateResume error]:', err.message);
      throw ApiError.internal(`AI Resume Generation failed: ${err.message}`);
    }
  }
}

module.exports = { GeminiService };

