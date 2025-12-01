import React, { useState, useMemo } from 'react';
import { HairstyleOption } from '../types';
import { HAIRSTYLES } from '../constants';

interface StyleSelectorProps {
  selectedStyleId: string | null;
  onSelect: (id: string) => void;
  onApply: () => void;
  onBack: () => void;
  uploadedImage: string;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedStyleId,
  onSelect,
  onApply,
  onBack,
  uploadedImage
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStyles = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return HAIRSTYLES;
    
    return HAIRSTYLES.filter(style => 
      style.name.toLowerCase().includes(query) || 
      style.description.toLowerCase().includes(query) ||
      style.gender.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6">
      {/* Left: Image Preview */}
      <div className="w-full md:w-1/3 flex-shrink-0 flex flex-col gap-4">
        <div className="bg-card rounded-2xl p-4 border border-slate-700 shadow-xl h-fit">
          <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-black relative">
             <img src={uploadedImage} alt="Original" className="w-full h-full object-cover" />
             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
               <p className="text-white text-sm font-medium">Original Photo</p>
             </div>
          </div>
        </div>
        <button
          onClick={onBack}
          className="w-full py-3 px-4 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Change Photo
        </button>
      </div>

      {/* Right: Style Grid */}
      <div className="w-full md:w-2/3 flex flex-col h-full">
        <div className="mb-4">
           <h2 className="text-2xl font-bold text-white mb-2">Select a Hairstyle</h2>
           <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
             </div>
             <input 
               type="text" 
               placeholder="Search hairstyles (e.g. 'fade', 'buzz', 'undercut')..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-3 bg-card border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
             />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {filteredStyles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <p>No hairstyles found matching "{searchQuery}"</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-primary hover:underline text-sm"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
              {filteredStyles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => onSelect(style.id)}
                  className={`
                    relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200
                    flex flex-col gap-3 group
                    ${selectedStyleId === style.id 
                      ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(99,102,241,0.3)]' 
                      : 'border-slate-700 bg-card hover:border-slate-600'}
                  `}
                >
                  <div className={`
                    w-full aspect-video rounded-lg ${style.previewColor} opacity-80 group-hover:opacity-100 transition-opacity
                    flex items-center justify-center
                  `}>
                    {/* Abstract placeholder icon */}
                    <span className="text-white font-bold text-xl opacity-50 tracking-widest uppercase">
                      {style.id.substring(0,2)}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold">{style.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{style.description}</p>
                  </div>

                  {selectedStyleId === style.id && (
                    <div className="absolute top-3 right-3 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Button for Mobile or sticky footer for Desktop */}
        <div className="pt-4 border-t border-slate-800 mt-auto">
          <button
            onClick={onApply}
            disabled={!selectedStyleId}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2
              ${selectedStyleId 
                ? 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-primary/50 translate-y-0 opacity-100' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'}
            `}
          >
            <span>Generate New Look</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.88 19.88l-1.566.522a2.25 2.25 0 00-1.545 1.545l-.522 1.566-.522-1.566a2.25 2.25 0 00-1.545-1.545l-1.566-.522 1.566-.522a2.25 2.25 0 001.545-1.545l.522-1.566.522 1.566a2.25 2.25 0 001.545 1.545l1.566.522z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};