import { freeAIService } from './freeAIService';
import OpenAI from 'openai';

export interface AIAnalysisResult {
  insights: string[];
  recommendations: string[];
  predictions: any;
  confidence: number;
}

export class AIService {
  private static instance: AIService;
  private openai: OpenAI | null = null;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private getSelectedProvider(): 'openai' | 'free' {
    const stored = localStorage.getItem('ai_provider');
    if (stored === 'openai' && import.meta.env.VITE_OPENAI_API_KEY) return 'openai';
    return 'free';
  }

  private ensureClients() {
    if (import.meta.env.VITE_OPENAI_API_KEY && !this.openai) {
      this.openai = new OpenAI({ apiKey: import.meta.env.VITE_OPENAI_API_KEY, dangerouslyAllowBrowser: true });
    }
  }

  async analyzeFinancialData(data: any): Promise<AIAnalysisResult> {
    return await freeAIService.analyzeFinancialData(data);
  }

  async chatWithAI(message: string, context: any): Promise<string> {
    try {
      const provider = this.getSelectedProvider();
      this.ensureClients();
      if (provider === 'openai' && this.openai) {
        const resp = await this.openai.chat.completions.create({
          model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an AI assistant embedded in a business ERP. Be concise.' },
            { role: 'user', content: `${message}\n\nContext:${JSON.stringify(context).slice(0, 2000)}` }
          ],
          temperature: 0.2
        });
        return resp.choices?.[0]?.message?.content || '';
      }
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
