import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export type FileType = 'pdf' | 'docx' | 'txt' | 'md';

export interface ExtractedDocument {
  text: string;
  type: FileType;
  metadata: {
    pages?: number;
    title?: string;
    author?: string;
  };
}

/**
 * Extract text from PDF files
 */
export async function extractFromPDF(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const pdfParser = new PDFParse({ data: buffer });
    const textResult = await pdfParser.getText();
    
    return {
      text: typeof textResult === 'string' ? textResult : JSON.stringify(textResult),
      type: 'pdf',
      metadata: {}, // pdf-parse doesn't expose metadata in the same way
    };
  } catch (error) {
    console.error('[extract] PDF extraction failed:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extract text from DOCX files
 */
export async function extractFromDOCX(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value,
      type: 'docx',
      metadata: {},
    };
  } catch (error) {
    console.error('[extract] DOCX extraction failed:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

/**
 * Extract text from TXT/MD files
 */
export async function extractFromText(buffer: Buffer): Promise<ExtractedDocument> {
  try {
    const text = buffer.toString('utf-8');
    return {
      text,
      type: 'txt',
      metadata: {},
    };
  } catch (error) {
    console.error('[extract] Text extraction failed:', error);
    throw new Error('Failed to extract text from file');
  }
}

/**
 * Determine file type from filename and mimetype
 */
export function getFileType(filename: string, mimetype: string): FileType | null {
  const ext = filename.toLowerCase().split('.').pop();
  
  if (mimetype === 'application/pdf' || ext === 'pdf') return 'pdf';
  if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === 'docx') return 'docx';
  if (mimetype === 'text/plain' || ext === 'txt') return 'txt';
  if (mimetype === 'text/markdown' || ext === 'md' || ext === 'markdown') return 'md';
  
  return null;
}

/**
 * Extract text from any supported file
 */
export async function extractText(buffer: Buffer, filename: string, mimetype: string): Promise<ExtractedDocument> {
  const type = getFileType(filename, mimetype);
  
  if (!type) {
    throw new Error(`Unsupported file type: ${mimetype} (${filename})`);
  }
  
  switch (type) {
    case 'pdf':
      return extractFromPDF(buffer);
    case 'docx':
      return extractFromDOCX(buffer);
    case 'txt':
    case 'md':
      return extractFromText(buffer);
    default:
      throw new Error(`Unsupported file type: ${type}`);
  }
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(filename: string, mimetype: string): boolean {
  return getFileType(filename, mimetype) !== null;
}

/**
 * Get supported file extensions
 */
export function getSupportedExtensions(): string[] {
  return ['.pdf', '.docx', '.txt', '.md'];
}

/**
 * Get supported MIME types
 */
export function getSupportedMimeTypes(): string[] {
  return [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
  ];
}
