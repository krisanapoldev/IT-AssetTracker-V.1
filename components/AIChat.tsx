
import React, { useState, useRef, useEffect } from 'react';
import { Asset, BorrowRecord } from '../types';
import { analyzeInventory } from '../services/geminiService';
import { Sparkles, Send, Bot, Loader2, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AIChatProps {
  assets: Asset[];
  history?: BorrowRecord[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIChat: React.FC<AIChatProps> = ({ assets, history = [] }) => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Set initial message based on language
  useEffect(() => {
    setMessages([
      { role: 'ai', content: t('aiIntro') }
    ]);
  }, [language]); // Reset chat intro when language changes (optional, or just update new messages)

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const aiResponse = await analyzeInventory(userMessage, assets, history, language);

    setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl ring-1 ring-slate-200 h-full flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center gap-3 shadow-lg z-10">
        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-white text-lg leading-tight">{t('aiTitle')}</h2>
          <div className="flex items-center gap-1.5 opacity-80">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-white font-medium">{t('onlineReady')}</span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 scroll-smooth">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slideInUp`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-white border border-purple-100'}`}>
                {msg.role === 'user' ? <User className="text-indigo-600 w-5 h-5" /> : <Bot className="text-purple-600 w-6 h-6" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 rounded-tl-none ring-1 ring-slate-100'
              }`}>
                {msg.content}
                {/* Tiny tail for bubble */}
                <div className={`absolute top-0 w-3 h-3 ${
                   msg.role === 'user' 
                   ? '-right-1.5 bg-indigo-600 clip-path-triangle-right' 
                   : '-left-1.5 bg-white clip-path-triangle-left'
                }`}></div>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-[85%]">
               <div className="w-10 h-10 rounded-full bg-white border border-purple-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot className="text-purple-600 w-6 h-6" />
              </div>
              <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-none ring-1 ring-slate-100 shadow-sm flex items-center gap-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{t('aiProcessing')}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-slate-100">
        <div className="flex gap-3 relative items-end">
          <div className="flex-1 relative">
             <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={t('typeMessage')}
              disabled={isLoading}
              rows={1}
              className="w-full px-5 py-3.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm resize-none max-h-32 shadow-inner"
              style={{ minHeight: '52px' }}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-14 h-[52px] rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
          </button>
        </div>
        <div className="text-center mt-3">
           <p className="text-[10px] text-slate-400 font-medium bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100">
             {t('aiDisclaimer')}
           </p>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
