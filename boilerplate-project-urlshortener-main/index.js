const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false })); // to parse URL-encoded bodies
app.use('/public', express.static(`${process.cwd()}/public`));

// Store URLs in memory (for demo purposes; consider using a database in production)
const urlDatabase = {};
let currentId = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// POST /api/shorturl endpoint
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  const urlObject = new URL(originalUrl);
  dns.lookup(urlObject.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const existingEntry = Object.entries(urlDatabase).find(([key, value]) => value === originalUrl);
    if (existingEntry) {
      return res.json({
        original_url: originalUrl,
        short_url: parseInt(existingEntry[0])
      });
    }

    urlDatabase[currentId] = originalUrl;
    const shortUrl = currentId;
    currentId++;

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;

  const shortUrlNum = parseInt(shortUrl);
  if (isNaN(shortUrlNum)) {
    return res.json({ error: 'Wrong format' });
  }

  if (urlDatabase[shortUrlNum]) {
    const originalUrl = urlDatabase[shortUrlNum];
    return res.redirect(originalUrl);
  } else {
    return res.json({ error: 'No short URL found for the given input' });
  }
});

// Start the server
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});