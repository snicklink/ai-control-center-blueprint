#!/usr/bin/env python3
"""
AI Control Center Flask Example

This demonstrates how to create a backend service that integrates
with both OpenRouter and Replicate APIs for comprehensive AI services.
"""

import os
import json
import time
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
class Config:
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
    REPLICATE_API_TOKEN = os.getenv('REPLICATE_API_TOKEN')
    GOOGLE_CREDENTIALS_PATH = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
    
    # Default models
    DEFAULT_LLM_MODEL = 'anthropic/claude-3-haiku'
    DEFAULT_IMAGE_MODEL = 'black-forest-labs/flux-schnell'
    
    # Cost tracking
    COST_TRACKING_FILE = 'costs.json'

# Global state
current_models = {
    'llm': Config.DEFAULT_LLM_MODEL,
    'image': Config.DEFAULT_IMAGE_MODEL
}

# Cost tracking
def load_costs():
    """Load cost tracking data from file"""
    try:
        if os.path.exists(Config.COST_TRACKING_FILE):
            with open(Config.COST_TRACKING_FILE, 'r') as f:
                return json.load(f)
    except Exception as e:
        logger.error(f"Error loading costs: {e}")
    
    return {
        'session_cost': 0.0,
        'daily_cost': 0.0,
        'monthly_cost': 0.0,
        'last_reset': datetime.now().isoformat(),
        'requests': {
            'llm': 0,
            'image': 0,
            'total': 0
        }
    }

