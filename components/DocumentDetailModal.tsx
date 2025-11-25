
import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import { DocumentRecord, DocType, Folder } from '../types';

interface DocumentDetailModalProps {
  document: DocumentRecord;
  categories: string[];
  folders?: Folder[]; // Optional to keep backward compatibility if not passed immediately
  onClose: () => void;
  onUpdate: (doc: DocumentRecord) => void;
  onDelete: (doc: DocumentRecord) => void;
  onMarkAsSeen: (id: string) => void;
}

export const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  document: docRecord,
  categories,
  folders = [],
  onClose,
  onUpdate,
  onDelete,
  onMarkAsSeen
}) => {
  const [editVendor, setEditVendor] = useState(docRecord.vendor);
  const [editCategory, setEditCategory] = useState(docRecord.category);
  const [editFolderId, setEditFolderId] = useState<string>(docRecord.folderId || '');
  const [isDirty, setIsDirty] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    if (docRecord.isNew) {
      onMarkAsSeen(docRecord.id);
    }
  }, [docRecord, onMarkAsSeen]);

  const handleSaveChanges = () => {
    const updated = {
      ...docRecord,
      vendor: editVendor,
      category: editCategory,
      folderId: editFolderId || undefined,
      isNew: false
    };
    onUpdate(updated);
    setIsDirty(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(docRecord.summary);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!docRecord.fileData.startsWith('data:')) {
      alert("Cannot download mock data files in this demo.");
      return;
    }
    const link = document.createElement("a");
    link.href = docRecord.fileData;
    let ext = 'bin';
    if (docRecord.mimeType === 'application/pdf') ext = 'pdf';
    else if (docRecord.mimeType === 'image/jpeg') ext = 'jpg';
    else if (docRecord.mimeType === 'image/png') ext = 'png';
    link.download = `${docRecord.vendor}_${docRecord.date}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text("PaperSnap Document Report", 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let yPos = 40;
    const lineHeight = 10;

    const addField = (label: string, value: string) => {
      doc.setFont("helvetica", "bold");
      doc.text(label + ":", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(value, 60, yPos);
      yPos += lineHeight;
    };

    addField("Name", docRecord.vendor);
    addField("Date", docRecord.date);
    addField("Type", docRecord.type);
    addField("Category", docRecord.category);
    
    if (docRecord.type !== DocType.TEXT) {
      addField("Amount", `${docRecord.currency} ${docRecord.amount.toFixed(2)}`);
      addField("Tax/VAT", `${docRecord.currency} ${docRecord.tax.toFixed(2)}`);
    }

    addField("Status", docRecord.status);
    
    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.text(docRecord.type === DocType.TEXT ? "Content:" : "Summary:", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    
    const splitSummary = doc.splitTextToSize(docRecord.summary, 170);
    doc.text(splitSummary, 20, yPos);
    
    doc.save(`${docRecord.vendor}_${docRecord.date}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" 
          onClick={onClose}
        ></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full h-[85vh]">
          
          <div className="h-full flex flex-col sm:flex-row items-stretch">
              {/* Left Column: Dark Preview */}
              <div className="w-full sm:w-1/2 bg-slate-900 border-b sm:border-b-0 sm:border-r border-gray-700 flex flex-col h-1/2 sm:h-full relative group">
                <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur text-xs font-bold text-white rounded-full border border-white/10">
                        {docRecord.mimeType.split('/')[1].toUpperCase()}
                    </span>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-hidden p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                   {docRecord.fileData.startsWith('data:image') ? (
                     <img src={docRecord.fileData} alt="Document" className="max-w-full max-h-full object-contain shadow-2xl rounded-sm ring-1 ring-white/10" />
                   ) : docRecord.fileData.startsWith('data:application/pdf') ? (
                     <embed src={docRecord.fileData} type="application/pdf" className="w-full h-full rounded shadow-sm" />
                   ) : (
                     <div className="text-center p-8 text-gray-500">
                       <svg className="w-20 h-20 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       <p>No preview available</p>
                     </div>
                   )}
                </div>
                <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-center">
                    <button onClick={handleDownloadFile} className="flex items-center text-sm text-slate-300 hover:text-white font-medium transition-colors">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" /></svg>
                      Download Original File
                    </button>
                </div>
              </div>

              {/* Right Column: Light Details & Edit */}
              <div className="w-full sm:w-1/2 bg-white flex flex-col h-1/2 sm:h-full overflow-y-auto relative">
                {/* Close Button */}
                <button 
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors z-20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div className="p-8 sm:p-10 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="mb-8 pr-10">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Vendor / Name</label>
                    <input 
                      type="text" 
                      value={editVendor}
                      onChange={(e) => { setEditVendor(e.target.value); setIsDirty(true); }}
                      className="text-3xl font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-600 focus:outline-none bg-transparent w-full transition-colors pb-1 placeholder-gray-300 tracking-tight"
                      placeholder="Document Name"
                    />
                    <div className="flex items-center gap-3 mt-4">
                       <div className="flex items-center text-sm text-gray-500 font-medium">
                          <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {docRecord.date}
                       </div>
                       <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${docRecord.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                          {docRecord.status === 'completed' ? 'Processed' : docRecord.status}
                       </span>
                    </div>
                  </div>

                  {/* Main Details Grid */}
                  <div className="space-y-8">
                    {/* Financial Card */}
                    {docRecord.type !== DocType.TEXT && (
                       <div className="bg-slate-50 rounded-lg p-6 border border-gray-200 grid grid-cols-2 gap-8 relative overflow-hidden">
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">{docRecord.currency} {docRecord.amount.toFixed(2)}</p>
                          </div>
                          <div className="border-l border-gray-200 pl-8">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tax / VAT</p>
                            <p className="text-xl font-semibold text-gray-600">{docRecord.currency} {docRecord.tax.toFixed(2)}</p>
                          </div>
                       </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                        <div className="relative">
                            <select 
                                value={editCategory}
                                onChange={(e) => { setEditCategory(e.target.value); setIsDirty(true); }}
                                className="block w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm font-medium rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 shadow-sm transition-all"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        </div>

                        {/* Folder */}
                        <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Folder</label>
                        <div className="relative">
                            <select 
                                value={editFolderId}
                                onChange={(e) => { setEditFolderId(e.target.value); setIsDirty(true); }}
                                className="block w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm font-medium rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 shadow-sm transition-all"
                            >
                                <option value="">Unfiled</option>
                                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Summary / Content */}
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-3">
                         <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                           {docRecord.type === DocType.TEXT ? 'Extracted Text' : 'AI Summary'}
                         </label>
                         {docRecord.type === DocType.TEXT && (
                           <button 
                             onClick={handleCopyText}
                             className="text-xs text-blue-600 font-bold hover:text-blue-800 flex items-center gap-1 uppercase tracking-wider transition-colors"
                           >
                             {copyFeedback ? (
                               <>Copied!</>
                             ) : (
                               <>
                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                 Copy
                               </>
                             )}
                           </button>
                         )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar font-medium">
                        {docRecord.summary}
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-auto pt-10">
                     {isDirty && (
                       <button 
                          onClick={handleSaveChanges}
                          className="w-full mb-4 flex justify-center items-center px-4 py-3.5 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-colors"
                       >
                         Save Changes
                       </button>
                     )}
                     
                     <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={handleExportPDF}
                        className="flex-1 flex justify-center items-center px-4 py-3 border border-gray-200 text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                         <svg className="mr-2 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        Export PDF
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 pt-4 flex justify-center">
                      <button 
                        onClick={() => onDelete(docRecord)}
                        className="flex items-center text-sm font-semibold text-red-500 hover:text-red-700 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Move to Trash
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
