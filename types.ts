export enum Difficulty {
  EASY = 'EASY',     // x + a = b
  MEDIUM = 'MEDIUM', // ax + b = c
  HARD = 'HARD'      // ax + b = cx + d or parentheses
}

export type Language = 'zh' | 'en';

export interface MathProblem {
  id: string;
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