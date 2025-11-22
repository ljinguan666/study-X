import React from 'react';

interface CharacterProps {
  emotion?: 'happy' | 'thinking' | 'excited' | 'waiting';
}

export const Character: React.FC<CharacterProps> = ({ emotion = 'happy' }) => {
  // Using emoji based composition for a simple, lightweight mascot
  // In a real production app, this would be an SVG or Image
  
  let face = "^_^";
  let bounce = "";

  switch (emotion) {
    case 'thinking':
      face = "o_O ?";
      bounce = "translate-y-2";
      break;
    case 'excited':
      face = ">▽< !";
      bounce = "animate-bounce";
      break;
    case 'waiting':
      face = "•_•";
      bounce = "";
      break;
    case 'happy':
    default:
      face = "^‿^";
      bounce = "animate-bounce-slight";
      break;
  }

  return (
    <div className={`flex flex-col items-center justify-center ${bounce} transition-all duration-300`}>
      <div className="w-24 h-24 bg-yellow-300 rounded-full border-4 border-yellow-500 shadow-xl flex items-center justify-center text-2xl font-bold text-yellow-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-yellow-200 opacity-50 rounded-full scale-75 translate-x-[-10px] translate-y-[-10px]"></div>
        <span className="relative z-10">{face}</span>
      </div>
      <div className="w-16 h-4 bg-black opacity-10 rounded-full blur-sm mt-2"></div>
    </div>
  );
};