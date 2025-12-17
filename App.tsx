import React, { useState } from 'react';
import { Disclaimer } from './components/Disclaimer';
import { AuthPage } from './pages/AuthPage';
import { ChatPage } from './pages/ChatPage';
import { HistoryPage } from './pages/HistoryPage';
import { ViewState, HistoryItem } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('auth');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  // Store the actual messages of the active chat to restore context when clicking history
  // For simplicity in this demo, ChatPage manages its own local messages state, 
  // but we can pass an initialQuery to "restart" a conversation context.
  const [activeQuery, setActiveQuery] = useState<string | undefined>(undefined);

  const handleLogin = () => {
    setView('chat');
  };

  const addToHistory = (item: HistoryItem) => {
    setHistory(prev => [item, ...prev]);
  };

  const handleSelectHistory = (item: HistoryItem) => {
    // In a real app, you'd restore the full message array. 
    // Here we just restart the chat with the query for simplicity in the 'chat' view logic
    setActiveQuery(item.query); 
    setView('chat');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {view === 'auth' && <AuthPage onLogin={handleLogin} />}
        
        {view === 'chat' && (
          <ChatPage 
            history={history}
            addToHistory={addToHistory}
            onViewHistory={() => setView('history')}
            initialQuery={activeQuery}
          />
        )}
        
        {view === 'history' && (
          <HistoryPage 
            history={history}
            onBack={() => setView('chat')}
            onSelectHistory={handleSelectHistory}
          />
        )}
      </main>

      {/* Sticky Footer Disclaimer - MUST always be visible */}
      <Disclaimer />
    </div>
  );
};

export default App;
