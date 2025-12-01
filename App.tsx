import React, { useState } from 'react';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { StyleSelector } from './components/StyleSelector';
import { LoadingOverlay } from './components/LoadingOverlay';
import { ResultDisplay } from './components/ResultDisplay';
import { AppStep, GeneratedImage } from './types';
import { HAIRSTYLES } from './constants';
import { generateNewHairstyle } from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.UPLOAD);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (base64: string) => {
    setUploadedImage(base64);
    setCurrentStep(AppStep.SELECT_STYLE);
    setError(null);
  };

  const handleStyleSelect = (id: string) => {
    setSelectedStyleId(id);
  };

  const handleBackToUpload = () => {
    setUploadedImage(null);
    setSelectedStyleId(null);
    setGeneratedData(null);
    setCurrentStep(AppStep.UPLOAD);
  };

  const handleTryAnother = () => {
    setCurrentStep(AppStep.SELECT_STYLE);
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !selectedStyleId) return;

    const style = HAIRSTYLES.find(s => s.id === selectedStyleId);
    if (!style) return;

    setCurrentStep(AppStep.PROCESSING);
    setError(null);

    try {
      const resultBase64 = await generateNewHairstyle(
        uploadedImage,
        style.name,
        style.description
      );

      setGeneratedData({
        original: uploadedImage,
        result: resultBase64,
        styleApplied: style.name
      });
      setCurrentStep(AppStep.RESULT);

    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "Failed to generate hairstyle. Please try again.");
      setCurrentStep(AppStep.SELECT_STYLE);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-slate-100 font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <Header />

      <main className="container mx-auto px-4 py-8 relative z-0">
        
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-900/40 border border-red-500/50 rounded-xl flex flex-col md:flex-row items-start gap-4 text-red-100 shadow-lg animate-fade-in-up">
             <div className="p-2 bg-red-500/20 rounded-full shrink-0">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
             </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-white mb-1">Generation Failed</p>
              <p className="text-sm opacity-90 leading-relaxed mb-4">{error}</p>
              
              {/* API Key Helper */}
              {error.toLowerCase().includes("api key") && (
                 <div className="bg-black/30 rounded-lg p-4 border border-white/10">
                    <p className="text-sm font-semibold mb-2 text-white">How to fix this:</p>
                    <ol className="list-decimal list-inside text-sm space-y-2 text-slate-300 mb-3">
                      <li>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline hover:text-white transition-colors font-medium">
                          Click here to get a free Gemini API Key
                        </a>
                      </li>
                      <li>Go to Netlify &gt; Site Settings &gt; Environment Variables.</li>
                      <li>Add a new variable: Key = <code className="bg-slate-800 px-1 py-0.5 rounded text-white">API_KEY</code>, Value = <em>Your key</em>.</li>
                      <li><strong>Important:</strong> Go to Deploys &gt; Trigger Deploy &gt; Clear cache and deploy site.</li>
                    </ol>
                 </div>
              )}
              
              {/* Generic Netlify Helper */}
              {error.includes("Netlify") && !error.toLowerCase().includes("api key") && (
                <div className="mt-3 p-3 bg-black/30 rounded-lg text-xs font-mono border border-white/10">
                  Tip: Go to Netlify Dashboard &gt; Deploys &gt; Trigger Deploy &gt; Clear cache and deploy site.
                </div>
              )}
            </div>
            <button 
              onClick={() => setError(null)}
              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-colors"
            >
              Dismiss
            </button>
          </div>
        )}

        {currentStep === AppStep.UPLOAD && (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <ImageUpload onImageSelected={handleImageSelected} />
          </div>
        )}

        {currentStep === AppStep.SELECT_STYLE && uploadedImage && (
          <StyleSelector
            uploadedImage={uploadedImage}
            selectedStyleId={selectedStyleId}
            onSelect={handleStyleSelect}
            onApply={handleGenerate}
            onBack={handleBackToUpload}
          />
        )}

        {currentStep === AppStep.PROCESSING && selectedStyleId && (
          <LoadingOverlay 
            styleName={HAIRSTYLES.find(s => s.id === selectedStyleId)?.name || 'New Style'} 
          />
        )}

        {currentStep === AppStep.RESULT && generatedData && (
          <ResultDisplay
            originalImage={generatedData.original}
            resultImage={generatedData.result}
            styleName={generatedData.styleApplied}
            onReset={handleBackToUpload}
            onTryAnother={handleTryAnother}
          />
        )}
      </main>
    </div>
  );
};

export default App;