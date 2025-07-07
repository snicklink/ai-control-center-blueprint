import { useState, useCallback } from 'react';
import type { AIServiceConfig, CombinedCosts, CostLevel } from '../types';

/**
 * Hook for tracking AI service costs across multiple providers
 * 
 * Provides:
 * - Real-time cost monitoring
 * - Cost formatting and level calculation
 * - Multi-service cost aggregation
 * 
 * @param config - AI service configuration
 * @returns Cost tracking functions and state
 */
export const useCostTracking = (config: AIServiceConfig) => {
  const [costs, setCosts] = useState<CombinedCosts | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch cost data from all configured services
   */
  const fetchCosts = useCallback(async () => {
    setLoading(true);
    try {
      const requests = [];
      
      // Fetch LLM costs (OpenRouter or Replicate)
      if (config.openrouter || config.replicate) {
        requests.push(
          fetch('/api/costs').then(res => res.ok ? res.json() : null)
        );
      }
      
      // Fetch TTS costs (Google Cloud)
      if (config.google) {
        requests.push(
          fetch('/api/google/costs').then(res => res.ok ? res.json() : null)
        );
      }
      
      // Fetch Image costs (Replicate)
      if (config.replicate) {
        requests.push(
          fetch('/api/replicate/costs').then(res => res.ok ? res.json() : null)
        );
      }

      const results = await Promise.all(requests);
      
      // Combine costs from all services
      const [llmData, ttsData, imageData] = results;
      
      const combinedCosts: CombinedCosts = {
        llm: llmData || { session_cost: 0, daily_cost: 0, total_requests: 0, service: 'llm' },
        tts: ttsData || { session_cost: 0, daily_cost: 0, total_requests: 0, service: 'tts' },
        image: imageData || { session_cost: 0, daily_cost: 0, total_requests: 0, service: 'image' },
        total_session: (llmData?.session_cost || 0) + (ttsData?.session_cost || 0) + (imageData?.session_cost || 0),
        total_daily: (llmData?.daily_cost || 0) + (ttsData?.daily_cost || 0) + (imageData?.daily_cost || 0),
        last_updated: new Date().toISOString()
      };

      setCosts(combinedCosts);
    } catch (error) {
      console.error('Failed to fetch costs:', error);
    } finally {
      setLoading(false);
    }
  }, [config]);

  /**
   * Format cost value for display
   * 
   * @param cost - Cost value in USD
   * @returns Formatted cost string
   */
  const formatCost = useCallback((cost: number): string => {
    if (cost < 0.000001) return '$0.00';
    if (cost < 0.01) return `$${(cost * 1000).toFixed(1)}m`;
    if (cost < 1) return `$${(cost * 100).toFixed(1)}¢`;
    return `$${cost.toFixed(4)}`;
  }, []);

  /**
   * Get cost level indicator for UI styling
   * 
   * @param cost - Cost value in USD
   * @returns Cost level (low, medium, high)
   */
  const getCostLevel = useCallback((cost: number): CostLevel => {
    if (cost > 5.0) return 'high';
    if (cost > 1.0) return 'medium';
    return 'low';
  }, []);

  /**
   * Calculate cost savings from using cache
   * 
   * @param cacheHitRate - Cache hit rate percentage
   * @param totalCost - Total cost without cache
   * @returns Estimated savings amount
   */
  const calculateCacheSavings = useCallback((cacheHitRate: number, totalCost: number): number => {
    return totalCost * (cacheHitRate / 100) * 0.9; // Assume 90% cost reduction for cache hits
  }, []);

  /**
   * Get cost breakdown by service
   */
  const getCostBreakdown = useCallback(() => {
    if (!costs) return [];
    
    return [
      {
        service: 'Language Models',
        cost: costs.llm?.session_cost || 0,
        percentage: ((costs.llm?.session_cost || 0) / costs.total_session) * 100 || 0,
        requests: costs.llm?.total_requests || 0
      },
      {
        service: 'Text-to-Speech',
        cost: costs.tts?.session_cost || 0,
        percentage: ((costs.tts?.session_cost || 0) / costs.total_session) * 100 || 0,
        requests: costs.tts?.total_requests || 0
      },
      {
        service: 'Image Generation',
        cost: costs.image?.session_cost || 0,
        percentage: ((costs.image?.session_cost || 0) / costs.total_session) * 100 || 0,
        requests: costs.image?.total_requests || 0
      }
    ].filter(item => item.cost > 0);
  }, [costs]);

  /**
   * Estimate cost for a given input
   * 
   * @param provider - Service provider
   * @param inputSize - Size of input (tokens, characters, etc.)
   * @param modelId - Model identifier
   * @returns Estimated cost
   */
  const estimateCost = useCallback(async (provider: string, inputSize: number, modelId?: string) => {
    try {
      const response = await fetch('/api/costs/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          input_size: inputSize,
          model_id: modelId
        })
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Cost estimation failed');
    } catch (error) {
      console.error('Cost estimation error:', error);
      return { estimated_cost: 0, error: error.message };
    }
  }, []);

  return {
    costs,
    loading,
    fetchCosts,
    formatCost,
    getCostLevel,
    calculateCacheSavings,
    getCostBreakdown,
    estimateCost
  };
};