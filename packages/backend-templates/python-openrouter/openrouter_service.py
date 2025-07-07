#!/usr/bin/env python3
"""
🎭 OpenRouter AI Service Template - Production-Ready
Built from proven SimStream2 implementation

Features:
- OpenRouter LLM integration with OpenAI SDK
- Real-time cost tracking and logging
- Dynamic model switching with live updates
- Multi-character prompt management
- Production-grade error handling
- Flask REST API with CORS support

Usage:
    python openrouter_service.py

Environment Variables:
    OPENROUTER_API_KEY: Your OpenRouter API key
    PORT: Service port (default: 5004)
"""

import os
import sys
import json
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, List, Optional, Any
from datetime import datetime, date
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Configuration
PORT = int(os.getenv('PORT', 5004))
CURRENT_MODEL = os.getenv('DEFAULT_MODEL', 'anthropic/claude-3-haiku')
COST_LOG_FILE = os.getenv('COST_LOG_FILE', '/tmp/ai_costs.json')

# OpenRouter model pricing (per 1M tokens) - Updated 2025
MODEL_PRICING = {
    "anthropic/claude-3.5-sonnet": {"input": 3.0, "output": 15.0},
    "anthropic/claude-3-haiku": {"input": 0.25, "output": 1.25},
    "meta-llama/llama-3.1-70b-instruct": {"input": 0.88, "output": 0.88},
    "meta-llama/llama-3.1-8b-instruct": {"input": 0.05, "output": 0.05},
    "mistralai/mixtral-8x7b-instruct": {"input": 0.24, "output": 0.24},
    "google/gemini-pro": {"input": 0.125, "output": 0.375},
    "openai/gpt-4o": {"input": 2.5, "output": 10.0},
    "openai/gpt-4o-mini": {"input": 0.15, "output": 0.6}
}

# Initialize Flask app and OpenRouter client
app = Flask(__name__)
CORS(app)

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)

# Character prompt templates (customizable)
CHARACTER_PROMPTS = {
    "default": {
        "system_prompt": "You are a helpful AI assistant. Respond clearly and concisely.",
        "temperature": 0.7,
        "max_tokens": 150
    },
    "creative": {
        "system_prompt": "You are a creative AI assistant. Generate imaginative and engaging responses.",
        "temperature": 0.9,
        "max_tokens": 200
    },
    "analytical": {
        "system_prompt": "You are an analytical AI assistant. Provide detailed, logical responses with reasoning.",
        "temperature": 0.3,
        "max_tokens": 300
    }
}

