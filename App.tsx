
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DocumentList } from './components/DocumentList';
import { Uploader } from './components/Uploader';
import { TrashList } from './components/TrashList';
import { ChatAssistant } from './components/ChatAssistant';
import { Settings } from './components/Settings';
import { FoldersView } from './components/FoldersView';
import { DocumentDetailModal } from './components/DocumentDetailModal';
import { ViewState, DocumentRecord, DEFAULT_CATEGORIES } from './types';
import { useDocuments } from './hooks/useDocuments';

const App: React.FC = () => {
  const [currentView, setView] = useState<ViewState>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Refactored state management using custom hook
  const { 
    activeDocuments, 
    deletedDocuments, 
    folders,
    addDocument, 
    updateDocument, 
    softDeleteDocument, 
    restoreDocument, 
    permanentDeleteDocument, 
    emptyTrash, 
    markAsSeen,
    createFolder,
    deleteFolder,
    moveDocumentToFolder,
    moveDocumentsToFolder
  } = useDocuments();

  // Settings State
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');
  const [defaultTaxRate, setDefaultTaxRate] = useState(0);
  const [ocrLanguage, setOcrLanguage] = useState('auto');
  const [enablePreprocessing, setEnablePreprocessing] = useState(true);

  // Global modal state could be handled here if we wanted to trigger details from anywhere
  // For now, specific views handle their own modal invocation or we rely on the specific components
  
  const handleUploadComplete = (newDoc: DocumentRecord) => {
    addDocument(newDoc);
    setView('documents');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            documents={activeDocuments} 
            onScanClick={() => setView('upload')}
          />
        );
      case 'documents':
        return (
          <DocumentList 
            documents={activeDocuments} 
            categories={categories}
            folders={folders}
            setCategories={setCategories}
            onUpdateDocument={updateDocument}
            onDeleteDocument={softDeleteDocument}
            onMarkAsSeen={markAsSeen}
            onMoveDocuments={moveDocumentsToFolder}
          />
        );
      case 'folders':
        return (
            <FoldersView 
                documents={activeDocuments}
                folders={folders}
                categories={categories}
                setCategories={setCategories}
                onUpdateDocument={updateDocument}
                onDeleteDocument={softDeleteDocument}
                onMarkAsSeen={markAsSeen}
                onCreateFolder={createFolder}
                onDeleteFolder={deleteFolder}
                onMoveDocument={moveDocumentToFolder}
                onMoveDocuments={moveDocumentsToFolder}
            />
        );
      case 'upload':
        return (
          <Uploader 
            onUploadComplete={handleUploadComplete} 
            onCancel={() => setView('dashboard')} 
          />
        );
      case 'chat':
        return (
          <ChatAssistant 
            documents={activeDocuments} 
          />
        );
      case 'trash':
        return (
          <TrashList 
            documents={deletedDocuments}
            onRestore={restoreDocument}
            onDeleteForever={permanentDeleteDocument}
            onEmptyTrash={emptyTrash}
          />
        );
      case 'settings':
        return (
          <Settings 
            categories={categories}
            setCategories={setCategories}
            defaultCurrency={defaultCurrency}
            setDefaultCurrency={setDefaultCurrency}
            defaultTaxRate={defaultTaxRate}
            setDefaultTaxRate={setDefaultTaxRate}
            ocrLanguage={ocrLanguage}
            setOcrLanguage={setOcrLanguage}
            enablePreprocessing={enablePreprocessing}
            setEnablePreprocessing={setEnablePreprocessing}
          />
        );
      default:
        return (
          <Dashboard 
            documents={activeDocuments} 
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
               currentView === 'folders' ? 'Folders' :
               currentView === 'trash' ? 'Trash Bin' :
               currentView === 'chat' ? 'AI Assistant' :
               currentView === 'settings' ? 'Settings' :
               currentView === 'upload' ? 'Upload' : ''}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="p-2 text-gray-400 hover:text-indigo-600 relative transition-colors bg-gray-50 rounded-full hover:bg-indigo-50">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
               {activeDocuments.some(d => d.isNew) && (
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
