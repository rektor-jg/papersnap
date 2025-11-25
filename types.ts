
export enum DocType {
  RECEIPT = 'RECEIPT',
  INVOICE = 'INVOICE',
  CONTRACT = 'CONTRACT',
  TEXT = 'TEXT',
  OTHER = 'OTHER'
}

// Default categories, but users can add more (so we treat Category as string)
export const DEFAULT_CATEGORIES = [
  'Fuel',
  'Equipment',
  'Services',
  'Marketing',
  'Travel',
  'Office',
  'Uncategorized'
];

export type Category = string;

export interface ExtractedData {
  type: DocType;
  vendor: string; // Used as "Name" or "Title" for generic docs/text
  date: string; // YYYY-MM-DD
  amount: number;
  currency: string;
  tax: number;
  invoiceNumber?: string;
  category: Category;
  summary: string; // Used as full text content for TEXT type
}

export interface DocumentRecord extends ExtractedData {
  id: string;
  fileData: string; // Base64
  mimeType: string;
  createdAt: string;
  status: 'processing' | 'completed' | 'error';
  isNew?: boolean; // Visual indicator for newly added items
}

export type ViewState = 'dashboard' | 'documents' | 'upload';
