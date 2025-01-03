import { Router } from 'express';
import { DailymotionAuth } from '../services/dailymotion/auth';

const router = Router();
const auth = new DailymotionAuth(
  process.env.DAILYMOTION_CLIENT_ID || '',
  process.env.DAILYMOTION_CLIENT_SECRET || '',
  process.env.DAILYMOTION_REDIRECT_URI || ''
);

// Initiate OAuth flow
router.get('/auth/dailymotion', (req, res) => {
  const authUrl = auth.getAuthorizationUrl();
  res.redirect(authUrl);
});

// OAuth callback endpoint
router.get('/auth/dailymotion/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  try {
    const token = await auth.handleCallback(code);
    // Store the token securely - you might want to save this in a database
    // and associate it with your application's state
    
    // For now, we'll just store it in an environment variable
    process.env.DAILYMOTION_ACCESS_TOKEN = token.access_token;
    
    res.json({ message: 'Authentication successful' });
  } catch (error) {
    console.error('Dailymotion callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

export default router;
