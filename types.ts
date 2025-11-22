export enum Difficulty {
  EASY = 'EASY',     // x + a = b
  MEDIUM = 'MEDIUM', // ax + b = c
  HARD = 'HARD'      // ax + b = cx + d or parentheses
}

export interface MathProblem {
  id: string;
  signature: string; // Unique hash of the problem content (difficulty + template + vars)
  story: string;
  question: string;
  unknownDefinition: string; // e.g., "Let x be the number of apples"
  equation: string; // The canonical equation
  answer: number;
  hint: string;
}

export enum GameStep {
  MENU = 0,
  LOADING = 1,
  READ_PROBLEM = 2,
  DEFINE_VAR = 3,
  BUILD_EQUATION = 4,
  SOLVE = 5,
  SUCCESS = 6
}

export interface CheckResult {
  correct: boolean;
  feedback: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}