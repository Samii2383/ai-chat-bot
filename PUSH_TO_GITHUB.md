# Push to GitHub - Step by Step

## Quick Commands (Copy & Paste)

**Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub repository details:**

```bash
# Navigate to project
cd ai-chatbot

# Initialize git (if not already done)
git init

# Check what will be committed (VERIFY NO .env FILES!)
git status

# Add all files
git add .

# Create commit
git commit -m "Initial commit: AI Chatbot with full features

Features:
- ChatGPT-like UI with dark theme
- Speech-to-text integration
- Camera capture functionality
- File uploads (images, audio, video, documents)
- Chat history management
- Message editing and copying
- Delete individual/all chats
- Built by Sameer Khan"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

## Detailed Steps

### 1. Verify Security First

```bash
# Run security check (optional)
node check-security.js

# Verify no .env files will be committed
git ls-files | grep "\.env$"
# Should return nothing (or only env.example files)
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `ai-chatbot` (or your preferred name)
3. Description: "AI Chatbot with React and Express, powered by Groq LLM"
4. Choose **Public** or **Private**
5. **DO NOT** check "Initialize with README" (we already have one)
6. Click **"Create repository"**

### 3. Copy Repository URL

After creating the repo, GitHub will show you the URL. It will look like:
```
https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### 4. Run the Commands Above

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` in the commands with your actual values.

### 5. Verify Push

1. Go to your GitHub repository
2. Check that:
   - ✅ All files are there
   - ✅ No `.env` files are visible
   - ✅ `env.example` files are present
   - ✅ README.md is there

## Troubleshooting

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### "fatal: not a git repository"
```bash
git init
```

### Authentication Issues
```bash
# Use GitHub CLI or set up SSH keys
# Or use GitHub Desktop app
```

---

**After pushing, follow `DEPLOY_NOW.md` to deploy to Vercel!**

