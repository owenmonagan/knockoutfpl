import { onRequest } from 'firebase-functions/v2/https';

/**
 * Simple HTTP proxy for FPL API
 * Proxies /api/fpl/* to fantasy.premierleague.com/api/*
 */
export const fplProxy = onRequest({ cors: true }, async (req, res) => {
  // Extract path after /api/fpl/
  const path = req.path.replace('/fplProxy', '').replace('/api/fpl/', '');
  const url = `https://fantasy.premierleague.com/api/${path}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('FPL proxy error:', error);
    res.status(500).json({ error: 'Proxy failed' });
  }
});
