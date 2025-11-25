
import { useState, useCallback } from 'react';
import { DocumentRecord, DocType, Folder } from '../types';

// Mock Data
const MOCK_FOLDERS: Folder[] = [
  { id: 'f1', name: 'Work Projects' },
  { id: 'f2', name: 'Personal Expenses' },
  { id: 'f3', name: 'Tax 2023' }
];

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
    isNew: false,
    isDeleted: false,
    folderId: 'f1'
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
    fileData: 'mockdata', 
    mimeType: 'image/jpeg',
    createdAt: '2023-10-18T14:30:00Z',
    status: 'completed',
    isNew: false,
    isDeleted: false,
    folderId: 'f2'
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
    fileData: 'mockdata', 
    mimeType: 'application/pdf',
    createdAt: '2023-10-20T09:15:00Z',
    status: 'completed',
    isNew: true,
    isDeleted: false,
    folderId: 'f1'
  }
];

export const useDocuments = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>(MOCK_DOCS);
  const [folders, setFolders] = useState<Folder[]>(MOCK_FOLDERS);

  const activeDocuments = documents.filter(d => !d.isDeleted);
  const deletedDocuments = documents.filter(d => d.isDeleted);

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
