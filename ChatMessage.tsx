import React from 'react';
import { Message } from '../types';
import BrainGraph from './BrainGraph';
import { User, Cpu } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAI = message.role === 'ai';

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] ${isAI ? 'flex-row' : 'flex-row-reverse'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isAI ? 'bg-cyan-600' : 'bg-indigo-600'}`}>
          {isAI ? <Cpu size={16} className="text-white" /> : <User size={16} className="text-white" />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
          <div className={`p-4 rounded-2xl shadow-lg ${
            isAI 
              ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-none' 
              : 'bg-indigo-600 text-white rounded-tr-none'
          }`}>
            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Mathematical Model Visualization (Only for AI) */}
          {isAI && message.graphData && (
            <div className="mt-3 w-full animate-fade-in">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-cyan-500 font-bold">Syntactic Analysis</span>
                <div className="h-[1px] bg-slate-700 flex-grow"></div>
              </div>
              <BrainGraph data={message.graphData} width={300} height={200} />
              <p className="text-[10px] text-slate-500 mt-1 italic">
                *Visualizing vector flow and grammatical weights
              </p>
            </div>
          )}
          
          <span className="text-[10px] text-slate-500 mt-1 opacity-70">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;