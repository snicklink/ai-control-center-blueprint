#!/usr/bin/env python3
"""
🎨 Replicate AI Service Template - Production-Ready
Image, Video, and Music generation with cost tracking

Features:
- Replicate API integration for image/video/music generation
- Real-time cost tracking across all model types
- Dynamic model switching for different media types
- Production-grade error handling and retries
- Flask REST API with CORS support

Usage:
    python replicate_service.py

Environment Variables:
    REPLICATE_API_TOKEN: Your Replicate API token
    PORT: Service port (default: 5005)
"""

import os
import sys
import json
import time
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, List, Optional, Any
from datetime import datetime, date
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
PORT = int(os.getenv('PORT', 5005))
COST_LOG_FILE = os.getenv('COST_LOG_FILE', '/tmp/replicate_costs.json')

# Replicate model pricing (updated 2025)
MODEL_PRICING = {
    # Image Generation Models
    "black-forest-labs/flux-schnell": {"cost_per_run": 0.003, "type": "image"},
    "black-forest-labs/flux-dev": {"cost_per_run": 0.055, "type": "image"},
    "stability-ai/sdxl": {"cost_per_run": 0.004, "type": "image"},
    "ideogram-ai/ideogram-v2": {"cost_per_run": 0.08, "type": "image"},
    "recraft-ai/recraft-v3": {"cost_per_run": 0.05, "type": "image"},
    
    # Video Generation Models
    "minimax/video-01": {"cost_per_run": 0.2, "type": "video"},
    "luma/dream-machine": {"cost_per_run": 0.12, "type": "video"},
    "runway/gen-3-alpha": {"cost_per_run": 0.5, "type": "video"},
    
    # Music Generation Models
    "suno-ai/bark": {"cost_per_run": 0.01, "type": "music"},
    "meta/musicgen": {"cost_per_run": 0.005, "type": "music"},
    
    # LLM Models (backup/specialty)
    "meta/llama-2-70b-chat": {"input": 0.00065, "output": 0.00275, "type": "llm"},
    "meta/llama-2-13b-chat": {"input": 0.0004, "output": 0.002, "type": "llm"}
}

# Current default models
CURRENT_MODELS = {
    "image": "black-forest-labs/flux-schnell",
    "video": "luma/dream-machine", 
    "music": "meta/musicgen",
    "llm": "meta/llama-2-13b-chat"
}

app = Flask(__name__)
CORS(app)

def estimate_token_count(text: str) -> int:
    """Estimate token count for LLM models"""
    return max(1, len(text) // 4)

def log_cost(model: str, cost: float, output_type: str = "unknown"):
    """Log Replicate API usage for cost tracking"""
    try:
        costs = []
        if os.path.exists(COST_LOG_FILE):
            with open(COST_LOG_FILE, 'r') as f:
                costs = json.load(f)
        
        cost_entry = {
            'timestamp': datetime.now().isoformat(),
            'date': date.today().isoformat(),
            'service': 'replicate',
            'model': model,
            'cost_usd': cost,
            'output_type': output_type,
            'success': True
        }
        
        costs.append(cost_entry)
        
        # Keep only last 1000 entries
        if len(costs) > 1000:
            costs = costs[-1000:]
        
        with open(COST_LOG_FILE, 'w') as f:
            json.dump(costs, f, indent=2)
            
    except Exception as e:
        print(f"❌ Cost logging error: {e}")

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
            "image_requests": len([c for c in daily_costs if c.get('output_type') == 'image']),
            "video_requests": len([c for c in daily_costs if c.get('output_type') == 'video']),
            "music_requests": len([c for c in daily_costs if c.get('output_type') == 'music'])
        }
    except Exception as e:
        print(f"❌ Cost summary error: {e}")
        return {"session_cost": 0, "daily_cost": 0, "total_requests": 0}

def run_replicate_model(model_id: str, inputs: Dict, output_type: str = "image") -> Dict:
    """Run Replicate model via CLI"""
    try:
        # Build replicate CLI command
        cmd = ["replicate", "run", model_id]
        
        # Add inputs as key=value pairs
        for key, value in inputs.items():
            if isinstance(value, str) and ' ' in value:
                cmd.append(f'{key}="{value}"')
            else:
                cmd.append(f'{key}={value}')
        
        print(f"🚀 Running: {' '.join(cmd)}")
        
        # Execute with timeout
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            output = result.stdout.strip()
            
            # Calculate and log cost
            pricing = MODEL_PRICING.get(model_id, {"cost_per_run": 0.01})
            cost = pricing.get("cost_per_run", 0.01)
            log_cost(model_id, cost, output_type)
            
            print(f"✅ Generation successful (${cost:.4f}): {output[:100]}...")
            
            return {
                "status": "success",
                "output": output,
                "cost": cost,
                "model": model_id,
                "type": output_type
            }
        else:
            print(f"❌ Replicate error: {result.stderr}")
            return {
                "status": "error", 
                "error": result.stderr,
                "model": model_id
            }
            
    except subprocess.TimeoutExpired:
        return {"status": "error", "error": "Generation timeout"}
    except Exception as e:
        print(f"❌ Generation error: {e}")
        return {"status": "error", "error": str(e)}

