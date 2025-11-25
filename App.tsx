import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DocumentList } from './components/DocumentList';
import { Uploader } from './components/Uploader';
import { ViewState, DocumentRecord, DocType, DEFAULT_CATEGORIES } from './types';

// Mock Data for Initial State
const MOCK_DOCS: DocumentRecord[] = [
  {
    id: '1',
    type: DocType.INVOICE,
    vendor: 'AWS Web Services',
    date: '2023-10-15',
    amount: 145.50,
    currency: 'USD',
    tax: 0,
    category: 'Services',
    summary: 'Monthly cloud hosting bill',
    fileData: 'mockdata', 
    mimeType: 'application/pdf',
    createdAt: '2023-10-15T10:00:00Z',
    status: 'completed',
    isNew: false
  },
  {
    id: '2',
    type: DocType.RECEIPT,
    vendor: 'Shell Station',
    date: '2023-10-18',
    amount: 65.20,
    currency: 'USD',
    tax: 5.20,
    category: 'Fuel',
    summary: 'Gas for company car',
    fileData: 'mockdata_image_string',
    mimeType: 'image/jpeg',
    createdAt: '2023-10-18T14:30:00Z',
    status: 'completed',
    isNew: false
  },
  {
    id: '3',
    type: DocType.INVOICE,
    vendor: 'Apple Store',
    date: '2023-10-20',
    amount: 2499.00,
    currency: 'USD',
    tax: 180.00,
    category: 'Equipment',
    summary: 'MacBook Pro M2 purchase',
    fileData: 'mockdata_large_pdf',
    mimeType: 'application/pdf',
    createdAt: '2023-10-20T09:15:00Z',
    status: 'completed',
    isNew: true
  }
];

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for Data
  const [documents, setDocuments] = useState<DocumentRecord[]>(MOCK_DOCS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  const handleUploadComplete = (newDoc: DocumentRecord) => {
    // Mark as new for visual highlighting
    const docWithFlag = { ...newDoc, isNew: true };
    setDocuments(prev => [docWithFlag, ...prev]);
    setView('documents');
  };

  const handleUpdateDocument = (updatedDoc: DocumentRecord) => {
    setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const handleMarkAsSeen = (id: string) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, isNew: false } : doc));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            documents={documents} 
            onScanClick={() => setView('upload')}
          />
        );
      case 'documents':
        return (
          <DocumentList 
            documents={documents} 
            categories={categories}
            setCategories={setCategories}
            onUpdateDocument={handleUpdateDocument}
            onDeleteDocument={handleDeleteDocument}
            onMarkAsSeen={handleMarkAsSeen}
          />
        );
      case 'upload':
        return (
          <Uploader 
            onUploadComplete={handleUploadComplete} 
            onCancel={() => setView('dashboard')} 
          />
        );
      default:
        return (
          <Dashboard 
            documents={documents} 
            onScanClick={() => setView('upload')}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        setView={setView} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 ml-2 lg:ml-0 tracking-tight">
              {currentView === 'dashboard' ? 'Dashboard' : 
               currentView === 'documents' ? 'My Documents' : 
               currentView === 'upload' ? 'Upload' : ''}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="p-2 text-gray-400 hover:text-indigo-600 relative transition-colors bg-gray-50 rounded-full hover:bg-indigo-50">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
               {documents.some(d => d.isNew) && (
                 <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
               )}
             </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#f8fafc] p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;