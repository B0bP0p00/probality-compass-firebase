import React, { useState, useRef, useEffect } from 'react';
import { Send, Clock, RotateCcw, AlertCircle, Link as LinkIcon, Compass } from 'lucide-react';
import { Message, HistoryItem } from '../types';
import { generatePrediction } from '../services/geminiService';
import { MarkdownRenderer } from '../components/MarkdownRenderer';

interface ChatPageProps {
  history: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
  onViewHistory: () => void;
  initialQuery?: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({ history, addToHistory, onViewHistory, initialQuery }) => {
  const [input, setInput] = useState(initialQuery || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  useEffect(() => {
      if (initialQuery && messages.length === 0) {
          handleSend(initialQuery);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() || isThinking) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const { text: responseText, sources } = await generatePrediction(text, messages);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: Date.now(),
        sources: sources
      };

      const newMessages = [...messages, userMsg, aiMsg];
      setMessages(newMessages);

      // Save to history (only if it's a fresh conversation or significant update)
      // For this demo, we save every successful completion interaction as a history item
      addToHistory({
        id: Date.now().toString(),
        query: text,
        summary: responseText.slice(0, 100) + "...",
        timestamp: Date.now(),
        messages: newMessages
      });

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: "System Error: Unable to process request. Please ensure valid API credentials and try again.",
        timestamp: Date.now()
      } as Message]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full relative">
      {/* Header Area within Chat */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-20">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
                <Compass className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100 hidden sm:block">Analysis Engine</h2>
        </div>
        
        <button 
          onClick={onViewHistory}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors text-sm text-slate-300"
        >
          <Clock className="w-4 h-4" />
          <span className="hidden sm:inline">History</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-32">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 mt-20">
            <Compass className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium">Ready to calculate probabilities.</p>
            <p className="text-sm opacity-60">Ask about future events, markets, or verified outcomes.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full max-w-lg">
                <button onClick={() => handleSend("Will SpaceX launch Starship next month?")} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-left text-sm hover:border-slate-600 transition-colors">
                    Will SpaceX launch Starship next month?
                </button>
                <button onClick={() => handleSend("Did the Fed cut rates in the last meeting?")} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-left text-sm hover:border-slate-600 transition-colors">
                    Did the Fed cut rates in the last meeting?
                </button>
                <button onClick={() => handleSend("Who is favored to win the 2024 NBA Finals?")} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-left text-sm hover:border-slate-600 transition-colors">
                    Who is favored to win the 2024 NBA Finals?
                </button>
                 <button onClick={() => handleSend("What is the probability of Bitcoin reaching 100k in 2024?")} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-left text-sm hover:border-slate-600 transition-colors">
                    Probability of BTC reaching 100k in 2024?
                </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`
                max-w-[90%] md:max-w-[80%] rounded-2xl p-5 shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : msg.role === 'system'
                  ? 'bg-red-900/50 border border-red-800 text-red-200'
                  : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-none shadow-lg'}
              `}
            >
              {msg.role === 'model' && (
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-700/50">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Probability Compass</span>
                </div>
              )}
              
              <div className="text-sm md:text-base leading-relaxed">
                {msg.role === 'user' ? msg.content : <MarkdownRenderer content={msg.content} />}
              </div>

              {/* Sources Section */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700/50">
                  <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3" /> VERIFIED SOURCES
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((source, idx) => (
                      <a 
                        key={idx}
                        href={source.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-slate-900/50 hover:bg-slate-700 text-blue-400 px-2 py-1 rounded border border-slate-700/50 transition-colors truncate max-w-[200px]"
                      >
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl rounded-bl-none p-4 flex items-center gap-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-sm text-slate-400 font-medium">Analyzing market data & sentiment...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 sticky bottom-[60px] md:bottom-[50px] z-10">
        <div className="relative max-w-4xl mx-auto flex items-end gap-2 bg-slate-900 border border-slate-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about a future event (e.g., 'Will X happen by Y?')..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm md:text-base p-3 focus:outline-none resize-none max-h-32"
            rows={1}
            style={{ minHeight: '50px' }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isThinking}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors shrink-0 mb-0.5"
          >
            {isThinking ? <RotateCcw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-2">
            AI can make mistakes. Please verify important information.
        </p>
      </div>
    </div>
  );
};
