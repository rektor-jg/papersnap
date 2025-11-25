
import React, { useState, useMemo } from 'react';
import { DocumentRecord, DocType, Folder } from '../types';
import { DocumentDetailModal } from './DocumentDetailModal';
import { useDocuments } from '../hooks/useDocuments'; 

interface DocumentListProps {
  documents: DocumentRecord[];
  categories: string[];
  folders?: Folder[];
  setCategories: (categories: string[]) => void;
  onUpdateDocument: (doc: DocumentRecord) => void;
  onDeleteDocument: (id: string) => void;
  onMarkAsSeen: (id: string) => void;
  onMoveDocuments?: (docIds: string[], folderId: string | undefined) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({ 
  documents, 
  categories, 
  folders = [],
  setCategories,
  onUpdateDocument,
  onDeleteDocument,
  onMarkAsSeen,
  onMoveDocuments
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // UI States
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Bulk Action States
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkMoveOpen, setIsBulkMoveOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string>('');

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
       const dateA = new Date(a.date).getTime();
       const dateB = new Date(b.date).getTime();
       if (dateA !== dateB) return dateB - dateA;
       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [documents, searchTerm, filterCategory, dateFrom, dateTo]);

  // Bulk Selection Handlers
  const handleToggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(filteredDocs.map(d => d.id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkMoveConfirm = () => {
    if (onMoveDocuments && selectedIds.size > 0) {
      const target = targetFolderId === '' ? undefined : targetFolderId;
      onMoveDocuments(Array.from(selectedIds), target);
      setSelectedIds(new Set());
      setIsBulkMoveOpen(false);
      setTargetFolderId('');
    }
  };

  const handleDeleteRequest = (doc: DocumentRecord) => {
    if (window.confirm(`Are you sure you want to move "${doc.vendor}" to trash?`)) {
      onDeleteDocument(doc.id);
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
      }
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Documents List</h2>
        <div className="flex gap-2">
            <button 
              onClick={handleExportAllCSV}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export List CSV
            </button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{selectedIds.size}</span>
            <span className="text-sm font-semibold text-blue-900">Selected</span>
          </div>
          <div className="flex gap-2">
             <button 
               onClick={() => setIsBulkMoveOpen(true)}
               className="text-sm bg-white border border-blue-200 text-blue-700 font-medium px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
             >
               Move to Folder
             </button>
             <button 
               onClick={() => setSelectedIds(new Set())}
               className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 transition-colors"
             >
               Cancel
             </button>
          </div>
        </div>
      )}

      {/* Unified Toolbar */}
      <div className="bg-white p-2 rounded-lg border border-gray-200 flex flex-col xl:flex-row gap-2 items-center">
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
                className="block w-full py-2 px-3 border border-gray-300 rounded-lg text-gray-900 bg-white sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
           </div>
           <span className="text-gray-400 font-medium">-</span>
           <div className="relative flex-1">
              <input 
                type="date" 
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 rounded-lg text-gray-900 bg-white sm:text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
           </div>
        </div>

        <div className="h-8 w-px bg-gray-200 hidden xl:block"></div>

        {/* Category Filter */}
        <div className="flex gap-2 w-full xl:w-auto p-1">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="block w-full xl:w-48 pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button 
            onClick={() => setIsManageCategoriesOpen(true)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Manage Categories"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 !bg-white accent-blue-600 cursor-pointer"
                    style={{ backgroundColor: 'white', colorScheme: 'light' }}
                    checked={filteredDocs.length > 0 && selectedIds.size === filteredDocs.length}
                    onChange={handleToggleSelectAll}
                  />
                </th>
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
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <p>No documents found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className={`hover:bg-blue-50/50 transition-colors group ${doc.isNew ? 'bg-blue-50/30' : ''} ${selectedIds.has(doc.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 w-10">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 !bg-white accent-blue-600 cursor-pointer"
                        style={{ backgroundColor: 'white', colorScheme: 'light' }}
                        checked={selectedIds.has(doc.id)}
                        onChange={() => handleToggleSelectOne(doc.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{doc.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold mr-3 relative">
                          {doc.vendor.charAt(0).toUpperCase()}
                          {doc.isNew && <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {doc.vendor.length > 25 ? doc.vendor.substring(0, 25) + '...' : doc.vendor}
                            </span>
                             {doc.isNew && <span className="text-[10px] text-blue-600 font-medium">New</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded border border-gray-200 bg-gray-50 text-gray-600">
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
                        className="text-blue-600 hover:text-blue-800 font-semibold px-3 py-1 rounded hover:bg-blue-50 transition-colors"
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
          <div key={doc.id} className={`bg-white p-4 rounded-lg shadow-sm border border-gray-200 ${doc.isNew ? 'ring-2 ring-blue-500/20' : ''}`} onClick={() => setSelectedDoc(doc)}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-3">
                 <div className="relative h-10 w-10 rounded bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
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
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 px-2 py-1 rounded border border-gray-100">{doc.category}</span>
              <div className="flex gap-4">
                 <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc); }}
                  className="text-sm text-blue-600 font-bold"
                >
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reusable Document Detail Modal */}
      {selectedDoc && (
        <DocumentDetailModal
          document={selectedDoc}
          categories={categories}
          folders={folders} 
          onClose={() => setSelectedDoc(null)}
          onUpdate={(updated) => { onUpdateDocument(updated); setSelectedDoc(updated); }}
          onDelete={(doc) => handleDeleteRequest(doc)}
          onMarkAsSeen={onMarkAsSeen}
        />
      )}

      {/* Bulk Move Modal */}
      {isBulkMoveOpen && (
         <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4">
               <div className="fixed inset-0 bg-gray-900/40 transition-opacity backdrop-blur-sm" onClick={() => setIsBulkMoveOpen(false)}></div>
               <div className="relative bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Move {selectedIds.size} Documents</h3>
                 <p className="text-sm text-gray-500 mb-6">Select the destination folder for the selected documents.</p>
                 
                 <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Folder</label>
                    <div className="relative">
                        <select 
                            value={targetFolderId}
                            onChange={(e) => setTargetFolderId(e.target.value)}
                            className="block w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm font-medium rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10"
                        >
                            <option value="">Unfiled (All Documents)</option>
                            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                 </div>

                 <div className="flex justify-end gap-3">
                   <button 
                    onClick={() => setIsBulkMoveOpen(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                    onClick={handleBulkMoveConfirm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                   >
                     Move Documents
                   </button>
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
               <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                 <h3 className="text-xl font-bold text-gray-900 mb-6">Manage Categories</h3>
                 
                 <div className="flex gap-2 mb-6">
                   <input 
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name..."
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                   />
                   <button 
                    onClick={handleAddCategory}
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                   >
                     Add
                   </button>
                 </div>

                 <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                   {categories.map(cat => (
                     <div key={cat} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
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
                    className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
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