def estimate_token_count(text: str) -> int:
    """Estimate token count (4 chars ≈ 1 token)"""
    return max(1, len(text) // 4)

def log_cost(model: str, input_text: str, output_text: str, cost: float):
    """Log API usage for cost tracking"""
    try:
        costs = []
        if os.path.exists(COST_LOG_FILE):
            with open(COST_LOG_FILE, 'r') as f:
                costs = json.load(f)
        
        cost_entry = {
            'timestamp': datetime.now().isoformat(),
            'date': date.today().isoformat(),
            'service': 'openrouter-llm',
            'model': model,
            'input_tokens': estimate_token_count(input_text),
            'output_tokens': estimate_token_count(output_text),
            'cost_usd': cost,
            'input_length': len(input_text),
            'output_length': len(output_text)
        }
        
        costs.append(cost_entry)
        
        # Keep only last 1000 entries
        if len(costs) > 1000:
            costs = costs[-1000:]
        
        with open(COST_LOG_FILE, 'w') as f:
            json.dump(costs, f, indent=2)
            
    except Exception as e:
        print(f"❌ Cost logging error: {e}")

def calculate_cost(model: str, input_text: str, output_text: str) -> float:
    """Calculate API call cost"""
    pricing = MODEL_PRICING.get(model, {"input": 0.25, "output": 1.25})
    
    input_tokens = estimate_token_count(input_text)
    output_tokens = estimate_token_count(output_text)
    
    input_cost = (input_tokens / 1000000) * pricing["input"]
    output_cost = (output_tokens / 1000000) * pricing["output"]
    
    return input_cost + output_cost

def get_cost_summary() -> Dict:
    """Get cost summary for dashboard"""
    try:
        if not os.path.exists(COST_LOG_FILE):
            return {"session_cost": 0, "daily_cost": 0, "total_requests": 0}
        
        with open(COST_LOG_FILE, 'r') as f:
            costs = json.load(f)
        
        today = date.today().isoformat()
        session_start = datetime.now().timestamp() - 3600  # 1 hour ago
        
        daily_costs = [c for c in costs if c['date'] == today]
        session_costs = [c for c in daily_costs 
                        if datetime.fromisoformat(c['timestamp']).timestamp() > session_start]
        
        return {
            "session_cost": sum(c['cost_usd'] for c in session_costs),
            "daily_cost": sum(c['cost_usd'] for c in daily_costs),
            "total_requests": len(daily_costs),
            "total_tokens": sum(c['input_tokens'] + c['output_tokens'] for c in daily_costs),
            "current_model": CURRENT_MODEL
        }
    except Exception as e:
        print(f"❌ Cost summary error: {e}")
        return {"session_cost": 0, "daily_cost": 0, "total_requests": 0}

def generate_response(prompt: str, character: str = "default", **kwargs) -> str:
    """Generate AI response using OpenRouter"""
    global CURRENT_MODEL
    
    try:
        char_config = CHARACTER_PROMPTS.get(character, CHARACTER_PROMPTS["default"])
        
        response = client.chat.completions.create(
            model=CURRENT_MODEL,
            messages=[
                {"role": "system", "content": char_config["system_prompt"]},
                {"role": "user", "content": prompt}
            ],
            temperature=kwargs.get('temperature', char_config.get('temperature', 0.7)),
            max_tokens=kwargs.get('max_tokens', char_config.get('max_tokens', 150)),
            top_p=kwargs.get('top_p', 0.9)
        )
        
        output_text = response.choices[0].message.content.strip()
        
        # Log cost
        full_input = f"{char_config['system_prompt']}\n\n{prompt}"
        cost = calculate_cost(CURRENT_MODEL, full_input, output_text)
        log_cost(CURRENT_MODEL, full_input, output_text, cost)
        
        print(f"✅ Generated response (${cost:.6f}): {output_text[:50]}...")
        return output_text
        
    except Exception as e:
        print(f"❌ Generation error: {e}")
        return "I apologize, but I'm experiencing technical difficulties. Please try again."

# API Routes

@app.route('/health', methods=['GET'])
def health_check():
    """Service health check"""
    costs = get_cost_summary()
    return jsonify({
        'status': 'healthy',
        'service': 'openrouter-ai-service',
        'timestamp': datetime.now().isoformat(),
        'current_model': CURRENT_MODEL,
        'session_cost': costs['session_cost'],
        'daily_cost': costs['daily_cost']
    })

@app.route('/generate', methods=['POST'])
def generate():
    """Generate AI response"""
    try:
        data = request.json
        prompt = data.get('prompt', data.get('message', ''))
        character = data.get('character', 'default')
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        # Optional parameters
        temperature = data.get('temperature')
        max_tokens = data.get('max_tokens')
        top_p = data.get('top_p')
        
        kwargs = {}
        if temperature is not None:
            kwargs['temperature'] = temperature
        if max_tokens is not None:
            kwargs['max_tokens'] = max_tokens
        if top_p is not None:
            kwargs['top_p'] = top_p
        
        response_text = generate_response(prompt, character, **kwargs)
        
        return jsonify({
            'status': 'success',
            'text': response_text,
            'character': character,
            'model': CURRENT_MODEL,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Generate endpoint error: {e}")
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/switch_model', methods=['POST'])
def switch_model():
    """Switch active model"""
    global CURRENT_MODEL
    
    try:
        data = request.json
        new_model = data.get('model_id')
        
        if not new_model:
            return jsonify({'error': 'No model_id provided'}), 400
        
        if new_model not in MODEL_PRICING:
            return jsonify({'error': f'Model {new_model} not supported'}), 400
        
        old_model = CURRENT_MODEL
        CURRENT_MODEL = new_model
        
        print(f"🔄 Model switched: {old_model} → {CURRENT_MODEL}")
        
        return jsonify({
            'status': 'success',
            'old_model': old_model,
            'new_model': CURRENT_MODEL,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/costs', methods=['GET'])
def get_costs():
    """Get cost information"""
    try:
        costs = get_cost_summary()
        pricing = MODEL_PRICING.get(CURRENT_MODEL, {"input": 0.25, "output": 1.25})
        
        costs.update({
            'model_pricing': pricing,
            'service': 'openrouter-llm',
            'timestamp': datetime.now().isoformat()
        })
        
        return jsonify(costs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models', methods=['GET'])
def get_models():
    """Get available models"""
    try:
        models = []
        for model_id, pricing in MODEL_PRICING.items():
            models.append({
                'id': model_id,
                'name': model_id.split('/')[-1].title(),
                'pricing': pricing,
                'current_default': model_id == CURRENT_MODEL
            })
        
        return jsonify({
            'openrouter_models': models,
            'current_model': CURRENT_MODEL,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/estimate', methods=['POST'])
def estimate_cost():
    """Estimate cost for given input"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        model = data.get('model', CURRENT_MODEL)
        character = data.get('character', 'default')
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        char_config = CHARACTER_PROMPTS.get(character, CHARACTER_PROMPTS["default"])
        full_input = f"{char_config['system_prompt']}\n\n{prompt}"
        estimated_output = "This is an estimated response length..."
        
        cost = calculate_cost(model, full_input, estimated_output)
        
        return jsonify({
            'input_tokens': estimate_token_count(full_input),
            'estimated_output_tokens': estimate_token_count(estimated_output),
            'estimated_cost': round(cost, 6),
            'model': model,
            'currency': 'USD'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"🎭 OpenRouter AI Service starting on port {PORT}...")
    print(f"🚀 Default model: {CURRENT_MODEL}")
    
    # Check API key
    if not os.getenv('OPENROUTER_API_KEY'):
        print("⚠️  WARNING: OPENROUTER_API_KEY not set!")
        print("   Get your key from: https://openrouter.ai/keys")
        print("   Set with: export OPENROUTER_API_KEY=sk-or-v1-your-key-here")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)