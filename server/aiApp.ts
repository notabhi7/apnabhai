import express, { Express, Request, Response } from 'express';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODEL = 'gemini-4-hydrogen';
const REQUEST_TIMEOUT_MS = 25000;

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

function extractResponseText(response: any): string {
  const blockReason = response?.promptFeedback?.blockReason;
  if (blockReason) {
    throw new Error(`Request was blocked by Gemini safety filters (${blockReason}). Try rephrasing your topic.`);
  }

  const candidate = response?.candidates?.[0];
  const finishReason = candidate?.finishReason;
  if (finishReason === 'SAFETY' || finishReason === 'PROHIBITED_CONTENT' || finishReason === 'SPII') {
    throw new Error(`Response was filtered by Gemini safety policy (${finishReason}). Please rephrase your query.`);
  }

  if (typeof response?.text === 'string' && response.text.trim()) {
    return response.text.trim();
  }

  const parts = candidate?.content?.parts;
  if (Array.isArray(parts)) {
    const joined = parts
      .filter((p: any) => !p?.thought && typeof p?.text === 'string')
      .map((p: any) => p.text)
      .join('')
      .trim();
    if (joined) return joined;
  }

  if (finishReason === 'MAX_TOKENS') {
    throw new Error('Gemini output was truncated due to length limits. Please retry.');
  }

  throw new Error('Gemini returned an empty response. Please retry.');
}