def save_costs(costs):
    """Save cost tracking data to file"""
    try:
        with open(Config.COST_TRACKING_FILE, 'w') as f:
            json.dump(costs, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving costs: {e}")

def add_cost(amount, service_type='llm'):
    """Add cost to tracking"""
    costs = load_costs()
    costs['session_cost'] += amount
    costs['daily_cost'] += amount
    costs['monthly_cost'] += amount
    costs['requests'][service_type] += 1
    costs['requests']['total'] += 1
    save_costs(costs)
    return costs

# OpenRouter integration
class OpenRouterService:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_response(self, prompt, model=None, max_tokens=150, temperature=0.7):
        """Generate response using OpenRouter API"""
        if not self.api_key:
            raise ValueError("OpenRouter API key not configured")
        
        model = model or current_models['llm']
        
        payload = {
            "model": model,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Calculate approximate cost (rough estimation)
            usage = data.get('usage', {})
            estimated_cost = self.estimate_cost(model, usage)
            add_cost(estimated_cost, 'llm')
            
            return {
                'response': data['choices'][0]['message']['content'],
                'model': model,
                'usage': usage,
                'cost': estimated_cost
            }
            
        except requests.RequestException as e:
            logger.error(f"OpenRouter API error: {e}")
            raise
    
    def estimate_cost(self, model, usage):
        """Estimate cost based on model and usage"""
        # Simplified cost estimation - you'd want more accurate pricing
        cost_per_1k = {
            'anthropic/claude-3-haiku': 0.0003,
            'openai/gpt-4o-mini': 0.0002,
            'meta-llama/llama-3.1-8b-instruct': 0.00005
        }
        
        tokens = usage.get('total_tokens', 100)  # Default estimate
        rate = cost_per_1k.get(model, 0.0001)
        return (tokens / 1000) * rate

# Replicate integration
class ReplicateService:
    def __init__(self, api_token):
        self.api_token = api_token
        self.base_url = "https://api.replicate.com/v1"
        self.headers = {
            "Authorization": f"Token {api_token}",
            "Content-Type": "application/json"
        }
    
    def generate_image(self, prompt, model=None):
        """Generate image using Replicate API"""
        if not self.api_token:
            raise ValueError("Replicate API token not configured")
        
        model = model or current_models['image']
        
        payload = {
            "version": self.get_model_version(model),
            "input": {"prompt": prompt}
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/predictions",
                headers=self.headers,
                json=payload,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            
            # Add estimated cost
            estimated_cost = self.estimate_image_cost(model)
            add_cost(estimated_cost, 'image')
            
            return {
                'prediction_id': data['id'],
                'status': data['status'],
                'model': model,
                'cost': estimated_cost,
                'urls': data.get('urls', {})
            }
            
        except requests.RequestException as e:
            logger.error(f"Replicate API error: {e}")
            raise
    
    def get_model_version(self, model):
        """Get latest version for a model"""
        # Simplified - you'd want to fetch actual versions
        versions = {
            'black-forest-labs/flux-schnell': 'latest',
            'stability-ai/sdxl': 'latest'
        }
        return versions.get(model, 'latest')
    
    def estimate_image_cost(self, model):
        """Estimate image generation cost"""
        costs = {
            'black-forest-labs/flux-schnell': 0.003,
            'stability-ai/sdxl': 0.004,
            'black-forest-labs/flux-dev': 0.055
        }
        return costs.get(model, 0.01)

# Initialize services
openrouter = OpenRouterService(Config.OPENROUTER_API_KEY)
replicate = ReplicateService(Config.REPLICATE_API_TOKEN)

# Routes
@app.route('/')
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'AI Control Center Flask Example',
        'version': '1.0.0',
        'services': {
            'openrouter': bool(Config.OPENROUTER_API_KEY),
            'replicate': bool(Config.REPLICATE_API_TOKEN),
            'google': bool(Config.GOOGLE_CREDENTIALS_PATH)
        }
    })

@app.route('/health')
def health():
    """Health check endpoint"""
    costs = load_costs()
    return jsonify({
        'status': 'healthy',
        'service': 'ai-control-center-flask',
        'current_models': current_models,
        'session_cost': costs['session_cost'],
        'daily_cost': costs['daily_cost'],
        'uptime': time.time()
    })

@app.route('/generate/text', methods=['POST'])
def generate_text():
    """Generate text using OpenRouter"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        model = data.get('model', current_models['llm'])
        max_tokens = data.get('max_tokens', 150)
        temperature = data.get('temperature', 0.7)
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        result = openrouter.generate_response(
            prompt=prompt,
            model=model,
            max_tokens=max_tokens,
            temperature=temperature
        )
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Text generation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/generate/image', methods=['POST'])
def generate_image():
    """Generate image using Replicate"""
    try:
        data = request.get_json()
        prompt = data.get('prompt', '')
        model = data.get('model', current_models['image'])
        
        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400
        
        result = replicate.generate_image(prompt=prompt, model=model)
        
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Image generation error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/models/switch', methods=['POST'])
def switch_model():
    """Switch active model"""
    try:
        data = request.get_json()
        model_type = data.get('type')  # 'llm' or 'image'
        model_id = data.get('model_id')
        
        if not model_type or not model_id:
            return jsonify({'error': 'Both type and model_id are required'}), 400
        
        if model_type in current_models:
            current_models[model_type] = model_id
            
            return jsonify({
                'success': True,
                'message': f'Switched {model_type} model to {model_id}',
                'current_models': current_models
            })
        else:
            return jsonify({'error': f'Unknown model type: {model_type}'}), 400
            
    except Exception as e:
        logger.error(f"Model switching error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/models/list')
def list_models():
    """List available models"""
    models = {
        'llm': [
            {
                'id': 'anthropic/claude-3-haiku',
                'name': 'Claude 3 Haiku',
                'provider': 'Anthropic',
                'cost_per_1k': 0.0003,
                'recommended': True
            },
            {
                'id': 'openai/gpt-4o-mini',
                'name': 'GPT-4o Mini',
                'provider': 'OpenAI',
                'cost_per_1k': 0.0002,
                'recommended': True
            },
            {
                'id': 'meta-llama/llama-3.1-8b-instruct',
                'name': 'Llama 3.1 8B',
                'provider': 'Meta',
                'cost_per_1k': 0.00005,
                'recommended': False
            }
        ],
        'image': [
            {
                'id': 'black-forest-labs/flux-schnell',
                'name': 'Flux Schnell',
                'provider': 'Black Forest Labs',
                'cost_per_image': 0.003,
                'recommended': True
            },
            {
                'id': 'stability-ai/sdxl',
                'name': 'Stable Diffusion XL',
                'provider': 'Stability AI',
                'cost_per_image': 0.004,
                'recommended': True
            }
        ]
    }
    
    return jsonify({
        'success': True,
        'models': models,
        'current_models': current_models
    })

@app.route('/costs')
def get_costs():
    """Get current cost tracking data"""
    costs = load_costs()
    return jsonify({
        'success': True,
        'costs': costs,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/costs/reset', methods=['POST'])
def reset_costs():
    """Reset cost tracking (session only)"""
    try:
        costs = load_costs()
        costs['session_cost'] = 0.0
        costs['requests'] = {'llm': 0, 'image': 0, 'total': 0}
        save_costs(costs)
        
        return jsonify({
            'success': True,
            'message': 'Session costs reset',
            'costs': costs
        })
        
    except Exception as e:
        logger.error(f"Cost reset error: {e}")
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    logger.info("Starting AI Control Center Flask Example")
    logger.info(f"OpenRouter configured: {bool(Config.OPENROUTER_API_KEY)}")
    logger.info(f"Replicate configured: {bool(Config.REPLICATE_API_TOKEN)}")
    
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5000)),
        debug=os.getenv('DEBUG', 'false').lower() == 'true'
    )