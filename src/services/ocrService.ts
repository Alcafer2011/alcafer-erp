import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  extractedData?: {
    importo?: number;
    data?: string;
    numeroDocumento?: string;
    fornitore?: string;
    materiali?: Array<{
      descrizione: string;
      quantita?: number;
      prezzo?: number;
    }>;
  };
}

export class OCRService {
  private static instance: OCRService;

  private constructor() {}

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  async extractTextFromImage(file: File): Promise<OCRResult> {
    try {
      const result = await Tesseract.recognize(file, 'ita+eng', {
        logger: m => console.log(m)
      });

      const extractedData = this.parseDocumentText(result.data.text);

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        extractedData
      };
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error('Errore nell\'estrazione del testo dall\'immagine');
    }
  }

  async extractTextFromPDF(file: File): Promise<OCRResult> {
    // Implementazione per PDF
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Qui useresti una libreria come pdf-parse
      // Per ora ritorniamo un placeholder
      return {
        text: 'Testo estratto dal PDF',
        confidence: 85,
        extractedData: {}
      };
    } catch (error) {
      console.error('PDF OCR Error:', error);
      throw new Error('Errore nell\'estrazione del testo dal PDF');
    }
  }

  private parseDocumentText(text: string): OCRResult['extractedData'] {
    const extractedData: OCRResult['extractedData'] = {};

    // Estrazione importo (cerca pattern come €123.45, 123,45€, etc.)
    const importoRegex = /(?:€\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*€?/g;
    const importoMatch = text.match(importoRegex);
    if (importoMatch) {
      const importoStr = importoMatch[0].replace(/[€\s]/g, '').replace(',', '.');
      extractedData.importo = parseFloat(importoStr);
    }

    // Estrazione data (cerca pattern DD/MM/YYYY, DD-MM-YYYY, etc.)
    const dataRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g;
    const dataMatch = text.match(dataRegex);
    if (dataMatch) {
      extractedData.data = dataMatch[0];
    }

    // Estrazione numero documento (cerca pattern come DDT, Fattura, etc.)
    const numeroRegex = /(?:DDT|Fattura|Doc\.?)\s*(?:n\.?|numero)?\s*(\w+)/i;
    const numeroMatch = text.match(numeroRegex);
    if (numeroMatch) {
      extractedData.numeroDocumento = numeroMatch[1];
    }

    // Estrazione fornitore (cerca nelle prime righe)
    const righe = text.split('\n').filter(riga => riga.trim().length > 0);
    if (righe.length > 0) {
      extractedData.fornitore = righe[0].trim();
    }

    // Estrazione materiali (cerca pattern di descrizioni con quantità e prezzi)
    const materialiRegex = /([A-Za-z\s]+)\s+(\d+(?:[.,]\d+)?)\s+(?:kg|pz|mt|lt)?\s+(\d+(?:[.,]\d+)?)/g;
    const materialiMatches = [...text.matchAll(materialiRegex)];
    if (materialiMatches.length > 0) {
      extractedData.materiali = materialiMatches.map(match => ({
        descrizione: match[1].trim(),
        quantita: parseFloat(match[2].replace(',', '.')),
        prezzo: parseFloat(match[3].replace(',', '.'))
      }));
    }

    return extractedData;
  }

  async processInvoiceDocument(file: File): Promise<OCRResult> {
    const fileType = file.type;
    
    if (fileType.includes('image')) {
      return this.extractTextFromImage(file);
    } else if (fileType.includes('pdf')) {
      return this.extractTextFromPDF(file);
    } else {
      throw new Error('Tipo di file non supportato per OCR');
    }
  }
}

export const ocrService = OCRService.getInstance();