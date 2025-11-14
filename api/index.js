// Vercel serverless function wrapper for Express app
// This file allows Vercel to use the Express app as a serverless function
const app = require('../server/server.js');

// Export the Express app for Vercel
module.exports = app;

