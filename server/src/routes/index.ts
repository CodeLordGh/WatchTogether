import { Router, static as expressStatic } from 'express';
import path from 'path';
import { searchVideosHandler } from '../controllers/videoController';

const router = Router();

// Health check endpoint for Render
router.get('/health', (_, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Basic health check endpoint
router.get('/api/health', (_, res) => {
  res.send("Hello");
});

// Video search endpoint
router.get('/videos/search', searchVideosHandler);

// Production static file serving
if (process.env.NODE_ENV === 'production') {
  router.use(expressStatic(path.join(__dirname, '../../dist')));
  router.get('*', (_, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

export default router;
