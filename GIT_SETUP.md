# Git Setup and Push to GitHub

Follow these steps to push your code to GitHub:

## Step 1: Check if Git is initialized

```bash
cd ai-chatbot
git status
```

If you see "not a git repository", initialize it:

```bash
git init
```

## Step 2: Verify .env files are not tracked

```bash
# Check if any .env files are being tracked
git ls-files | grep .env

# If any .env files are listed, remove them from tracking
git rm --cached server/.env
git rm --cached client/.env
```

## Step 3: Add all files

```bash
git add .
```

## Step 4: Check what will be committed

```bash
git status
```

**IMPORTANT**: Make sure NO `.env` files are listed! Only `env.example` files should be committed.

## Step 5: Create initial commit

```bash
git commit -m "Initial commit: AI Chatbot with full features

- ChatGPT-like UI with dark theme
- Speech-to-text integration
- Camera capture functionality
- File uploads (images, audio, video, documents)
- Chat history management
- Message editing and copying
- Delete individual/all chats
- Built by Sameer Khan"
```

## Step 6: Create GitHub repository

1. Go to https://github.com/new
2. Repository name: `ai-chatbot` (or your preferred name)
3. Description: "AI Chatbot with React and Express, powered by Groq LLM"
4. Choose Public or Private
5. **DO NOT** check "Initialize with README" (we already have one)
6. Click "Create repository"

## Step 7: Connect and push

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-chatbot.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 8: Verify

1. Go to your GitHub repository
2. Check that:
   - ✅ README.md is present
   - ✅ No `.env` files are visible
   - ✅ `env.example` files are present
   - ✅ All source code is there

## Troubleshooting

### If you get "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/ai-chatbot.git
```

### If you need to update .gitignore
```bash
# After updating .gitignore
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```

### If you accidentally committed .env files
```bash
# Remove from git (but keep local file)
git rm --cached server/.env
git rm --cached client/.env

# Commit the removal
git commit -m "Remove .env files from repository"

# Push the fix
git push
```

---

**Next Step**: Follow `DEPLOYMENT.md` to deploy to Vercel!

