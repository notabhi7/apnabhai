import express, { Express, Request, Response } from 'express';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODEL = 'gemini-4-hydrogen';

let aiClient: GoogleGenAI | null = null;
let cachedApiKey: string | undefined;

export function getAIClient(): GoogleGenAI | null {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    return null;
  }
  if (!aiClient || cachedApiKey !== apiKey) {
    cachedApiKey = apiKey;
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

function stripMarkdownFences(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }
  return trimmed;
}

function safeParseJson<T = any>(rawText: string | undefined): T {
  const cleaned = stripMarkdownFences(rawText || '');
  if (!cleaned) {
    throw new Error('Gemini returned an empty response.');
  }
  return JSON.parse(cleaned) as T;
}

function formatGeminiError(err: any): { status: number; message: string; code: string; retryable: boolean } {
  const rawMessage = typeof err?.message === 'string' ? err.message : String(err || 'Unknown Gemini error');
  const numericStatus = Number(err?.status || err?.code || 0);
  const lower = rawMessage.toLowerCase();

  if (
    numericStatus === 403 ||
    lower.includes('permission_denied') ||
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    (numericStatus === 400 && lower.includes('api key'))
  ) {
    return {
      status: 403,
      code: 'INVALID_API_KEY',
      retryable: false,
      message: 'Invalid or unauthorized Gemini API key. Verify GEMINI_API_KEY in your environment variables or Settings > Secrets.',
    };
  }

  if (
    numericStatus === 429 ||
    lower.includes('resource_exhausted') ||
    lower.includes('quota') ||
    lower.includes('rate limit')
  ) {
    return {
      status: 429,
      code: 'QUOTA_EXCEEDED',
      retryable: true,
      message: 'Gemini API quota or rate limit reached. Please wait a moment and click Retry.',
    };
  }

  if (numericStatus === 404 || lower.includes('not_found')) {
    return {
      status: 502,
      code: 'MODEL_UNAVAILABLE',
      retryable: false,
      message: 'The configured Gemini model was not found or is temporarily unavailable.',
    };
  }

  if (numericStatus === 503 || lower.includes('unavailable') || lower.includes('overloaded')) {
    return {
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
      retryable: true,
      message: 'Gemini service is temporarily busy. Please retry in a few seconds.',
    };
  }

  if (err instanceof SyntaxError || lower.includes('json') || lower.includes('empty response')) {
    return {
      status: 502,
      code: 'MALFORMED_AI_RESPONSE',
      retryable: true,
      message: 'Received an incomplete or invalid structured response from Gemini. Please retry.',
    };
  }

  return {
    status: numericStatus >= 400 && numericStatus < 600 ? numericStatus : 500,
    code: 'AI_GENERATION_FAILED',
    retryable: true,
    message: rawMessage.length > 260 ? `${rawMessage.slice(0, 260)}...` : rawMessage,
  };
}

/**
 * Credit-conscious call helper:
 * - Tries primary model once (only retries once on transient 503 overload, never wastes credits retrying 429 daily quota).
 * - Automatically falls back across models (e.g. gemini-3.1-flash-lite <-> gemini-4-hydrogen) only when the primary returns 429/503/404.
 */
