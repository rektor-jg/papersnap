import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { DocType, Category, ExtractedData, DEFAULT_CATEGORIES, DocumentRecord } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const extractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: {
      type: Type.STRING,
      enum: [DocType.RECEIPT, DocType.INVOICE, DocType.CONTRACT, DocType.TEXT, DocType.OTHER],
      description: "The type of the document."
    },
    vendor: {
      type: Type.STRING,
      description: "The name of the vendor, issuer, or the title/first line of the text."
    },
    date: {
      type: Type.STRING,
      description: "The date of the document in YYYY-MM-DD format. If not found, use today's date."
    },
    amount: {
      type: Type.NUMBER,
      description: "The total gross amount. Set to 0 if not applicable or text only."
    },
    currency: {
      type: Type.STRING,
      description: "The 3-letter currency code (e.g., USD, EUR, PLN)."
    },
    tax: {
      type: Type.NUMBER,
      description: "The total tax or VAT amount. 0 if not applicable."
    },
    invoiceNumber: {
      type: Type.STRING,
      description: "The invoice or document reference number."
    },
    category: {
      type: Type.STRING,
      enum: DEFAULT_CATEGORIES,
      description: "The cost category."
    },
    summary: {
      type: Type.STRING,
      description: "A summary of the content, or the FULL extracted text if type is TEXT."
    }
  },
  required: ["type", "vendor", "date", "amount", "currency", "category", "summary"]
};

export type ScanMode = 'finance' | 'document' | 'text';

export const analyzeDocument = async (base64Data: string, mimeType: string, scanMode: ScanMode = 'finance'): Promise<ExtractedData> => {
  try {
    let promptText = "Analyze this document. Extract the key financial details. If some fields are missing (like tax), make a best guess or set to 0. Format the date strictly as YYYY-MM-DD.";
    
    if (scanMode === 'text') {
      promptText = "Perform OCR on this document. Extract all visible text. Set 'type' to 'TEXT'. Set 'vendor' to the Main Title or First Line of the text. Set 'summary' to the full extracted text content. Set 'amount' and 'tax' to 0. Set 'category' to 'Uncategorized' if not clear.";
    } else if (scanMode === 'document') {
      promptText = "Analyze this general document (contract, letter, etc). Extract the 'vendor' as the sender or main party. Set 'amount' to 0 if not financial. Summarize the content in 'summary'.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: promptText
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: extractionSchema,
        temperature: 0.1 // Low temperature for factual extraction
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as ExtractedData;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    // Return a fallback so the app doesn't crash, but marks it for review
    return {
      type: DocType.OTHER,
      vendor: "Unknown",
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      currency: "USD",
      tax: 0,
      category: "Uncategorized",
      summary: "Failed to extract data."
    };
  }
};

export const createChatSession = (documents: DocumentRecord[]): Chat => {
  // Minimize token usage by stripping base64 data
  const contextDocs = documents.map(d => ({
    id: d.id,
    type: d.type,
    vendor: d.vendor,
    date: d.date,
    amount: d.amount,
    currency: d.currency,
    category: d.category,
    summary: d.summary
  }));

  const systemInstruction = `
    You are PaperSnap AI, a helpful document assistant.
    You have access to the user's uploaded documents in JSON format.
    
    Current Date: ${new Date().toLocaleDateString()}
    
    User Documents:
    ${JSON.stringify(contextDocs)}

    Rules:
    1. Answer based ONLY on the provided documents.
    2. If the user asks for a total, calculate it precisely.
    3. Be concise and friendly.
    4. Format money values with their currency code (e.g., USD 150.00).
    5. If asked about specific dates (e.g., "last month"), filter the data accordingly.
  `;

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: systemInstruction,
    }
  });
};
