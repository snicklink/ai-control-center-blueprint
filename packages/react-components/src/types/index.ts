export interface CostData {
  session_cost: number;
  daily_cost: number;
  total_requests: number;
  cache_hits?: number;
  cache_hit_rate?: number;
  service: string;
}

export interface CombinedCosts {
  llm?: CostData;
  tts?: CostData;
  image?: CostData;
  total_session: number;
  total_daily: number;
  last_updated: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  pricing?: {
    input?: number;
    output?: number;
    cost_per_char?: number;
    cost_per_image?: number;
    currency?: string;
    per?: string;
  };
  performance: {
    speed: string;
    quality: string;
    context_length?: number;
  };
  capabilities?: string[];
  recommended_for?: string[];
  current_default?: boolean;
}

export interface ModelConfig {
  llm?: ModelOption[];
  image?: ModelOption[];
  tts?: ModelOption[];
  video?: ModelOption[];
  music?: ModelOption[];
}

export interface AIServiceConfig {
  openrouter?: {
    apiKey: string;
    baseUrl?: string;
    defaultModel?: string;
  };
  replicate?: {
    apiToken: string;
    defaultModels?: {
      llm?: string;
      image?: string;
    };
  };
  google?: {
    credentials?: string;
    projectId?: string;
    defaultVoice?: string;
  };
}

export interface AIControlCenterProps {
  config: AIServiceConfig;
  theme?: 'dark' | 'light';
  updateInterval?: number;
  onModelChange?: (provider: string, modelId: string) => void;
  onCostAlert?: (cost: number, threshold: number) => void;
  className?: string;
  costThresholds?: {
    session?: number;
    daily?: number;
    monthly?: number;
  };
}

export interface CurrentModels {
  llm?: string;
  image?: string;
  tts?: string;
  video?: string;
  music?: string;
}

export type CostLevel = 'low' | 'medium' | 'high';

export interface ModelSwitchResponse {
  status: 'success' | 'error';
  old_model?: string;
  new_model?: string;
  timestamp?: string;
  error?: string;
}

export interface CostEstimate {
  input_tokens?: number;
  output_tokens?: number;
  estimated_cost: number;
  model: string;
  currency: string;
  service: string;
}