function safeParseJson<T = any>(rawText: string | undefined): T {
  const cleaned = stripMarkdownFences(rawText || '');
  if (!cleaned) {
    throw new Error('Gemini returned an empty JSON response.');
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as T;
    }
    throw new Error('Gemini returned malformed JSON output.');
  }
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
      message: 'Invalid or unauthorized Gemini API key. Verify GEMINI_API_KEY in environment variables or Settings > Secrets.',
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

  if (lower.includes('timed out') || lower.includes('timeout')) {
    return {
      status: 504,
      code: 'TIMEOUT',
      retryable: true,
      message: 'Gemini request timed out. Please click Retry.',
    };
  }

  if (lower.includes('safety') || lower.includes('filtered')) {
    return {
      status: 422,
      code: 'SAFETY_FILTERED',
      retryable: false,
      message: rawMessage,
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

  if (err instanceof SyntaxError || lower.includes('json') || lower.includes('empty') || lower.includes('incomplete')) {
    return {
      status: 502,
      code: 'MALFORMED_AI_RESPONSE',
      retryable: true,
      message: rawMessage.includes('Gemini') ? rawMessage : 'Received an incomplete response from Gemini. Please retry.',
    };
  }

  return {
    status: numericStatus >= 400 && numericStatus < 600 ? numericStatus : 500,
    code: 'AI_GENERATION_FAILED',
    retryable: true,
    message: rawMessage.length > 260 ? `${rawMessage.slice(0, 260)}...` : rawMessage,
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Gemini request timed out after ${Math.round(ms / 1000)}s.`)), ms);
    }),
  ]);
}

async function generateWithFallback(
  client: GoogleGenAI,
  params: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>,
  preferredModel: string = PRIMARY_MODEL
) {
  const modelsToTry =
    preferredModel === PRIMARY_MODEL
      ? [PRIMARY_MODEL, FALLBACK_MODEL]
      : [preferredModel, PRIMARY_MODEL];

  let lastError: any;

  for (let i = 0; i < modelsToTry.length; i++) {
    const model = modelsToTry[i];
    const requestParams: Parameters<GoogleGenAI['models']['generateContent']>[0] = {
      ...params,
      model,
    };

    if (model === FALLBACK_MODEL && requestParams.config?.thinkingConfig?.thinkingLevel === ThinkingLevel.MINIMAL) {
      const { thinkingConfig: _omit, ...restConfig } = requestParams.config;
      requestParams.config = restConfig;
    }

    try {
      const response = await withTimeout(
        client.models.generateContent(requestParams),
        REQUEST_TIMEOUT_MS
      );
      return { response, model };
    } catch (err: any) {
      lastError = err;
      const formatted = formatGeminiError(err);

      if (formatted.code === 'SERVICE_UNAVAILABLE' && i === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          const retryResponse = await withTimeout(
            client.models.generateContent(requestParams),
            REQUEST_TIMEOUT_MS
          );
          return { response: retryResponse, model };
        } catch (retryErr) {
          lastError = retryErr;
        }
      }

      if (formatted.code === 'INVALID_API_KEY' || formatted.code === 'SAFETY_FILTERED') {
        throw err;
      }
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
    importantConcepts: {
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
    'importantConcepts',
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

function cleanStringArray(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);
}

// ==========================================
// EXPORTED HANDLERS (Express + Vercel Shared)
// ==========================================

export async function handleHealth(_req: Request, res: Response) {
  res.json({
    ok: true,
    geminiConfigured: Boolean((process.env.GEMINI_API_KEY || '').trim()),
    primaryModel: PRIMARY_MODEL,
    timestamp: new Date().toISOString(),
  });
}

export async function handleExplain(req: Request, res: Response) {
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

    const prompt = `Explain "${cleanTopic}" thoroughly for a student.
Difficulty Level: ${difficulty} (Beginner = clear everyday language, zero unnecessary jargon; Intermediate = university rigor and mechanisms; Advanced = formal edge cases, equations/complexity, and system tradeoffs).
Explanation Style: ${style}.
${extraContext ? `Additional Focus: ${String(extraContext).trim()}` : ''}

Every required field MUST be populated with rich, non-empty educational content:
- title: Clear title for "${cleanTopic}"
- introduction: 2-3 sentence overview explaining what it is and why it matters
- analogy: Vivid, memorable real-world analogy tailored to ${difficulty} level
- coreMechanics: 3 to 5 clear numbered/ordered step-by-step mechanics explaining how it works
- importantConcepts: 3 to 4 key concepts or terms formatted as "Term: clear explanation"
- practicalExample: Concrete real-world or engineering example showing "${cleanTopic}" in action
- codeOrFormula: Relevant mathematical formula, packet sequence diagram text, pseudocode, or code snippet (if non-mathematical, provide a concise structured flow/diagram in text)
- commonMisconceptions: 2 to 3 common student mistakes or traps
- summary: Crisp 1-2 sentence key takeaway`;

    const { response, model } = await generateWithFallback(client, {
      contents: prompt,
      config: {
        systemInstruction: 'You are ApnaBhai, an expert academic tutor. Populate every requested JSON field completely and accurately.',
        responseMimeType: 'application/json',
        responseSchema: EXPLANATION_SCHEMA,
      },
    });

    const rawText = extractResponseText(response);
    const parsed = safeParseJson<Record<string, any>>(rawText);

    const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : cleanTopic;
    const introduction = typeof parsed.introduction === 'string' ? parsed.introduction.trim() : '';
    const analogy = typeof parsed.analogy === 'string' ? parsed.analogy.trim() : '';
    const coreMechanics = cleanStringArray(parsed.coreMechanics);
    const importantConcepts = cleanStringArray(parsed.importantConcepts);
    const practicalExample = typeof parsed.practicalExample === 'string' ? parsed.practicalExample.trim() : '';
    const codeOrFormula = typeof parsed.codeOrFormula === 'string' ? parsed.codeOrFormula.trim() : '';
    const commonMisconceptions = cleanStringArray(parsed.commonMisconceptions);
    const summary = typeof parsed.summary === 'string' ? parsed.summary.trim() : '';

    if (!introduction || !analogy || coreMechanics.length === 0 || !summary) {
      throw new Error('Gemini returned an explanation with missing sections. Please click Retry.');
    }

    res.json({
      topic: cleanTopic,
      difficulty,
      style,
      title,
      introduction,
      analogy,
      coreMechanics,
      importantConcepts,
      practicalExample,
      codeOrFormula,
      commonMisconceptions,
      summary,
      modelUsed: model,
      disclaimer:
        (typeof parsed.disclaimer === 'string' && parsed.disclaimer.trim()) ||
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
}

export async function handleChat(req: Request, res: Response) {
  try {
    const {
      topic,
      difficulty = 'Intermediate',
      style = 'Analogy-Rich',
      explanationContext,
      messages = [],
      userMessage,
    } = req.body || {};

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

    const normalizedTurns: Array<{ role: 'user' | 'model'; text: string }> = [];
    for (const msg of Array.isArray(messages) ? messages : []) {
      const text = typeof msg?.text === 'string' ? msg.text.trim() : '';
      if (!text || text.startsWith('Error:')) continue;
      const msgRole: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
      if (normalizedTurns.length === 0 && msgRole !== 'user') continue;
      const prev = normalizedTurns[normalizedTurns.length - 1];
      if (prev && prev.role === msgRole) {
        prev.text = `${prev.text}\n\n${text}`;
      } else {
        normalizedTurns.push({ role: msgRole, text });
      }
    }

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

    // Build rich grounded context from the currently viewed explanation
    let contextBlock = `Current Topic: "${topic || 'General Studies'}"\nSelected Difficulty: ${difficulty}\nSelected Style: ${style}`;
    if (explanationContext && typeof explanationContext === 'object') {
      const steps = Array.isArray(explanationContext.coreMechanics)
        ? explanationContext.coreMechanics
            .map((step: string, i: number) => `  Step ${i + 1}: ${step}`)
            .join('\n')
        : '';
      const concepts = Array.isArray(explanationContext.importantConcepts)
        ? explanationContext.importantConcepts.join(' | ')
        : '';

      contextBlock += `
Current Explanation Reference (use this whenever the student refers to "step 2", "the analogy", "that example", or asks to clarify/simplify):
- Title: ${explanationContext.title || topic || ''}
- Introduction: ${explanationContext.introduction || ''}
- Analogy already shown: ${explanationContext.analogy || ''}
- Step-by-Step Mechanics:\n${steps}
- Important Concepts: ${concepts}
- Practical Example already shown: ${explanationContext.practicalExample || ''}
- Code/Formula: ${explanationContext.codeOrFormula || ''}
- Key Takeaway: ${explanationContext.summary || ''}`;
    }

    const systemInstruction = `You are ApnaBhai's interactive Follow-up AI Tutor.
${contextBlock}

Instructions:
1. Answer directly and conversationally in clean Markdown (short paragraphs, bullet points, bold emphasis, or code/formula blocks where useful).
2. Always match the student's selected difficulty (${difficulty}) unless they ask you to simplify or go deeper.
3. If the student says "Simplify step 2", "Clarify more", "Give another analogy", or "Explain with a practical example", refer directly to the Current Explanation Reference above (e.g., rewrite Step 2 in simpler words, or invent a brand-new analogy different from the one already shown).
4. If the student asks an unrelated/off-topic question, answer it briefly and politely or explain the distinction, then smoothly invite them back to "${topic || 'the current topic'}".
5. Keep answers focused and concise (2-4 short paragraphs max). Never return an empty reply.`;

    const { response, model } = await generateWithFallback(client, {
      contents,
      config: { systemInstruction },
    });

    const reply = extractResponseText(response);

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
}

export async function handleChatbot(req: Request, res: Response) {
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

    const replyText = extractResponseText(response);

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
}

export async function handleQuiz(req: Request, res: Response) {
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

    const parsed = safeParseJson<Record<string, any>>(extractResponseText(response));
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
}

export async function handleNotes(req: Request, res: Response) {
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

    const parsed = safeParseJson<Record<string, any>>(extractResponseText(response));
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
}

export async function handleFlashcards(req: Request, res: Response) {
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

    const parsed = safeParseJson<Record<string, any>>(extractResponseText(response));
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
}

export async function handleConceptTest(req: Request, res: Response) {
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

    const parsed = safeParseJson<Record<string, any>>(extractResponseText(response));
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
}

export function registerAiRoutes(app: Express) {
  app.use(express.json({ limit: '10mb' }));
  app.get('/api/health', handleHealth);
  app.post('/api/ai/explain', handleExplain);
  app.post('/api/ai/chat', handleChat);
  app.post('/api/ai/chatbot', handleChatbot);
  app.post('/api/ai/quiz', handleQuiz);
  app.post('/api/ai/notes', handleNotes);
  app.post('/api/ai/flashcards', handleFlashcards);
  app.post('/api/ai/ai-concept-test', handleConceptTest);
}

export const aiApp = express();
registerAiRoutes(aiApp);

export default aiApp;
