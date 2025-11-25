
import React, { useRef, useState } from 'react';
import { analyzeDocument, ScanMode } from '../services/geminiService';
import { DocumentRecord } from '../types';

interface UploaderProps {
  onUploadComplete: (doc: DocumentRecord) => void;
  onCancel: () => void;
}

const SCAN_MODES = [
  { 
    id: 'finance', 
    label: 'Finance', 
    desc: 'Extract amounts, tax, vendor, and dates from Invoices & Receipts.', 
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    color: 'bg-blue-600',
    bg: 'bg-blue-50'
  },
  { 
    id: 'document', 
    label: 'Document', 
    desc: 'Summarize contracts, letters, and general business documents.', 
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    color: 'bg-sky-500',
    bg: 'bg-sky-50'
  },
  { 
    id: 'text', 
    label: 'Text Extraction', 
    desc: 'Perform raw OCR to extract all visible text from the image/PDF.', 
    icon: 'M4 6h16M4 12h16M4 18h7',
    color: 'bg-slate-600',
    bg: 'bg-slate-50'
  }
];

export const Uploader: React.FC<UploaderProps> = ({ onUploadComplete, onCancel }) => {
  const [step, setStep] = useState<'mode-selection' | 'upload'>('mode-selection');
  const [scanMode, setScanMode] = useState<ScanMode>('finance');
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeSelect = (modeId: string) => {
    setScanMode(modeId as ScanMode);
    setStep('upload');
  };

  const handleBack = () => {
    if (step === 'upload') {
      setFile(null);
      setPreview(null);
      setError(null);
      setStep('mode-selection');
    } else {
      onCancel();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files?.[0];
    processFile(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile: File | undefined) => {
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File is too large. Max 5MB.");
        return;
      }
      setFile(selectedFile);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleProcess = async () => {
    if (!file || !preview) return;

    setIsProcessing(true);
    setError(null);

    try {
      const base64Data = preview.split(',')[1];
      const mimeType = file.type;

      const extractedData = await analyzeDocument(base64Data, mimeType, scanMode);

      const newDoc: DocumentRecord = {
        id: crypto.randomUUID(),
        fileData: preview, 
        mimeType: mimeType,
        createdAt: new Date().toISOString(),
        status: 'completed',
        ...extractedData
      };

      onUploadComplete(newDoc);
    } catch (err) {
      console.error(err);
      setError("Failed to process document. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentModeInfo = SCAN_MODES.find(m => m.id === scanMode);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {step === 'mode-selection' ? 'Select Scan Mode' : 'Upload Document'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {step === 'mode-selection' ? 'Choose how you want AI to process your file' : `Mode: ${currentModeInfo?.label}`}
            </p>
          </div>
          <button 
            onClick={handleBack} 
            className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-colors"
          >
            {step === 'upload' ? (
              <div className="flex items-center gap-2 px-2">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                 <span className="text-sm font-bold">Back</span>
              </div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </button>
        </div>

        <div className="flex-1 p-8 flex flex-col justify-center">
          
          {step === 'mode-selection' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up">
              {SCAN_MODES.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode.id)}
                  className="group relative flex flex-col items-center text-center p-8 rounded-lg border border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/30 transition-all duration-200"
                >
                  <div className={`w-16 h-16 rounded-lg ${mode.color} flex items-center justify-center text-white mb-6 group-hover:scale-105 transition-transform duration-200`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mode.icon} /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{mode.label}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{mode.desc}</p>
                  
                  <div className="mt-8 px-6 py-2 rounded border border-gray-200 text-gray-600 font-medium text-sm group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-colors">
                    Select
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="animate-fade-in space-y-8 max-w-3xl mx-auto w-full">
              {!preview ? (
                <div 
                  className={`relative border-2 border-dashed rounded-lg p-16 text-center transition-all duration-200 cursor-pointer group h-96 flex flex-col items-center justify-center
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                  />
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-200
                    ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your file here</h3>
                  <p className="text-gray-500 mb-6">or <span className="text-blue-600 font-bold hover:underline">browse files</span> on your computer</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Supports JPG, PNG, PDF • Max 5MB</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Preview Area */}
                  <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-slate-900 flex items-center justify-center min-h-[400px] group">
                    {file?.type.includes('image') ? (
                      <img src={preview} alt="Preview" className="max-w-full max-h-[500px] object-contain opacity-90" />
                    ) : (
                      <div className="text-gray-400 flex flex-col items-center p-12">
                        <svg className="w-24 h-24 mb-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span className="font-bold text-2xl text-white">PDF Document</span>
                        <span className="text-base opacity-60 mt-2">{file?.name}</span>
                      </div>
                    )}
                    
                    {/* Scanner Animation */}
                    {isProcessing && (
                      <>
                        <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-[2px]"></div>
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 z-20 animate-scan-line shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-900 font-bold text-lg">AI Processing...</p>
                                <p className="text-gray-500 text-sm mt-1">Extracting data for {currentModeInfo?.label}</p>
                            </div>
                        </div>
                      </>
                    )}
                    
                    <button 
                      onClick={() => { setFile(null); setPreview(null); }}
                      disabled={isProcessing}
                      className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 disabled:hidden"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                      <svg className="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button 
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="flex-1 py-3.5 bg-blue-600 rounded-lg text-white font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'Analyzing...' : 'Start Extraction'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
