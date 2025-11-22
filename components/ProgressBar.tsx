import React from 'react';
import { GameStep } from '../types';

interface ProgressBarProps {
  currentStep: GameStep;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  // Map GameStep to a linear progress 0-3
  // Steps: Define(3) -> Build(4) -> Solve(5) -> Success(6)
  const steps = [
    { id: GameStep.DEFINE_VAR, label: "设未知数" },
    { id: GameStep.BUILD_EQUATION, label: "列方程" },
    { id: GameStep.SOLVE, label: "解方程" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full -z-10"></div>
        
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id || currentStep === GameStep.SUCCESS;
          const isActive = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300
                  ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                    isActive ? 'bg-blue-500 border-blue-200 text-white animate-bounce-slight' : 
                    'bg-white border-gray-300 text-gray-400'}
                `}
              >
                {isCompleted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <span className="font-bold text-lg">{index + 1}</span>
                )}
              </div>
              <span className={`mt-2 text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};