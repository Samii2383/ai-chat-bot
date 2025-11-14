// Simple test script to verify the server is working
const axios = require('axios');

const testServer = async () => {
  try {
    console.log('🧪 Testing AI Chatbot Server...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test chat endpoint (without OpenAI key for now)
    console.log('\n2. Testing chat endpoint...');
    try {
      const chatResponse = await axios.post('http://localhost:5000/api/chat', {
        message: 'Hello, this is a test message'
      });
      console.log('✅ Chat endpoint working:', chatResponse.data);
    } catch (error) {
      if (error.response?.status === 500 && error.response?.data?.error?.includes('OpenAI API key')) {
        console.log('⚠️  Chat endpoint working but OpenAI API key not configured');
        console.log('   This is expected if you haven\'t set up your API key yet');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 Server is working correctly!');
    console.log('   You can now start the frontend with: cd client && npm start');
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.log('\n💡 Make sure the server is running:');
    console.log('   cd server && npm run dev');
  }
};

// Run the test
testServer();





