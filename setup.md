# Quick Setup Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
# Install all dependencies (root, server, and client)
npm run install-all
```

### Step 2: Configure OpenAI API Key
1. Copy the environment file:
   ```bash
   cd server
   copy env.example .env
   ```

2. Edit `server/.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_actual_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

### Step 3: Run the Application
```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend app on http://localhost:3000

### Step 4: Open Your Browser
Navigate to http://localhost:3000 and start chatting!

## 🔧 Alternative: Run Servers Separately

### Backend Only
```bash
cd server
npm run dev
```

### Frontend Only
```bash
cd client
npm start
```

## 🆘 Need Help?

1. **API Key Issues**: Make sure your OpenAI API key is valid and has credits
2. **Port Conflicts**: Change PORT in server/.env if 5000 is occupied
3. **CORS Errors**: Ensure backend is running before starting frontend
4. **Dependencies**: Run `npm run install-all` to install all packages

## 📝 Environment Variables

### Server (.env)
```env
OPENAI_API_KEY=sk-your-openai-api-key
PORT=5000
NODE_ENV=development
```

### Client (optional)
```env
REACT_APP_API_URL=http://localhost:5000
```

## 🎯 What's Next?

- Customize the AI personality in `server/server.js`
- Modify the UI theme in `client/tailwind.config.js`
- Add new features like file uploads or voice input
- Deploy to production using the deployment guide in README.md





