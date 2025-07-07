import React from 'react';
import { AIControlCenter } from '@ai-blueprint/react-components';
import type { AIServiceConfig } from '@ai-blueprint/react-components';
import './App.css';

/**
 * AI Control Center Example App
 * 
 * This demonstrates how to integrate the AI Control Center
 * into your React application with minimal setup.
 */
function App() {
  // Configure your AI services
  const aiConfig: AIServiceConfig = {
    openrouter: {
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
      baseUrl: 'http://localhost:5004',
      defaultModel: 'anthropic/claude-3-haiku'
    },
    replicate: {
      apiToken: import.meta.env.VITE_REPLICATE_API_TOKEN || '',
      defaultModels: {
        image: 'black-forest-labs/flux-schnell'
      }
    },
    google: {
      credentials: import.meta.env.VITE_GOOGLE_CREDENTIALS_PATH || '',
      projectId: import.meta.env.VITE_GOOGLE_PROJECT_ID || ''
    }
  };

  // Handle model switching events
  const handleModelChange = (provider: string, modelId: string) => {
    console.log(`🔄 Model switched: ${provider} → ${modelId}`);
    // Add your custom logic here
  };

  // Handle cost alerts
  const handleCostAlert = (cost: number, threshold: number) => {
    console.log(`💰 Cost alert: $${cost} exceeded threshold $${threshold}`);
    // Add your custom alert logic here
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎮 AI Control Center Demo</h1>
        <p>Professional AI cost tracking and model management</p>
      </header>

      <main className="app-main">
        <div className="layout">
          {/* Left Sidebar - AI Control Center */}
          <aside className="sidebar">
            <AIControlCenter
              config={aiConfig}
              theme="dark"
              updateInterval={10000}
              onModelChange={handleModelChange}
              onCostAlert={handleCostAlert}
              costThresholds={{
                session: 1.0,
                daily: 10.0,
                monthly: 100.0
              }}
            />
          </aside>

          {/* Main Content Area */}
          <div className="content">
            <div className="demo-section">
              <h2>🚀 AI Control Center Features</h2>
              
              <div className="feature-grid">
                <div className="feature-card">
                  <h3>💰 Cost Tracking</h3>
                  <p>Real-time monitoring across OpenRouter, Replicate, and Google Cloud</p>
                  <ul>
                    <li>Session and daily totals</li>
                    <li>Color-coded cost indicators</li>
                    <li>Budget alerts and warnings</li>
                  </ul>
                </div>

                <div className="feature-card">
                  <h3>🔄 Model Switching</h3>
                  <p>Dynamic model selection with live updates</p>
                  <ul>
                    <li>LLM models (OpenRouter)</li>
                    <li>Image models (Replicate)</li>
                    <li>Voice models (Google Cloud)</li>
                  </ul>
                </div>

                <div className="feature-card">
                  <h3>📊 Performance Metrics</h3>
                  <p>Track usage patterns and optimize costs</p>
                  <ul>
                    <li>Request counts</li>
                    <li>Cache hit rates</li>
                    <li>Average costs</li>
                  </ul>
                </div>

                <div className="feature-card">
                  <h3>🎨 Professional UI</h3>
                  <p>Beautiful design that works everywhere</p>
                  <ul>
                    <li>Gradient design system</li>
                    <li>Smooth animations</li>
                    <li>Responsive layout</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="demo-section">
              <h2>🔧 Quick Setup</h2>
              <div className="setup-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <div>
                    <h4>Install Package</h4>
                    <code>npm install @ai-blueprint/react-components</code>
                  </div>
                </div>
                
                <div className="step">
                  <span className="step-number">2</span>
                  <div>
                    <h4>Import Component</h4>
                    <code>import {`{ AIControlCenter }`} from '@ai-blueprint/react-components'</code>
                  </div>
                </div>
                
                <div className="step">
                  <span className="step-number">3</span>
                  <div>
                    <h4>Add to Your App</h4>
                    <code>{`<AIControlCenter config={aiConfig} />`}</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="demo-section">
              <h2>🌟 Live Demo</h2>
              <p>
                The AI Control Center on the left is fully functional! 
                Try switching models and watch the cost tracking in real-time.
              </p>
              <div className="demo-actions">
                <button onClick={() => console.log('Demo button clicked!')}>
                  Test LLM Generation
                </button>
                <button onClick={() => console.log('Demo button clicked!')}>
                  Generate Image
                </button>
                <button onClick={() => console.log('Demo button clicked!')}>
                  Synthesize Speech
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with ❤️ using the AI Control Center Blueprint</p>
        <p>
          <a href="https://github.com/willykramer/ai-control-center-blueprint" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;