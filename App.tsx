import React, { useState, useEffect } from 'react';
import { Difficulty, GameStep, MathProblem, Language } from './types';
import { generateProblem, validateEquation, checkAnswer } from './services/geminiService';
import { Button } from './components/Button';
import { ProgressBar } from './components/ProgressBar';
import { Character } from './components/Character';
import { translations, t } from './locales';

export default function App() {
  const [step, setStep] = useState<GameStep>(GameStep.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<Language>('zh');
  
  // User inputs
  const [userEquation, setUserEquation] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  
  // Feedback state
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<'info' | 'error' | 'success'>('info');

  const startGame = async (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setStep(GameStep.LOADING);
    setLoading(true);
    setMessage(translations[lang].feedback.loading);
    
    try {
      const newProblem = await generateProblem(selectedDifficulty, lang);
      setProblem(newProblem);
      setStep(GameStep.READ_PROBLEM);
      setUserEquation("");
      setUserAnswer("");
      setMessage("");
    } catch (error) {
      setMessage("Error generating problem. Try again.");
      setStep(GameStep.MENU);
    } finally {
      setLoading(false);
    }
  };

  const handleDefineVar = () => {
    setStep(GameStep.DEFINE_VAR);
    setMessage("");
  };

  const confirmVar = () => {
    setStep(GameStep.BUILD_EQUATION);
    setMessage(translations[lang].feedback.buildPrompt);
  };

  const handleCheckEquation = async () => {
    if (!userEquation.trim() || !problem) return;
    
    setLoading(true);
    
    try {
      const result = await validateEquation(problem, userEquation, lang);
      if (result.correct) {
        setMessage(result.feedback);
        setMessageType('success');
        setTimeout(() => {
          setStep(GameStep.SOLVE);
          setMessage(translations[lang].feedback.solvePrompt);
          setMessageType('info');
        }, 1000);
      } else {
        setMessage(result.feedback);
        setMessageType('error');
      }
    } catch (e) {
      setMessage("Error checking equation.");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnswer = () => {
    if (!userAnswer || !problem) return;
    
    const numAns = parseFloat(userAnswer);
    const result = checkAnswer(problem, numAns, lang);
    
    if (result.correct) {
      setStep(GameStep.SUCCESS);
      setMessage(result.feedback);
      setMessageType('success');
      // Trigger global confetti function attached to window
      if ((window as any).triggerConfetti) {
        (window as any).triggerConfetti();
      }
    } else {
      setMessage(result.feedback);
      setMessageType('error');
    }
  };

  const resetGame = () => {
    setStep(GameStep.MENU);
    setProblem(null);
    setMessage("");
  };

  const toggleLang = () => {
    setLang(prev => prev === 'zh' ? 'en' : 'zh');
  };

  // Render Helpers
  const renderMenu = () => (
    <div className="flex flex-col items-center space-y-8 animate-fade-in w-full max-w-md">
      <Character emotion="happy" />
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-lg tracking-tight">
          {translations[lang].appTitle}
        </h1>
        <p className="text-blue-100 text-xl font-medium">{translations[lang].subTitle}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 w-full">
        <Button onClick={() => startGame(Difficulty.EASY)} variant="success" size="lg" className="shadow-xl border-green-600">
          {translations[lang].levels.easy}
        </Button>
        <Button onClick={() => startGame(Difficulty.MEDIUM)} variant="primary" size="lg" className="shadow-xl border-blue-600">
          {translations[lang].levels.medium}
        </Button>
        <Button onClick={() => startGame(Difficulty.HARD)} variant="secondary" size="lg" className="shadow-xl border-purple-600">
          {translations[lang].levels.hard}
        </Button>
      </div>
    </div>
  );

  const renderProblemCard = () => {
    if (!problem) return null;
    return (
      <div className="glass-panel p-6 rounded-3xl shadow-2xl w-full max-w-2xl mb-6 relative transform transition-all hover:scale-[1.01]">
        <div className="absolute -top-4 left-6 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-bold text-sm shadow-md border border-yellow-200">
          {translations[lang].problemLabel}
        </div>
        <p className="text-xl md:text-2xl text-gray-800 leading-relaxed mt-2 font-medium">
          {problem.story} <br/>
          <span className="font-bold text-blue-600 block mt-3">{problem.question}</span>
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800 relative z-10">
      {/* Header */}
      <header className="p-4 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={resetGame}>
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-xl text-blue-700 hidden sm:block">{translations[lang].appTitle}</span>
          </div>
          
          <div className="flex gap-3">
             <button 
               onClick={toggleLang}
               className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full font-bold text-sm border border-gray-300 transition-colors"
             >
               {lang === 'zh' ? '🇺🇸 English' : '🇨🇳 中文'}
             </button>
             {step > GameStep.MENU && (
                <Button variant="primary" size="sm" onClick={resetGame}>
                  {translations[lang].actions.home}
                </Button>
             )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 w-full max-w-4xl mx-auto">
        
        {step === GameStep.MENU && renderMenu()}
        
        {step === GameStep.LOADING && (
          <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-b-transparent"></div>
            <p className="text-xl font-bold animate-pulse">{message}</p>
            <Character emotion="thinking" />
          </div>
        )}

        {step > GameStep.LOADING && problem && (
          <div className="w-full flex flex-col items-center space-y-6 animate-fade-in">
            
            <ProgressBar currentStep={step} />
            
            {renderProblemCard()}

            {/* Game Steps Logic */}
            <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 shadow-xl">
              
              {/* Step 1: Read & Define Unknown */}
              {step === GameStep.READ_PROBLEM && (
                <div className="text-center space-y-6">
                  <Character emotion="waiting" />
                  <h3 className="text-2xl font-bold text-indigo-700">{translations[lang].feedback.definePrompt}</h3>
                  <Button onClick={handleDefineVar} className="w-full md:w-auto mx-auto shadow-lg" size="lg">
                    {translations[lang].feedback.defineAction}
                  </Button>
                </div>
              )}

              {step === GameStep.DEFINE_VAR && (
                <div className="text-center space-y-6 animate-slide-up">
                  <Character emotion="thinking" />
                  <h3 className="text-2xl font-bold text-indigo-700">{translations[lang].steps.define}</h3>
                  <div className="bg-indigo-50 p-4 rounded-xl text-xl font-mono text-indigo-800 inline-block border-2 border-indigo-100 shadow-inner">
                     {translations[lang].solutionLabel} {problem.unknownDefinition}
                  </div>
                  <p className="text-gray-500 text-sm">{translations[lang].feedback.defineDone}</p>
                  <Button onClick={confirmVar} variant="success" className="w-full md:w-auto mx-auto shadow-lg">
                    {translations[lang].actions.confirmVar}
                  </Button>
                </div>
              )}

              {/* Step 2: Build Equation */}
              {step === GameStep.BUILD_EQUATION && (
                <div className="text-center space-y-6 animate-slide-up">
                   <div className="flex justify-center items-center gap-4">
                      <Character emotion="waiting" />
                      <div className="text-left">
                         <h3 className="text-2xl font-bold text-indigo-700">{translations[lang].steps.build}</h3>
                         <p className="text-gray-600 text-sm">{translations[lang].feedback.buildPrompt}</p>
                      </div>
                   </div>

                   <div className="chalkboard p-6 rounded-xl shadow-inner text-left relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"></div>
                      <input 
                        type="text" 
                        value={userEquation}
                        onChange={(e) => setUserEquation(e.target.value)}
                        placeholder={translations[lang].feedback.buildPlaceholder}
                        className="w-full bg-transparent border-b-2 border-gray-500 focus:border-yellow-400 text-3xl font-mono focus:outline-none text-white placeholder-gray-600 text-center py-2 transition-colors"
                      />
                   </div>

                   {message && (
                     <div className={`p-3 rounded-lg font-bold ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                       {message}
                     </div>
                   )}

                   <div className="flex gap-4 justify-center">
                     <Button 
                       onClick={() => setMessage(`${translations[lang].actions.hint}: ${problem.hint}`)} 
                       variant="secondary" 
                       size="sm"
                       disabled={loading}
                     >
                       {translations[lang].actions.hint}
                     </Button>
                     <Button onClick={handleCheckEquation} disabled={loading || !userEquation} className="flex-1 md:flex-none shadow-lg">
                       {loading ? '...' : translations[lang].actions.submitEq}
                     </Button>
                   </div>
                </div>
              )}

              {/* Step 3: Solve */}
              {step === GameStep.SOLVE && (
                <div className="text-center space-y-6 animate-slide-up">
                  <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-indigo-700 mb-2">{translations[lang].steps.solve}</h3>
                    <div className="bg-gray-800 text-white px-6 py-3 rounded-lg text-2xl font-mono shadow-md mb-4">
                      {problem.equation}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 text-3xl font-bold text-gray-700">
                     <span>x = </span>
                     <input 
                       type="number" 
                       value={userAnswer}
                       onChange={(e) => setUserAnswer(e.target.value)}
                       className="w-32 border-b-4 border-gray-300 bg-gray-50 rounded-lg p-2 text-center focus:border-blue-500 transition-all outline-none"
                       placeholder="?"
                     />
                  </div>

                  {message && (
                     <div className={`p-3 rounded-lg font-bold ${messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                       {message}
                     </div>
                   )}

                  <Button onClick={handleCheckAnswer} size="lg" variant="success" className="w-full md:w-auto mx-auto shadow-xl">
                    {translations[lang].actions.submitAns}
                  </Button>
                </div>
              )}

              {/* Success */}
              {step === GameStep.SUCCESS && (
                <div className="text-center space-y-8 animate-bounce-slight py-4">
                  <Character emotion="excited" />
                  <div>
                    <h2 className="text-4xl font-black text-yellow-500 mb-2 drop-shadow-sm tracking-wide uppercase">{translations[lang].feedback.successTitle}</h2>
                    <p className="text-gray-600 text-lg">{translations[lang].feedback.successMsg}</p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-100 shadow-inner">
                    <p className="font-bold text-green-800 mb-2 uppercase text-sm tracking-wider">{translations[lang].fullSolution}</p>
                    <div className="font-mono text-lg text-left whitespace-pre-line leading-relaxed text-gray-700">
                      <p>{translations[lang].solutionLabel} {problem.unknownDefinition}</p>
                      <p>Equation: {problem.equation}</p>
                      <p>x = {problem.answer}</p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button onClick={resetGame} variant="secondary" className="shadow-lg">{translations[lang].actions.home}</Button>
                    <Button onClick={() => startGame(difficulty)} variant="primary" className="shadow-lg">{translations[lang].actions.retry}</Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>
    </div>
  );
}