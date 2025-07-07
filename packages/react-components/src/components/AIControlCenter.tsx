import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Zap, 
  Settings,
  TrendingUp,
  RefreshCw,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { useAIServices } from '../hooks/useAIServices';
import { useCostTracking } from '../hooks/useCostTracking';
import type { AIControlCenterProps, CostData, ModelOption } from '../types';
import '../styles/AIControlCenter.css';

/**
 * Professional AI Control Center Component
 * 
 * Features:
 * - Real-time cost tracking across multiple AI services
 * - Dynamic model switching with live updates
 * - Professional gradient design with smooth animations
 * - Support for OpenRouter, Replicate, Google Cloud
 * 
 * @example
 * <AIControlCenter 
 *   config={{
 *     openrouter: { apiKey: process.env.OPENROUTER_API_KEY },
 *     replicate: { apiKey: process.env.REPLICATE_API_TOKEN }
 *   }}
 *   theme="dark"
 *   updateInterval={10000}
 * />
 */
export const AIControlCenter: React.FC<AIControlCenterProps> = ({
  config,
  theme = 'dark',
  updateInterval = 10000,
  onModelChange,
  onCostAlert,
  className = ''
}) => {
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState<string | null>(null);

  const { 
    models, 
    currentModels, 
    switchModel, 
    fetchModels 
  } = useAIServices(config);

  const { 
    costs, 
    fetchCosts, 
    formatCost, 
    getCostLevel 
  } = useCostTracking(config);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([fetchCosts(), fetchModels()]);
      setLoading(false);
    };
    
    initializeData();
    
    // Auto-refresh costs
    const interval = setInterval(fetchCosts, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

  const handleModelSwitch = async (provider: string, modelId: string) => {
    setSwitching(provider);
    
    try {
      await switchModel(provider, modelId);
      onModelChange?.(provider, modelId);
      
      // Refresh costs to show new model
      await fetchCosts();
    } catch (error) {
      console.error('Model switch error:', error);
      alert(`Failed to switch model: ${error.message}`);
    } finally {
      setSwitching(null);
    }
  };

  if (loading) {
    return (
      <div className={`ai-control-center loading ${theme} ${className}`}>
        <div className="loading-spinner">
          <RefreshCw className="animate-spin" />
          <span>Loading AI Controls...</span>
        </div>
      </div>
    );
  }

  const sessionCostLevel = getCostLevel(costs?.total_session || 0);
  const dailyCostLevel = getCostLevel(costs?.total_daily || 0);

  return (
    <div className={`ai-control-center ${theme} ${className}`}>
      {/* Header */}
      <div className="ai-header">
        <div className="ai-title">
          <Settings className="ai-icon" />
          <h2>AI Control Center</h2>
        </div>
        <div className="ai-status">
          <div className="status-dot online"></div>
          <span>Online</span>
        </div>
      </div>

      {/* Cost Overview */}
      <div className="cost-section">
        <h3>
          <DollarSign size={16} />
          Cost Overview
        </h3>
        
        <div className="cost-cards">
          <div className={`cost-card session ${sessionCostLevel}`}>
            <div className="cost-label">Session</div>
            <div className="cost-value">{formatCost(costs?.total_session || 0)}</div>
            <div className="cost-detail">
              {costs?.llm?.total_requests || 0} requests
            </div>
          </div>
          
          <div className={`cost-card daily ${dailyCostLevel}`}>
            <div className="cost-label">Today</div>
            <div className="cost-value">{formatCost(costs?.total_daily || 0)}</div>
            <div className="cost-detail">
              All services
            </div>
          </div>
        </div>

        {/* Cost Alert */}
        {dailyCostLevel === 'high' && (
          <div className="cost-alert">
            <AlertTriangle size={16} />
            <span>High daily usage detected</span>
          </div>
        )}
      </div>

      {/* Model Management */}
      <div className="model-section">
        <h3>
          <Zap size={16} />
          Model Management
        </h3>
        
        {/* LLM Models */}
        <div className="model-control">
          <label>Language Model</label>
          <div className={`model-selector ${switching === 'llm' ? 'switching' : ''}`}>
            <select 
              value={currentModels.llm || ''}
              onChange={(e) => handleModelSwitch('llm', e.target.value)}
              disabled={switching === 'llm'}
            >
              {models.llm?.map((model: ModelOption) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="select-icon" />
            {switching === 'llm' && (
              <RefreshCw className="switching-icon animate-spin" />
            )}
          </div>
          
          {models.llm?.find((m: ModelOption) => m.id === currentModels.llm) && (
            <div className="model-info">
              <div className="model-details">
                <span className={`quality-badge ${models.llm.find((m: ModelOption) => m.id === currentModels.llm)?.performance?.quality}`}>
                  {models.llm.find((m: ModelOption) => m.id === currentModels.llm)?.performance?.quality}
                </span>
                <span className="cost-info">
                  ${models.llm.find((m: ModelOption) => m.id === currentModels.llm)?.pricing?.input}/1M input
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Image Models */}
        <div className="model-control">
          <label>Image Model</label>
          <div className={`model-selector ${switching === 'image' ? 'switching' : ''}`}>
            <select 
              value={currentModels.image || ''}
              onChange={(e) => handleModelSwitch('image', e.target.value)}
              disabled={switching === 'image'}
            >
              {models.image?.map((model: ModelOption) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="select-icon" />
            {switching === 'image' && (
              <RefreshCw className="switching-icon animate-spin" />
            )}
          </div>
        </div>

        {/* TTS Models */}
        <div className="model-control">
          <label>Voice Model</label>
          <div className={`model-selector ${switching === 'tts' ? 'switching' : ''}`}>
            <select 
              value={currentModels.tts || ''}
              onChange={(e) => handleModelSwitch('tts', e.target.value)}
              disabled={switching === 'tts'}
            >
              {models.tts?.map((model: ModelOption) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <ChevronDown className="select-icon" />
            {switching === 'tts' && (
              <RefreshCw className="switching-icon animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="stats-section">
        <h3>
          <TrendingUp size={16} />
          Performance
        </h3>
        
        <div className="stat-grid">
          <div className="stat-item">
            <span className="stat-label">Requests</span>
            <span className="stat-value">{costs?.llm?.total_requests || 0}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cache Rate</span>
            <span className="stat-value">{costs?.llm?.cache_hit_rate || 0}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Avg Cost</span>
            <span className="stat-value">{formatCost((costs?.total_session || 0) / Math.max(1, costs?.llm?.total_requests || 1))}</span>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <button 
        className="refresh-button"
        onClick={() => Promise.all([fetchCosts(), fetchModels()])}
      >
        <RefreshCw size={16} />
        Refresh Data
      </button>
    </div>
  );
};

export default AIControlCenter;