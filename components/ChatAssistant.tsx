import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MathProblem } from '../types';
import { getAIExplanation, getGeminiTTS, decodeAudioData } from '../services/geminiService';
import { STRINGS } from '../locales';

interface ChatAssistantProps {
  problem: MathProblem;
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
    AudioContext: any;
    webkitAudioContext: any;
  }
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ problem, isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSoundOn, setIsSoundOn] = useState(false); 
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Audio Context for Gemini TTS
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const introText = "你好！我是 Gemini 驱动的智能助教。这道题哪里不懂，可以直接跟我说哦！";
      setMessages([
        {
          role: 'model',
          text: introText,
          timestamp: Date.now()
        }
      ]);
      // Try to play greeting if sound is on (might be blocked by autoplay policy if no interaction yet)
      if(isSoundOn) playGeminiAudio(introText);
    }
  }, [isOpen, problem]);

  useEffect(() => {
    setMessages([]);
    stopAudio();
  }, [problem]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isListening]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(STRINGS.chat.noVoice);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Ensure AudioContext is resumed on user interaction
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      setIsSoundOn(true); 
      stopAudio();
      setInput("");
      recognitionRef.current.start();
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      audioSourceRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const playGeminiAudio = async (text: string) => {
    if (!isSoundOn) return;
    stopAudio();
    setIsSpeaking(true);

    // 1. Try Gemini TTS (Network)
    const base64Audio = await getGeminiTTS(text);

    if (base64Audio) {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioContextRef.current;
        if (!ctx) return; // Safety check
        const buffer = await decodeAudioData(base64Audio, ctx);
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start(0);
        audioSourceRef.current = source;
        return; // Success
      } catch (e) {
        console.error("Audio Decode Error", e);
      }
    }

    // 2. Fallback to Browser TTS if Gemini fails or returns null
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    stopAudio();
    if (isListening && recognitionRef.current) recognitionRef.current.stop();

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
      playGeminiAudio(aiResponseText);

    } catch (e) {
      const errorMsg: ChatMessage = { 
        role: 'model', 
        text: "抱歉，网络出小差了，请重试。", 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, errorMsg]);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-end md:items-end md:p-6 bg-black/20 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none animate-fade-in">
      <div className="bg-white/95 w-full h-full md:w-[400px] md:h-[600px] md:rounded-3xl flex flex-col shadow-2xl border border-white/50 backdrop-blur-xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
            <h3 className="font-bold text-lg">Gemini 助教</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                const newState = !isSoundOn;
                setIsSoundOn(newState);
                if (!newState) stopAudio();
              }} 
              className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
              title="朗读开关"
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
                className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                <span className="text-xs text-gray-400 mr-2">Gemini 思考中</span>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          
          {/* Voice Status Indicator */}
          {isListening && (
            <div className="mb-2 text-center text-sm text-red-500 font-bold animate-pulse">
               🎤 {STRINGS.chat.listening}
            </div>
          )}

          <div className="flex gap-2 items-end">
            
            {/* Mic Button */}
            <button 
              onClick={toggleListening}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md flex-shrink-0 ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="点击说话"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? STRINGS.chat.speakPrompt : STRINGS.chat.placeholder}
              disabled={isLoading}
              className="flex-1 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-2xl px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all min-h-[40px]"
            />
            
            <button 
              onClick={handleSend} 
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-md flex-shrink-0"
            >
              <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};