// Vercel serverless function - catch-all route for all API endpoints
const app = require('../server/server.js');

module.exports = (req, res) => {
  // Vercel passes the full path including /api
  // Express app already has routes defined with /api prefix
  // So we can pass the request directly
  app(req, res);
};

