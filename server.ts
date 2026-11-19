import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client server-side with telemetry header
let ai: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI | null {
  if (!ai && process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return ai;
}

async function generateWithRetry(
  client: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0],
  maxRetries = 2
) {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await client.models.generateContent(params);
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code;
      const isTransient = status === 429 || status === 503 || status === 500 || err?.message?.includes('UNAVAILABLE');
      if (!isTransient || attempt === maxRetries) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 600 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

// 1. API: AI Tutor - Topic Explanation
app.post('/api/ai/explain', async (req: Request, res: Response) => {
  try {
    const { topic, difficulty = 'Intermediate', style = 'Analogy-Rich', extraContext = '' } = req.body;
    if (!topic || !topic.trim()) {
      res.status(400).json({ error: 'Topic is required' });
      return;
    }

    const client = getAIClient();
    if (!client) {
      // Demo / fallback response
      res.json({
        topic,
        difficulty,
        style,
        title: `Understanding ${topic}`,
        introduction: `${topic} is a cornerstone concept. At a ${difficulty.toLowerCase()} level, it represents a structured mechanism designed to solve complex challenges through foundational principles.`,
        analogy: `Think of ${topic} like a modern orchestra conductor: each musician (component) knows their instrument, but the conductor ensures seamless synchronization and prevents chaos.`,
        coreMechanics: [
          `Key Invariant: The fundamental rule that must hold true at all stages of ${topic}.`,
          `Data & Control Flow: How inputs are transformed into outputs step-by-step.`,
          `Practical Trade-off: High efficiency often requires balancing resource consumption against latency.`
        ],
        codeOrFormula: `// Conceptual snippet for ${topic}\nfunction explainConcept(input) {\n  const verified = validate(input);\n  return transform(verified);\n}`,
        commonMisconceptions: [
          `Assuming ${topic} can be applied indiscriminately without understanding the underlying constraints.`,
          `Confusing the high-level theoretical abstraction with the specific implementation details.`
        ],
        summary: `Mastering ${topic} unlocks the ability to design resilient architectures and reason systematically about modern systems.`,
        disclaimer: 'AI-generated educational explanation. Please verify critical facts and exam-specific details with primary textbooks and verified course materials.'
      });
      return;
    }

    const prompt = `You are an elite academic tutor for "AI Study Buddy".
Explain the topic "${topic}" thoroughly to a student.
Target Difficulty: ${difficulty} (Options: Beginner, Intermediate, Advanced)
Explanation Style: ${style} (Options: Analogy-Rich, Technical & Formal, Socratic & Conceptual, Executive Summary)
${extraContext ? `Context or Specific Question: ${extraContext}` : ''}

Respond STRICTLY in valid JSON matching this schema:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "style": "${style}",
  "title": "Clear educational title",
  "introduction": "Engaging introduction breaking down what this is and why it matters",
  "analogy": "Memorable, intuitive real-world analogy",
  "coreMechanics": ["Step 1 / Core principle", "Step 2 / Mechanism", "Step 3 / Nuance"],
  "codeOrFormula": "Illustrative code snippet, formula, or pseudo-code (or empty string if non-technical)",
  "commonMisconceptions": ["Common mistake 1 students make", "Common mistake 2"],
  "summary": "Concise key takeaway sentence",
  "disclaimer": "AI-generated educational explanation. Please verify critical facts and exam-specific details with primary textbooks and verified course materials."
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.warn('Explain endpoint fallback triggered:', err?.message || err);
    const { topic = 'Core Topic', difficulty = 'Intermediate', style = 'Analogy-Rich' } = req.body;
    res.json({
      topic,
      difficulty,
      style,
      title: `Understanding ${topic}`,
      introduction: `${topic} is a fundamental concept that empowers learners to reason systematically and solve real-world problems.`,
      analogy: `Imagine ${topic} as a precision GPS navigation system: it continuously calculates the optimal route while adapting dynamically to obstacles.`,
      coreMechanics: [
        'Fundamental Invariants: The underlying rules governing input/output transformations.',
        'Efficiency Bottlenecks: Identifying where most time and computational resources are spent.',
        'Edge Case Handling: Verifying safety constraints under boundary conditions.'
      ],
      codeOrFormula: `// Demonstrating ${topic}\nconst compute = (data) => {\n  return processPipeline(data);\n};`,
      commonMisconceptions: [
        'Overlooking initial boundary conditions.',
        'Assuming worst-case performance represents typical everyday operations.'
      ],
      summary: `In summary, understanding ${topic} provides the building blocks for deeper mastery in the field.`,
      disclaimer: 'AI-generated educational explanation. Please verify critical facts and exam-specific details with primary textbooks and verified course materials.'
    });
  }
});

