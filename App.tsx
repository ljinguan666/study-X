import React, { useState } from 'react';
import { Difficulty, GameStep, MathProblem } from './types';
import { generateProblem, validateEquation, checkAnswer } from './services/geminiService';
import { Button } from './components/Button';
import { ProgressBar } from './components/ProgressBar';
import { Character } from './components/Character';
import { ChatAssistant } from './components/ChatAssistant';
import { STRINGS } from './locales';

export default function App() {
  const [step, setStep] = useState<GameStep>(GameStep.MENU);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [problem, setProblem] = useState<MathProblem | null>(null);
  const [loading, setLoading] = useState(false);
  const [seenSignatures, setSeenSignatures] = useState<Set<string>>(new Set());
  
  // User inputs
  const [userEquation, setUserEquation] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  
  // Feedback state
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<'info' | 'error' | 'success'>('info');

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);

  const startGame = async (selectedDifficulty: Difficulty) => {
    setDifficulty(selectedDifficulty);
    setStep(GameStep.LOADING);
    setLoading(true);
    setMessage(STRINGS.feedback.loading);
    setIsChatOpen(false); 
    
    try {
      const newProblem = await generateProblem(selectedDifficulty, seenSignatures);
      
      // Update history
      const newHistory = new Set(seenSignatures);
      newHistory.add(newProblem.signature);
      setSeenSignatures(newHistory);

      setProblem(newProblem);
      setStep(GameStep.READ_PROBLEM);
      setUserEquation("");
      setUserAnswer("");
      setMessage("");
    } catch (error) {
      setMessage("Error generating problem.");
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
    setMessage(STRINGS.feedback.buildPrompt);
  };

  const handleCheckEquation = async () => {
    if (!userEquation.trim() || !problem) return;
    
    setLoading(true);
    
    try {
      const result = await validateEquation(problem, userEquation);
      if (result.correct) {
        setMessage(result.feedback);
        setMessageType('success');
        setTimeout(() => {
          setStep(GameStep.SOLVE);
          setMessage(STRINGS.feedback.solvePrompt);
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
    const result = checkAnswer(problem, numAns);
    
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
    setIsChatOpen(false);
  };

  // Render Helpers
  const renderMenu = () => (
    <div className="flex flex-col items-center space-y-8 animate-fade-in w-full max-w-md">
      <Character emotion="happy" />
      <div className="text-center">
        <h1 className="text-5xl font-extrabold text-white mb-3 drop-shadow-lg tracking-tight">
          {STRINGS.appTitle}
        </h1>
        <p className="text-blue-100 text-xl font-medium">{STRINGS.subTitle}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 w-full">
        <Button onClick={() => startGame(Difficulty.EASY)} variant="success" size="lg" className="shadow-xl border-green-600">
          {STRINGS.levels.easy}
        </Button>
        <Button onClick={() => startGame(Difficulty.MEDIUM)} variant="primary" size="lg" className="shadow-xl border-blue-600">
          {STRINGS.levels.medium}
        </Button>
        <Button onClick={() => startGame(Difficulty.HARD)} variant="secondary" size="lg" className="shadow-xl border-purple-600">
          {STRINGS.levels.hard}
        </Button>
      </div>
    </div>
  );

  const renderProblemCard = () => {
    if (!problem) return null;
    return (
      <div className="glass-panel p-6 rounded-3xl shadow-2xl w-full max-w-2xl mb-6 relative transform transition-all hover:scale-[1.01]">
        <div className="absolute -top-4 left-6 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full font-bold text-sm shadow-md border border-yellow-200">
          {STRINGS.problemLabel}
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
      {/* Header - Removed 'sticky' and 'top-0' to fix blocking issue on small screens */}
      <header className="p-4 w-full z-20">
        <div className="max-w-4xl mx-auto flex justify-between items-center bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-lg">
          <div className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform" onClick={resetGame}>
            <span className="text-2xl">🚀</span>
            <span className="font-bold text-xl text-blue-700 hidden sm:block">{STRINGS.appTitle}</span>
          </div>
          
          <div className="flex gap-3">
             {step > GameStep.MENU && (
                <Button variant="primary" size="sm" onClick={resetGame}>
                  {STRINGS.actions.home}
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
            <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 shadow-xl relative">
              
              {/* Step 1: Read & Define Unknown */}
              {step === GameStep.READ_PROBLEM && (
                <div className="text-center space-y-6">
                  <Character emotion="waiting" />
                  <h3 className="text-2xl font-bold text-indigo-700">{STRINGS.feedback.definePrompt}</h3>
                  <Button onClick={handleDefineVar} className="w-full md:w-auto mx-auto shadow-lg" size="lg">
                    {STRINGS.feedback.defineAction}
                  </Button>
                </div>
              )}

              {step === GameStep.DEFINE_VAR && (
                <div className="text-center space-y-6 animate-slide-up">
                  <Character emotion="thinking" />
                  <h3 className="text-2xl font-bold text-indigo-700">{STRINGS.steps.define}</h3>
                  <div className="bg-indigo-50 p-4 rounded-xl text-xl font-mono text-indigo-800 inline-block border-2 border-indigo-100 shadow-inner">
                     {STRINGS.solutionLabel} {problem.unknownDefinition}
                  </div>
                  <p className="text-gray-500 text-sm">{STRINGS.feedback.defineDone}</p>
                  <Button onClick={confirmVar} variant="success" className="w-full md:w-auto mx-auto shadow-lg">
                    {STRINGS.actions.confirmVar}
                  </Button>
                </div>
              )}

              {/* Step 2: Build Equation */}
              {step === GameStep.BUILD_EQUATION && (
                <div className="text-center space-y-6 animate-slide-up">
                   <div className="flex justify-center items-center gap-4">
                      <Character emotion="waiting" />
                      <div className="text-left">
                         <h3 className="text-2xl font-bold text-indigo-700">{STRINGS.steps.build}</h3>
                         <p className="text-gray-600 text-sm">{STRINGS.feedback.buildPrompt}</p>
                      </div>
                   </div>

                   <div className="chalkboard p-6 rounded-xl shadow-inner text-left relative overflow-hidden group">
                      <div className="absolute inset-0 bg-white opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"></div>
                      <input 
                        type="text" 
                        value={userEquation}
                        onChange={(e) => setUserEquation(e.target.value)}
                        placeholder={STRINGS.feedback.buildPlaceholder}
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
                       onClick={() => setMessage(`${STRINGS.actions.hint}: ${problem.hint}`)} 
                       variant="secondary" 
                       size="sm"
                       disabled={loading}
                     >
                       {STRINGS.actions.hint}
                     </Button>
                     <Button onClick={handleCheckEquation} disabled={loading || !userEquation} className="flex-1 md:flex-none shadow-lg">
                       {loading ? '...' : STRINGS.actions.submitEq}
                     </Button>
                   </div>
                </div>
              )}

              {/* Step 3: Solve */}
              {step === GameStep.SOLVE && (
                <div className="text-center space-y-6 animate-slide-up">
                  <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-bold text-indigo-700 mb-2">{STRINGS.steps.solve}</h3>
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
                    {STRINGS.actions.submitAns}
                  </Button>
                </div>
              )}

              {/* Success */}
              {step === GameStep.SUCCESS && (
                <div className="text-center space-y-8 animate-bounce-slight py-4">
                  <Character emotion="excited" />
                  <div>
                    <h2 className="text-4xl font-black text-yellow-500 mb-2 drop-shadow-sm tracking-wide uppercase">{STRINGS.feedback.successTitle}</h2>
                    <p className="text-gray-600 text-lg">{STRINGS.feedback.successMsg}</p>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-2xl border-2 border-green-100 shadow-inner">
                    <p className="font-bold text-green-800 mb-2 uppercase text-sm tracking-wider">{STRINGS.fullSolution}</p>
                    <div className="font-mono text-lg text-left whitespace-pre-line leading-relaxed text-gray-700">
                      <p>{STRINGS.solutionLabel} {problem.unknownDefinition}</p>
                      <p>Equation: {problem.equation}</p>
                      <p>x = {problem.answer}</p>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button onClick={resetGame} variant="secondary" className="shadow-lg">{STRINGS.actions.home}</Button>
                    <Button onClick={() => startGame(difficulty)} variant="primary" className="shadow-lg">{STRINGS.actions.retry}</Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}
      </main>

      {/* AI Chat Floating Button (Only valid when problem is active) */}
      {step > GameStep.LOADING && problem && (
        <div className="fixed bottom-6 right-6 z-40">
          {!isChatOpen && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="bg-white/80 backdrop-blur-md hover:scale-110 transition-transform p-2 rounded-full shadow-2xl border-2 border-indigo-200 group flex items-center gap-2 pr-5"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-2xl shadow-lg group-hover:rotate-12 transition-transform">
                🤖
              </div>
              <div className="text-left">
                <span className="block text-xs text-gray-500 font-bold uppercase tracking-wider">求助</span>
                <span className="block text-sm font-bold text-indigo-700">{STRINGS.actions.askAI}</span>
              </div>
            </button>
          )}
          
          {/* Chat Component */}
          <ChatAssistant 
            problem={problem} 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
        </div>
      )}
    </div>
  );
}