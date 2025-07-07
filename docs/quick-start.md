# 🚀 Quick Start Guide

Get your AI Control Center running in 5 minutes!

## ⚡ One-Command Setup

```bash
# Clone the blueprint
git clone https://github.com/willykramer/ai-control-center-blueprint.git
cd ai-control-center-blueprint

# Choose your example
cd examples/react-vite     # React + Vite
# OR
cd examples/nextjs         # Next.js
# OR 
cd examples/python-flask   # Python backend only

# Install and run
npm install && npm run dev
```

## 🔑 API Keys Setup

### 1. OpenRouter (LLM Models)
```bash
# Get key from: https://openrouter.ai/keys
export OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### 2. Replicate (Images/Video/Music)
```bash
# Get token from: https://replicate.com/account  
export REPLICATE_API_TOKEN=r8_your-token-here
```

### 3. Google Cloud (Text-to-Speech)
```bash
# Download service account JSON from Google Cloud Console
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

## 🎯 Basic Integration

### React Component
```tsx
import { AIControlCenter } from '@ai-blueprint/react-components';

function App() {
  const config = {
    openrouter: { apiKey: process.env.OPENROUTER_API_KEY },
    replicate: { apiToken: process.env.REPLICATE_API_TOKEN }
  };

  return (
    <div className="sidebar">
      <AIControlCenter config={config} />
    </div>
  );
}
```

### Backend Service
```python
# Start OpenRouter service
cd packages/backend-templates/python-openrouter
pip install -r requirements.txt
python openrouter_service.py

# Start Replicate service  
cd packages/backend-templates/python-replicate
pip install -r requirements.txt
python replicate_service.py
```

## 🎮 What You Get

✅ **Real-time cost tracking** across all AI services  
✅ **Dynamic model switching** with live updates  
✅ **Professional UI** with gradients and animations  
✅ **Production-ready backends** for OpenRouter and Replicate  
✅ **Complete documentation** and examples  

## 🔧 CLI Installation

```bash
# Install Replicate CLI (for image/video generation)
brew install replicate/tap/replicate
# OR
pip install replicate

# Install OpenAI SDK (for OpenRouter)
pip install openai

# Install Google Cloud SDK (optional)
brew install google-cloud-sdk
```

## 📊 Verify Installation

1. **Check services are running:**
   ```bash
   curl http://localhost:5004/health  # OpenRouter service
   curl http://localhost:5005/health  # Replicate service
   ```

2. **Test frontend:**
   ```bash
   npm run dev  # Should open http://localhost:3000
   ```

3. **Verify API keys:**
   - ✅ Cost tracking shows real data
   - ✅ Model switching works
   - ✅ No authentication errors in console

## 🎯 Next Steps

- [📖 Full Documentation](../README.md)
- [🔧 Installation Guide](./installation/)
- [🎨 Component API](./api-reference/components.md)
- [🔌 Backend Integration](./api-reference/backend.md)
- [🎪 More Examples](./examples/)

## ⚠️ Troubleshooting

### Common Issues

**Port already in use:**
```bash
lsof -ti:5004 | xargs kill -9  # Kill OpenRouter service
lsof -ti:5005 | xargs kill -9  # Kill Replicate service
```

**API key errors:**
```bash
# Check environment variables
echo $OPENROUTER_API_KEY
echo $REPLICATE_API_TOKEN

# Verify keys work
curl -H "Authorization: Bearer $OPENROUTER_API_KEY" https://openrouter.ai/api/v1/models
```

**Module not found:**
```bash
# Install missing dependencies
pip install -r requirements.txt
npm install
```

## 🤝 Need Help?

- 📖 [Full Documentation](../README.md)
- 🐛 [Report Issues](https://github.com/willykramer/ai-control-center-blueprint/issues)
- 💬 [Discussions](https://github.com/willykramer/ai-control-center-blueprint/discussions)

---

**Ready to build amazing AI applications! 🚀**