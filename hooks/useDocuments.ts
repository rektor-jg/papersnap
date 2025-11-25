
import { useState, useCallback, useEffect } from 'react';
import { DocumentRecord, DocType, Folder } from '../types';

const STORAGE_KEY_DOCS = 'papersnap_documents_v1';
const STORAGE_KEY_FOLDERS = 'papersnap_folders_v1';

export const useDocuments = () => {
  // Initialize from LocalStorage to ensure data persistence (Production Ready)
  const [documents, setDocuments] = useState<DocumentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOCS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load documents from storage", e);
      return [];
    }
  });

  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FOLDERS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load folders from storage", e);
      return [];
    }
  });

  const activeDocuments = documents.filter(d => !d.isDeleted);
  const deletedDocuments = documents.filter(d => d.isDeleted);

  // Persistence Effects
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
    } catch (e) {
      console.error("Failed to save documents", e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FOLDERS, JSON.stringify(folders));
    } catch (e) {
      console.error("Failed to save folders", e);
    }
  }, [folders]);

  // Document Actions
  const addDocument = useCallback((newDoc: DocumentRecord) => {
    const docWithFlag = { ...newDoc, isNew: true, isDeleted: false };
    setDocuments(prev => [docWithFlag, ...prev]);
  }, []);

  const updateDocument = useCallback((updatedDoc: DocumentRecord) => {
    setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
  }, []);

  const softDeleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, isDeleted: true } : doc));
  }, []);

  const restoreDocument = useCallback((id: string) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, isDeleted: false } : doc));
  }, []);

  const permanentDeleteDocument = useCallback((id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  }, []);

  const emptyTrash = useCallback(() => {
    setDocuments(prev => prev.filter(doc => !doc.isDeleted));
  }, []);

  const markAsSeen = useCallback((id: string) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, isNew: false } : doc));
  }, []);

  // Folder Actions
  const createFolder = useCallback((name: string) => {
    const newFolder: Folder = { id: crypto.randomUUID(), name };
    setFolders(prev => [...prev, newFolder]);
  }, []);

  const deleteFolder = useCallback((folderId: string) => {
    // Move docs in this folder to "Unfiled" (undefined folderId)
    setDocuments(prev => prev.map(doc => doc.folderId === folderId ? { ...doc, folderId: undefined } : doc));
    setFolders(prev => prev.filter(f => f.id !== folderId));
  }, []);

  const moveDocumentToFolder = useCallback((docId: string, folderId: string | undefined) => {
    setDocuments(prev => prev.map(doc => doc.id === docId ? { ...doc, folderId } : doc));
  }, []);

  const moveDocumentsToFolder = useCallback((docIds: string[], folderId: string | undefined) => {
    setDocuments(prev => prev.map(doc => docIds.includes(doc.id) ? { ...doc, folderId } : doc));
  }, []);

  return {
    documents,
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
  };
};
