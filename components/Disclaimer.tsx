import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { DISCLAIMER_TEXT } from '../constants';

export const Disclaimer: React.FC = () => {
  return (
    <div className="bg-amber-900/30 border-t border-amber-800/50 backdrop-blur-sm p-3 flex items-center justify-center gap-3 text-xs md:text-sm text-amber-200/90 font-medium z-50">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <p className="text-center">{DISCLAIMER_TEXT}</p>
    </div>
  );
};
