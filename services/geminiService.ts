import { Difficulty, MathProblem, CheckResult, ChatMessage } from "../types";
import { generateOfflineProblem } from "./problemBank";
import { checkEquationOffline } from "./mathEngine";

// Safely retrieve API Key using Vite's environment variables
// VITE_API_KEY is available at build time via import.meta.env
const apiKey = import.meta.env.VITE_API_KEY || "";

// Helper function to call DeepSeek API via Netlify function
const callDeepSeekAPI = async (messages: Array<{ role: string; content: string }>) => {
  if (!apiKey) {
    throw new Error("API Key not configured");
  }

  // Use Netlify function proxy for DeepSeek API
  const response = await fetch("/.netlify/functions/deepseek", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

// --- Helper: Clean JSON string from Markdown ---
const cleanJSON = (text: string): string => {
  let clean = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
  return clean.trim();
};

// --- Helper: Decode Base64 Audio ---
export const decodeAudioData = async (
  base64String: string, 
  audioContext: AudioContext
): Promise<AudioBuffer> => {
  const binaryString = atob(base64String);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return audioContext.decodeAudioData(bytes.buffer);
};

// --- Core: Generate Problem ---

export const generateProblem = async (difficulty: Difficulty, seenSignatures: Set<string>): Promise<MathProblem> => {
  // Fallback to offline immediately if no API Key is detected (safe failover)
  if (!apiKey) {
    console.warn("No API Key found, using offline mode.");
    return generateOfflineProblem(difficulty, seenSignatures);
  }

  try {
    return await generateOnlineProblem(difficulty, seenSignatures);
  } catch (error) {
    console.warn("Online generation failed, falling back to offline bank.", error);
    return generateOfflineProblem(difficulty, seenSignatures);
  }
};

const generateOnlineProblem = async (difficulty: Difficulty, seenSignatures: Set<string>): Promise<MathProblem> => {
  let difficultyPrompt = "";
  switch (difficulty) {
    case Difficulty.EASY:
      difficultyPrompt = "难度：简单。一步计算。场景：基础购物找零、简单的行程（速度x时间）、物品分配。方程形如 ax=b 或 x+a=b。";
      break;
    case Difficulty.MEDIUM:
      difficultyPrompt = "难度：中等。两步逻辑。场景：打车计费（起步价+里程）、网购（商品+运费）、团体门票。方程形如 ax+b=c。";
      break;
    case Difficulty.HARD:
      difficultyPrompt = "难度：困难。复杂逻辑。场景：行程问题（相遇/追及）、工程合作、方案比较（储蓄/话费套餐）。方程形如 ax+b = cx+d 或 (a+b)x = c。";
      break;
  }

  const prompt = `你是一个富有创意的小学数学老师。请编写一道贴近生活实际的一元一次方程应用题。
  
  要求：
  1. ${difficultyPrompt}
  2. 必须包含以下生活场景之一：购物消费、行程问题（开车/跑步）、打车/计费标准、工程效率。
  3. 题目描述要自然、具体（例如包含具体的人物、地点、商品名称）。
  4. 简体中文。
  5. 必须严格返回 JSON。
  6. 解必须是整数。
  
  JSON Schema:
  {
    "story": string,
    "question": string,
    "unknownDefinition": string (e.g. "设...为 x"),
    "equation": string,
    "answer": number,
    "hint": string
  }`;

  const responseText = await callDeepSeekAPI([
    {
      role: "user",
      content: prompt
    }
  ]);

  if (!responseText) throw new Error("Empty response from DeepSeek");

  const parsed = JSON.parse(cleanJSON(responseText));

  const signature = `AI-${difficulty}-${parsed.answer}-${parsed.equation.replace(/\s/g,'')}`;

  if (seenSignatures.has(signature)) {
      throw new Error("Duplicate AI problem");
  }

  return {
    id: Date.now().toString(),
    signature: signature,
    story: parsed.story,
    question: parsed.question,
    unknownDefinition: parsed.unknownDefinition,
    equation: parsed.equation,
    answer: parsed.answer,
    hint: parsed.hint
  };
};

// --- Offline Check Functions ---

export const validateEquation = async (
  problem: MathProblem, 
  userEquation: string
): Promise<CheckResult> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return checkEquationOffline(problem.answer, userEquation);
};

export const checkAnswer = (problem: MathProblem, userAnswer: number): CheckResult => {
  const isCorrect = Math.abs(problem.answer - userAnswer) < 0.01;
  return { 
    correct: isCorrect, 
    feedback: isCorrect ? "答案正确！" : "答案不太对，请再算一下。" 
  };
};

// --- AI Chat & TTS Functions ---

export const getAIExplanation = async (
  problem: MathProblem,
  history: ChatMessage[],
  userQuestion: string
): Promise<string> => {
  if (!apiKey) return "API Key 未配置，无法连接 AI 老师。";

  try {
    const systemPrompt = `你是一位友善、耐心的小学数学辅导老师。
    当前题目：${problem.story}
    问题：${problem.question}
    方程：${problem.equation}
    答案：${problem.answer}
    请循循善诱，不要直接给答案。回复简短（3-5句）。`;

    // Convert chat history format
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
      })),
      { role: "user", content: userQuestion }
    ];

    const responseText = await callDeepSeekAPI(messages);
    return responseText || "抱歉，我走神了。";
  } catch (error) {
    console.error("DeepSeek Chat Error:", error);
    return "网络有点卡，AI 老师暂时听不见。";
  }
};

// TTS using browser Web Speech API as fallback
export const getGeminiTTS = async (text: string): Promise<string | null> => {
  // Since DeepSeek doesn't have TTS, we return null
  // The ChatAssistant can use browser's SpeechSynthesis API instead
  return null;
};
