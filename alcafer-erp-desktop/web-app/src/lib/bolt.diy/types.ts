export interface BoltDiyConfig {
  modelProvider: 'openai' | 'anthropic' | 'huggingface' | 'local';
  embeddings: 'openai' | 'huggingface' | 'local';
  useCache: boolean;
  useHistory: boolean;
  maxTokens: number;
  temperature: number;
  apiKeys: {
    openai: string;
    huggingface: string;
    anthropic: string;
  };
}

export interface CodeAnalysisResult {
  text: string;
  code?: string;
  language?: string;
  confidence: number;
  source: string;
}

export interface ChatResponse {
  text: string;
  confidence: number;
  source: string;
}

export interface CodeFixResult {
  text: string;
  fixedCode: string;
  confidence: number;
  source: string;
}

export interface SQLGenerationResult {
  text: string;
  sql: string;
  confidence: number;
  source: string;
}