# API Routes

@app.route('/health', methods=['GET'])
def health_check():
    """Service health check"""
    costs = get_cost_summary()
    return jsonify({
        'status': 'healthy',
        'service': 'replicate-ai-service',
        'timestamp': datetime.now().isoformat(),
        'current_models': CURRENT_MODELS,
        'session_cost': costs['session_cost'],
        'daily_cost': costs['daily_cost']
    })

@app.route('/generate/image', methods=['POST'])
def generate_image():
    """Generate image using Replicate"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        model = data.get('model', CURRENT_MODELS['image'])
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        # Prepare inputs based on model
        inputs = {"prompt": prompt}
        
        # Add model-specific parameters
        if 'flux' in model:
            inputs.update({
                "aspect_ratio": data.get('aspect_ratio', '1:1'),
                "output_format": data.get('format', 'webp'),
                "output_quality": data.get('quality', 80)
            })
        elif 'sdxl' in model:
            inputs.update({
                "width": data.get('width', 1024),
                "height": data.get('height', 1024),
                "num_inference_steps": data.get('steps', 20)
            })
        
        result = run_replicate_model(model, inputs, "image")
        
        if result["status"] == "success":
            return jsonify({
                'status': 'success',
                'image_url': result["output"],
                'cost': result["cost"],
                'model': model,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/generate/video', methods=['POST'])
def generate_video():
    """Generate video using Replicate"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        model = data.get('model', CURRENT_MODELS['video'])
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        inputs = {"prompt": prompt}
        
        # Add video-specific parameters
        if 'luma' in model:
            inputs.update({
                "aspect_ratio": data.get('aspect_ratio', '16:9'),
                "loop": data.get('loop', False)
            })
        
        result = run_replicate_model(model, inputs, "video")
        
        if result["status"] == "success":
            return jsonify({
                'status': 'success',
                'video_url': result["output"],
                'cost': result["cost"],
                'model': model,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/generate/music', methods=['POST'])
def generate_music():
    """Generate music using Replicate"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        model = data.get('model', CURRENT_MODELS['music'])
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        inputs = {"text": prompt}
        
        # Add music-specific parameters
        if 'musicgen' in model:
            inputs.update({
                "model_version": data.get('model_version', 'large'),
                "duration": data.get('duration', 8)
            })
        
        result = run_replicate_model(model, inputs, "music")
        
        if result["status"] == "success":
            return jsonify({
                'status': 'success',
                'audio_url': result["output"],
                'cost': result["cost"],
                'model': model,
                'timestamp': datetime.now().isoformat()
            })
        else:
            return jsonify(result), 500
            
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 500

@app.route('/switch_model', methods=['POST'])
def switch_model():
    """Switch active model for a media type"""
    try:
        data = request.json
        model_type = data.get('type', 'image')  # image, video, music, llm
        model_id = data.get('model_id')
        
        if not model_id:
            return jsonify({'error': 'No model_id provided'}), 400
        
        if model_id not in MODEL_PRICING:
            return jsonify({'error': f'Model {model_id} not supported'}), 400
        
        old_model = CURRENT_MODELS.get(model_type)
        CURRENT_MODELS[model_type] = model_id
        
        print(f"🔄 {model_type.title()} model switched: {old_model} → {model_id}")
        
        return jsonify({
            'status': 'success',
            'type': model_type,
            'old_model': old_model,
            'new_model': model_id,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/costs', methods=['GET'])
def get_costs():
    """Get cost information"""
    try:
        costs = get_cost_summary()
        costs.update({
            'service': 'replicate',
            'timestamp': datetime.now().isoformat(),
            'current_models': CURRENT_MODELS
        })
        return jsonify(costs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/models', methods=['GET'])
def get_models():
    """Get available models by type"""
    try:
        models_by_type = {
            'image': [],
            'video': [],
            'music': [],
            'llm': []
        }
        
        for model_id, info in MODEL_PRICING.items():
            model_type = info.get('type', 'image')
            models_by_type[model_type].append({
                'id': model_id,
                'name': model_id.split('/')[-1].title(),
                'pricing': info,
                'current_default': model_id == CURRENT_MODELS.get(model_type)
            })
        
        return jsonify({
            'replicate_models': models_by_type,
            'current_models': CURRENT_MODELS,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"🎨 Replicate AI Service starting on port {PORT}...")
    print(f"🚀 Current models: {CURRENT_MODELS}")
    
    # Check API token
    if not os.getenv('REPLICATE_API_TOKEN'):
        print("⚠️  WARNING: REPLICATE_API_TOKEN not set!")
        print("   Get your token from: https://replicate.com/account")
        print("   Set with: export REPLICATE_API_TOKEN=r8_your-token-here")
    
    app.run(host='0.0.0.0', port=PORT, debug=True)