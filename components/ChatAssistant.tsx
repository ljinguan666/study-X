import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MathProblem } from '../types';
import { getAIExplanation, getGeminiTTS } from '../services/geminiService';
import { STRINGS } from '../locales';

interface ChatAssistantProps {
  problem: MathProblem;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ problem, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize AudioContext on user interaction
  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  // Initialize voices
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.cancel();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Initialize with greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const introText = STRINGS.chat.intro;
      setMessages([
        {
          role: 'model',
          text: introText,
          timestamp: Date.now()
        }
      ]);
      if (isSoundOn) {
        setTimeout(() => speak(introText), 500);
      }
    }
  }, [isOpen, problem]);

  // Reset chat when problem changes
  useEffect(() => {
    setMessages([]);
    window.speechSynthesis.cancel();
  }, [problem]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isListening]);

  const speak = async (text: string) => {
    if (!isSoundOn) return;
    initAudio();
    setIsSpeaking(true);

    // 1. Try Gemini TTS (High Quality)
    try {
      const audioBufferData = await getGeminiTTS(text);
      
      if (audioBufferData && audioContextRef.current) {
         const audioBuffer = await audioContextRef.current.decodeAudioData(audioBufferData);
         const source = audioContextRef.current.createBufferSource();
         source.buffer = audioBuffer;
         source.connect(audioContextRef.current.destination);
         source.start();
         source.onended = () => setIsSpeaking(false);
         return; // Success with Gemini
      }
    } catch (e) {
      console.warn("Gemini TTS failed, falling back to browser TTS");
    }

    // 2. Fallback to Browser TTS
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.95; 
    utterance.pitch = 1.0; 

    const voices = window.speechSynthesis.getVoices();
    
    // Priority list for Chinese Gentle voices
    const zhPriorities = [
      'Xiaoxiao', // Microsoft Neural (Very gentle)
      'Huihui',   // Microsoft Standard
      'Google 普通话', // Google Standard
      'Ting-Ting', // macOS Standard
      'zh-CN'      // Fallback
    ];
    
    const targetVoice = voices.find(v => zhPriorities.some(p => v.name.includes(p)) || v.lang === 'zh-CN');
    if (targetVoice) utterance.voice = targetVoice;

    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    window.speechSynthesis.cancel();

    const userText = input.trim();
    setInput(""); 
    
    const userMsg: ChatMessage = { role: 'user', text: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const aiResponseText = await getAIExplanation(problem, messages, userText);
      
      const aiMsg: ChatMessage = { 
        role: 'model', 
        text: aiResponseText, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, aiMsg]);
      speak(aiResponseText);

    } catch (e) {
       // Error
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(STRINGS.chat.noVoice);
      return;
    }

    window.speechSynthesis.cancel();
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      }
    };

    recognition.start();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-end md:items-end md:p-6 bg-black/20 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none animate-fade-in">
      <div className="bg-white/95 w-full h-full md:w-[400px] md:h-[600px] md:rounded-3xl flex flex-col shadow-2xl border border-white/50 backdrop-blur-xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xl">👩‍🏫</div>
            <h3 className="font-bold text-lg">{STRINGS.chat.title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSoundOn(!isSoundOn)} 
              className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
            >
              {isSoundOn ? (
                <span className={isSpeaking ? "animate-pulse text-yellow-300" : ""}>🔊</span>
              ) : (
                <span>🔇</span>
              )}
            </button>
            <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          {isListening && (
             <div className="flex justify-center items-center py-2 animate-pulse text-indigo-600 font-bold">
              🎤 {STRINGS.chat.listening}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2 items-end">
            <button
              onClick={toggleListening}
              disabled={isLoading || isListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md border ${
                isListening 
                  ? 'bg-red-100 text-red-500 border-red-300 scale-110' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
              }`}
            >
               🎤
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={STRINGS.chat.placeholder}
              disabled={isLoading}
              className="flex-1 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-2xl px-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all min-h-[40px]"
            />
            <button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md"
            >
              <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};