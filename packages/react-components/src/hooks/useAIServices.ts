import { useState, useCallback } from 'react';
import type { AIServiceConfig, ModelConfig, CurrentModels, ModelSwitchResponse } from '../types';

/**
 * Hook for managing AI services and model switching
 * 
 * Provides:
 * - Model data fetching from configuration
 * - Real-time model switching across providers
 * - Current model state management
 * 
 * @param config - AI service configuration
 * @returns AI services management functions and state
 */
export const useAIServices = (config: AIServiceConfig) => {
  const [models, setModels] = useState<ModelConfig>({});
  const [currentModels, setCurrentModels] = useState<CurrentModels>({});
  const [loading, setLoading] = useState(false);

  /**
   * Fetch available models from backend or configuration
   */
  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      // Try to fetch from backend first
      const response = await fetch('/api/models');
      
      if (response.ok) {
        const data = await response.json();
        setModels({
          llm: data.openrouter_models || data.replicate_llm_models || [],
          image: data.replicate_image_models || [],
          tts: data.google_tts_voices || [],
          video: data.replicate_video_models || [],
          music: data.replicate_music_models || []
        });
        
        // Set current defaults
        const currentLLM = data.openrouter_models?.find((m: any) => m.current_default)?.id ||
                          data.replicate_llm_models?.find((m: any) => m.current_default)?.id;
        const currentImage = data.replicate_image_models?.find((m: any) => m.current_default)?.id;
        const currentTTS = data.google_tts_voices?.find((m: any) => m.current_default_agent)?.id;
        
        setCurrentModels({
          llm: currentLLM,
          image: currentImage,
          tts: currentTTS
        });
      } else {
        // Fallback to default configuration
        setModels({
          llm: [
            {
              id: 'anthropic/claude-3-haiku',
              name: 'Claude 3 Haiku',
              description: 'Fast, reliable, excellent multilingual support',
              pricing: { input: 0.25, output: 1.25, currency: 'USD', per: '1M tokens' },
              performance: { speed: 'very-fast', quality: 'high' },
              current_default: true
            }
          ],
          image: [
            {
              id: 'black-forest-labs/flux-schnell',
              name: 'Flux Schnell',
              description: 'Fastest image generation',
              pricing: { cost_per_image: 0.003, currency: 'USD' },
              performance: { speed: 'very-fast', quality: 'good' },
              current_default: true
            }
          ]
        });
        
        setCurrentModels({
          llm: 'anthropic/claude-3-haiku',
          image: 'black-forest-labs/flux-schnell'
        });
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Switch active model for a specific provider
   * 
   * @param provider - The AI service provider (llm, image, tts, etc.)
   * @param modelId - The model ID to switch to
   */
  const switchModel = useCallback(async (provider: string, modelId: string): Promise<ModelSwitchResponse> => {
    try {
      // Determine the correct API endpoint based on provider
      let endpoint = '/api/switch_model';
      if (provider === 'llm' && config.openrouter) {
        endpoint = '/api/switch_model'; // OpenRouter LLM switching
      } else if (provider === 'image' && config.replicate) {
        endpoint = '/api/replicate/switch_model'; // Replicate image switching
      } else if (provider === 'tts' && config.google) {
        endpoint = '/api/google/switch_voice'; // Google TTS switching
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          model_id: modelId,
          provider: provider
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local state
        setCurrentModels(prev => ({
          ...prev,
          [provider]: modelId
        }));
        
        return {
          status: 'success',
          old_model: result.old_model,
          new_model: result.new_model,
          timestamp: result.timestamp
        };
      } else {
        throw new Error(`Model switch failed: ${response.status}`);
      }
    } catch (error) {
      console.error(`Failed to switch ${provider} model:`, error);
      return {
        status: 'error',
        error: error.message
      };
    }
  }, [config]);

  /**
   * Get models by provider type
   */
  const getModelsByProvider = useCallback((provider: string) => {
    return models[provider as keyof ModelConfig] || [];
  }, [models]);

  /**
   * Get current model for a provider
   */
  const getCurrentModel = useCallback((provider: string) => {
    return currentModels[provider as keyof CurrentModels];
  }, [currentModels]);

  return {
    models,
    currentModels,
    loading,
    fetchModels,
    switchModel,
    getModelsByProvider,
    getCurrentModel
  };
};