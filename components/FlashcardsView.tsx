import React, { useState } from 'react';
import { DocumentRecord, FlashcardSet } from '../types';
import { generateFlashcards } from '../services/geminiService';

interface FlashcardsViewProps {
  documents: DocumentRecord[];
  flashcardSets: FlashcardSet[];
  onCreateSet: (set: FlashcardSet) => void;
  onDeleteSet: (id: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  documents,
  flashcardSets,
  onCreateSet,
  onDeleteSet
}) => {
  // Modes: 'list' (default), 'create' (wizard), 'study' (active session)
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'study'>('list');
  
  // Creation State
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSet, setGeneratedSet] = useState<FlashcardSet | null>(null);
  const [setTitle, setSetTitle] = useState('');

  // Study State
  const [activeSet, setActiveSet] = useState<FlashcardSet | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- Creation Logic ---

  const handleToggleDoc = (id: string) => {
    const newSet = new Set(selectedDocIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedDocIds(newSet);
  };

  const handleGenerate = async () => {
    if (selectedDocIds.size === 0 || !setTitle.trim()) return;

    setIsGenerating(true);
    try {
      // Combine text from selected documents
      const selectedDocs = documents.filter(d => selectedDocIds.has(d.id));
      const combinedText = selectedDocs.map(d => `--- Document: ${d.vendor} ---\n${d.summary}`).join('\n\n');

      const cards = await generateFlashcards(combinedText);

      const newSet: FlashcardSet = {
        id: crypto.randomUUID(),
        title: setTitle,
        createdAt: new Date().toISOString().split('T')[0],
        cards: cards,
        sourceDocIds: Array.from(selectedDocIds)
      };

      setGeneratedSet(newSet);
    } catch (error) {
      console.error("Failed to generate flashcards", error);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSet = () => {
    if (generatedSet) {
      onCreateSet(generatedSet);
      resetCreation();
      setViewMode('list');
    }
  };

  const resetCreation = () => {
    setSelectedDocIds(new Set());
    setGeneratedSet(null);
    setSetTitle('');
  };

  // --- Study Logic ---

  const startStudy = (set: FlashcardSet) => {
    setActiveSet(set);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setViewMode('study');
  };

  const nextCard = () => {
    if (activeSet && currentCardIndex < activeSet.cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev - 1), 150);
    }
  };

  const closeStudy = () => {
    setActiveSet(null);
    setViewMode('list');
  };


  // --- Render Functions ---

  const renderList = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Flashcards</h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Master your documents with AI-generated study sets.</p>
        </div>
        <button 
          onClick={() => setViewMode('create')}
          className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create New Set
        </button>
      </div>

      {flashcardSets.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
           <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 text-blue-500 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
           </div>
           <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No flashcards yet</h3>
           <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Select documents to extract key concepts and turn them into study materials instantly.</p>
           <button 
             onClick={() => setViewMode('create')}
             className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
           >
             Start creating now
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map(set => (
            <div key={set.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all group relative">
               <button 
                 onClick={(e) => { e.stopPropagation(); onDeleteSet(set.id); }}
                 className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>

               <div className="mb-4">
                 <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{set.title}</h3>
                 <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">{set.createdAt} • {set.sourceDocIds.length} sources</p>
               </div>

               <div className="flex items-center gap-2 mb-6">
                 <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold px-2.5 py-1 rounded-full">
                    {set.cards.length} Cards
                 </span>
               </div>

               <button 
                 onClick={() => startStudy(set)}
                 className="w-full py-2.5 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-bold rounded-lg hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 Start Studying
               </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateWizard = () => (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <div className="mb-8 flex items-center gap-4">
         <button 
           onClick={() => { resetCreation(); setViewMode('list'); }}
           className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
         >
           <svg className="w-6 h-6 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
         </button>
         <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Set</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">Select documents to generate questions from.</p>
         </div>
      </div>

      {!generatedSet ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-700">
             <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Set Title</label>
             <input 
               type="text" 
               value={setTitle}
               onChange={(e) => setSetTitle(e.target.value)}
               placeholder="e.g., Q1 Financial Review"
               className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-colors"
             />
          </div>
          
          <div className="p-4 bg-gray-50 dark:bg-slate-700/50">
             <h3 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Select Documents</h3>
             <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
               {documents.filter(d => !d.isDeleted).map(doc => (
                 <label 
                    key={doc.id} 
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedDocIds.has(doc.id) 
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                        : 'bg-white border-gray-200 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-600'
                    }`}
                 >
                    <input 
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500 mr-3 h-5 w-5 border-gray-300"
                      checked={selectedDocIds.has(doc.id)}
                      onChange={() => handleToggleDoc(doc.id)}
                    />
                    <div className="flex-1">
                       <p className="font-semibold text-gray-900 dark:text-white">{doc.vendor}</p>
                       <p className="text-xs text-gray-500 dark:text-slate-400">{doc.date} • {doc.type}</p>
                    </div>
                 </label>
               ))}
               {documents.filter(d => !d.isDeleted).length === 0 && (
                   <div className="text-center py-4 text-gray-500 text-sm">No documents available. Upload some first!</div>
               )}
             </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end">
             <button 
               onClick={handleGenerate}
               disabled={isGenerating || selectedDocIds.size === 0 || !setTitle.trim()}
               className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-blue-500/20"
             >
               {isGenerating ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Generating...
                 </>
               ) : (
                 'Generate Cards'
               )}
             </button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 animate-fade-in">
           <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Success!</h3>
              <p className="text-gray-500 dark:text-slate-400">Generated {generatedSet.cards.length} cards for "{generatedSet.title}".</p>
           </div>
           
           <div className="space-y-3 mb-8 max-h-64 overflow-y-auto custom-scrollbar bg-gray-50 dark:bg-slate-700/50 p-4 rounded-lg">
              {generatedSet.cards.map((card, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded border border-gray-200 dark:border-slate-600 text-sm">
                   <p className="font-bold text-gray-900 dark:text-white mb-1">Q: {card.front}</p>
                   <p className="text-gray-600 dark:text-slate-300">A: {card.back}</p>
                </div>
              ))}
           </div>

           <div className="flex gap-4">
              <button 
                onClick={() => setGeneratedSet(null)}
                className="flex-1 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Discard
              </button>
              <button 
                onClick={handleSaveSet}
                className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
              >
                Save Set
              </button>
           </div>
        </div>
      )}
    </div>
  );

  const renderStudy = () => {
    if (!activeSet) return null;
    const currentCard = activeSet.cards[currentCardIndex];

    return (
      <div className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-fade-in">
         {/* Top Bar */}
         <div className="w-full max-w-4xl flex justify-between items-center mb-8 text-white">
            <div>
               <h2 className="text-2xl font-bold">{activeSet.title}</h2>
               <p className="text-white/60 text-sm">Card {currentCardIndex + 1} of {activeSet.cards.length}</p>
            </div>
            <button 
              onClick={closeStudy}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>

         {/* Card Container */}
         <div 
           className="relative w-full max-w-2xl aspect-[3/2] cursor-pointer perspective-1000 group"
           onClick={() => setIsFlipped(!isFlipped)}
         >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
               {/* Front */}
               <div className="absolute inset-0 backface-hidden bg-white rounded-2xl shadow-2xl flex flex-col items-center justify-center p-12 text-center">
                  <span className="absolute top-6 left-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Question</span>
                  <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed">
                    {currentCard.front}
                  </p>
                  <p className="absolute bottom-6 text-xs text-gray-400 font-medium animate-pulse">Click to flip</p>
               </div>

               {/* Back */}
               <div className="absolute inset-0 backface-hidden bg-blue-600 rounded-2xl shadow-2xl rotate-y-180 flex flex-col items-center justify-center p-12 text-center text-white">
                  <span className="absolute top-6 left-6 text-xs font-bold text-blue-200 uppercase tracking-widest">Answer</span>
                  <p className="text-xl md:text-2xl font-medium leading-relaxed">
                    {currentCard.back}
                  </p>
               </div>
            </div>
         </div>

         {/* Controls */}
         <div className="mt-10 flex items-center gap-6">
            <button 
              onClick={(e) => { e.stopPropagation(); prevCard(); }}
              disabled={currentCardIndex === 0}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            {/* Progress dots */}
            <div className="flex gap-2">
               {activeSet.cards.map((_, idx) => (
                 <div 
                   key={idx} 
                   className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentCardIndex ? 'bg-white' : 'bg-white/30'}`}
                 />
               ))}
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); nextCard(); }}
              disabled={currentCardIndex === activeSet.cards.length - 1}
              className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
         </div>

         <div className="mt-4 text-white/40 text-sm">
           Use arrow keys or click buttons to navigate
         </div>
      </div>
    );
  };

  return (
    <div className="h-full">
      {viewMode === 'list' && renderList()}
      {viewMode === 'create' && renderCreateWizard()}
      {viewMode === 'study' && renderStudy()}
    </div>
  );
};