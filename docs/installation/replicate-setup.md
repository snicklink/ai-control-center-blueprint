# 🎨 Replicate Setup Guide

Replicate provides AI models for image generation, video creation, music synthesis, and more. Perfect for creative applications and multimodal AI.

## 🔑 Get Your API Token

### 1. Create Account
- Go to [replicate.com](https://replicate.com)
- Sign up with GitHub or email
- Verify your email address

### 2. Generate API Token
- Visit [replicate.com/account](https://replicate.com/account)
- Click "API tokens" 
- Create new token
- Copy the token (starts with `r8_...`)

### 3. Add Credits
- Replicate uses pay-per-use pricing
- Add credits for production use
- $10 minimum, credits don't expire

## 🛠️ Installation

### CLI Installation (Recommended)
```bash
# macOS
brew install replicate/tap/replicate

# Linux/Windows
pip install replicate

# Verify installation
replicate --version
```

### Backend Service
```bash
# Install dependencies
pip install flask flask-cors python-dotenv

# Or use our template
cd packages/backend-templates/python-replicate
pip install -r requirements.txt
```

### Environment Setup
```bash
# Add to .env file
REPLICATE_API_TOKEN=r8_your-actual-token-here
PORT=5005
```

### Start Service
```bash
python replicate_service.py
```

## 🎯 Available Models

### Image Generation ⭐

#### **Flux Schnell** (Recommended)
- **ID:** `black-forest-labs/flux-schnell`
- **Speed:** Very fast (2-5 seconds)
- **Quality:** Good
- **Cost:** $0.003 per image
- **Best for:** Real-time applications, prototyping

#### **Flux Dev**
- **ID:** `black-forest-labs/flux-dev`
- **Speed:** Medium (10-30 seconds)
- **Quality:** High
- **Cost:** $0.055 per image
- **Best for:** Production quality images

#### **Stable Diffusion XL**
- **ID:** `stability-ai/sdxl`
- **Speed:** Medium (5-15 seconds)
- **Quality:** High
- **Cost:** $0.004 per image
- **Best for:** Reliable, consistent results

#### **Ideogram V2**
- **ID:** `ideogram-ai/ideogram-v2`
- **Speed:** Medium (10-20 seconds)
- **Quality:** High
- **Cost:** $0.08 per image
- **Best for:** Text in images, logos

### Video Generation 🎬

#### **Luma Dream Machine**
- **ID:** `luma/dream-machine`
- **Speed:** Medium (2-5 minutes)
- **Quality:** High
- **Cost:** $0.12 per 5-second video
- **Best for:** Short promotional videos

#### **Runway Gen-3**
- **ID:** `runway/gen-3-alpha`
- **Speed:** Slow (5-10 minutes)
- **Quality:** Very High
- **Cost:** $0.50 per 10-second video
- **Best for:** Professional video content

### Music Generation 🎵

#### **MusicGen**
- **ID:** `meta/musicgen`
- **Speed:** Fast (10-30 seconds)
- **Quality:** Good
- **Cost:** $0.005 per 8-second clip
- **Best for:** Background music, loops

#### **Bark** 
- **ID:** `suno-ai/bark`
- **Speed:** Fast (5-15 seconds)
- **Quality:** Good
- **Cost:** $0.01 per generation
- **Best for:** Voice synthesis, sound effects

## 🧪 Test Your Setup

### 1. Health Check
```bash
curl http://localhost:5005/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "replicate-ai-service",
  "current_models": {
    "image": "black-forest-labs/flux-schnell",
    "video": "luma/dream-machine",
    "music": "meta/musicgen"
  }
}
```

### 2. Generate Image
```bash
curl -X POST http://localhost:5005/generate/image \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "model": "black-forest-labs/flux-schnell"
  }'
```

### 3. Test CLI Directly
```bash
export REPLICATE_API_TOKEN=r8_your-token-here

replicate run black-forest-labs/flux-schnell \
  prompt="A cute robot in a garden"
```

## ⚙️ API Endpoints

### Image Generation
```bash
POST /generate/image
{
  "prompt": "Your image description",
  "model": "black-forest-labs/flux-schnell",
  "aspect_ratio": "1:1",           # Optional
  "output_format": "webp",         # Optional
  "output_quality": 80             # Optional
}
```

### Video Generation
```bash
POST /generate/video
{
  "prompt": "Your video description",
  "model": "luma/dream-machine",
  "aspect_ratio": "16:9",          # Optional
  "loop": false                    # Optional
}
```

### Music Generation
```bash
POST /generate/music
{
  "prompt": "Upbeat electronic music",
  "model": "meta/musicgen",
  "duration": 8,                   # Optional (seconds)
  "model_version": "large"         # Optional
}
```

### Model Switching
```bash
POST /switch_model
{
  "type": "image",                 # image, video, music
  "model_id": "stability-ai/sdxl"
}
```

## 💰 Cost Management

### Model Pricing
| Model | Cost | Speed | Quality |
|-------|------|-------|---------|
| Flux Schnell | $0.003 | ⚡⚡⚡ | ⭐⭐⭐ |
| Flux Dev | $0.055 | ⚡⚡ | ⭐⭐⭐⭐ |
| SDXL | $0.004 | ⚡⚡ | ⭐⭐⭐⭐ |
| Luma Video | $0.12 | ⚡ | ⭐⭐⭐⭐ |
| MusicGen | $0.005 | ⚡⚡⚡ | ⭐⭐⭐ |

### Cost Tracking
```bash
# Get current costs
curl http://localhost:5005/costs

# Response includes breakdowns
{
  "session_cost": 0.045,
  "daily_cost": 0.234,
  "image_requests": 15,
  "video_requests": 2,
  "music_requests": 5
}
```

## 🔄 Model Parameters

### Image Models

#### Flux Schnell/Dev
```json
{
  "prompt": "Your description",
  "aspect_ratio": "1:1",        # 1:1, 16:9, 3:4, etc.
  "output_format": "webp",      # webp, jpg, png
  "output_quality": 80,         # 1-100
  "seed": 12345                 # Optional for reproducibility
}
```

#### SDXL
```json
{
  "prompt": "Your description",
  "width": 1024,               # Image width
  "height": 1024,              # Image height  
  "num_inference_steps": 20,   # Quality vs speed
  "guidance_scale": 7.5,       # Prompt adherence
  "negative_prompt": "blurry"  # What to avoid
}
```

### Video Models

#### Luma Dream Machine
```json
{
  "prompt": "Your video description",
  "aspect_ratio": "16:9",      # 16:9, 1:1, 9:16
  "loop": false,               # Create looping video
  "keyframes": {               # Optional keyframe control
    "frame0": "Starting scene",
    "frame1": "Ending scene"
  }
}
```

### Music Models

#### MusicGen
```json
{
  "text": "Your music description",
  "model_version": "large",    # small, medium, large
  "duration": 8,               # Seconds (max 30)
  "top_k": 250,               # Sampling parameter
  "top_p": 0.0                # Nucleus sampling
}
```

## 📊 Best Practices

### Image Generation
```python
# Optimize for speed
fast_params = {
    "model": "black-forest-labs/flux-schnell",
    "output_format": "webp",
    "output_quality": 70
}

# Optimize for quality  
quality_params = {
    "model": "black-forest-labs/flux-dev",
    "output_format": "png",
    "num_inference_steps": 28
}
```

### Prompt Engineering
```python
# Good image prompts
"A photorealistic portrait of a person, studio lighting, professional photography"
"Digital art of a futuristic city, neon lights, cyberpunk style, high detail"
"Minimalist logo design, clean lines, modern typography, white background"

# Good video prompts
"A time-lapse of clouds moving over a mountain landscape"
"Close-up of hands crafting pottery, warm lighting, artistic shot"
"Animated logo reveal with particle effects"

# Good music prompts
"Upbeat electronic dance music with synthesizers"
"Calm acoustic guitar melody, folk style"
"Epic orchestral soundtrack, cinematic, dramatic"
```

### Batch Processing
```python
# Generate multiple images efficiently
prompts = [
    "A red sports car",
    "A blue bicycle", 
    "A green motorcycle"
]

for i, prompt in enumerate(prompts):
    result = generate_image(prompt, seed=1000+i)
    save_image(result, f"vehicle_{i}.png")
```

## 🛡️ Security & Rate Limiting

### API Token Security
```bash
# Never commit tokens to git
echo ".env" >> .gitignore

# Use environment variables
export REPLICATE_API_TOKEN=r8_...

# Monitor usage on Replicate dashboard
```

### Rate Limiting
```python
import time
from functools import wraps

def rate_limit(calls_per_minute=60):
    def decorator(func):
        last_called = [0.0]
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            elapsed = time.time() - last_called[0]
            left_to_wait = 60.0 / calls_per_minute - elapsed
            if left_to_wait > 0:
                time.sleep(left_to_wait)
            ret = func(*args, **kwargs)
            last_called[0] = time.time()
            return ret
        return wrapper
    return decorator

@rate_limit(calls_per_minute=30)
def generate_image(prompt):
    # Your generation logic
```

## ⚠️ Troubleshooting

### Common Issues

**Authentication Error**
```bash
# Check token format
echo $REPLICATE_API_TOKEN | grep "r8_"

# Test token directly
curl -H "Authorization: Token $REPLICATE_API_TOKEN" \
  https://api.replicate.com/v1/models
```

**Generation Timeout**
```bash
# Check model status
replicate run black-forest-labs/flux-schnell \
  prompt="test" --no-wait

# Monitor prediction
replicate predictions list
```

**High Costs**
```bash
# Switch to cheaper models
curl -X POST http://localhost:5005/switch_model \
  -d '{"type": "image", "model_id": "black-forest-labs/flux-schnell"}'

# Monitor spending
curl http://localhost:5005/costs
```

**Poor Results**
- Improve prompt descriptions
- Try different models for your use case
- Adjust model parameters
- Use negative prompts for images

## 📈 Advanced Features

### Webhooks
```python
# Set up webhooks for long-running generations
@app.route('/webhook', methods=['POST'])
def handle_webhook():
    data = request.json
    if data['status'] == 'succeeded':
        # Process completed generation
        save_result(data['output'])
    return 'OK'
```

### Custom Models
```python
# Train custom models on Replicate
# See: https://replicate.com/docs/guides/fine-tuning

# Use custom model
custom_model = "your-username/your-custom-model"
result = generate_image(prompt, model=custom_model)
```

### Batch API
```python
# Process multiple requests efficiently
import asyncio

async def batch_generate(prompts):
    tasks = [generate_image_async(prompt) for prompt in prompts]
    results = await asyncio.gather(*tasks)
    return results
```

## 🚀 Next Steps

- [🔧 Backend Integration Guide](../api-reference/backend.md)
- [🎨 Frontend Component Guide](../api-reference/components.md)
- [💰 Cost Optimization Guide](../features/cost-tracking.md)
- [🎪 Creative Examples](../examples/creative-applications.md)

---

**Replicate is now ready for creative AI generation! 🎨**