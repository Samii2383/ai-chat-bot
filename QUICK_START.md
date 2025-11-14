# Quick Start Guide

## 🚀 Deploy in 3 Steps

### 1. Push to GitHub
```bash
cd ai-chatbot
git init
git add .
git commit -m "Initial commit: AI Chatbot"
git remote add origin https://github.com/YOUR_USERNAME/ai-chatbot.git
git push -u origin main
```

### 2. Deploy to Vercel
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Set environment variables:
  - `GROQ_API_KEY` = your Groq API key
  - `NODE_ENV` = production
- Click "Deploy"

### 3. Update API URL
After deployment, add:
- `REACT_APP_API_URL` = `https://your-app.vercel.app/api`
- Redeploy

## 📋 Before Pushing

✅ Check `.gitignore` includes `.env` files
✅ Verify no `.env` files are committed
✅ Only `env.example` files should be in repo

## 🔐 Security

- Never commit `.env` files
- Use Vercel environment variables
- Keep API keys secret

## 📚 Full Documentation

- `README.md` - Complete project documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `GIT_SETUP.md` - Git and GitHub setup

---

**Ready to deploy!** 🎉

