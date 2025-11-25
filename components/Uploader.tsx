import React, { useRef, useState } from 'react';
import { analyzeDocument, ScanMode } from '../services/geminiService';
import { DocumentRecord } from '../types';

interface UploaderProps {
  onUploadComplete: (doc: DocumentRecord) => void;
  onCancel: () => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onUploadComplete, onCancel }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('finance');
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Clean base64 string
      const base64Data = preview.split(',')[1];
      const mimeType = file.type;

      // Call Gemini API with selected scan mode
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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
            <p className="text-sm text-gray-500 mt-0.5">We support JPG, PNG, and PDF</p>
          </div>
          <button onClick={onCancel} className="p-2 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-gray-900 hover:border-gray-300 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-8">
          {!preview ? (
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200 cursor-pointer group
                ${isDragging 
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
                  : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
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
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors duration-200
                ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Drop your file here, or <span className="text-indigo-600">browse</span></h3>
              <p className="text-sm text-gray-500">Maximum file size 5MB</p>
            </div>
          ) : (
            <div className="space-y-8">
               {/* Preview Area with Scanner Animation */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-900 flex items-center justify-center min-h-[300px] max-h-[500px] shadow-inner group">
                {file?.type.includes('image') ? (
                  <img src={preview} alt="Preview" className="max-w-full max-h-[400px] object-contain opacity-90" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center p-12">
                    <svg className="w-20 h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    <span className="font-medium text-lg">PDF Document Selected</span>
                    <span className="text-sm opacity-60 mt-2">{file?.name}</span>
                  </div>
                )}
                
                {/* Scanner Line Animation */}
                {isProcessing && (
                  <>
                     <div className="absolute inset-0 bg-gray-900/60 z-10 backdrop-blur-[2px]"></div>
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,1)] z-20 animate-scan-line"></div>
                     <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex flex-col items-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-4"></div>
                            <p className="text-white font-bold text-lg tracking-wide">Analyzing...</p>
                            <p className="text-indigo-200 text-sm mt-1 font-medium">{scanMode === 'finance' ? 'Extracting financials' : 'Reading content'}</p>
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

              {/* Mode Selector - Cards */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Select Scan Mode</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: 'finance', label: 'Finance', desc: 'Invoices & Receipts', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                    { id: 'document', label: 'Document', desc: 'Contracts & Letters', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                    { id: 'text', label: 'Text Extraction', desc: 'Raw OCR Text', icon: 'M4 6h16M4 12h16M4 18h7' }
                  ].map((mode) => (
                    <div 
                      key={mode.id}
                      onClick={() => setScanMode(mode.id as ScanMode)}
                      className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 flex items-start gap-3
                        ${scanMode === mode.id 
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-600' 
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                    >
                      <div className={`mt-1 p-2 rounded-lg ${scanMode === mode.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mode.icon} /></svg>
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${scanMode === mode.id ? 'text-indigo-900' : 'text-gray-900'}`}>{mode.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{mode.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center">
                   <svg className="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                   <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              )}

              <button 
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl text-white font-bold text-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                 {isProcessing ? 'Processing Document...' : 'Start Extraction'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};