async function generateWithFallback(
  client: GoogleGenAI,
  params: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>,
  preferredModel: string = PRIMARY_MODEL
) {
  const modelsToTry = preferredModel === PRIMARY_MODEL
    ? [PRIMARY_MODEL, FALLBACK_MODEL]
    : [preferredModel, PRIMARY_MODEL];

  let lastError: any;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    const requestParams: Parameters<GoogleGenAI['models']['generateContent']>[0] = {
      ...params,
      model,
    };

    // Strip ThinkingLevel.MINIMAL if falling back to gemini-4-hydrogen (unsupported there)
    if (model === FALLBACK_MODEL && requestParams.config?.thinkingConfig?.thinkingLevel === ThinkingLevel.MINIMAL) {
      const { thinkingConfig: _omit, ...restConfig } = requestParams.config;
      requestParams.config = restConfig;
    }

    try {
      const response = await client.models.generateContent(requestParams);
      return { response, model };
    } catch (err: any) {
      lastError = err;
      const formatted = formatGeminiError(err);

      // Brief single retry only on transient 503 overload for the primary model
      if (formatted.code === 'SERVICE_UNAVAILABLE' && i === 0) {
        await new Promise(resolve => setTimeout(resolve, 600));
        try {
          const retryResponse = await client.models.generateContent(requestParams);
          return { response: retryResponse, model };
        } catch (retryErr) {
          lastError = retryErr;
        }
      }

      // Stop immediately on invalid API key (no point trying another model)
      if (formatted.code === 'INVALID_API_KEY') {
        throw err;
      }
      // Otherwise continue to next model in list (e.g., if 429 quota hit on one model)
    }
  }

  throw lastError;
}

const EXPLANATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    style: { type: Type.STRING },
    title: { type: Type.STRING },
    introduction: { type: Type.STRING },
    analogy: { type: Type.STRING },
    coreMechanics: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    practicalExample: { type: Type.STRING },
    codeOrFormula: { type: Type.STRING },
    commonMisconceptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    summary: { type: Type.STRING },
    disclaimer: { type: Type.STRING },
  },
  required: [
    'title',
    'introduction',
    'analogy',
    'coreMechanics',
    'practicalExample',
    'commonMisconceptions',
    'summary',
  ],
};

const QUIZ_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    difficulty: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING },
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctIndex: { type: Type.INTEGER },
          sampleAnswer: { type: Type.STRING },
          keyTerms: { type: Type.ARRAY, items: { type: Type.STRING } },
          explanation: { type: Type.STRING },
          points: { type: Type.INTEGER },
        },
        required: ['id', 'type', 'question', 'explanation', 'points'],
      },
    },
    disclaimer: { type: Type.STRING },
  },
  required: ['questions'],
};

const NOTES_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    subject: { type: Type.STRING },
    detailLevel: { type: Type.STRING },
    overview: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          heading: { type: Type.STRING },
          content: { type: Type.STRING },
        },
        required: ['heading', 'content'],
      },
    },
    keyDefinitions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          definition: { type: Type.STRING },
        },
        required: ['term', 'definition'],
      },
    },
    formulasAndTheorems: { type: Type.ARRAY, items: { type: Type.STRING } },
    examQuickTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING },
    disclaimer: { type: Type.STRING },
  },
  required: ['title', 'overview', 'sections', 'keyDefinitions', 'summary'],
};

const FLASHCARDS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    topic: { type: Type.STRING },
    flashcards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          question: { type: Type.STRING },
          answer: { type: Type.STRING },
          hint: { type: Type.STRING },
          tag: { type: Type.STRING },
        },
        required: ['id', 'question', 'answer', 'tag'],
      },
    },
    disclaimer: { type: Type.STRING },
  },
  required: ['flashcards'],
};

const PERSONA_PROMPTS: Record<string, string> = {
  socratic: `You are ApnaBhai's Socratic Study Coach. Guide students using inquiry, hints, and active recall. Keep responses concise, supportive, and academically sharp.`,
  drillmaster: `You are ApnaBhai's Exam Drillmaster. Challenge students with high-yield concepts, verify precision, and highlight edge cases. Be brisk and clear.`,
  eli5: `You are ApnaBhai's Concept Simplifier (ELI5). Make difficult academic concepts intuitive through real-world analogies and plain language. End with a 1-sentence takeaway.`,
  architect: `You are ApnaBhai's Senior Engineering Architect. Provide structured algorithmic explanations, clean code examples, O(...) complexity, and system tradeoffs.`,
};

