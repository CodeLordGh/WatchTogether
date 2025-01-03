import { Request, Response } from 'express';
import { VideoSource } from '../types/video';
import { searchVideos } from '../services/search/searchService';

export const searchVideosHandler = async (req: Request, res: Response) => {
  try {
    const { query, source, pageToken } = req.query;

    if (!query || !source) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    if (source !== 'youtube' && source !== 'telegram' && source !== 'dailymotion') {
      return res.status(400).json({ error: 'Invalid source' });
    }

    const results = await searchVideos(
      query as string,
      source as VideoSource,
      pageToken as string | undefined
    );

    res.json(results);
  } catch (error) {
    console.error('Error in video search:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ error: errorMessage });
  }
};
