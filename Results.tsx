import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui";
import { ArrowLeft, Share2, CheckCircle2, TrendingUp, Users, Clock, BrainCircuit, Building2, CalendarDays, ExternalLink, Trophy } from "lucide-react";
import { AnalysisResult } from "@/types";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { saveToHistory } from "@/services/historyService";
import Disclaimer from "@/components/Disclaimer";

// Helper Chart Component
const ProbabilityChart = ({ probability, label, subtext, size = "large" }: { probability: number, label: string, subtext?: string, size?: "small" | "large" }) => {
  const data = [
    { name: 'Probability', value: probability },
    { name: 'Remaining', value: 100 - probability },
  ];
  const COLORS = ['#0f172a', '#e2e8f0']; // Slate-900, Slate-200
  const isLarge = size === "large";

  return (
      <div className="flex flex-col items-center justify-center relative w-full">
        <div className={isLarge ? "w-48 h-48 relative" : "w-36 h-36 relative"}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={isLarge ? 60 : 45}
                    outerRadius={isLarge ? 80 : 60}
                    startAngle={180}
                    endAngle={0}
                    fill="#8884d8"
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                >
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${isLarge ? "mt-8" : "mt-6"}`}>
                <span className={`${isLarge ? "text-4xl" : "text-2xl"} font-bold text-slate-900`}>{probability}%</span>
                <span className="text-[10px] text-slate-400">Chance</span>
            </div>
        </div>
        <p className={`${isLarge ? "text-sm mt-[-20px]" : "text-xs mt-[-15px]"} font-bold text-slate-800 text-center px-2`}>{label}</p>
        {subtext && <p className="text-[10px] text-slate-500 text-center mt-1 max-w-[150px]">{subtext}</p>}
    </div>
  )
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.data as AnalysisResult;

  useEffect(() => {
    if (!result) {
      navigate("/");
      return;
    }
    saveToHistory(result);
  }, [result, navigate]);

  if (!result) return null;

  const isResolved = result.status === 'resolved';
  const avgProb = Math.round((result.probability_low + result.probability_high) / 2);
  const hasScenarios = result.scenarios && result.scenarios.length > 0;
  
  // Logic for scenarios vs competitors
  const isCompetitor = result.scenario_type === 'competitors';
  const sortedScenarios = hasScenarios ? [...(result.scenarios || [])].sort((a, b) => b.probability - a.probability) : [];
  const topCompetitor = sortedScenarios[0];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Analysis
          </Button>
          <Button variant="secondary" className="gap-2">
            <Share2 className="w-4 h-4" /> Share
          </Button>
        </div>

        <Disclaimer />

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-200">
            <div className="p-8 md:p-12 border-b border-slate-100">
                <div className="grid md:grid-cols-3 gap-12 items-center">
                    <div className="md:col-span-2 space-y-6">
                         <div className="flex items-center gap-3">
                             <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider
                                ${result.confidence_level === 'high' ? 'bg-green-100 text-green-700' : 
                                  result.confidence_level === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                {result.confidence_level} Confidence
                             </span>
                             {isResolved ? (
                               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-slate-900 text-white">
                                  Resolved Event
                               </span>
                             ) : (
                               <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-blue-100 text-blue-700">
                                  Future Prediction
                               </span>
                             )}
                             {hasScenarios && !isCompetitor && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-purple-100 text-purple-700">
                                  Multi-Scenario
                                </span>
                             )}
                             {isCompetitor && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider bg-indigo-100 text-indigo-700">
                                  Head-to-Head
                                </span>
                             )}
                         </div>

                         <h1 className="text-3xl font-light text-slate-900 leading-tight">
                            {result.reframed_question}
                         </h1>
                         
                         {/* System Decision Block */}
                         <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex gap-3">
                            <BrainCircuit className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-semibold text-indigo-900 mb-1">AI Prediction / Decision</h3>
                                <p className="text-sm text-indigo-800 leading-relaxed">{result.system_decision}</p>
                            </div>
                         </div>

                         <p className="text-lg text-slate-600 leading-relaxed">
                            {result.explanation}
                         </p>
                    </div>

                    {/* Visualization Column */}
                    <div className="flex flex-col items-center justify-center relative min-h-[250px]">
                        {isResolved ? (
                           <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 w-full text-center">
                              <CheckCircle2 className="w-16 h-16 text-slate-900 mb-4" />
                              <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirmed Outcome</span>
                              <span className="text-xl font-medium text-slate-900">{result.resolved_outcome || "Event Concluded"}</span>
                           </div>
                        ) : isCompetitor && topCompetitor ? (
                           // COMPETITOR SINGLE VIEW (Show the winner)
                           <div className="flex flex-col items-center justify-center w-full">
                              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-wider">
                                <Trophy className="w-4 h-4" />
                                Predicted Winner
                              </div>
                              <ProbabilityChart 
                                  probability={topCompetitor.probability} 
                                  label={`${topCompetitor.name}`} 
                                  subtext={topCompetitor.explanation}
                                  size="large" 
                              />
                              <div className="mt-4 text-xs text-slate-400">
                                vs {sortedScenarios.slice(1).map(s => `${s.name} (${s.probability}%)`).join(', ')}
                              </div>
                           </div>
                        ) : hasScenarios ? (
                           // TIMELINE/MULTI VIEW (Grid)
                           <div className="flex flex-col items-center w-full">
                             <div className="flex items-center gap-2 mb-4 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                                <CalendarDays className="w-4 h-4" />
                                Scenario Comparison
                             </div>
                             <div className="grid grid-cols-2 gap-2 w-full">
                                {sortedScenarios.slice(0, 2).map((scenario, idx) => (
                                    <div key={idx} className="bg-slate-50/50 rounded-xl p-2 border border-slate-100">
                                        <ProbabilityChart 
                                            probability={scenario.probability} 
                                            label={scenario.name} 
                                            subtext={scenario.explanation}
                                            size="small" 
                                        />
                                    </div>
                                ))}
                             </div>
                             {result.scenarios && result.scenarios.length > 2 && (
                                 <p className="text-xs text-slate-400 mt-2">and {result.scenarios.length - 2} more scenarios...</p>
                             )}
                           </div>
                        ) : (
                          // SINGLE RANGE VIEW (Default)
                          <>
                            <ProbabilityChart 
                                probability={avgProb} 
                                label={`Range: ${result.probability_low}% - ${result.probability_high}%`} 
                                size="large" 
                            />
                            {result.time_remaining && (
                                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full mt-4">
                                    <Clock className="w-3 h-3" />
                                    {result.time_remaining} remaining
                                </div>
                            )}
                          </>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline & Corporate Signals Analysis (New Section) */}
            <div className="grid md:grid-cols-2 border-b border-slate-100">
               <div className="p-8 border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="flex items-center gap-2 mb-4 text-slate-900 font-medium">
                      <Clock className="w-5 h-5" />
                      <h3>Timeline Analysis</h3>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-900">
                     {result.timeline_analysis || "Timeline data was neutral for this analysis."}
                  </div>
               </div>
               <div className="p-8">
                  <div className="flex items-center gap-2 mb-4 text-slate-900 font-medium">
                      <Building2 className="w-5 h-5" />
                      <h3>Corporate Signals</h3>
                  </div>
                   <ul className="space-y-2">
                      {result.corporate_signals && result.corporate_signals.length > 0 ? (
                        result.corporate_signals.map((sig, i) => (
                           <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                              <span className="block w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                              {sig}
                           </li>
                        ))
                      ) : (
                        <li className="text-sm text-slate-500 italic">No major corporate announcements found.</li>
                      )}
                   </ul>
               </div>
            </div>

            {/* Grid Content */}
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-slate-100">
                
                {/* Left Column: Data & Precedents */}
                <div className="p-8 space-y-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-slate-900 font-medium">
                            <TrendingUp className="w-5 h-5" />
                            <h3>Market & Data Sources</h3>
                        </div>
                        <div className="space-y-4">
                            {result.sources.length > 0 ? result.sources.map((source, idx) => (
                                <a 
                                  key={idx} 
                                  href={source.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="block bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors group"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-slate-800 text-sm group-hover:text-blue-600 flex items-center gap-1">
                                          {source.name}
                                          <ArrowLeft className="w-3 h-3 rotate-135 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600">{source.data_point}</p>
                                </a>
                            )) : <p className="text-sm text-slate-500 italic">No direct market sources found.</p>}
                        </div>
                    </div>
                </div>

                {/* Right Column: Social Signals */}
                <div className="p-8 space-y-8 bg-slate-50/50">
                    <div>
                         <div className="flex items-center gap-2 mb-4 text-slate-900 font-medium">
                            <Users className="w-5 h-5" />
                            <h3>Social Signal Analysis</h3>
                        </div>
                        
                        <div className="mb-6 p-4 bg-white rounded-xl border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Overall Sentiment</span>
                                <span className="text-sm font-medium text-slate-900 capitalize">{result.social_signals.overall_sentiment}</span>
                            </div>
                            <p className="text-sm text-slate-600">{result.social_signals.summary}</p>
                        </div>

                        <div className="space-y-3">
                            {result.social_signals.key_influencers.map((inf, idx) => (
                                <div key={idx} className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-700 text-xs font-bold">
                                        {inf.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            {inf.source_url ? (
                                                <a href={inf.source_url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-900 hover:text-blue-600 hover:underline flex items-center gap-1">
                                                    {inf.name}
                                                    <ExternalLink className="w-3 h-3 text-slate-400" />
                                                </a>
                                            ) : (
                                                <span className="text-sm font-medium text-slate-900">{inf.name}</span>
                                            )}
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                                inf.stance.includes('support') || inf.stance.includes('confirm') ? 'bg-green-50 text-green-700 border-green-100' : 
                                                'bg-slate-100 text-slate-600 border-slate-200'
                                            }`}>{inf.stance}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{inf.statement}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
}