
import React, { useState, useMemo } from 'react';
import { DocumentRecord, Folder } from '../types';
import { DocumentList } from './DocumentList';

interface FoldersViewProps {
  documents: DocumentRecord[];
  folders: Folder[];
  categories: string[];
  setCategories: (categories: string[]) => void;
  onUpdateDocument: (doc: DocumentRecord) => void;
  onDeleteDocument: (id: string) => void;
  onMarkAsSeen: (id: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveDocument: (docId: string, folderId: string | undefined) => void;
  onMoveDocuments: (docIds: string[], folderId: string | undefined) => void;
}

export const FoldersView: React.FC<FoldersViewProps> = ({
  documents,
  folders,
  categories,
  setCategories,
  onUpdateDocument,
  onDeleteDocument,
  onMarkAsSeen,
  onCreateFolder,
  onDeleteFolder,
  onMoveDocument,
  onMoveDocuments
}) => {
  // 'all' means all documents. undefined means "Unfiled" (doc.folderId is undefined). string is specific folder ID.
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const filteredDocuments = useMemo(() => {
    if (selectedFolderId === 'all') {
      return documents;
    }
    // If we wanted an "Unfiled" view, we could check for undefined. 
    // Here, selectedFolderId matches the doc.folderId
    return documents.filter(doc => doc.folderId === selectedFolderId);
  }, [documents, selectedFolderId]);

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreateModalOpen(false);
    }
  };

  const handleDeleteFolder = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this folder? Documents inside will be moved to 'All' (Unfiled).")) {
      if (selectedFolderId === id) setSelectedFolderId('all');
      onDeleteFolder(id);
    }
  };

  const selectedFolderInfo = folders.find(f => f.id === selectedFolderId);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex h-full">
        {/* Left Sidebar: Folder List */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              New Folder
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {/* System Folder: All */}
            <button
              onClick={() => setSelectedFolderId('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedFolderId === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <div className="flex items-center gap-3">
                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                 All Documents
              </div>
              <span className="text-xs bg-white/50 px-2 py-0.5 rounded-full text-gray-500">{documents.length}</span>
            </button>

            {/* User Folders */}
            <div className="pt-4 pb-2 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">My Folders</div>
            {folders.map(folder => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedFolderId === folder.id ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                <div className="flex items-center gap-3 truncate">
                  <svg className={`w-5 h-5 ${selectedFolderId === folder.id ? 'text-blue-600' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 24 24"><path d="M2.5 5A2.5 2.5 0 015 2.5h2.88a2.5 2.5 0 012.02.99l1.1 1.51h7.5A2.5 2.5 0 0121 7.5v10A2.5 2.5 0 0118.5 20h-13A2.5 2.5 0 013 17.5v-10h-.5zm2.5-.5a.5.5 0 00-.5.5v10a.5.5 0 00.5.5h13a.5.5 0 00.5-.5v-10a.5.5 0 00-.5-.5h-7.5a.5.5 0 01-.4-.19l-1.63-2.24a.5.5 0 00-.4-.17H5z" /></svg>
                  <span className="truncate">{folder.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedFolderId === folder.id ? 'bg-white/50 text-blue-700' : 'text-gray-400'}`}>
                    {documents.filter(d => d.folderId === folder.id).length}
                  </span>
                  <div 
                    onClick={(e) => handleDeleteFolder(e, folder.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 hover:text-red-500 rounded transition-all"
                  >
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Pane: Document List */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {selectedFolderId === 'all' ? (
                        <>All Documents</>
                    ) : (
                        <>
                           <span className="text-gray-400 font-normal">Folder /</span>
                           {selectedFolderInfo?.name}
                        </>
                    )}
                </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
                <DocumentList 
                    documents={filteredDocuments}
                    categories={categories}
                    folders={folders}
                    setCategories={setCategories}
                    onUpdateDocument={onUpdateDocument}
                    onDeleteDocument={onDeleteDocument}
                    onMarkAsSeen={onMarkAsSeen}
                    onMoveDocuments={onMoveDocuments}
                />
            </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Create New Folder</h3>
                <input 
                    type="text" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder Name (e.g. Work, Taxes)"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-6 text-gray-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                />
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setIsCreateModalOpen(false)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreate}
                        disabled={!newFolderName.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        Create Folder
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
