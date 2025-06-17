import { freeAIService } from './freeAIService';

export interface AIAnalysisResult {
  insights: string[];
  recommendations: string[];
  predictions: any;
  confidence: number;
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async analyzeFinancialData(data: any): Promise<AIAnalysisResult> {
    return await freeAIService.analyzeFinancialData(data);
  }

  async chatWithAI(message: string, context: any): Promise<string> {
    try {
      return await freeAIService.chatWithGemini(message, context);
    } catch (error) {
      // Usa il metodo pubblico
      const analysis = await freeAIService.analyzeFinancialData({
        query: message,
        context: context
      });
      return analysis.insights.join('\n\n');
    }
  }

  async analyzeDocument(file: File): Promise<any> {
    const text = await this.extractTextFromFile(file);
    return await freeAIService.analyzeDocument(text);
  }

  private async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.readAsText(file);
    });
  }
}

export const aiService = AIService.getInstance();