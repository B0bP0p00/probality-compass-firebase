import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoadingSpinner } from "@/components/ui";
import { analyzeQuestionWithGemini } from "@/services/geminiService";

export default function Analyze() {
  const navigate = useNavigate();
  const location = useLocation();
  const processingRef = useRef(false);
  
  // Parse query params using React Router's useLocation for consistency
  const searchParams = new URLSearchParams(location.search);
  const question = searchParams.get("q");
  const preferredSource = searchParams.get('source') || 'balanced';
  const keywords = searchParams.get('keywords') || '';
  const confidenceBias = searchParams.get('bias') || 'auto';

  useEffect(() => {
    if (!question) {
      navigate("/");
      return;
    }

    if (processingRef.current) return;
    processingRef.current = true;

    const analyzeQuestion = async () => {
      // Build source preference instructions
      let sourceInstructions = "";
      if (preferredSource === "polymarket") {
        sourceInstructions = "PRIORITIZE Polymarket data when available. Use Kalshi as secondary source.";
      } else if (preferredSource === "kalshi") {
        sourceInstructions = "PRIORITIZE Kalshi data when available. Use Polymarket as secondary source.";
      } else if (preferredSource === "historical") {
        sourceInstructions = "PRIORITIZE historical precedents and past event data. Use prediction markets as secondary validation.";
      } else {
        sourceInstructions = "Use all available sources equally (balanced approach).";
      }

      // Build confidence bias instructions
      let confidenceInstructions = "";
      if (confidenceBias === "conservative") {
        confidenceInstructions = "Bias towards LOWER confidence levels and WIDER probability ranges. Be more cautious.";
      } else if (confidenceBias === "optimistic") {
        confidenceInstructions = "Bias towards HIGHER confidence when data is available. Allow narrower ranges when justified.";
      } else if (confidenceBias === "financial") {
        confidenceInstructions = "For financial questions, apply stricter scrutiny and lean towards lower confidence unless prediction markets are strongly aligned.";
      } else if (confidenceBias === "tech") {
        confidenceInstructions = "For technology/innovation questions, account for rapid change and unexpected developments. Balance optimism with technical realities.";
      } else {
        confidenceInstructions = "Auto-detect the question type and apply appropriate confidence calibration.";
      }

      const keywordInstructions = keywords 
        ? `Focus your web search on these specific keywords/topics: "${keywords}". Use these to find more targeted and relevant information.`
        : "";

      try {
        // Correction: Call the real Gemini Service
        const result = await analyzeQuestionWithGemini(
            question, 
            sourceInstructions, 
            confidenceInstructions, 
            keywordInstructions
        );

        // Correction: Pass result via router state instead of non-existent database
        navigate("/results", { state: { data: result } });

      } catch (error) {
        console.error("Analysis error:", error);
        alert("Failed to analyze. Please try again or check your API key.");
        navigate("/");
      } finally {
        processingRef.current = false;
      }
    };

    analyzeQuestion();
  }, [question, preferredSource, keywords, confidenceBias, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <LoadingSpinner />
    </div>
  );
}
