import { SearchResponse } from '../../types/video';
import { ExtendedVideoResult, RESULTS_PER_PAGE } from './types';
import { videoStorage } from './storage';
import { ExtendedVideoResult as SearchResult } from './types';
import { DailymotionService } from '../dailymotion/dailymotionService';

const dailymotion = new DailymotionService(process.env.DAILYMOTION_API_KEY);

export const searchTelegramVideos = async (
  query: string,
  source?: 'telegram' | 'dailymotion',
  page?: number,
  pageToken?: string
): Promise<SearchResponse> => {
  if (source === 'dailymotion' || !source) {
    try {
      return await dailymotion.searchVideos(query, page || 1);
    } catch (error) {
      console.error('Dailymotion search failed:', error);
      if (source === 'dailymotion') {
        throw error;
      }
      // If source wasn't specified, continue with telegram search
    }
  }

  try {
    const offset = pageToken ? parseInt(pageToken) : 0;
    
    // Search in our video storage
    const allVideos = Array.from(videoStorage.values())
      .sort((a, b) => b.timestamp - a.timestamp); // Most recent first

    // Filter videos by query
    const filteredVideos = query
      ? allVideos.filter(video => 
          video.title.toLowerCase().includes(query.toLowerCase()) ||
          (video.description?.toLowerCase().includes(query.toLowerCase())) ||
          (video.genre?.toLowerCase() === query.toLowerCase())
      )
      : allVideos;

    // Paginate results
    const paginatedVideos = filteredVideos.slice(
      offset,
      offset + RESULTS_PER_PAGE
    );

    // Convert to VideoResult format with additional fields
    const results = paginatedVideos.map(video => ({
      id: video.id,
      title: video.title,
      duration: video.duration,
      source: video.source,
      thumbnail: video.thumbnail,
      url: video.url,
      description: video.description,
      genre: video.genre
    } as ExtendedVideoResult));

    return {
      results,
      hasMore: offset + RESULTS_PER_PAGE < filteredVideos.length,
      nextPageToken: (offset + RESULTS_PER_PAGE).toString()
    };
  } catch (error) {
    console.error('Error searching Telegram videos:', error);
    return {
      results: [],
      hasMore: false,
      nextPageToken: ''
    };
  }
};
