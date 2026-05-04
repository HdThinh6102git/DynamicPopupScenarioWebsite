const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to fetch dynamic config
app.get('/api/config', (req, res) => {
  const configPath = path.join(__dirname, 'config.json');
  
  // Explicitly prevent browser from caching this endpoint
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read config file.' });
    }
    try {
      const config = JSON.parse(data);
      res.json(config);
    } catch (parseError) {
      res.status(500).json({ error: 'Failed to parse config JSON.' });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
