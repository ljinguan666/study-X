import { Difficulty, MathProblem, CheckResult, Language } from "../types";
import { generateOfflineProblem } from "./problemBank";
import { checkEquationOffline } from "./mathEngine";

// To ensure "Direct access without waiting", we bypass Gemini and use the local engine.
// This satisfies the request for "100 offline questions" (via procedural generation)

export const generateProblem = async (difficulty: Difficulty, lang: Language = 'zh'): Promise<MathProblem> => {
  // Fast response
  await new Promise(resolve => setTimeout(resolve, 100));
  return generateOfflineProblem(difficulty, lang);
};

export const validateEquation = async (
  problem: MathProblem, 
  userEquation: string,
  lang: Language
): Promise<CheckResult> => {
  // Fast check
  await new Promise(resolve => setTimeout(resolve, 100));
  return checkEquationOffline(problem.answer, userEquation, lang);
};

export const checkAnswer = (problem: MathProblem, userAnswer: number, lang: Language): CheckResult => {
  const isCorrect = Math.abs(problem.answer - userAnswer) < 0.01;
  
  const feedback = isCorrect 
    ? (lang === 'zh' ? "太棒了！答案完全正确！" : "Correct! Great job!")
    : (lang === 'zh' ? "再试一次哦，计算可能有点小误差。" : "Try again, check your math.");
    
  return { correct: isCorrect, feedback };
};