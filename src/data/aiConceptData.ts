import { AIConceptLesson } from '../types';

export const aiConceptLessons: AIConceptLesson[] = [
  {
    id: 'concept-prompting',
    slug: 'prompting',
    title: 'Prompt Engineering & Directives',
    tagline: 'The art and science of guiding language models to produce accurate, structured outcomes.',
    description: 'A prompt is the natural language instruction or context provided to an AI model to guide its response. Effective prompting transforms generic text completion into precision problem-solving.',
    coreDefinition: 'Prompting is the input mechanism through which human intent is translated into model behavior. A high-quality prompt establishes: 1) Persona/Role, 2) Clear Task, 3) Constraints/Rules, 4) Desired Output Schema, and 5) Reference Context.',
    realWorldExample: 'Instead of asking: "Explain sorting algorithms", an engineered prompt specifies: "You are a university computer science professor. Compare MergeSort and QuickSort in a markdown table covering Time Complexity (Best, Average, Worst), Space Complexity, Stability, and ideal use cases for undergraduate students."',
    comparisonTable: [
      { feature: 'Naive Prompting', colA: '"Summarize this article"', colB: 'Often produces vague, unstructured prose' },
      { feature: 'Engineered Prompting', colA: '"Extract the 3 main arguments into bullet points under 20 words each"', colB: 'Produces precise, parseable, and high-yield summaries' },
      { feature: 'Persona Injection', colA: '"You are a senior pediatric cardiologist explaining to a resident"', colB: 'Calibrates tone, vocabulary, and depth to target audience' }
    ],
    interactivePrompt: {
      label: 'Interactive Prompt Playground: Recipe to Algorithm Converter',
      initialPrompt: 'Transform this recipe instruction into structured pseudo-code with time invariants and error handling.',
      taskInput: 'Boil water, add pasta, cook for 8 minutes, check firmness, strain water, mix with sauce.',
      sampleOutput: `// Structured Algorithm Generated:\nfunction preparePasta(waterVolume, pastaGrams) {\n  bringToBoil(waterVolume, 100); // Wait until boiling\n  insert(pastaGrams);\n  const timer = startTimer(8 * 60);\n  while(!timer.isExpired()) { keepSimmering(); }\n  if (testAlDente()) {\n    strainWater();\n    return foldSauce();\n  }\n  throw new Error("UnderCookedException");\n}`,
      explanation: 'Notice how prompt constraints convert informal instructions into deterministic algorithmic steps with conditional validation.'
    },
    quizChallenge: {
      question: 'Which of the following is considered best practice when designing a production prompt for an LLM?',
      options: [
        'Making the prompt as brief as possible to save user typing time',
        'Explicitly defining the role, task boundary, constraints, and target output format (e.g., JSON)',
        'Using ambiguous language to let the model decide its own structure',
        'Asking the model to guess what the user wants without providing context'
      ],
      correctIndex: 1,
      explanation: 'Providing explicit roles, unambiguous constraints, contextual grounding, and a concrete output schema minimizes hallucinations and maximizes consistency.'
    }
  },
  {
    id: 'concept-llms',
    slug: 'llms',
    title: 'Large Language Models (LLMs)',
    tagline: 'Deep neural networks trained on massive corpora to predict next tokens and reason across domains.',
    description: 'Large Language Models are massive deep learning models based on the Transformer architecture. They learn the statistical grammar, semantic relationships, and world facts embedded within billions of parameters.',
    coreDefinition: 'An LLM is a probabilistic autoregressive model that computes the conditional probability distribution P(token_t | token_1, ..., token_{t-1}) over a fixed vocabulary. Through multi-head self-attention, the model weighs the relative importance of all words in the context window simultaneously.',
    realWorldExample: 'When you ask Gemini or ChatGPT to write a Python script, the model does not run a search engine query internally; instead, it predicts token by token what an expert engineer would write based on patterns learned during self-supervised pre-training and refined through RLHF.',
    comparisonTable: [
      { feature: 'Pre-Training Phase', colA: 'Self-supervised next-token prediction over trillions of text tokens', colB: 'Builds foundational linguistic and factual representations' },
      { feature: 'Fine-Tuning / RLHF', colA: 'Supervised alignment and human feedback reinforcement', colB: 'Aligns raw model into a helpful, harmless, and instruction-following assistant' },
      { feature: 'Context Window', colA: 'Fixed token memory buffer (e.g., 32k - 1M tokens)', colB: 'Limits how much document context the model can view at one time' }
    ],
    interactivePrompt: {
      label: 'LLM Tokenization & Probability Explorer',
      initialPrompt: 'Predict the most statistically coherent completion for this scientific statement.',
      taskInput: 'In quantum mechanics, Heisenberg\'s uncertainty principle states that you cannot simultaneously measure with arbitrary precision both...',
      sampleOutput: '...the position and momentum of a particle. Mathematically, Δx · Δp ≥ ℏ/2.',
      explanation: 'The model assigns overwhelmingly high probability to "the position and momentum" because those tokens co-occur with Heisenberg\'s principle across physics literature.'
    },
    quizChallenge: {
      question: 'In the Transformer architecture powering modern LLMs, what is the role of the Self-Attention mechanism?',
      options: [
        'To speed up CPU clock cycles during memory allocation',
        'To allow each token in a sentence to dynamically calculate attention weights with all other tokens, capturing long-range dependencies',
        'To delete unused words from the prompt to save RAM',
        'To connect the LLM directly to a live relational database'
      ],
      correctIndex: 1,
      explanation: 'Self-attention allows the model to connect related concepts (e.g. linking "it" to "the dog" 50 words earlier) regardless of their physical distance in the text.'
    }
  },
  {
    id: 'concept-zero-shot',
    slug: 'zero-shot',
    title: 'Zero-Shot Learning',
    tagline: 'Solving tasks directly from instructions without a single demonstration example.',
    description: 'Zero-shot learning is the capability of a pre-trained model to understand a task instruction and execute it successfully without having seen prior demonstration examples of that specific task during inference.',
    coreDefinition: 'Zero-shot prompting feeds the model a task directive and the input payload, relying entirely on the model\'s internalized pre-training representations to deduce the desired transformation: Output = Model(Prompt_Directive, Input).',
    realWorldExample: 'You paste an unfamiliar customer review in German: "Das Gerät schaltet sich nach 5 Minuten automatisch ab" and prompt: "Classify sentiment as POSITIVE, NEGATIVE, or NEUTRAL". The model correctly responds: "NEGATIVE" without needing any sample pairs.',
    comparisonTable: [
      { feature: 'Input Requirements', colA: 'Only task directive + payload', colB: 'Minimal prompt length and token cost' },
      { feature: 'Best Used For', colA: 'Standard classification, summarization, direct translation', colB: 'Tasks with clear, unambiguous natural language definitions' },
      { feature: 'Limitation', colA: 'May fail on novel or proprietary structured formatting', colB: 'Cannot infer subtle stylistic nuances without exemplars' }
    ],
    interactivePrompt: {
      label: 'Zero-Shot Classification Test',
      initialPrompt: 'Classify the urgency of this hospital triage message into [CRITICAL, URGENT, ROUTINE] without examples.',
      taskInput: 'Patient reports sudden unilateral facial drooping and slurred speech starting 15 minutes ago.',
      sampleOutput: 'Classification: CRITICAL\nReasoning: Symptoms indicate acute stroke protocol (FAST criteria); requires immediate emergency intervention.',
      explanation: 'Zero-shot execution accurately leverages medical knowledge internalized during pre-training to make high-stakes classifications.'
    },
    quizChallenge: {
      question: 'Which of the following best describes Zero-Shot prompting?',
      options: [
        'Training a neural network from scratch using zero weights',
        'Providing 10 example pairs before asking the model to complete a new query',
        'Providing an instruction to the model without any demonstration examples of the task',
        'Running an LLM without an internet connection'
      ],
      correctIndex: 2,
      explanation: 'Zero-shot gives the model instructions and the input directly, without providing demonstration examples.'
    }
  },
  {
    id: 'concept-few-shot',
    slug: 'few-shot',
    title: 'Few-Shot Learning & In-Context Demonstrations',
    tagline: 'Teaching models custom formats, reasoning styles, and domain nuances using exemplar pairs.',
    description: 'Few-shot prompting provides the model with 2 to 5 concrete demonstration examples (input-output pairs) before asking it to solve a new target case. It is often called in-context learning because no model weights are updated.',
    coreDefinition: 'Few-shot learning conditions the model\'s conditional probability by embedding a sequence of exemplars: Prompt = [(x_1, y_1), (x_2, y_2), ..., (x_k, y_k), x_test]. The model infers the latent pattern f: x -> y and applies it to predict y_test.',
    realWorldExample: 'When converting medical jargon into patient-friendly SMS messages: Example 1: "Dyspnea on exertion" -> "Shortness of breath when walking". Example 2: "Cephalea" -> "Headache". Test: "Erythema on left patella" -> "Redness on your left kneecap".',
    comparisonTable: [
      { feature: 'Zero-Shot vs Few-Shot', colA: 'Zero-shot relies on baseline intuition', colB: 'Few-shot enforces exact formatting, tone, and edge-case handling' },
      { feature: 'Parameter Updates', colA: 'Fine-tuning modifies neural network weights', colB: 'Few-shot modifies only the prompt context; zero weights are changed' },
      { feature: 'Token Usage', colA: 'Minimal token cost', colB: 'Higher token consumption per request due to exemplar pairs' }
    ],
    interactivePrompt: {
      label: 'Few-Shot Structured Extractor',
      initialPrompt: 'Extract entities in JSON format based on the few-shot pattern below.',
      taskInput: `Input: Dr. Sarah Vance at St. Jude Hospital prescribed 50mg Amoxicillin.\nOutput: {"physician": "Dr. Sarah Vance", "facility": "St. Jude Hospital", "drug": "Amoxicillin", "dosage": "50mg"}\n\nInput: Dr. Kenji Tanaka at Tokyo Medical Center prescribed 10mg Lisinopril.\nOutput: {"physician": "Dr. Kenji Tanaka", "facility": "Tokyo Medical Center", "drug": "Lisinopril", "dosage": "10mg"}\n\nInput: Dr. Elena Rostova at City Clinic prescribed 200mg Ibuprofen.\nOutput:`,
      sampleOutput: `{"physician": "Dr. Elena Rostova", "facility": "City Clinic", "drug": "Ibuprofen", "dosage": "200mg"}`,
      explanation: 'The model mirrors the exact JSON key naming and format without needing an explicit schema description.'
    },
    quizChallenge: {
      question: 'What is the primary advantage of Few-Shot Prompting over Fine-Tuning?',
      options: [
        'Few-shot prompting permanently modifies the neural weights of the model',
        'Few-shot prompting provides instant adaptation to new formats without expensive GPU re-training or weight deployment',
        'Few-shot prompting works even if the model has a 0-token context window',
        'Few-shot prompting eliminates all API costs'
      ],
      correctIndex: 1,
      explanation: 'Few-shot prompting happens purely in-context; you get tailored behavior immediately without running expensive backpropagation training runs.'
    }
  },
  {
    id: 'concept-hallucinations',
    slug: 'hallucinations',
    title: 'AI Hallucinations & Factual Grounding',
    tagline: 'Understanding why language models fabricate facts and how to detect, prevent, and verify them.',
    description: 'An AI Hallucination occurs when a language model generates content that sounds authoritative, fluent, and convincing, but is factually false, ungrounded in source data, or logically fabricated.',
    coreDefinition: 'Hallucination stems from the fundamental nature of LLMs: they are probability engines trained to produce statistically plausible completions, not relational database query engines verifying truth. If training data is sparse, conflicting, or the prompt encourages speculation, the model generates fluent untruths.',
    realWorldExample: 'A lawyer using an LLM in federal court submitted a legal brief containing 6 fictitious legal decisions with realistic court case citations (e.g., "Varghese v. China Southern Airlines"). The LLM had invented plausible-sounding judges, dates, and case law numbers from whole cloth.',
    comparisonTable: [
      { feature: 'Factual Hallucination', colA: 'Fabricating non-existent research papers, dates, or historical events', colB: 'Mitigated by Retrieval-Augmented Generation (RAG) with verified sources' },
      { feature: 'Logical Hallucination', colA: 'Step 3 in a mathematical derivation contradicts Step 2', colB: 'Mitigated by Chain-of-Thought prompting and code-execution sandboxes' },
      { feature: 'Verification Discipline', colA: 'Blindly trusting AI output as infallible', colB: 'Treating AI as a draft creator; cross-referencing against primary sources' }
    ],
    interactivePrompt: {
      label: 'Hallucination Detection Sandbox',
      initialPrompt: 'Identify whether the following historical claim is factual or a classic AI hallucination.',
      taskInput: 'Claim: The famous physicist Albert Einstein was awarded the 1921 Nobel Prize in Physics for his groundbreaking discovery of the Theory of General Relativity.',
      sampleOutput: `Verification: PARTIALLY HALLUCINATED / COMMON TRAP.\nCorrection: Einstein won the 1921 Nobel Prize for his explanation of the PHOTOELECTRIC EFFECT, not for the Theory of General Relativity (which was considered too controversial by the committee at the time).`,
      explanation: 'Notice how a convincing claim easily slips past readers without strict ground-truth verification.'
    },
    quizChallenge: {
      question: 'Which of the following is the most effective engineering method to reduce AI hallucinations in a production educational app?',
      options: [
        'Setting the model temperature to 2.0 to make it more creative',
        'Retrieval-Augmented Generation (RAG) which retrieves verified textbook passages and instructs the model to answer strictly based on provided context',
        'Asking the user to type their questions in ALL CAPS',
        'Hiding the fact that an AI is generating the responses'
      ],
      correctIndex: 1,
      explanation: 'Grounding the model with verified source documents (RAG) and constraining output strictly to the provided text is the industry gold standard for hallucination mitigation.'
    }
  }
];
