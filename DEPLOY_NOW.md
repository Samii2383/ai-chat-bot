# Quick Deployment Guide

## 🚀 Deploy to Vercel & Push to GitHub

### Step 1: Initialize Git (if not done)

```bash
cd ai-chatbot
git init
```

### Step 2: Verify No API Keys in Code

✅ **IMPORTANT**: Make sure no `.env` files are committed!

```bash
# Check what will be committed
git status

# Verify no .env files are listed
git ls-files | grep .env
# Should only show: env.example files (not .env files)
```

### Step 3: Add All Files

```bash
git add .
```

### Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: AI Chatbot with full features

Features:
- ChatGPT-like UI
- Speech-to-text
- Camera capture
- File uploads
- Chat history
- Message editing
- Built by Sameer Khan"
```

### Step 5: Add GitHub Remote

**Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
```

### Step 6: Push to GitHub

```bash
git push -u origin main
```

### Step 7: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository
5. Click **"Import"**

6. **Configure Project:**
   - **Root Directory**: Leave as is (or set to `ai-chatbot` if needed)
   - **Framework Preset**: Other
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm install && cd server && npm install && cd ../client && npm install`

7. **Add Environment Variables:**
   Click "Environment Variables" and add:
   - **Name**: `GROQ_API_KEY`
   - **Value**: Your actual Groq API key (get from https://console.groq.com/keys)
   - **Environment**: Production, Preview, Development (check all)
   
   - **Name**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Production, Preview, Development (check all)

   **Note**: Do NOT add `REACT_APP_API_URL` - it will be automatically set to `/api`

8. Click **"Deploy"**

9. Wait for deployment to complete

10. **Your app is live!** 🎉

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd ai-chatbot
vercel

# Add environment variables
vercel env add GROQ_API_KEY
# Paste your API key when prompted

vercel env add NODE_ENV
# Enter: production

# Deploy to production
vercel --prod
```

### Step 8: Verify Deployment

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Test the chatbot
3. Check browser console for any errors

## 🔐 Security Checklist

- [x] ✅ No `.env` files in repository
- [x] ✅ `.gitignore` properly configured
- [x] ✅ Only `env.example` files committed
- [x] ✅ API keys set in Vercel environment variables (NOT in code)
- [x] ✅ API URL automatically detects production environment

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version (18.x)

### API Not Working
- Check environment variables in Vercel dashboard
- Verify `GROQ_API_KEY` is set correctly
- Check server logs in Vercel

### CORS Issues
- Already handled in `server.js` with CORS middleware

## 📝 Notes

- **API Keys**: Never commit `.env` files. Always use Vercel environment variables.
- **API URL**: Automatically uses `/api` in production (same domain)
- **Updates**: Push to GitHub and Vercel will auto-deploy

---

**Ready to deploy!** 🚀

