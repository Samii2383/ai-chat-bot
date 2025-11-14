// Vercel serverless function wrapper for Express app
const app = require('../server/server.js');

// Export handler for Vercel serverless functions
module.exports = (req, res) => {
  // Store original URL
  const originalUrl = req.url;
  const originalPath = req.path || originalUrl.split('?')[0];
  
  // Vercel routes /api/* to this function, so we need to reconstruct the path
  // If the path doesn't start with /api, add it
  if (!originalPath.startsWith('/api')) {
    req.url = `/api${originalPath}${req.url.includes('?') ? '?' + req.url.split('?')[1] : ''}`;
    req.path = `/api${originalPath}`;
  }
  
  // Handle the request with Express
  app(req, res);
};

