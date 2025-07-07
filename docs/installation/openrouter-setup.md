# 🌐 OpenRouter Setup Guide

OpenRouter provides access to 300+ AI models through a unified API. Perfect for production LLM applications with reliable streaming and no timeouts.

## 🔑 Get Your API Key

### 1. Create Account
- Go to [openrouter.ai](https://openrouter.ai)
- Sign up with Google, GitHub, or email
- Verify your email address

### 2. Generate API Key
- Visit [openrouter.ai/keys](https://openrouter.ai/keys)
- Click "Create Key"
- Name it (e.g., "AI Control Center")
- Copy the key (starts with `sk-or-v1-...`)

### 3. Add Credits (Optional)
- OpenRouter offers $1 free credit
- Add more credits for production use
- Pay-as-you-go pricing

## 🛠️ Installation

### Backend Service
```bash
# Install dependencies
pip install openai python-dotenv flask flask-cors

# Or use our template
cd packages/backend-templates/python-openrouter
pip install -r requirements.txt
```

### Environment Setup
```bash
# Add to .env file
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
DEFAULT_MODEL=anthropic/claude-3-haiku
PORT=5004
```

### Start Service
```bash
python openrouter_service.py
```

## 🎯 Available Models

### Recommended Production Models

#### **Claude 3 Haiku** ⭐ (Recommended)
- **ID:** `anthropic/claude-3-haiku`
- **Speed:** Very fast
- **Quality:** High
- **Cost:** $0.25/$1.25 per 1M tokens
- **Best for:** Real-time applications, multilingual

#### **GPT-4o Mini** 
- **ID:** `openai/gpt-4o-mini`
- **Speed:** Very fast  
- **Quality:** High
- **Cost:** $0.15/$0.60 per 1M tokens
- **Best for:** High-volume applications

#### **Llama 3.1 8B**
- **ID:** `meta-llama/llama-3.1-8b-instruct`
- **Speed:** Very fast
- **Quality:** Medium-High
- **Cost:** $0.05/$0.05 per 1M tokens
- **Best for:** Budget applications

### Premium Models

#### **Claude 3.5 Sonnet**
- **ID:** `anthropic/claude-3.5-sonnet`
- **Speed:** Medium
- **Quality:** Very High
- **Cost:** $3.00/$15.00 per 1M tokens
- **Best for:** Complex reasoning, code generation

#### **GPT-4o**
- **ID:** `openai/gpt-4o`
- **Speed:** Medium
- **Quality:** Very High  
- **Cost:** $2.50/$10.00 per 1M tokens
- **Best for:** Premium applications

## 🧪 Test Your Setup

### 1. Health Check
```bash
curl http://localhost:5004/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "openrouter-ai-service",
  "current_model": "anthropic/claude-3-haiku",
  "session_cost": 0,
  "daily_cost": 0
}
```

### 2. Generate Text
```bash
curl -X POST http://localhost:5004/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Hello! How are you?",
    "character": "default"
  }'
```

### 3. Switch Models
```bash
curl -X POST http://localhost:5004/switch_model \
  -H "Content-Type: application/json" \
  -d '{"model_id": "openai/gpt-4o-mini"}'
```

## ⚙️ Configuration Options

### Character Prompts
```python
CHARACTER_PROMPTS = {
    "assistant": {
        "system_prompt": "You are a helpful AI assistant.",
        "temperature": 0.7,
        "max_tokens": 150
    },
    "creative": {
        "system_prompt": "You are a creative writing assistant.",
        "temperature": 0.9,
        "max_tokens": 300
    }
}
```

### Model Parameters
```python
# In your generation request
{
  "prompt": "Your prompt here",
  "character": "assistant",
  "temperature": 0.8,      # 0.0-1.0 (creativity)
  "max_tokens": 200,       # Response length
  "top_p": 0.9            # Alternative to temperature
}
```

## 💰 Cost Management

### Model Pricing (per 1M tokens)
| Model | Input | Output | Use Case |
|-------|-------|--------|----------|
| Claude 3 Haiku | $0.25 | $1.25 | Production streaming |
| GPT-4o Mini | $0.15 | $0.60 | High volume |
| Llama 3.1 8B | $0.05 | $0.05 | Budget apps |
| Claude 3.5 Sonnet | $3.00 | $15.00 | Premium quality |

### Cost Tracking
```bash
# Get current costs
curl http://localhost:5004/costs

# Estimate cost before generation
curl -X POST http://localhost:5004/estimate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Your prompt", "model": "anthropic/claude-3-haiku"}'
```

## 🔄 Model Switching

### Automatic Switching
```python
# Set fallback models
FALLBACK_MODELS = [
    "anthropic/claude-3-haiku",
    "openai/gpt-4o-mini", 
    "meta-llama/llama-3.1-8b-instruct"
]
```

### Manual Switching
```javascript
// Frontend model switching
const switchModel = async (modelId) => {
  const response = await fetch('/api/switch_model', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model_id: modelId })
  });
  return response.json();
};
```

## 📊 Performance Tips

### Optimal Settings for Different Use Cases

#### Real-time Chat
```python
{
  "model": "anthropic/claude-3-haiku",
  "temperature": 0.7,
  "max_tokens": 100,
  "stream": True  # For streaming responses
}
```

#### Creative Writing
```python
{
  "model": "anthropic/claude-3.5-sonnet",
  "temperature": 0.9,
  "max_tokens": 500,
  "top_p": 0.95
}
```

#### Code Generation
```python
{
  "model": "openai/gpt-4o",
  "temperature": 0.3,
  "max_tokens": 1000,
  "stop": ["```"]
}
```

## 🛡️ Security Best Practices

### API Key Security
```bash
# Never commit API keys to git
echo ".env" >> .gitignore

# Use environment variables
export OPENROUTER_API_KEY=sk-or-v1-...

# Rotate keys regularly
# Monitor usage on OpenRouter dashboard
```

### Rate Limiting
```python
# Implement rate limiting
from flask_limiter import Limiter

limiter = Limiter(
    app,
    key_func=lambda: request.remote_addr,
    default_limits=["100 per hour"]
)

@app.route('/generate')
@limiter.limit("10 per minute")
def generate():
    # Your generation logic
```

## ⚠️ Troubleshooting

### Common Issues

**Authentication Error**
```bash
# Check API key format
echo $OPENROUTER_API_KEY | grep "sk-or-v1-"

# Test key directly
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/models
```

**Model Not Found**
```bash
# List available models
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" \
  https://openrouter.ai/api/v1/models | jq '.data[].id'
```

**High Costs**
```bash
# Monitor usage
curl http://localhost:5004/costs

# Set model to cheaper option
curl -X POST http://localhost:5004/switch_model \
  -d '{"model_id": "meta-llama/llama-3.1-8b-instruct"}'
```

**Slow Responses**
- Switch to faster models (Claude 3 Haiku, GPT-4o Mini)
- Reduce max_tokens parameter
- Use streaming for real-time applications

## 📈 Monitoring & Analytics

### Usage Dashboard
- Visit [openrouter.ai/activity](https://openrouter.ai/activity)
- Monitor costs and usage patterns
- Set up budget alerts

### Custom Metrics
```python
# Track custom metrics
import time

start_time = time.time()
response = generate_response(prompt)
latency = time.time() - start_time

# Log to your analytics system
log_metrics({
    'model': current_model,
    'latency': latency,
    'tokens': estimate_tokens(response),
    'cost': calculate_cost(response)
})
```

## 🚀 Next Steps

- [🔧 Backend Integration Guide](../api-reference/backend.md)
- [🎨 Frontend Component Guide](../api-reference/components.md)
- [🔄 Model Switching Best Practices](../features/model-switching.md)
- [💰 Cost Optimization Guide](../features/cost-tracking.md)

---

**OpenRouter is now ready for production use! 🎯**