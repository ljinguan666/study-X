export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface MathProblem {
  id: string;
  signature: string; // Unique hash
  story: string;
  question: string;
  unknownDefinition: string;
  equation: string;
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
