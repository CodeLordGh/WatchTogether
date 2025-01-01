import { VideoSource, SearchResponse } from '../../types/video';
import { searchYoutubeVideos } from '../youtube/youtubeService';
import { searchTelegramVideos } from '../telegram/telegramService';

export const searchVideos = async (
  query: string,
  source: VideoSource,
  pageToken?: string
): Promise<SearchResponse> => {
  switch (source) {
    case 'youtube':
      return searchYoutubeVideos(query, pageToken);
    case 'telegram':
      return searchTelegramVideos(query, pageToken);
    default:
      throw new Error(`Unsupported video source: ${source}`);
  }
};
