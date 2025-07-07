import React from 'react';
import Head from 'next/head';
import { AIControlCenter } from '@ai-blueprint/react-components';
import type { AIServiceConfig } from '@ai-blueprint/react-components';
import styles from '../styles/Home.module.css';

/**
 * AI Control Center Next.js Example
 * 
 * This demonstrates how to integrate the AI Control Center
 * into a Next.js application with server-side rendering support.
 */
export default function Home() {
  // Configure your AI services
  const aiConfig: AIServiceConfig = {
    openrouter: {
      apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
      baseUrl: 'http://localhost:5004',
      defaultModel: 'anthropic/claude-3-haiku'
    },
    replicate: {
      apiToken: process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN || '',
      defaultModels: {
        image: 'black-forest-labs/flux-schnell'
      }
    },
    google: {
      credentials: process.env.NEXT_PUBLIC_GOOGLE_CREDENTIALS_PATH || '',
      projectId: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID || ''
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
    <div className={styles.container}>
      <Head>
        <title>AI Control Center - Next.js Example</title>
        <meta name="description" content="AI Control Center integrated with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.layout}>
          {/* Left Sidebar - AI Control Center */}
          <aside className={styles.sidebar}>
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
          <div className={styles.content}>
            <div className={styles.header}>
              <h1>🎮 AI Control Center</h1>
              <p>Next.js Integration Example</p>
            </div>

            <div className={styles.grid}>
              <div className={styles.card}>
                <h2>💰 Cost Tracking</h2>
                <p>Real-time monitoring across all AI services</p>
                <ul>
                  <li>Session and daily totals</li>
                  <li>Color-coded indicators</li>
                  <li>Budget alerts</li>
                </ul>
              </div>

              <div className={styles.card}>
                <h2>🔄 Model Switching</h2>
                <p>Dynamic model selection with live updates</p>
                <ul>
                  <li>LLM models (OpenRouter)</li>
                  <li>Image models (Replicate)</li>
                  <li>Voice models (Google Cloud)</li>
                </ul>
              </div>

              <div className={styles.card}>
                <h2>📊 Performance</h2>
                <p>Track usage patterns and optimize costs</p>
                <ul>
                  <li>Request counts</li>
                  <li>Cache hit rates</li>
                  <li>Average costs</li>
                </ul>
              </div>

              <div className={styles.card}>
                <h2>🎨 Professional UI</h2>
                <p>Beautiful design that works everywhere</p>
                <ul>
                  <li>Gradient design system</li>
                  <li>Smooth animations</li>
                  <li>Responsive layout</li>
                </ul>
              </div>
            </div>

            <div className={styles.demo}>
              <h2>🚀 Try It Out</h2>
              <p>The AI Control Center on the left is fully functional!</p>
              <div className={styles.buttons}>
                <button className={styles.button}>
                  Test LLM Generation
                </button>
                <button className={styles.button}>
                  Generate Image
                </button>
                <button className={styles.button}>
                  Synthesize Speech
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Built with ❤️ using the AI Control Center Blueprint</p>
        <a
          href="https://github.com/willykramer/ai-control-center-blueprint"
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
}