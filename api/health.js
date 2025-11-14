// Vercel serverless function for /api/health endpoint
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  res.json({ 
    status: 'Server is running!', 
    timestamp: new Date().toISOString() 
  });
};

