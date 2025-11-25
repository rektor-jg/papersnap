import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from "jspdf";
import { DocumentRecord, DocType } from '../types';

interface DocumentListProps {
  documents: DocumentRecord[];
  categories: string[];
  setCategories: (categories: string[]) => void;
  onUpdateDocument: (doc: DocumentRecord) => void;
  onDeleteDocument: (id: string) => void;
  onMarkAsSeen: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  categories, 
  setCategories,
  onUpdateDocument,
  onDeleteDocument,
  onMarkAsSeen
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // UI States
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Edit States (inside Modal)
  const [editVendor, setEditVendor] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Category Management State
  const [newCategoryName, setNewCategoryName] = useState('');

  // Initialize edit state when a doc is selected
  useEffect(() => {
    if (selectedDoc) {
      setEditVendor(selectedDoc.vendor);
      setEditCategory(selectedDoc.category);
      setIsDirty(false);
      setCopyFeedback(false);
      
      // If it's new, mark as seen when opened
      if (selectedDoc.isNew) {
        onMarkAsSeen(selectedDoc.id);
      }
    }
  }, [selectedDoc]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      // Search
      const matchesSearch = 
        doc.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.amount.toString().includes(searchTerm);
      
      // Category
      const matchesCategory = filterCategory === 'All' || doc.category === filterCategory;

      // Date Range
      let matchesDate = true;
      if (dateFrom) {
        matchesDate = matchesDate && (doc.date >= dateFrom);
      }
      if (dateTo) {
        matchesDate = matchesDate && (doc.date <= dateTo);
      }

      return matchesSearch && matchesCategory && matchesDate;
    }).sort((a, b) => {
       // Sort by Date Descending (Newest first)
       const dateA = new Date(a.date).getTime();
       const dateB = new Date(b.date).getTime();
       if (dateA !== dateB) return dateB - dateA;
       
       // Fallback to CreatedAt Descending
       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [documents, searchTerm, filterCategory, dateFrom, dateTo]);

  const handleDeleteRequest = (doc: DocumentRecord, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${doc.vendor}"? This action cannot be undone.`)) {
      onDeleteDocument(doc.id);
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
      }
    }
  };

  const handleSaveChanges = () => {
    if (selectedDoc) {
      const updated = {
        ...selectedDoc,
        vendor: editVendor,
        category: editCategory,
        isNew: false // Ensure flag is cleared on save
      };
      onUpdateDocument(updated);
      setSelectedDoc(updated); // Update local view
      setIsDirty(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      setCategories([...categories, newCategoryName.trim()]);
      setNewCategoryName('');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Are you sure you want to delete category "${cat}"?`)) {
      setCategories(categories.filter(c => c !== cat));
    }
  };

  const handleCopyText = () => {
    if (selectedDoc) {
      navigator.clipboard.writeText(selectedDoc.summary);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  // --- Export Logic ---
  const generateCSV = (docs: DocumentRecord[]) => {
    const headers = ['Type', 'Name', 'Date', 'Amount', 'Currency', 'Tax', 'Category', 'Summary'];
    const rows = docs.map(doc => [
      doc.type,
      `"${doc.vendor}"`,
      doc.date,
      doc.amount,
      doc.currency,
      doc.tax,
      doc.category,
      `"${doc.summary.replace(/"/g, '""')}"`
    ]);

    return "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
  };

  const downloadCSV = (docs: DocumentRecord[], filename: string) => {
    const csvContent = generateCSV(docs);
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllCSV = () => {
    downloadCSV(filteredDocs, `papersnap_export_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleSingleExportCSV = () => {
    if (!selectedDoc) return;
    downloadCSV([selectedDoc], `papersnap_${selectedDoc.vendor}_${selectedDoc.date}.csv`);
  };

  const handleExportPDF = () => {
    if (!selectedDoc) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); 
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

    addField("Name", selectedDoc.vendor);
    addField("Date", selectedDoc.date);
    addField("Type", selectedDoc.type);
    addField("Category", selectedDoc.category);
    
    if (selectedDoc.type !== DocType.TEXT) {
      addField("Amount", `${selectedDoc.currency} ${selectedDoc.amount.toFixed(2)}`);
      addField("Tax/VAT", `${selectedDoc.currency} ${selectedDoc.tax.toFixed(2)}`);
    }

    addField("Status", selectedDoc.status);
    
    yPos += 5;
    doc.setFont("helvetica", "bold");
    doc.text(selectedDoc.type === DocType.TEXT ? "Content:" : "Summary:", 20, yPos);
    yPos += 7;
    doc.setFont("helvetica", "normal");
    
    const splitSummary = doc.splitTextToSize(selectedDoc.summary, 170);
    doc.text(splitSummary, 20, yPos);
    yPos += (splitSummary.length * 7) + 10;

    if (selectedDoc.mimeType.startsWith("image/")) {
      try {
        const maxW = 170;
        const maxH = 120; 
        doc.setFont("helvetica", "bold");
        doc.text("Original Attachment:", 20, yPos);
        yPos += 10;
        doc.addImage(selectedDoc.fileData, "JPEG", 20, yPos, maxW, maxH, undefined, 'FAST');
      } catch (e) {
        doc.text("[Error embedding image]", 20, yPos);
      }
    } else {
      doc.setTextColor(100);
      doc.setFontSize(10);
      doc.text("Note: The original attachment is a PDF/File and cannot be embedded in this report.", 20, yPos);
    }
    doc.save(`${selectedDoc.vendor}_${selectedDoc.date}.pdf`);
  };

  const handleDownloadFile = () => {
    if (!selectedDoc) return;
    if (!selectedDoc.fileData.startsWith('data:')) {
      alert("Cannot download mock data files.");
      return;
    }
    const link = document.createElement("a");
    link.href = selectedDoc.fileData;
    let ext = 'bin';
    if (selectedDoc.mimeType === 'application/pdf') ext = 'pdf';
    else if (selectedDoc.mimeType === 'image/jpeg') ext = 'jpg';
    else if (selectedDoc.mimeType === 'image/png') ext = 'png';
    link.download = `${selectedDoc.vendor}_${selectedDoc.date}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">All Documents</h2>
        <div className="flex gap-2">
            <button 
              onClick={handleExportAllCSV}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all"
            >
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export List CSV
            </button>
        </div>
      </div>

      {/* Unified Toolbar */}
      <div className="bg-white p-2 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col xl:flex-row gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-transparent border-0 text-gray-900 placeholder-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Search name, text, amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="h-8 w-px bg-gray-200 hidden xl:block"></div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 w-full xl:w-auto px-2">
           <div className="relative flex-1">
              <input 
                type="date" 
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-200 rounded-lg text-gray-700 bg-gray-50/50 sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
           </div>
           <span className="text-gray-400 font-medium">-</span>
           <div className="relative flex-1">
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-200 rounded-lg text-gray-700 bg-gray-50/50 sm:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all outline-none"
              />
           </div>
        </div>

        <div className="h-8 w-px bg-gray-200 hidden xl:block"></div>

        {/* Category Filter */}
        <div className="flex gap-2 w-full xl:w-auto p-1">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="block w-full xl:w-48 pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsManageCategoriesOpen(true)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Manage Categories"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p>No documents found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className={`hover:bg-gray-50/80 transition-colors group ${doc.isNew ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold mr-3 relative shadow-sm border border-indigo-100">
                          {doc.vendor.charAt(0).toUpperCase()}
                          {doc.isNew && <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white animate-pulse"></span>}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {doc.vendor.length > 25 ? doc.vendor.substring(0, 25) + '...' : doc.vendor}
                            </span>
                             {doc.isNew && <span className="text-[10px] text-indigo-600 font-medium">New Upload</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-md bg-gray-100 text-gray-600 border border-gray-200">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      {doc.type === DocType.TEXT ? <span className="text-gray-400">-</span> : `${doc.currency} ${doc.amount.toFixed(2)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button 
                        onClick={() => setSelectedDoc(doc)}
                        className="text-indigo-600 hover:text-indigo-900 font-semibold px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* List - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredDocs.map((doc) => (
          <div key={doc.id} className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 ${doc.isNew ? 'ring-2 ring-indigo-500/20' : ''}`} onClick={() => setSelectedDoc(doc)}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                 <div className="relative h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {doc.vendor.charAt(0).toUpperCase()}
                    {doc.isNew && <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>}
                 </div>
                 <div>
                   <h3 className="font-bold text-gray-900 flex items-center gap-2">
                     {doc.vendor.length > 20 ? doc.vendor.substring(0, 20) + '...' : doc.vendor}
                   </h3>
                   <p className="text-xs text-gray-500">{doc.date}</p>
                 </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">
                   {doc.type === DocType.TEXT ? '-' : `${doc.currency} ${doc.amount.toFixed(2)}`}
                </p>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-500 mt-1 uppercase">{doc.type}</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between items-center border-t border-gray-50 pt-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 px-2 py-1 rounded">{doc.category}</span>
              <div className="flex gap-4">
                 <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                  className="text-sm text-indigo-600 font-bold"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Document Details Modal (View & Edit) */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-gray-900/60 transition-opacity backdrop-blur-sm" 
              onClick={() => setSelectedDoc(null)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full h-[85vh]">
              
              <div className="h-full flex flex-col sm:flex-row items-stretch">
                  {/* Left Column: Dark Preview */}
                  <div className="w-full sm:w-1/2 bg-slate-900 border-b sm:border-b-0 sm:border-r border-gray-800 flex flex-col h-1/2 sm:h-full relative group">
                    <div className="absolute top-4 left-4 z-10">
                        <span className="px-3 py-1 bg-black/50 backdrop-blur text-xs font-bold text-white rounded-full border border-white/10">
                            {selectedDoc.mimeType.split('/')[1].toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 flex items-center justify-center overflow-hidden p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                       {selectedDoc.fileData.startsWith('data:image') ? (
                         <img src={selectedDoc.fileData} alt="Document" className="max-w-full max-h-full object-contain shadow-2xl rounded-sm ring-1 ring-white/10" />
                       ) : selectedDoc.fileData.startsWith('data:application/pdf') ? (
                         <embed src={selectedDoc.fileData} type="application/pdf" className="w-full h-full rounded shadow-sm" />
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
                      onClick={() => setSelectedDoc(null)}
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
                          className="text-3xl font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-200 focus:border-indigo-600 focus:outline-none bg-transparent w-full transition-colors pb-1 placeholder-gray-300 tracking-tight"
                          placeholder="Document Name"
                        />
                        <div className="flex items-center gap-3 mt-4">
                           <div className="flex items-center text-sm text-gray-500 font-medium">
                              <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              {selectedDoc.date}
                           </div>
                           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${selectedDoc.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {selectedDoc.status === 'completed' ? 'Processed' : selectedDoc.status}
                           </span>
                        </div>
                      </div>

                      {/* Main Details Grid */}
                      <div className="space-y-8">
                        {/* Financial Card */}
                        {selectedDoc.type !== DocType.TEXT && (
                           <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-100 shadow-sm grid grid-cols-2 gap-8 relative overflow-hidden">
                              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-8 -mt-8"></div>
                              <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</p>
                                <p className="text-2xl font-bold text-gray-900">{selectedDoc.currency} {selectedDoc.amount.toFixed(2)}</p>
                              </div>
                              <div className="border-l border-gray-200 pl-8">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Tax / VAT</p>
                                <p className="text-xl font-semibold text-gray-600">{selectedDoc.currency} {selectedDoc.tax.toFixed(2)}</p>
                              </div>
                           </div>
                        )}
                        
                        {/* Category */}
                        <div>
                           <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                           <div className="relative">
                              <select 
                                value={editCategory}
                                onChange={(e) => { setEditCategory(e.target.value); setIsDirty(true); }}
                                className="block w-full appearance-none bg-white border border-gray-200 text-gray-900 text-base font-medium rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block p-4 pr-10 shadow-sm transition-all"
                              >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                              </div>
                           </div>
                        </div>

                        {/* Summary / Content */}
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-3">
                             <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                               {selectedDoc.type === DocType.TEXT ? 'Extracted Text' : 'AI Summary'}
                             </label>
                             {selectedDoc.type === DocType.TEXT && (
                               <button 
                                 onClick={handleCopyText}
                                 className="text-xs text-indigo-600 font-bold hover:text-indigo-800 flex items-center gap-1 uppercase tracking-wider transition-colors"
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
                          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200/60 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar font-medium">
                            {selectedDoc.summary}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-auto pt-10">
                         {isDirty && (
                           <button 
                              onClick={handleSaveChanges}
                              className="w-full mb-4 flex justify-center items-center px-4 py-4 border border-transparent shadow-lg shadow-indigo-500/30 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transform active:scale-[0.99] transition-all"
                           >
                             Save Changes
                           </button>
                         )}
                         
                         <div className="grid grid-cols-2 gap-3 mb-4">
                          <button
                            onClick={handleSingleExportCSV}
                            className="flex justify-center items-center px-4 py-3 border border-gray-200 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                             <svg className="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Export CSV
                          </button>
                          <button
                            onClick={handleExportPDF}
                            className="flex justify-center items-center px-4 py-3 border border-gray-200 shadow-sm text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                             <svg className="mr-2 h-4 w-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            Export PDF
                          </button>
                        </div>
                        
                        <div className="border-t border-gray-100 pt-4 flex justify-center">
                          <button 
                            onClick={() => handleDeleteRequest(selectedDoc)}
                            className="flex items-center text-sm font-semibold text-red-500 hover:text-red-700 transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            Delete Document
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Categories Modal */}
      {isManageCategoriesOpen && (
         <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4">
               <div className="fixed inset-0 bg-gray-900/40 transition-opacity backdrop-blur-sm" onClick={() => setIsManageCategoriesOpen(false)}></div>
               <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                 <h3 className="text-xl font-bold text-gray-900 mb-6">Manage Categories</h3>
                 
                 <div className="flex gap-2 mb-6">
                   <input 
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                   />
                   <button 
                    onClick={handleAddCategory}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-sm transition-colors"
                   >
                     Add
                   </button>
                 </div>

                 <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                   {categories.map(cat => (
                     <div key={cat} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
                       <span className="font-medium text-gray-700">{cat}</span>
                       <button 
                        onClick={() => handleDeleteCategory(cat)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                       >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                     </div>
                   ))}
                 </div>

                 <div className="mt-8 text-right">
                   <button 
                    onClick={() => setIsManageCategoriesOpen(false)}
                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors"
                   >
                     Done
                   </button>
                 </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};