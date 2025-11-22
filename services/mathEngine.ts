import { CheckResult, Language } from "../types";
import { translations } from "../locales";

/**
 * Evaluates a math expression string with a given variable value.
 * Supports basic operators +, -, *, /, (), and implied multiplication (2x).
 */
const evaluateExpression = (expr: string, xVal: number): number => {
  try {
    // 1. Normalize: Remove spaces, handle implied multiplication (2x -> 2*x, )x -> )*x)
    let clean = expr.replace(/\s+/g, '').toLowerCase();
    
    // Replace 'x' with the actual number, wrapping in parens to be safe for negatives
    // But first, handle coefficient: 2x -> 2*...
    clean = clean.replace(/(\d|\))x/g, '$1*' + xVal);
    clean = clean.replace(/x/g, String(xVal));

    // Security note: In a real web app, avoiding eval is better, but for a math toy 
    // with controlled inputs (numbers and operators), Function constructor is acceptable
    // providing we sanitize strict inputs.
    // Sanitize: only allow numbers, operators, parens
    if (/[^0-9+\-*/().]/.test(clean)) return NaN;

    // eslint-disable-next-line no-new-func
    return new Function(`return ${clean}`)();
  } catch (e) {
    return NaN;
  }
};

export const checkEquationOffline = (
  targetAnswer: number, 
  userEq: string, 
  lang: Language
): CheckResult => {
  const parts = userEq.split('=');
  if (parts.length !== 2) {
    return { 
      correct: false, 
      feedback: lang === 'zh' ? "方程必须包含一个等号 '='" : "An equation must have one '=' sign." 
    };
  }

  const lhs = parts[0];
  const rhs = parts[1];

  // We test the equation by plugging in the correct answer.
  // If LHS(answer) == RHS(answer), the equation is valid for the solution.
  const valL = evaluateExpression(lhs, targetAnswer);
  const valR = evaluateExpression(rhs, targetAnswer);

  if (isNaN(valL) || isNaN(valR)) {
     return { 
      correct: false, 
      feedback: lang === 'zh' ? "方程包含无法识别的字符。" : "Equation contains invalid characters." 
    };
  }

  // Allow small floating point error
  if (Math.abs(valL - valR) < 0.001) {
    return { 
      correct: true, 
      feedback: translations[lang].feedback.correctEq 
    };
  }

  return { 
    correct: false, 
    feedback: translations[lang].feedback.errorEq 
  };
};