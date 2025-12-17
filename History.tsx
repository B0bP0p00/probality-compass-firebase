import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { ArrowLeft, Clock, Calendar, CheckCircle, HelpCircle } from 'lucide-react';
import { getHistory, clearHistory } from '@/services/historyService';
import { AnalysisResult } from '@/types';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear your history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleSelect = (item: AnalysisResult) => {
    navigate("/results", { state: { data: item } });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <h1 className="text-2xl font-light text-slate-900">Analysis History</h1>
           </div>
           {history.length > 0 && (
             <Button variant="secondary" onClick={handleClear} className="text-red-600 hover:text-red-700 hover:bg-red-50">
               Clear History
             </Button>
           )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No history found. Start analyzing events!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => handleSelect(item)}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
                    item.status === 'resolved' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium text-slate-800 group-hover:text-slate-900 mb-2">
                  {item.reframed_question}
                </h3>
                
                <div className="flex items-center gap-4 text-sm">
                  {item.status === 'resolved' ? (
                     <span className="flex items-center gap-1.5 text-slate-600">
                        <CheckCircle className="w-4 h-4 text-slate-900" />
                        Outcome: <span className="font-medium">{item.resolved_outcome?.substring(0, 50)}...</span>
                     </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-600">
                       <HelpCircle className="w-4 h-4 text-blue-600" />
                       Probability: <span className="font-medium text-slate-900">{item.probability_low}% - {item.probability_high}%</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}