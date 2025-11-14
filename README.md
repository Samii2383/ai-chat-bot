# AI Chatbot - Built by Sameer Khan

A modern, full-stack AI chatbot application with a beautiful ChatGPT-like interface, built with React and Express.js, powered by Groq's free LLM API.

![AI Chatbot](https://img.shields.io/badge/AI-Chatbot-blue) ![React](https://img.shields.io/badge/React-19.2.0-61DAFB) ![Express](https://img.shields.io/badge/Express-4.18.2-000000) ![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- 🤖 **AI-Powered Conversations** - Powered by Groq's free LLM API (Llama 3.1)
- 💬 **ChatGPT-like Interface** - Beautiful, modern UI with smooth animations
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- 🎙️ **Speech-to-Text** - Convert your voice to text using Web Speech API
- 📷 **Camera Integration** - Take photos directly from your device camera
- 🎤 **Audio Recording** - Record and send audio messages
- 📎 **File Attachments** - Upload images, audio, video, and documents
- ✏️ **Edit Messages** - Edit your sent messages and regenerate AI responses
- 📋 **Copy Messages** - Copy any message to clipboard with one click
- 💾 **Chat History** - Persistent chat history with localStorage
- 🗑️ **Delete Chats** - Delete individual chats or clear all history
- 🌙 **Dark Theme** - Beautiful dark mode interface

## 🚀 Live Demo

[View Live Demo on Vercel](https://your-project.vercel.app)

**Note**: Replace with your actual Vercel deployment URL after deployment.

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Groq API Key (Free) - Get it from [Groq Console](https://console.groq.com/keys)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-chatbot.git
   cd ai-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   Or install manually:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

3. **Set up environment variables**

   **Server** (`server/.env`):
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   PORT=5000
   NODE_ENV=development
   ```

   **Client** (`client/.env`):
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - Frontend on `http://localhost:3000`

## 📁 Project Structure

```
ai-chatbot/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source files
│   │   ├── App.js         # Main app component
│   │   └── ChatUI.jsx     # Chat UI component
│   ├── package.json
│   └── .env               # Client environment variables
├── server/                 # Express backend
│   ├── server.js          # Main server file
│   ├── package.json
│   └── .env               # Server environment variables
├── package.json           # Root package.json
├── vercel.json            # Vercel deployment config
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

#### Server (`server/.env`)
- `GROQ_API_KEY` - Your Groq API key (required)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment mode (development/production)

#### Client (`client/.env`)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)

## 🚀 Deployment

### Deploy to Vercel

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import project to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project:
     - **Root Directory**: `ai-chatbot`
     - **Framework Preset**: Other
     - **Build Command**: `cd client && npm run build`
     - **Output Directory**: `client/build`

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add the following:
     - `GROQ_API_KEY` - Your Groq API key
     - `REACT_APP_API_URL` - Your Vercel serverless function URL (will be set automatically)

4. **Deploy**
   - Vercel will automatically deploy your project
   - Your app will be live at `https://your-project.vercel.app`

### Manual Deployment

For manual deployment, you can use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## 🔐 Security

- **Never commit `.env` files** - They are already in `.gitignore`
- **Use environment variables** for all sensitive data
- **Keep your API keys secure** - Don't share them publicly
- **Rotate API keys** if they are accidentally exposed

## 📝 API Endpoints

### `POST /api/chat`
Send a message to the AI chatbot.

**Request:**
```json
{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Hello! I'm doing well, thank you for asking!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "Server is running!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🎨 Features in Detail

### Chat Interface
- Real-time message streaming
- Typing indicators
- Message timestamps
- Date dividers
- Smooth animations

### Message Actions
- **Edit**: Click ✏️ to edit your message
- **Copy**: Click 📋 to copy message text
- **Delete**: Hover over chat items to delete

### Media Support
- **Images**: Upload or capture photos
- **Audio**: Record or upload audio files
- **Video**: Upload video files
- **Documents**: Support for PDF, DOC, DOCX, TXT

### Chat Management
- Create new chats
- View chat history
- Delete individual chats
- Clear all chat history
- Persistent storage with localStorage

## 🛠️ Technologies Used

- **Frontend**: React 19.2.0, Axios
- **Backend**: Express.js, Node.js
- **AI**: Groq API (Llama 3.1)
- **File Upload**: Multer
- **Styling**: CSS3 with CSS Variables
- **Deployment**: Vercel

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Sameer Khan**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- [Groq](https://groq.com) for providing free LLM API access
- [React](https://reactjs.org) team for the amazing framework
- [Vercel](https://vercel.com) for seamless deployment

## 📞 Support

If you have any questions or issues, please open an issue on GitHub or contact the author.

## 🔄 Changelog

### Version 1.0.0
- Initial release
- ChatGPT-like UI
- Speech-to-text integration
- Camera capture
- File uploads
- Chat history management
- Message editing and copying

---

**Built with ❤️ by Sameer Khan**

