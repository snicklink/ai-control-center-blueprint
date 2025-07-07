#!/usr/bin/env node

/**
 * AI Control Center Blueprint CLI Setup Tool
 * 
 * This tool helps users quickly set up new projects with the AI Control Center
 * by generating the necessary files, configurations, and dependencies.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Project templates
const templates = {
  'react-vite': {
    name: 'React + Vite',
    description: 'Modern React app with Vite build system',
    files: ['package.json', 'vite.config.ts', 'tsconfig.json', 'src/App.tsx', 'src/main.tsx']
  },
  'nextjs': {
    name: 'Next.js',
    description: 'Full-stack React framework with SSR',
    files: ['package.json', 'next.config.js', 'tsconfig.json', 'pages/index.tsx', 'pages/_app.tsx']
  },
  'python-flask': {
    name: 'Python Flask',
    description: 'Backend-only Python service',
    files: ['requirements.txt', 'app.py', 'config.py', '.env.example']
  },
  'python-fastapi': {
    name: 'Python FastAPI',
    description: 'Modern Python API with automatic docs',
    files: ['requirements.txt', 'main.py', 'config.py', '.env.example']
  }
};

// Service configurations
const services = {
  openrouter: {
    name: 'OpenRouter',
    description: 'LLM models (Claude, GPT-4, Llama)',
    required: true,
    envVar: 'OPENROUTER_API_KEY',
    setupUrl: 'https://openrouter.ai/keys'
  },
  replicate: {
    name: 'Replicate',
    description: 'Image/Video/Music generation',
    required: false,
    envVar: 'REPLICATE_API_TOKEN',
    setupUrl: 'https://replicate.com/account'
  },
  google: {
    name: 'Google Cloud',
    description: 'Text-to-Speech (optional)',
    required: false,
    envVar: 'GOOGLE_APPLICATION_CREDENTIALS',
    setupUrl: 'https://console.cloud.google.com'
  }
};

class AIControlCenterCLI {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.config = {};
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  async prompt(question, defaultValue = '') {
    return new Promise((resolve) => {
      const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim() || defaultValue);
      });
    });
  }

  async confirm(question) {
    const answer = await this.prompt(`${question} (y/N)`);
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
  }

  async selectFromList(question, options) {
    this.log(`\n${question}`, 'cyan');
    options.forEach((option, index) => {
      this.log(`  ${index + 1}. ${option.name} - ${option.description}`, 'yellow');
    });
    
    const answer = await this.prompt(`Enter your choice (1-${options.length})`);
    const index = parseInt(answer) - 1;
    
    if (index >= 0 && index < options.length) {
      return options[index];
    }
    
    this.log('Invalid choice. Please try again.', 'red');
    return this.selectFromList(question, options);
  }

  async welcome() {
    this.log('\n🎮 AI Control Center Blueprint Setup', 'bright');
    this.log('===================================', 'bright');
    this.log('Welcome to the AI Control Center Blueprint CLI!', 'green');
    this.log('This tool will help you set up a new project with professional AI cost tracking and model management.\n', 'green');
  }

  async collectProjectInfo() {
    this.log('📋 Project Information', 'cyan');
    this.log('----------------------', 'cyan');
    
    this.config.projectName = await this.prompt('Project name', 'my-ai-app');
    this.config.projectDescription = await this.prompt('Project description', 'AI-powered application');
    this.config.author = await this.prompt('Author name', '');
    
    // Clean project name for directory
    this.config.projectDir = this.config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  }

  async selectTemplate() {
    this.log('\n🏗️ Project Template', 'cyan');
    this.log('-------------------', 'cyan');
    
    const templateOptions = Object.entries(templates).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description
    }));
    
    const selectedTemplate = await this.selectFromList('Choose a project template:', templateOptions);
    this.config.template = selectedTemplate.key;
    
    this.log(`Selected: ${selectedTemplate.name}`, 'green');
  }

  async selectServices() {
    this.log('\n🔌 AI Services', 'cyan');
    this.log('--------------', 'cyan');
    
    this.config.services = {};
    
    for (const [key, service] of Object.entries(services)) {
      if (service.required) {
        this.config.services[key] = true;
        this.log(`✓ ${service.name} - ${service.description} (required)`, 'green');
      } else {
        const include = await this.confirm(`Include ${service.name} - ${service.description}?`);
        this.config.services[key] = include;
        if (include) {
          this.log(`✓ ${service.name} will be included`, 'green');
        }
      }
    }
  }

  async generateProject() {
    this.log('\n🚀 Generating Project', 'cyan');
    this.log('---------------------', 'cyan');
    
    const projectPath = path.join(process.cwd(), this.config.projectDir);
    
    // Check if directory exists
    if (fs.existsSync(projectPath)) {
      const overwrite = await this.confirm(`Directory ${this.config.projectDir} already exists. Overwrite?`);
      if (!overwrite) {
        this.log('Setup cancelled.', 'yellow');
        return false;
      }
      fs.rmSync(projectPath, { recursive: true, force: true });
    }

    // Create project directory
    fs.mkdirSync(projectPath, { recursive: true });
    this.log(`Created directory: ${this.config.projectDir}`, 'green');

    // Copy template files
    await this.copyTemplateFiles(projectPath);
    
    // Generate configuration files
    await this.generateConfigFiles(projectPath);
    
    // Create environment file
    await this.generateEnvFile(projectPath);
    
    // Generate package.json or requirements.txt
    await this.generateDependencyFile(projectPath);
    
    this.log('Project files generated successfully!', 'green');
    return true;
  }

  async copyTemplateFiles(projectPath) {
    const templatePath = path.join(__dirname, '..', 'examples', this.config.template);
    
    if (fs.existsSync(templatePath)) {
      // Copy template files
      this.copyDirectory(templatePath, projectPath);
      this.log(`Copied template files from ${this.config.template}`, 'green');
    } else {
      // Generate basic structure
      await this.generateBasicStructure(projectPath);
    }
  }

  copyDirectory(src, dest) {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  async generateBasicStructure(projectPath) {
    const template = this.config.template;
    
    if (template.includes('react') || template.includes('nextjs')) {
      // React/Next.js structure
      fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'src', 'components'), { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'public'), { recursive: true });
      
      // Generate App.tsx
      const appContent = this.generateAppTsx();
      fs.writeFileSync(path.join(projectPath, 'src', 'App.tsx'), appContent);
      
    } else if (template.includes('python')) {
      // Python structure
      fs.mkdirSync(path.join(projectPath, 'src'), { recursive: true });
      fs.mkdirSync(path.join(projectPath, 'tests'), { recursive: true });
      
      // Generate main.py or app.py
      const mainFile = template.includes('fastapi') ? 'main.py' : 'app.py';
      const mainContent = this.generatePythonMain(template);
      fs.writeFileSync(path.join(projectPath, mainFile), mainContent);
    }
  }

  generateAppTsx() {
    return `import React from 'react';
import { AIControlCenter } from '@ai-blueprint/react-components';
import type { AIServiceConfig } from '@ai-blueprint/react-components';
import './App.css';

function App() {
  const aiConfig: AIServiceConfig = {
    openrouter: {
      apiKey: process.env.REACT_APP_OPENROUTER_API_KEY || '',
      baseUrl: 'http://localhost:5004',
      defaultModel: 'anthropic/claude-3-haiku'
    },
    ${this.config.services.replicate ? `replicate: {
      apiToken: process.env.REACT_APP_REPLICATE_API_TOKEN || '',
      defaultModels: {
        image: 'black-forest-labs/flux-schnell'
      }
    },` : ''}
    ${this.config.services.google ? `google: {
      credentials: process.env.REACT_APP_GOOGLE_CREDENTIALS_PATH || '',
      projectId: process.env.REACT_APP_GOOGLE_PROJECT_ID || ''
    }` : ''}
  };

  return (
    <div className="app">
      <div className="sidebar">
        <AIControlCenter config={aiConfig} />
      </div>
      <div className="main-content">
        <h1>🎮 ${this.config.projectName}</h1>
        <p>${this.config.projectDescription}</p>
      </div>
    </div>
  );
}

export default App;
`;
  }

  generatePythonMain(template) {
    if (template.includes('fastapi')) {
      return `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="${this.config.projectName}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to ${this.config.projectName}"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "${this.config.projectName}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
    } else {
      return `from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def root():
    return jsonify({"message": "Welcome to ${this.config.projectName}"})

@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "${this.config.projectName}"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
`;
    }
  }

  async generateConfigFiles(projectPath) {
    // Generate TypeScript config if needed
    if (this.config.template.includes('react') || this.config.template.includes('nextjs')) {
      const tsconfigContent = {
        compilerOptions: {
          target: "ES2020",
          lib: ["DOM", "DOM.Iterable", "ESNext"],
          allowJs: true,
          skipLibCheck: true,
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          forceConsistentCasingInFileNames: true,
          module: "ESNext",
          moduleResolution: "node",
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: "react-jsx"
        },
        include: ["src"],
        references: [{ path: "./tsconfig.node.json" }]
      };
      
      fs.writeFileSync(
        path.join(projectPath, 'tsconfig.json'),
        JSON.stringify(tsconfigContent, null, 2)
      );
    }
  }

  async generateEnvFile(projectPath) {
    let envContent = `# AI Control Center Environment Variables
# Copy this file to .env and fill in your actual API keys

# Project Configuration
PROJECT_NAME="${this.config.projectName}"
PROJECT_DESCRIPTION="${this.config.projectDescription}"

`;

    // Add service-specific environment variables
    for (const [serviceKey, enabled] of Object.entries(this.config.services)) {
      if (enabled) {
        const service = services[serviceKey];
        envContent += `# ${service.name} - ${service.description}\n`;
        envContent += `# Get your key from: ${service.setupUrl}\n`;
        envContent += `${service.envVar}=your-${serviceKey}-key-here\n\n`;
      }
    }

    fs.writeFileSync(path.join(projectPath, '.env.example'), envContent);
    this.log('Generated .env.example file', 'green');
  }

  async generateDependencyFile(projectPath) {
    if (this.config.template.includes('react') || this.config.template.includes('nextjs')) {
      // Generate package.json
      const packageJson = {
        name: this.config.projectDir,
        version: "1.0.0",
        private: true,
        description: this.config.projectDescription,
        author: this.config.author,
        scripts: {},
        dependencies: {
          "@ai-blueprint/react-components": "^1.0.0"
        },
        devDependencies: {}
      };

      if (this.config.template === 'react-vite') {
        packageJson.type = "module";
        packageJson.scripts = {
          dev: "vite",
          build: "tsc && vite build",
          preview: "vite preview"
        };
        packageJson.dependencies = {
          ...packageJson.dependencies,
          react: "^18.2.0",
          "react-dom": "^18.2.0"
        };
        packageJson.devDependencies = {
          "@types/react": "^18.2.0",
          "@types/react-dom": "^18.2.0",
          "@vitejs/plugin-react": "^4.0.0",
          typescript: "^5.0.0",
          vite: "^4.4.0"
        };
      } else if (this.config.template === 'nextjs') {
        packageJson.scripts = {
          dev: "next dev",
          build: "next build",
          start: "next start"
        };
        packageJson.dependencies = {
          ...packageJson.dependencies,
          react: "^18.2.0",
          "react-dom": "^18.2.0",
          next: "^13.0.0"
        };
        packageJson.devDependencies = {
          "@types/react": "^18.2.0",
          "@types/react-dom": "^18.2.0",
          typescript: "^5.0.0"
        };
      }

      fs.writeFileSync(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      
    } else if (this.config.template.includes('python')) {
      // Generate requirements.txt
      let requirements = ['python-dotenv', 'requests'];
      
      if (this.config.template.includes('flask')) {
        requirements.push('flask', 'flask-cors');
      } else if (this.config.template.includes('fastapi')) {
        requirements.push('fastapi', 'uvicorn');
      }

      if (this.config.services.openrouter) {
        requirements.push('openai');
      }
      
      if (this.config.services.replicate) {
        requirements.push('replicate');
      }
      
      if (this.config.services.google) {
        requirements.push('google-cloud-texttospeech');
      }

      fs.writeFileSync(
        path.join(projectPath, 'requirements.txt'),
        requirements.join('\n') + '\n'
      );
    }
    
    this.log('Generated dependency file', 'green');
  }

  async installDependencies(projectPath) {
    this.log('\n📦 Installing Dependencies', 'cyan');
    this.log('--------------------------', 'cyan');
    
    const install = await this.confirm('Install dependencies now?');
    if (!install) {
      this.log('You can install dependencies later by running:', 'yellow');
      if (this.config.template.includes('react') || this.config.template.includes('nextjs')) {
        this.log('  npm install', 'yellow');
      } else {
        this.log('  pip install -r requirements.txt', 'yellow');
      }
      return;
    }

    try {
      process.chdir(projectPath);
      
      if (this.config.template.includes('react') || this.config.template.includes('nextjs')) {
        this.log('Running npm install...', 'blue');
        execSync('npm install', { stdio: 'inherit' });
      } else {
        this.log('Running pip install...', 'blue');
        execSync('pip install -r requirements.txt', { stdio: 'inherit' });
      }
      
      this.log('Dependencies installed successfully!', 'green');
    } catch (error) {
      this.log('Failed to install dependencies automatically.', 'red');
      this.log('You can install them manually later.', 'yellow');
    }
  }

  async showNextSteps() {
    this.log('\n🎉 Setup Complete!', 'green');
    this.log('==================', 'green');
    this.log(`Your new AI Control Center project "${this.config.projectName}" is ready!`, 'bright');
    
    this.log('\n📋 Next Steps:', 'cyan');
    this.log(`1. cd ${this.config.projectDir}`, 'yellow');
    this.log('2. Copy .env.example to .env and add your API keys', 'yellow');
    this.log('3. Start the development server:', 'yellow');
    
    if (this.config.template.includes('react') || this.config.template.includes('nextjs')) {
      this.log('   npm run dev', 'yellow');
    } else {
      this.log('   python app.py', 'yellow');
    }
    
    this.log('\n🔑 API Keys Setup:', 'cyan');
    for (const [serviceKey, enabled] of Object.entries(this.config.services)) {
      if (enabled) {
        const service = services[serviceKey];
        this.log(`   ${service.name}: ${service.setupUrl}`, 'yellow');
      }
    }
    
    this.log('\n📖 Documentation:', 'cyan');
    this.log('   https://github.com/willykramer/ai-control-center-blueprint', 'yellow');
    
    this.log('\n🚀 Happy building!', 'green');
  }

  async run() {
    try {
      await this.welcome();
      await this.collectProjectInfo();
      await this.selectTemplate();
      await this.selectServices();
      
      const success = await this.generateProject();
      if (!success) return;
      
      await this.installDependencies(path.join(process.cwd(), this.config.projectDir));
      await this.showNextSteps();
      
    } catch (error) {
      this.log(`\nError: ${error.message}`, 'red');
      process.exit(1);
    } finally {
      this.rl.close();
    }
  }
}

// Run the CLI
if (require.main === module) {
  const cli = new AIControlCenterCLI();
  cli.run();
}

module.exports = AIControlCenterCLI;