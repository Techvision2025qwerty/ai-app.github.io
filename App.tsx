import React, { useState, useEffect, useRef } from 'react';
import { Send, Zap, Activity } from 'lucide-react';
import { Message, ConnectionStatus } from './types';
import { generateAIResponse } from './services/geminiService';
import ChatMessage from './components/ChatMessage';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.IDLE);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'init',
        role: 'ai',
        content: 'Привет! Я Syntactic-Ru. Моя архитектура основана на векторном анализе синтаксиса. Я строю предложения, рассчитывая вес каждого слова. О чем ты хочешь поговорить?',
        timestamp: Date.now(),
        graphData: {
          nodes: [
            { id: 'Я', word: 'Я', role: 'Субъект', weight: 0.9, group: 1 },
            { id: 'Syntactic', word: 'Syntactic-Ru', role: 'Имя', weight: 0.95, group: 3 },
            { id: 'строю', word: 'строю', role: 'Предикат', weight: 0.8, group: 2 },
            { id: 'предложения', word: 'предложения', role: 'Объект', weight: 0.7, group: 3 }
          ],
          links: [
            { source: 'Я', target: 'строю', value: 1 },
            { source: 'строю', target: 'Syntactic', value: 0.5 },
            { source: 'строю', target: 'предложения', value: 0.8 }
          ]
        }
      }
    ]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || status === ConnectionStatus.THINKING) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setStatus(ConnectionStatus.THINKING);

    try {
      const response = await generateAIResponse(userMsg.content);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.text,
        graphData: response.graph,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, aiMsg]);
      setStatus(ConnectionStatus.IDLE);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Ошибка: Нарушение целостности математической модели. Проверьте API ключ или соединение.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMsg]);
      setStatus(ConnectionStatus.ERROR);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Syntactic-Ru <span className="text-cyan-400">AI</span></h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Mathematical Core Active
            </p>
          </div>
        </div>
        <div className="hidden md:flex text-xs text-slate-500 font-mono gap-4">
          <span>MODEL: VECTOR-FLOW-V1</span>
          <span>LANG: RU-NATIVE</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 z-10 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          
          {status === ConnectionStatus.THINKING && (
            <div className="flex items-center gap-2 text-cyan-400 text-sm animate-pulse ml-12">
              <Zap size={16} />
              <span className="font-mono">Computing vector weights...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 md:p-6 bg-slate-900/90 border-t border-slate-800 z-20">
        <div className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите запрос для анализа..."
            className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 rounded-xl py-4 pl-5 pr-14 outline-none border border-slate-700 focus:border-cyan-500 transition-colors shadow-lg"
            disabled={status === ConnectionStatus.THINKING}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || status === ConnectionStatus.THINKING}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
              input.trim() && status !== ConnectionStatus.THINKING
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md' 
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        <div className="text-center mt-2">
           <p className="text-[10px] text-slate-600">Система обучается на лету. Ввод только на русском языке для корректной работы математической модели.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;