// 2A. API: AI Tutor Follow-up Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { topic, messages = [], userMessage } = req.body;
    const client = getAIClient();

    if (!client) {
      res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please check Settings > Secrets to configure your API key.'
      });
      return;
    }

    const conversationHistory = messages
      .map((m: any) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
      .join('\n');

    const prompt = `You are ApnaBhai's personalized academic tutor.
Topic being studied: "${topic || 'General Studies'}".
Conversation so far:
${conversationHistory}
Student asks: "${userMessage}"

Provide a clear, supportive, instructive, and academically precise answer within 3 short paragraphs. Include a concrete example or formula if relevant.`;

    const response = await generateWithRetry(client, {
      model: 'gemini-4-hydrogen',
      contents: prompt,
    });

    res.json({
      reply: response.text || 'I could not generate a response. Please try rephrasing your question.',
      disclaimer: 'AI-generated tutor reply. Verify critical answers against certified references.'
    });
  } catch (err: any) {
    console.error('Tutor chat endpoint error:', err?.message || err);
    res.status(500).json({
      error: err?.message || 'Unable to generate tutor response right now. Please try again.'
    });
  }
});

// 2B. API: Dedicated Multi-turn Gemini Chatbot with Persona & Model Routing
const PERSONA_PROMPTS: Record<string, string> = {
  socratic: `You are ApnaBhai's Socratic Study Coach. You guide students using inquiry, hints, and active recall. Never dump raw solutions without encouraging the student to think through the step first. Keep tone supportive, insightful, and academically sharp.`,
  drillmaster: `You are ApnaBhai's Exam Drillmaster. Your objective is rigorous exam readiness. Challenge the student with high-yield concepts, verify precision, test edge cases, and ensure no conceptual flaws remain. Be brisk, clear, and high-impact.`,
  eli5: `You are ApnaBhai's Concept Simplifier (ELI5). Make difficult academic & computer science concepts strikingly intuitive through down-to-earth analogies, visual metaphors, and plain language. End with a 1-sentence mnemonic or takeaway.`,
  architect: `You are ApnaBhai's Senior Code & Engineering Architect. Provide structured algorithmic explanations, clean code examples with comments, time/space complexity O(...) analysis, and real-world system architecture tradeoffs.`
};

function resolveChatbotModelConfig(requestedModel: string): {
  model: string;
  displayLabel: string;
  thinkingLevel?: ThinkingLevel;
} {
  switch (requestedModel) {
    case 'gemini-3.1-flash-lite':
      return { model: 'gemini-3.1-flash-lite', displayLabel: 'gemini-3.1-flash-lite' };
    case 'gemini-4-hydrogen-deep':
    case 'gemini-4-carbon':
    case 'gemini-4-argon':
      return {
        model: 'gemini-4-hydrogen',
        displayLabel: 'gemini-4-hydrogen (Deep)',
        thinkingLevel: ThinkingLevel.HIGH,
      };
    case 'gemini-4-hydrogen-fast':
      return {
        model: 'gemini-4-hydrogen',
        displayLabel: 'gemini-4-hydrogen (Fast)',
        thinkingLevel: ThinkingLevel.LOW,
      };
    case 'gemini-4-hydrogen':
    case 'gemini-3.8-flash':
    default:
      return {
        model: 'gemini-4-hydrogen',
        displayLabel: 'gemini-4-hydrogen',
        thinkingLevel: ThinkingLevel.MEDIUM,
      };
  }
}

