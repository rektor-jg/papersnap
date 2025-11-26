
import { jsPDF } from "jspdf";
import { DocumentRecord, DocType } from "../types";

export const generateAndDownloadCSV = (docs: DocumentRecord[], filename: string) => {
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

  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(",") + "\n" 
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const generateAndDownloadPDF = (docRecord: DocumentRecord) => {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue-600
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

  addField("Name", docRecord.vendor);
  addField("Date", docRecord.date);
  addField("Type", docRecord.type);
  addField("Category", docRecord.category);
  
  if (docRecord.type !== DocType.TEXT) {
    addField("Amount", `${docRecord.currency} ${docRecord.amount.toFixed(2)}`);
    addField("Tax/VAT", `${docRecord.currency} ${docRecord.tax.toFixed(2)}`);
  }

  addField("Status", docRecord.status);
  
  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.text(docRecord.type === DocType.TEXT ? "Content:" : "Summary:", 20, yPos);
  yPos += 7;
  doc.setFont("helvetica", "normal");
  
  const splitSummary = doc.splitTextToSize(docRecord.summary, 170);
  doc.text(splitSummary, 20, yPos);
  
  doc.save(`${docRecord.vendor}_${docRecord.date}.pdf`);
};
