import { Router } from 'express';
// import { DailymotionService } from '../services/dailymotion/dailymotionService';
// import { searchTelegramVideos } from '../services/telegram/search';
import { VideoSource } from '../types/video';

const router = Router();
// const dailymotion = new DailymotionService();

router.get('/search', async (req, res) => {
  const query = req.query.query as string;
  const sourceParam = req.query.source as string;
  const pageToken = req.query.pageToken as string | undefined;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  // Validate source parameter
  if (!sourceParam || !['dailymotion', 'telegram', 'youtube'].includes(sourceParam)) {
    return res.status(400).json({ error: 'Invalid source' });
  }

  const source = sourceParam as VideoSource; // Now we know it's a valid VideoSource

  try {
    let response;

    switch (source) {
      // case 'dailymotion':
      //   const page = pageToken ? parseInt(pageToken) : 1;
      //   response = await dailymotion.searchVideos(query, page);
      //   break;

      // case 'telegram':
      //   response = await searchTelegramVideos(query, 'telegram', undefined, pageToken);
      //   break;

      case 'youtube':
        // Existing YouTube search logic
        response = { results: [], hasMore: false };
        break;

      default:
        return res.status(400).json({ error: 'Invalid source' });
    }

    res.json(response);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

export default router;
