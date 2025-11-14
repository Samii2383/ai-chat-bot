const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const multer = require('multer');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Groq Free LLM Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'gsk_your_free_key_here';

// Configure multer for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images, audio, video, and common document types
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp3|wav|ogg|mp4|webm|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, audio, video, and documents are allowed.'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Smart fallback response function
function getSmartResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // PM of India questions
  if (lowerMessage.includes('pm of india') || lowerMessage.includes('prime minister of india') || lowerMessage.includes('who is pm')) {
    return "The Prime Minister of India is Narendra Modi. He has been serving as the PM since 2014 and was re-elected in 2019.";
  }
  
  // Karnataka questions
  if (lowerMessage.includes('karnataka') || lowerMessage.includes('bangalore') || lowerMessage.includes('bengaluru')) {
    return "Karnataka is a state in southern India. Its capital is Bengaluru (formerly Bangalore). It's known for its IT industry, rich culture, and historical sites like Hampi. The state is famous for its cuisine, classical dance forms, and the Kannada language.";
  }
  
  // General greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm an AI chatbot. How can I help you today?";
  }
  
  // How are you questions
  if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you do')) {
    return "I'm doing well, thank you for asking! I'm here to help you with any questions you might have.";
  }
  
  // What are you questions
  if (lowerMessage.includes('what are you') || lowerMessage.includes('who are you')) {
    return "I'm an AI chatbot designed to help answer questions and have conversations. I can provide information on various topics!";
  }
  
  // Default responses based on question type
  if (lowerMessage.includes('what') || lowerMessage.includes('tell me about')) {
    return "I'd be happy to help you with that question! However, I'm currently using a fallback system. Could you be more specific about what you'd like to know?";
  }
  
  if (lowerMessage.includes('who')) {
    return "I can help with information about people! Could you tell me more specifically who you're asking about?";
  }
  
  if (lowerMessage.includes('when')) {
    return "I can help with information about dates and times! What specific event or time period are you asking about?";
  }
  
  if (lowerMessage.includes('where')) {
    return "I can help with information about places! What location are you asking about?";
  }
  
  // Default response
  return "Thanks for your message! I'm here to help. Could you tell me more about what you'd like to know?";
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', upload.any(), async (req, res) => {
  let message = req.body.message || '';
  const files = req.files || [];

  // Validate input - allow empty message if files are attached
  if (!message && files.length === 0) {
    return res.status(400).json({ 
      error: 'Message or file attachment is required' 
    });
  }

  // Process files if any
  const fileInfo = files.map((file, idx) => ({
    name: file.originalname,
    type: req.body[`attachment_${idx}_type`] || file.mimetype,
    size: file.size
  }));

  try {

    // Call Groq Free LLM API
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.1-8b-instant", // Groq model
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant. Provide accurate, helpful, and detailed responses to user questions. Be conversational and engaging."
          },
          {
            role: "user",
            content: message.trim() + (fileInfo.length > 0 ? `\n[User attached ${fileInfo.length} file(s): ${fileInfo.map(f => f.name).join(', ')}]` : '')
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract the AI response
    let aiResponse = '';
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      aiResponse = response.data.choices[0].message.content || 'I understand your message, but I need a moment to process it properly.';
    } else {
      aiResponse = 'Hello! I received your message. How can I help you today?';
    }

    // Return the AI response
    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calling Groq API:', error);
    console.error('Error response:', error.response?.data);
    
    const errorData = error.response?.data?.error;
    const errorCode = errorData?.code;
    const errorMessage = errorData?.message || '';
    
    // Handle specific API errors
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid Groq API key. Please check your configuration.' 
      });
    }
    
    // Handle quota/rate limit errors (429)
    if (error.response?.status === 429) {
      const smartFallback = getSmartResponse(message);
      console.warn('⚠️  Rate limit exceeded - using fallback response');
      return res.json({
        success: true,
        response: smartFallback,
        timestamp: new Date().toISOString(),
        note: 'Rate limit reached - using fallback response. Please try again in a moment for AI-powered responses.'
      });
    }

    if (error.response?.status === 400) {
      console.error('Bad Request - Model might not be available:', error.response.data);
    }

    // If API fails, provide a smart fallback response
    const smartFallback = getSmartResponse(message);
    
    res.json({
      success: true,
      response: smartFallback,
      timestamp: new Date().toISOString(),
      note: 'Using fallback response due to API unavailability'
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server only if not in serverless environment (Vercel)
if (process.env.VERCEL !== '1' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 AI Chatbot Server running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`🤖 Using FREE Groq LLM API!`);
    
    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'gsk_your_free_key_here') {
      console.warn('⚠️  WARNING: GROQ_API_KEY not configured');
      console.warn('   The chatbot will use fallback responses without a token');
      console.warn('   Get your FREE token at: https://console.groq.com/keys');
    } else {
      console.log('✅ Groq API key configured - AI responses enabled!');
    }
  });
}

module.exports = app;
