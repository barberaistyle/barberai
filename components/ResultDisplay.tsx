import React, { useState } from 'react';

interface ResultDisplayProps {
  originalImage: string;
  resultImage: string;
  styleName: string;
  onReset: () => void;
  onTryAnother: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  originalImage,
  resultImage,
  styleName,
  onReset,
  onTryAnother
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    // Determine clientX based on mouse or touch event
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  // We attach mouse move to the container to handle dragging smoothly
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = e.clientX;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setSliderPosition(percentage);
  }

  const handleTouchMove = (e: React.TouchEvent) => {
     // No isDragging check needed strictly for touch usually, but consistency
     const clientX = e.touches[0].clientX;
     const container = e.currentTarget;
     const rect = container.getBoundingClientRect();
     const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
     const percentage = (x / rect.width) * 100;
     setSliderPosition(percentage);
  }


  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-full items-center">
      <div className="w-full flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Here is your new look!</h2>
          <p className="text-slate-400">Style applied: <span className="text-primary font-semibold">{styleName}</span></p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button 
             onClick={onTryAnother}
             className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Try Another Style
          </button>
          <button 
             onClick={onReset}
             className="px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Upload New Photo
          </button>
          <a 
            href={resultImage} 
            download={`barber-ai-${styleName.toLowerCase().replace(/\s/g, '-')}.png`}
            className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </a>
        </div>
      </div>

      <div className="relative w-full max-w-2xl aspect-[3/4] md:aspect-square bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700 select-none group"
           onMouseMove={handleMouseMove}
           onTouchMove={handleTouchMove}
           onMouseUp={handleMouseUp}
           onMouseLeave={handleMouseUp}
      >
        {/* Background Image (Modified) */}
        <img 
          src={resultImage} 
          alt="Result" 
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Foreground Image (Original) - Clipped */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
        >
          <img 
            src={originalImage} 
            alt="Original" 
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: '100%' }} // Ensures image doesn't squash
          />
           <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold">Original</div>
        </div>
        
        <div className="absolute bottom-4 right-4 bg-primary/80 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-bold">AI Generated</div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-10 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg transform active:scale-110 transition-transform text-slate-900">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
          </div>
        </div>
      </div>

      <p className="mt-4 text-slate-500 text-sm">Drag the slider to compare before and after</p>
    </div>
  );
};
