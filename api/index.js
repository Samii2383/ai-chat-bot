// Vercel serverless function wrapper for Express app
const app = require('../server/server.js');

// Export handler for Vercel serverless functions
module.exports = (req, res) => {
  // Vercel serverless functions don't need the /api prefix in the path
  // So we need to adjust the request path
  const originalUrl = req.url;
  req.url = `/api${originalUrl}`;
  
  // Handle the request with Express
  app(req, res);
};

