import { useState, useCallback } from 'react';
import { DocumentRecord, DocType } from '../types';

// Mock Data moved here
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
    isDeleted: false
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
    fileData: 'mockdata', // simplified for mock
    mimeType: 'image/jpeg',
    createdAt: '2023-10-18T14:30:00Z',
    status: 'completed',
    isNew: false,
    isDeleted: false
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
    fileData: 'mockdata', // simplified for mock
    mimeType: 'application/pdf',
    createdAt: '2023-10-20T09:15:00Z',
    status: 'completed',
    isNew: true,
    isDeleted: false
  }
];

export const useDocuments = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>(MOCK_DOCS);

  const activeDocuments = documents.filter(d => !d.isDeleted);
  const deletedDocuments = documents.filter(d => d.isDeleted);

  const addDocument = useCallback((newDoc: DocumentRecord) => {
    // Mark as new for visual highlighting, ensure not deleted
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

  return {
    documents,
    activeDocuments,
    deletedDocuments,
    addDocument,
    updateDocument,
    softDeleteDocument,
    restoreDocument,
    permanentDeleteDocument,
    emptyTrash,
    markAsSeen
  };
};