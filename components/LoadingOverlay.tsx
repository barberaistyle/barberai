import React, { useEffect, useState } from 'react';

interface LoadingOverlayProps {
  styleName: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ styleName }) => {
  const [tipIndex, setTipIndex] = useState(0);
  
  const tips = [
    "Analyzing facial structure...",
    `Applying ${styleName} to your photo...`,
    "Blending hair naturally with lighting...",
    "Refining texture and details...",
    "Finalizing your new look..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [tips.length]);

  return (
    <div className="fixed inset-0 z-50 bg-dark/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-4 border-secondary animate-spin-reverse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
             </svg>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-2">Creating Magic</h3>
      <p className="text-lg text-primary animate-pulse text-center max-w-md">
        {tips[tipIndex]}
      </p>
    </div>
  );
};
