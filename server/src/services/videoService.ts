import { Telegraf } from 'telegraf';
import { google, youtube_v3 } from 'googleapis';
import { VideoResult, VideoSource, SearchResponse } from '../types/video';

export class VideoService {
  private telegramBot: Telegraf;
  private youtube: youtube_v3.Youtube;
  private readonly RESULTS_PER_PAGE = 5;
  private readonly TARGET_CHANNEL = 'HD_ACTIONMOVIES';

  constructor() {
    // Initialize Telegram bot
    this.telegramBot = new Telegraf('7231407597:AAGmTfN2BB9b66pZKfFzmMEc7xSS76id0lc');
    
    // Initialize YouTube API
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
  }

  async searchVideos(query: string, source: VideoSource, pageToken?: string): Promise<SearchResponse> {
    return source === 'telegram' 
      ? undefined as any // this.searchTelegramVideos(query, pageToken)
      : this.searchYoutubeVideos(query, pageToken);
  }

  // private async searchTelegramVideos(query: string, pageToken?: string): Promise<SearchResponse> {
  //   try {
  //     if (!process.env.TELEGRAM_BOT_TOKEN) {
  //       throw new Error('Telegram bot token is not configured');
  //     }

  //     // First try searching in the target channel
  //     let results = await this.searchTelegramChannel(this.TARGET_CHANNEL, query, pageToken);
      
  //     // If no results found, search in public domain
  //     if (results.results.length === 0) {
  //       results = await this.searchTelegramPublic(query, pageToken);
  //     }

  //     return results;
  //   } catch (error) {
  //     console.error('Error searching Telegram videos:', error);
  //     throw new Error(error instanceof Error ? error.message : 'Failed to search Telegram videos');
  //   }
  // }

  // private async searchTelegramChannel(channelUsername: string, query: string, pageToken?: string): Promise<SearchResponse> {
  //   try {
  //     const offset = pageToken ? parseInt(pageToken) : 0;
  //     const messages = await this.telegramBot.telegram.searchMessages(channelUsername, {
  //       query,
  //       limit: this.RESULTS_PER_PAGE,
  //       offset: offset,
  //       filter: 'video'
  //     });

  //     if (!messages || !Array.isArray(messages)) {
  //       return { results: [], hasMore: false };
  //     }

  //     const results: VideoResult[] = messages
  //       .filter(msg => msg.video)
  //       .map(msg => ({
  //         id: msg.message_id.toString(),
  //         title: msg.caption || 'Untitled Video',
  //         duration: msg.video?.duration ? `${msg.video.duration}s` : '',
  //         source: 'telegram' as const,
  //         thumbnail: msg.video?.thumb?.file_id,
  //         url: `https://t.me/${channelUsername}/${msg.message_id}`
  //       }));

  //     return {
  //       results,
  //       hasMore: messages.length === this.RESULTS_PER_PAGE,
  //       nextPageToken: (offset + this.RESULTS_PER_PAGE).toString()
  //     };
  //   } catch (error) {
  //     console.error('Error searching Telegram channel:', error);
  //     throw new Error('Failed to search Telegram channel');
  //   }
  // }

  // private async searchTelegramPublic(query: string, pageToken?: string): Promise<SearchResponse> {
  //   try {
  //     const offset = pageToken ? parseInt(pageToken) : 0;
  //     const messages = await this.telegramBot.telegram.searchGlobal({
  //       query,
  //       limit: this.RESULTS_PER_PAGE,
  //       offset: offset,
  //       filter: 'video'
  //     });

  //     if (!messages || !Array.isArray(messages)) {
  //       return { results: [], hasMore: false };
  //     }

  //     const results: VideoResult[] = messages
  //       .filter(msg => msg.video)
  //       .map(msg => ({
  //         id: `${msg.chat.id}_${msg.message_id}`,
  //         title: msg.caption || 'Untitled Video',
  //         duration: msg.video?.duration ? `${msg.video.duration}s` : '',
  //         source: 'telegram' as const,
  //         thumbnail: msg.video?.thumb?.file_id,
  //         url: msg.chat.username 
  //           ? `https://t.me/${msg.chat.username}/${msg.message_id}`
  //           : `https://t.me/c/${msg.chat.id}/${msg.message_id}`
  //       }));

  //     return {
  //       results,
  //       hasMore: messages.length === this.RESULTS_PER_PAGE,
  //       nextPageToken: (offset + this.RESULTS_PER_PAGE).toString()
  //     };
  //   } catch (error) {
  //     console.error('Error searching Telegram public:', error);
  //     throw new Error('Failed to search Telegram public messages');
  //   }
  // }

  private async searchYoutubeVideos(query: string, pageToken?: string): Promise<SearchResponse> {
    try {
      if (!process.env.YOUTUBE_API_KEY) {
        throw new Error('YouTube API key is not configured');
      }

      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: query + ' full movie',
        type: ['video'],
        videoType: 'movie',
        maxResults: this.RESULTS_PER_PAGE,
        pageToken: pageToken,
      });

      if (!searchResponse.data.items) {
        return { results: [], hasMore: false };
      }

      const videoIds = searchResponse.data.items
        .map(item => item.id?.videoId)
        .filter((id): id is string => !!id);

      if (videoIds.length === 0) {
        return { results: [], hasMore: false };
      }

      const videoDetails = await this.youtube.videos.list({
        part: ['contentDetails', 'snippet'],
        id: videoIds
      });

      const results: VideoResult[] = (videoDetails.data.items || []).map(video => {
        const thumbnail = video.snippet?.thumbnails?.medium?.url || undefined;
        return {
          id: video.id || '',
          title: video.snippet?.title || '',
          duration: video.contentDetails?.duration || '',
          source: 'youtube' as const,
          ...(thumbnail && { thumbnail }),
          url: `https://www.youtube.com/watch?v=${video.id}`
        };
      });

      return {
        results,
        hasMore: !!searchResponse.data.nextPageToken,
        nextPageToken: searchResponse.data.nextPageToken || undefined
      };
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search YouTube videos');
    }
  }
}
