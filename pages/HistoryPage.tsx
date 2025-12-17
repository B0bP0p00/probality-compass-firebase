import React from 'react';
import { ArrowLeft, MessageSquare, Calendar, ChevronRight } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryPageProps {
  history: HistoryItem[];
  onBack: () => void;
  onSelectHistory: (item: HistoryItem) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ history, onBack, onSelectHistory }) => {
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-white">Prediction History</h1>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-slate-500">
          <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
          <p>No history available yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectHistory(item)}
              className="group flex items-start gap-4 p-5 bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/80 rounded-xl transition-all text-left w-full shadow-sm hover:shadow-md"
            >
              <div className="p-3 bg-slate-800 group-hover:bg-slate-700 rounded-lg transition-colors">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-200 truncate pr-4">{item.query}</h3>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.summary}</p>
                <p className="text-xs text-slate-600 mt-2">
                  {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 mt-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