function resolveChatbotModelConfig(requestedModel: string): {
  model: string;
  displayLabel: string;
  thinkingLevel?: ThinkingLevel;
} {
  switch (requestedModel) {
    case 'gemini-4-hydrogen-deep':
    case 'gemini-4-carbon':
    case 'gemini-4-argon':
      return {
        model: FALLBACK_MODEL,
        displayLabel: 'gemini-4-hydrogen (Deep)',
        thinkingLevel: ThinkingLevel.HIGH,
      };
    case 'gemini-4-hydrogen-fast':
      return {
        model: FALLBACK_MODEL,
        displayLabel: 'gemini-4-hydrogen (Fast)',
        thinkingLevel: ThinkingLevel.LOW,
      };
    case 'gemini-4-hydrogen':
    case 'gemini-3.8-flash':
      return {
        model: FALLBACK_MODEL,
        displayLabel: FALLBACK_MODEL,
        thinkingLevel: ThinkingLevel.MEDIUM,
      };
    case 'gemini-3.1-flash-lite':
    default:
      return {
        model: PRIMARY_MODEL,
        displayLabel: PRIMARY_MODEL,
      };
  }
}

export function registerAiRoutes(app: Express) {
  app.use(express.json({ limit: '10mb' }));

  // Health Check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      geminiConfigured: Boolean((process.env.GEMINI_API_KEY || '').trim()),
      primaryModel: PRIMARY_MODEL,
      timestamp: new Date().toISOString(),
    });
  });

  // 1. API: AI Tutor - Topic Explanation
  app.post('/api/ai/explain', async (req: Request, res: Response) => {
    try {
      const { topic, difficulty = 'Intermediate', style = 'Analogy-Rich', extraContext = '' } = req.body || {};
      const cleanTopic = typeof topic === 'string' ? topic.trim() : '';
      if (!cleanTopic) {
        res.status(400).json({ error: 'Please enter a topic before clicking Explain Topic.' });
        return;
      }

      const client = getAIClient();
      if (!client) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY to your environment variables or Settings > Secrets.',
          code: 'MISSING_API_KEY',
        });
        return;
      }

      const prompt = `Explain "${cleanTopic}" for a college student.
Difficulty: ${difficulty} (Beginner: accessible jargon-free fundamentals; Intermediate: undergraduate rigor and mechanisms; Advanced: formal edge cases, math/complexity, and system tradeoffs).
Style: ${style}.
${extraContext ? `Focus: ${String(extraContext).trim()}` : ''}
Provide:
- Clear title, crisp 2-3 sentence introduction, memorable analogy
- 3 to 5 clear step-by-step coreMechanics
- A concrete practicalExample showing "${cleanTopic}" in real-world action
- A concise codeOrFormula (formula, diagram text, packet sequence, or code snippet; empty string if inapplicable)
- 2 to 3 commonMisconceptions students make
- A 1-2 sentence summary takeaway`;

      const { response, model } = await generateWithFallback(client, {
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert academic tutor for ApnaBhai. Be accurate, clear, and concise.',
          responseMimeType: 'application/json',
          responseSchema: EXPLANATION_SCHEMA,
        },
      });

      const parsed = safeParseJson<Record<string, any>>(response.text);
      if (!parsed?.introduction || !Array.isArray(parsed?.coreMechanics) || parsed.coreMechanics.length === 0) {
        throw new Error('Incomplete structured explanation returned by Gemini.');
      }

      res.json({
        topic: cleanTopic,
        difficulty,
        style,
        title: parsed.title || cleanTopic,
        introduction: parsed.introduction,
        analogy: parsed.analogy || '',
        coreMechanics: parsed.coreMechanics,
        practicalExample: parsed.practicalExample || '',
        codeOrFormula: parsed.codeOrFormula || '',
        commonMisconceptions: Array.isArray(parsed.commonMisconceptions) ? parsed.commonMisconceptions : [],
        summary: parsed.summary || '',
        modelUsed: model,
        disclaimer:
          parsed.disclaimer ||
          'AI-generated educational explanation. Verify critical formulas and exam specifics against primary course materials.',
      });
    } catch (err: any) {
      console.error('[/api/ai/explain] error:', err?.message || err);
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({
        error: formatted.message,
        code: formatted.code,
        retryable: formatted.retryable,
      });
    }
  });

  // 2A. API: AI Tutor Follow-up Chat
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const { topic, messages = [], userMessage } = req.body || {};
      const cleanUserMessage = typeof userMessage === 'string' ? userMessage.trim() : '';
      if (!cleanUserMessage) {
        res.status(400).json({ error: 'Please enter a follow-up question.' });
        return;
      }

      const client = getAIClient();
      if (!client) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets or deployment env vars.',
          code: 'MISSING_API_KEY',
        });
        return;
      }

      // Build normalized alternating multi-turn contents starting with 'user'
      const normalizedTurns: Array<{ role: 'user' | 'model'; text: string }> = [];
      for (const msg of Array.isArray(messages) ? messages : []) {
        const text = typeof msg?.text === 'string' ? msg.text.trim() : '';
        if (!text) continue;
        const msgRole: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
        if (normalizedTurns.length === 0 && msgRole !== 'user') continue;
        const prev = normalizedTurns[normalizedTurns.length - 1];
        if (prev && prev.role === msgRole) {
          prev.text = `${prev.text}\n\n${text}`;
        } else {
          normalizedTurns.push({ role: msgRole, text });
        }
      }

      // Ensure latest userMessage is the final user turn
      const last = normalizedTurns[normalizedTurns.length - 1];
      if (!last || last.role !== 'user' || last.text !== cleanUserMessage) {
        if (last && last.role === 'user') {
          last.text = cleanUserMessage;
        } else {
          normalizedTurns.push({ role: 'user', text: cleanUserMessage });
        }
      }

      const contents = normalizedTurns.map(turn => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      }));

      const { response, model } = await generateWithFallback(client, {
        contents,
        config: {
          systemInstruction: `You are ApnaBhai's academic tutor helping a student study "${topic || 'General Studies'}". Answer clearly in 1-3 short paragraphs with a concrete example or formula when helpful.`,
        },
      });

      const reply = (response.text || '').trim();
      if (!reply) {
        throw new Error('Gemini returned an empty tutor reply.');
      }

      res.json({
        reply,
        model,
        disclaimer: 'AI-generated tutor reply. Verify critical answers against primary references.',
      });
    } catch (err: any) {
      console.error('[/api/ai/chat] error:', err?.message || err);
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({
        error: formatted.message,
        code: formatted.code,
        retryable: formatted.retryable,
      });
    }
  });

  // 2B. API: Dedicated Multi-turn Gemini Chatbot Drawer
  app.post('/api/ai/chatbot', async (req: Request, res: Response) => {
    try {
      const { messages = [], role = 'socratic', model = PRIMARY_MODEL } = req.body || {};

      const systemInstruction = PERSONA_PROMPTS[role] || PERSONA_PROMPTS.socratic;
      const resolved = resolveChatbotModelConfig(model);

      const client = getAIClient();
      if (!client) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY in Settings > Secrets or deployment env vars.',
          code: 'MISSING_API_KEY',
        });
        return;
      }

      const rawContents: Array<{ role: 'user' | 'model'; text: string }> = [];
      for (const msg of Array.isArray(messages) ? messages : []) {
        const text = typeof msg?.text === 'string' ? msg.text.trim() : '';
        if (!text) continue;
        const msgRole: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
        if (rawContents.length === 0 && msgRole !== 'user') continue;
        const prev = rawContents[rawContents.length - 1];
        if (prev && prev.role === msgRole) {
          prev.text = `${prev.text}\n\n${text}`;
        } else {
          rawContents.push({ role: msgRole, text });
        }
      }

      if (rawContents.length === 0) {
        res.status(400).json({ error: 'Please enter a message to start the conversation.' });
        return;
      }

      const contents = rawContents.map(item => ({
        role: item.role,
        parts: [{ text: item.text }],
      }));

      const config: any = { systemInstruction };
      if (resolved.thinkingLevel) {
        config.thinkingConfig = { thinkingLevel: resolved.thinkingLevel };
      }

      const { response, model: usedModel } = await generateWithFallback(
        client,
        { contents, config },
        resolved.model
      );

      const replyText = (response.text || '').trim();
      if (!replyText) {
        throw new Error('Gemini returned an empty reply.');
      }

      res.json({
        reply: replyText,
        model: usedModel === resolved.model ? resolved.displayLabel : usedModel,
        role,
        disclaimer: 'AI-generated study guidance. Verify critical formulas with primary academic sources.',
      });
    } catch (err: any) {
      console.error('[/api/ai/chatbot] error:', err?.message || err);
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({
        error: formatted.message,
        code: formatted.code,
        retryable: formatted.retryable,
      });
    }
  });

  // 3. API: Quiz Generator
  app.post('/api/ai/quiz', async (req: Request, res: Response) => {
    try {
      const { topic, difficulty = 'Intermediate', questionCount = 5, questionTypes = ['mcq', 'tf', 'short'] } = req.body || {};
      const cleanTopic = typeof topic === 'string' ? topic.trim() : '';
      if (!cleanTopic) {
        res.status(400).json({ error: 'Quiz topic is required.' });
        return;
      }

      const client = getAIClient();
      if (!client) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
          code: 'MISSING_API_KEY',
        });
        return;
      }

      const prompt = `Generate a ${questionCount}-question university quiz on "${cleanTopic}" (${difficulty} level).
Allowed types: ${JSON.stringify(questionTypes)}.
For "mcq" provide 4 options and 0-based correctIndex.
For "tf" provide options ["True", "False"] and 0-based correctIndex.
For "short" provide sampleAnswer and keyTerms.
Set points: 10 per question.`;

      const { response } = await generateWithFallback(client, {
        contents: prompt,
        config: {
          systemInstruction: 'You are an exam writer for ApnaBhai. Output accurate questions and clear answer explanations.',
          responseMimeType: 'application/json',
          responseSchema: QUIZ_SCHEMA,
        },
      });

      const parsed = safeParseJson<Record<string, any>>(response.text);
      if (!Array.isArray(parsed?.questions) || parsed.questions.length === 0) {
        throw new Error('Quiz generator returned no questions.');
      }

      res.json({
        topic: cleanTopic,
        difficulty,
        questions: parsed.questions,
        disclaimer:
          parsed.disclaimer ||
          'AI-generated quiz questions. Always check critical grading criteria against your syllabus.',
      });
    } catch (err: any) {
      console.error('[/api/ai/quiz] error:', err?.message || err);
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
    }
  });

  // 4. API: Revision Notes Generator
  app.post('/api/ai/notes', async (req: Request, res: Response) => {
    try {
      const { topic, detailLevel = 'Comprehensive', subject = 'Computer Science & AI' } = req.body || {};
      const cleanTopic = typeof topic === 'string' ? topic.trim() : '';
      if (!cleanTopic) {
        res.status(400).json({ error: 'Topic is required for revision notes.' });
        return;
      }

      const client = getAIClient();
      if (!client) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
          code: 'MISSING_API_KEY',
        });
        return;
      }

      const prompt = `Generate structured "${detailLevel}" revision notes on "${cleanTopic}" under subject "${subject}".
Include: title, overview, 3 structured sections (heading + concise high-yield content), 3 keyDefinitions, formulasAndTheorems (if applicable), 3 examQuickTips, and a summary.`;

      const { response } = await generateWithFallback(client, {
        contents: prompt,
        config: {
          systemInstruction: 'You are an academic curriculum specialist for ApnaBhai.',
          responseMimeType: 'application/json',
          responseSchema: NOTES_SCHEMA,
        },
      });

      const parsed = safeParseJson<Record<string, any>>(response.text);
      if (!parsed?.overview || !Array.isArray(parsed?.sections)) {
        throw new Error('Revision notes generator returned incomplete output.');
      }

      res.json({
        title: parsed.title || `Revision Notes: ${cleanTopic}`,
        subject: parsed.subject || subject,
        detailLevel: parsed.detailLevel || detailLevel,
        overview: parsed.overview,
        sections: parsed.sections,
        keyDefinitions: Array.isArray(parsed.keyDefinitions) ? parsed.keyDefinitions : [],
        formulasAndTheorems: Array.isArray(parsed.formulasAndTheorems) ? parsed.formulasAndTheorems : [],
        examQuickTips: Array.isArray(parsed.examQuickTips) ? parsed.examQuickTips : [],
        summary: parsed.summary || '',
        disclaimer:
          parsed.disclaimer ||
          'AI-generated study notes. Verify critical formulas and dates against official course syllabi.',
      });
    } catch (err: any) {
      console.error('[/api/ai/notes] error:', err?.message || err);
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
    }
  });

  // 5. API: Flashcards Generator
  app.post('/api/ai/flashcards', async (req: Request, res: Response) => {
    try {
      const { topic, count = 6, difficulty = 'Intermediate' } = req.body || {};
      const cleanTopic = typeof topic === 'string' ? topic.trim() : '';
      if (!cleanTopic) {
        res.status(400).json({ error: 'Topic is required for flashcard generation.' });
        return;
      }

      const client = getAIClient();
      if (!client) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
          code: 'MISSING_API_KEY',
        });
        return;
      }

      const prompt = `Create ${count} active-recall flashcards on "${cleanTopic}" (${difficulty} level).
Each card needs: id, question, concise accurate answer, helpful hint, and short tag.`;

      const { response } = await generateWithFallback(client, {
        contents: prompt,
        config: {
          systemInstruction: 'You create spaced-repetition flashcards for ApnaBhai.',
          responseMimeType: 'application/json',
          responseSchema: FLASHCARDS_SCHEMA,
        },
      });

      const parsed = safeParseJson<Record<string, any>>(response.text);
      if (!Array.isArray(parsed?.flashcards) || parsed.flashcards.length === 0) {
        throw new Error('Flashcards generator returned empty deck.');
      }

      res.json({
        topic: cleanTopic,
        flashcards: parsed.flashcards,
        disclaimer:
          parsed.disclaimer ||
          'AI-generated active recall flashcards. Verify critical terms with trusted references.',
      });
    } catch (err: any) {
      console.error('[/api/ai/flashcards] error:', err?.message || err);
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
    }
  });

  // 6. API: Core AI Topic Interactive Playground
  app.post('/api/ai/ai-concept-test', async (req: Request, res: Response) => {
    try {
      const { conceptType, userPrompt, taskInput } = req.body || {};
      const client = getAIClient();
      if (!client) {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
          code: 'MISSING_API_KEY',
        });
        return;
      }

      const prompt = `Demonstrate the AI concept "${conceptType || 'prompting'}".
Student prompt or input: "${userPrompt || taskInput || ''}".
Return JSON with: technique, output (the demonstration result), and analysis (2-sentence educational explanation).`;

      const { response } = await generateWithFallback(client, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              technique: { type: Type.STRING },
              output: { type: Type.STRING },
              analysis: { type: Type.STRING },
            },
            required: ['technique', 'output', 'analysis'],
          },
        },
      });

      const parsed = safeParseJson<Record<string, any>>(response.text);
      res.json({
        technique: parsed.technique || conceptType || 'AI Concept',
        output: parsed.output || '',
        analysis: parsed.analysis || '',
      });
    } catch (err: any) {
      console.error('[/api/ai/ai-concept-test] error:', err?.message || err);
      const formatted = formatGeminiError(err);
      res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
    }
  });
}

export const aiApp = express();
registerAiRoutes(aiApp);

export default aiApp;
