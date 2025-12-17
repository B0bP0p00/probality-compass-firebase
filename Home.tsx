import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Textarea, Input } from "@/components/ui";
import { ArrowRight, Sparkles, TrendingUp, History, Shield, ChevronDown, Settings, LogOut } from "lucide-react";
import Disclaimer from "@/components/Disclaimer";
import { signOut } from "firebase/auth";
import { auth } from "@/services/firebase";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [preferredSource, setPreferredSource] = useState("balanced");
  const [keywords, setKeywords] = useState("");
  const [confidenceBias, setConfidenceBias] = useState("auto");
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      const params = new URLSearchParams({
        q: question.trim(),
        source: preferredSource,
        keywords: keywords.trim(),
        bias: confidenceBias
      });
      navigate(`/analyze?${params.toString()}`);
    }
  };

  const exampleQuestions = [
    "Who won the 2024 US Election?",
    "Will SpaceX launch Starship again this month?",
    "Did Bitcoin hit $100k in 2024?"
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative">
      
      {/* Top Bar */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button variant="ghost" onClick={handleLogout} className="text-slate-500 text-xs">
          <LogOut className="w-3 h-3 mr-1" /> Sign Out
        </Button>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full text-sm text-white mb-6 shadow-lg shadow-slate-900/20">
            <Sparkles className="w-4 h-4" />
            <span>AI Decision Assistant</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-light text-slate-900 mb-4 tracking-tight">
            Probability Compass
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Analyze future probabilities or verify past outcomes using real-time market data and historical precedents.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-8">
          <Disclaimer />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8 mb-8"
        >
          <label className="block text-sm font-medium text-slate-700 mb-3">
            What event or decision would you like to analyze?
          </label>
          <div className="relative">
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Will Apple release a foldable phone this year?"
              className="min-h-[120px] text-lg border-slate-200 focus:border-slate-400 focus:ring-slate-400 resize-none mb-4 pr-4"
            />
          </div>

          {/* Advanced Options */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              <Settings className="w-3 h-3" />
              <span>Advanced Options</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showAdvanced ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">
                    Preferred Data Source
                  </label>
                  <div className="relative">
                    <select
                      value={preferredSource}
                      onChange={(e) => setPreferredSource(e.target.value)}
                      className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 shadow-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    >
                      <option value="balanced">Balanced (All Sources)</option>
                      <option value="polymarket">Prioritize Polymarket</option>
                      <option value="kalshi">Prioritize Kalshi</option>
                      <option value="historical">Prioritize Historical Data</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                       <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2">
                    Confidence Bias
                  </label>
                  <div className="relative">
                    <select
                      value={confidenceBias}
                      onChange={(e) => setConfidenceBias(e.target.value)}
                      className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-900 shadow-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                    >
                      <option value="auto">Auto-Detect</option>
                      <option value="conservative">More Conservative</option>
                      <option value="optimistic">More Optimistic</option>
                      <option value="financial">Financial Focus</option>
                      <option value="tech">Tech/Innovation Focus</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                       <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-2">
                    Additional Keywords (Optional)
                  </label>
                  <Input
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., recent announcements, developer updates"
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* History Button - Positioned beside action */}
            <Button 
              type="button"
              variant="secondary"
              onClick={() => navigate('/history')}
              className="flex-1 sm:flex-none border border-slate-200"
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>

            <Button 
              type="submit" 
              disabled={!question.trim()}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
            >
              Analyze Decision
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>

        {/* Example Questions */}
        <div className="mb-12">
          <p className="text-xs text-slate-400 text-center mb-3">Try an example:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {exampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => setQuestion(q)}
                className="text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: TrendingUp, title: "Market Data", desc: "Prediction market signals from Polymarket & Kalshi" },
            { icon: History, title: "Historical Outcomes", desc: "Verification of past events & historical patterns" },
            { icon: Shield, title: "No Financial Advice", desc: "Probabilistic estimates for decision support only" }
          ].map((feature, i) => (
            <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <feature.icon className="w-6 h-6 text-slate-400 mb-3" />
              <h3 className="font-medium text-slate-800 mb-1">{feature.title}</h3>
              <p className="text-sm text-slate-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}