app.post('/api/ai/chatbot', async (req: Request, res: Response) => {
  try {
    const {
      messages = [],
      role = 'socratic',
      model = 'gemini-4-hydrogen'
    } = req.body;

    const systemInstruction = PERSONA_PROMPTS[role] || PERSONA_PROMPTS.socratic;
    const resolved = resolveChatbotModelConfig(model);

    const client = getAIClient();
    if (!client) {
      res.status(503).json({
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY in Settings > Secrets.'
      });
      return;
    }

    // Normalize messages: Gemini multi-turn contents must start with 'user' and strictly alternate user/model
    const rawContents: Array<{ role: 'user' | 'model'; text: string }> = [];
    for (const msg of messages) {
      const text = typeof msg?.text === 'string' ? msg.text.trim() : '';
      if (!text) continue;
      const msgRole: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
      if (rawContents.length === 0 && msgRole !== 'user') {
        // Skip leading assistant welcome message so conversation always starts with a user turn
        continue;
      }
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

    const config: any = {
      systemInstruction,
    };
    if (resolved.thinkingLevel) {
      config.thinkingConfig = { thinkingLevel: resolved.thinkingLevel };
    }

    let replyText = '';
    let usedModel = resolved.displayLabel;

    try {
      const response = await generateWithRetry(client, {
        model: resolved.model,
        contents,
        config,
      });
      replyText = response.text || '';
    } catch (modelErr: any) {
      console.warn(`Primary model ${resolved.model} failed, trying gemini-4-hydrogen fallback:`, modelErr?.message || modelErr);
      if (resolved.model !== 'gemini-4-hydrogen' || resolved.thinkingLevel) {
        usedModel = 'gemini-4-hydrogen';
        const fallbackResp = await generateWithRetry(client, {
          model: 'gemini-4-hydrogen',
          contents,
          config: { systemInstruction },
        });
        replyText = fallbackResp.text || '';
      } else {
        throw modelErr;
      }
    }

    res.json({
      reply: replyText || 'I am ready to help you study. What concept would you like to explore?',
      model: usedModel,
      role,
      disclaimer: 'AI-generated study guidance. Verify critical formulas with primary academic sources.'
    });
  } catch (err: any) {
    console.error('Chatbot endpoint error:', err);
    const status = err?.status || err?.code;
    const rawMsg = err?.message || 'Unable to generate a response right now.';
    if (status === 403 || status === 400 && rawMsg.toLowerCase().includes('api key')) {
      res.status(403).json({ error: 'Invalid or unauthorized Gemini API key. Please check Settings > Secrets.' });
      return;
    }
    if (status === 429) {
      res.status(429).json({ error: 'Rate limit reached. Please wait a few seconds before sending another question.' });
      return;
    }
    res.status(500).json({ error: rawMsg });
  }
});


// 3. API: Quiz Generator (MCQs, True/False, Short Answer)
app.post('/api/ai/quiz', async (req: Request, res: Response) => {
  try {
    const { topic, difficulty = 'Intermediate', questionCount = 5, questionTypes = ['mcq', 'tf', 'short'] } = req.body;
    const client = getAIClient();

    if (!client) {
      res.json({
        topic,
        difficulty,
        questions: [
          {
            id: 'q-1',
            type: 'mcq',
            question: `In the context of ${topic || 'Modern Computing'}, which of the following is the primary advantage of active recall over passive reading?`,
            options: [
              'It requires less cognitive effort',
              'It strengthens neural retrieval pathways and long-term retention',
              'It eliminates the need for understanding core concepts',
              'It guarantees zero exam anxiety'
            ],
            correctIndex: 1,
            explanation: 'Active recall forces the brain to retrieve information from memory, which scientifically cements synaptic connections far more effectively than passive rereading.',
            points: 10
          },
          {
            id: 'q-2',
            type: 'tf',
            question: 'True or False: Few-shot prompting provides an LLM with several concrete input-output examples before asking for the target completion.',
            options: ['True', 'False'],
            correctIndex: 0,
            explanation: 'True. Few-shot prompting guides the model by demonstrating the desired format, reasoning pattern, and output structure through 2 to 5 demonstrations.',
            points: 10
          },
          {
            id: 'q-3',
            type: 'mcq',
            question: 'What is the root cause of an "AI Hallucination" in Large Language Models?',
            options: [
              'The model intentionally produces false statements to deceive users',
              'Hardware overheating in the data center',
              'Probabilistic token generation without ground-truth factual verification or real-world grounding',
              'The user typing their prompt too quickly'
            ],
            correctIndex: 2,
            explanation: 'LLMs predict the most statistically probable next tokens based on training patterns rather than consulting a deterministic factual database, leading to plausible-sounding yet fabricated information.',
            points: 10
          },
          {
            id: 'q-4',
            type: 'short',
            question: `Briefly state the difference between zero-shot and few-shot learning for ${topic || 'AI models'}.`,
            sampleAnswer: 'Zero-shot learning tasks the model with direct instructions without examples, whereas few-shot learning includes exemplar pairs to establish context and structure.',
            keyTerms: ['zero-shot', 'few-shot', 'examples', 'prompt'],
            points: 10
          }
        ],
        disclaimer: 'AI-generated quiz questions. Always check critical grading criteria against your syllabus.'
      });
      return;
    }

    const prompt = `You are a university exam creator for "AI Study Buddy".
Generate an interactive quiz on the topic "${topic}".
Difficulty: ${difficulty}
Total Questions: ${questionCount}
Include these question types: ${JSON.stringify(questionTypes)}

Return strictly valid JSON in this structure:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q-1",
      "type": "mcq", // or "tf" or "short"
      "question": "Question prompt",
      "options": ["Option A", "Option B", "Option C", "Option D"], // For MCQ or ["True", "False"] for TF
      "correctIndex": 0, // 0-indexed for MCQ/TF
      "explanation": "Clear explanation of why this answer is correct",
      "points": 10
    },
    {
      "id": "q-2",
      "type": "short",
      "question": "Conceptual short question",
      "sampleAnswer": "Model ideal answer",
      "keyTerms": ["key term 1", "key term 2"],
      "points": 10
    }
  ],
  "disclaimer": "AI-generated quiz questions. Always check critical grading criteria against your syllabus."
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{"questions":[]}');
    res.json(parsed);
  } catch (err: any) {
    console.warn('Quiz generator fallback triggered:', err?.message || err);
    const { topic = 'Educational Concept', difficulty = 'Intermediate' } = req.body;
    res.json({
      topic,
      difficulty,
      questions: [
        {
          id: 'q-fallback-1',
          type: 'mcq',
          question: `Which fundamental principle characterizes ${topic}?`,
          options: [
            'Systematic abstraction and structured constraints',
            'Random execution without verification',
            'Complete elimination of latency',
            'Unbounded memory consumption'
          ],
          correctIndex: 0,
          explanation: `${topic} relies upon disciplined abstraction to manage complexity and provide reliable guarantees.`,
          points: 10
        },
        {
          id: 'q-fallback-2',
          type: 'tf',
          question: `True or False: Pre-conditions and post-conditions must always be defined when formalizing ${topic}.`,
          options: ['True', 'False'],
          correctIndex: 0,
          explanation: 'True. Invariants and conditions ensure correctness across all valid states.',
          points: 10
        }
      ],
      disclaimer: 'AI-generated quiz questions. Always check critical grading criteria against your syllabus.'
    });
  }
});

// 4. API: Revision Notes Generator
app.post('/api/ai/notes', async (req: Request, res: Response) => {
  try {
    const { topic, detailLevel = 'Comprehensive', subject = 'General' } = req.body;
    const client = getAIClient();

    if (!client) {
      res.json({
        title: `Comprehensive Revision Guide: ${topic || 'Key Concepts'}`,
        subject: subject || 'Computer Science & AI',
        detailLevel,
        overview: `This structured revision guide summarizes ${topic}. It is optimized for quick review before exams and technical interviews.`,
        sections: [
          {
            heading: '1. Foundational Definition & Scope',
            content: `${topic} establishes the contract between computational requirements and output guarantees. It structures complex operations into deterministic, verifiable steps.`
          },
          {
            heading: '2. Core Principles & Architecture',
            content: '• Invariant Guarantee: System states transition strictly through authorized protocols.\n• Resource Allocation: Time complexity and memory footprints are balanced.\n• Modularity: Independent units communicate via explicit interfaces.'
          },
          {
            heading: '3. Real-World Applications & Industry Impact',
            content: `From cloud infrastructure to embedded systems, ${topic} forms the backbone of scalable real-world implementations.`
          }
        ],
        keyDefinitions: [
          { term: 'Invariant', definition: 'A condition that remains true across all program states or transformations.' },
          { term: 'Asymptotic Bound', definition: 'The mathematical upper or average limit on resource consumption as input size grows.' },
          { term: 'Convergence', definition: 'The guarantee that an algorithm terminates at an optimal or acceptable solution.' }
        ],
        formulasAndTheorems: [
          'Master Theorem: T(n) = aT(n/b) + f(n)',
          'Bayes Theorem: P(A|B) = [P(B|A) * P(A)] / P(B)'
        ],
        examQuickTips: [
          'Always identify the base cases before beginning recursive derivations.',
          'State pre-conditions and post-conditions clearly in 10-mark questions.',
          'Draw state-space diagrams to demonstrate practical understanding.'
        ],
        summary: `In summary, ${topic} combines theoretical rigor with practical problem-solving. Reviewing these definitions and invariants ensures high performance on examinations.`,
        disclaimer: 'AI-generated study notes. Important formulas, dates, and historical definitions should be verified against official course syllabi.'
      });
      return;
    }

    const prompt = `You are an expert academic curriculum specialist for "AI Study Buddy".
Generate high-yield, structured revision notes for "${topic}".
Subject: "${subject}"
Detail Level: "${detailLevel}"

Format STRICTLY as valid JSON matching this schema:
{
  "title": "Comprehensive Revision Guide: ${topic}",
  "subject": "${subject}",
  "detailLevel": "${detailLevel}",
  "overview": "Clear 2-3 sentence overview of this topic",
  "sections": [
    {
      "heading": "Section Heading",
      "content": "Rich markdown text with bullet points, explanation, and code/formulas if applicable"
    }
  ],
  "keyDefinitions": [
    { "term": "Term Name", "definition": "Clear concise definition" }
  ],
  "formulasAndTheorems": ["Equation / Theorem 1", "Equation / Theorem 2"],
  "examQuickTips": ["Exam tip 1", "Common trap to avoid"],
  "summary": "Final synthesis paragraph",
  "disclaimer": "AI-generated study notes. Important formulas, dates, and historical definitions should be verified against official course syllabi."
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.warn('Notes generator fallback triggered:', err?.message || err);
    const { topic = 'Academic Concept' } = req.body;
    res.json({
      title: `Revision Notes: ${topic}`,
      subject: 'Computer Science & AI',
      overview: `A complete revision breakdown covering essential concepts of ${topic}.`,
      sections: [
        {
          heading: '1. Theoretical Framework',
          content: `${topic} is formulated to address core challenges in modern computing and academic disciplines.`
        },
        {
          heading: '2. Implementation Patterns',
          content: 'Key steps include initialization, iterative transformation, validation, and terminal evaluation.'
        }
      ],
      keyDefinitions: [
        { term: 'Core Invariant', definition: 'The unchanging state property maintained throughout execution.' }
      ],
      formulasAndTheorems: ['Primary recurrence: T(n) = O(n log n)'],
      examQuickTips: ['Draw a clear flowchart or architectural diagram for full marks.'],
      summary: `Mastery of ${topic} is achieved through continuous active recall and problem practice.`,
      disclaimer: 'AI-generated study notes. Important formulas, dates, and historical definitions should be verified against official course syllabi.'
    });
  }
});

// 5. API: Flashcards Generator
app.post('/api/ai/flashcards', async (req: Request, res: Response) => {
  try {
    const { topic, count = 6, difficulty = 'Intermediate' } = req.body;
    const client = getAIClient();

    if (!client) {
      res.json({
        topic,
        flashcards: [
          {
            id: 'fc-1',
            question: `What is the core definition of ${topic || 'this concept'}?`,
            answer: `It is a structured method or model that optimizes resource utilization and enforces foundational computational invariants.`,
            hint: 'Think about primary purpose and guarantees',
            tag: 'Definition'
          },
          {
            id: 'fc-2',
            question: 'What is the key difference between Zero-Shot and Few-Shot Prompting?',
            answer: 'Zero-shot gives instructions with zero task-specific examples. Few-shot includes 2-5 demonstration pairs to teach the model format and style.',
            hint: 'Count the demonstration examples',
            tag: 'AI Concepts'
          },
          {
            id: 'fc-3',
            question: 'What is an AI Hallucination and why does it happen?',
            answer: 'An AI Hallucination is when an LLM produces confident yet factually incorrect statements, caused by statistical token prediction without factual grounding.',
            hint: 'Statistical probability vs verified truth',
            tag: 'LLMs'
          },
          {
            id: 'fc-4',
            question: `What is the standard time-space tradeoff in ${topic || 'algorithmic optimization'}?`,
            answer: 'Trading auxiliary memory (e.g., memoization tables or hash indexes) to dramatically reduce execution time from exponential to polynomial.',
            hint: 'Memory footprint vs execution speed',
            tag: 'Tradeoffs'
          },
          {
            id: 'fc-5',
            question: 'What is Chain-of-Thought (CoT) Prompting?',
            answer: 'Prompting the model to write out intermediate reasoning steps before providing the final answer, significantly improving complex reasoning accuracy.',
            hint: '"Think step-by-step"',
            tag: 'Prompting'
          }
        ],
        disclaimer: 'AI-generated active recall flashcards. Verify critical terms with trusted references.'
      });
      return;
    }

    const prompt = `You are an active-recall flashcard creator for "AI Study Buddy".
Generate ${count} high-retention flashcards for "${topic}".
Difficulty: "${difficulty}".
Include questions on definitions, core mechanics, tradeoffs, and critical distinctions.

Return strictly valid JSON:
{
  "topic": "${topic}",
  "flashcards": [
    {
      "id": "fc-1",
      "question": "Clear, challenging question testing active recall",
      "answer": "Concise, precise answer with bullet points if helpful",
      "hint": "Helpful memory hook or mnemonic",
      "tag": "Category Tag"
    }
  ],
  "disclaimer": "AI-generated active recall flashcards. Verify critical terms with trusted references."
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{"flashcards":[]}');
    res.json(parsed);
  } catch (err: any) {
    console.warn('Flashcard generator fallback triggered:', err?.message || err);
    res.json({
      topic: req.body.topic || 'Concept',
      flashcards: [
        {
          id: 'fc-f-1',
          question: `State the fundamental theorem of ${req.body.topic || 'this subject'}.`,
          answer: 'It defines the mathematical upper bound and guarantees optimal convergence under boundary conditions.',
          hint: 'Remember boundary conditions',
          tag: 'Core'
        }
      ],
      disclaimer: 'AI-generated active recall flashcards. Verify critical terms with trusted references.'
    });
  }
});

// 6. API: Core AI Topic Interactive Playground (Prompting, Zero-shot, Few-shot, Hallucination tester)
app.post('/api/ai/ai-concept-test', async (req: Request, res: Response) => {
  try {
    const { conceptType, userPrompt, taskInput } = req.body;
    const client = getAIClient();

    if (!client) {
      if (conceptType === 'zero-shot') {
        res.json({
          technique: 'Zero-Shot Prompting',
          output: `Direct completion for "${taskInput}":\nSentiment: Positive (Confidence: 0.94).\nExplanation: The model evaluated the semantic tokens without any prior examples.`,
          analysis: 'Zero-shot relies solely on the pre-trained weights without intermediate priming.'
        });
      } else if (conceptType === 'few-shot') {
        res.json({
          technique: 'Few-Shot Prompting',
          output: `Few-shot guided completion:\nInput: "${taskInput}"\nClassification: High-Priority Inquiry\nAction: Immediate Escalation to Engineering.`,
          analysis: 'By demonstrating 2 pattern examples, the model adhered strictly to the output schema.'
        });
      } else {
        res.json({
          technique: 'Hallucination Inspection',
          output: `Analysis: The prompt asks about an imaginary theorem. An ungrounded model might fabricate plausible-sounding citations. A grounded model warns that no such theorem exists.`,
          analysis: 'Mitigate hallucinations using ground-truth retrieval (RAG) and low temperature settings.'
        });
      }
      return;
    }

    const prompt = `You are demonstrating the AI concept "${conceptType}" for educational purposes.
Concept: ${conceptType} (Options: zero-shot, few-shot, prompting, hallucination, chain-of-thought)
Student prompt or test case:
"${userPrompt || taskInput}"

Provide:
1. The model output executing this technique
2. A brief 2-sentence educational commentary explaining what happened behind the scenes and how this illustrates ${conceptType}.

Return strictly JSON:
{
  "technique": "${conceptType}",
  "output": "The model completion",
  "analysis": "Educational commentary on how this demonstrates the AI concept"
}`;

    const response = await generateWithRetry(client, {
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    res.json({
      technique: req.body.conceptType || 'AI Concept',
      output: 'Educational demonstration output completed.',
      analysis: 'This illustrates the sensitivity of token probability to prompt structure and contextual examples.'
    });
  }
});

// Serve frontend in dev or prod
async function setupServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AI Study Buddy server running on http://0.0.0.0:${port}`);
  });
}

setupServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
