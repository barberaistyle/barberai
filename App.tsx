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
      console.error(err);
      setError("Failed to generate hairstyle. Please try again or use a different photo.");
      setCurrentStep(AppStep.SELECT_STYLE);
    }
  };

  return (
    <div className="min-h-screen bg-dark text-slate-100 font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <Header />

      <main className="container mx-auto px-4 py-8 relative z-0">
        
        {error && (
          <div className="max-w-xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
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
