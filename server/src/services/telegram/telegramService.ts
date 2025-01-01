import { Telegraf } from 'telegraf';
import { SearchResponse, VideoResult } from '../../types/video';

const RESULTS_PER_PAGE = 5;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

const bot = new Telegraf(BOT_TOKEN);

export const searchTelegramVideos = async (
  query: string,
  pageToken?: string
): Promise<SearchResponse> => {
  try {
    const results = await searchInChannel(query, pageToken);
    return results.results.length > 0 ? results : await searchInPublic(query, pageToken);
  } catch (error) {
    console.error('Error searching Telegram videos:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to search Telegram videos');
  }
};

const searchInChannel = async (
  query: string,
  pageToken?: string
): Promise<SearchResponse> => {
  try {
    const offset = pageToken ? parseInt(pageToken) : 0;
    
    // Verify channel access
    const chat = await bot.telegram.getChat('@HD_ACTIONMOVIES');
    if (!chat) {
      throw new Error('Channel not found');
    }

    // Correct usage of getUpdates
    const updates = await bot.telegram.getUpdates(0, RESULTS_PER_PAGE, offset, ['message']);

    const videoMessages = updates
      .map(update => update.message)
      .filter((msg): msg is NonNullable<typeof msg> => msg?.video !== undefined);

    const results: VideoResult[] = videoMessages.map(msg => ({
      id: msg.message_id.toString(),
      title: msg.caption || 'Untitled Video',
      duration: msg.video?.duration ? `${msg.video.duration}s` : '',
      source: 'telegram' as const,
      thumbnail: msg.video?.thumb?.file_id,
      url: `https://t.me/HD_ACTIONMOVIES/${msg.message_id}`
    }));

    return {
      results,
      hasMore: videoMessages.length === RESULTS_PER_PAGE,
      nextPageToken: (offset + RESULTS_PER_PAGE).toString()
    };
  } catch (error) {
    console.error('Error searching Telegram channel:', error);
    throw new Error('Failed to search Telegram channel');
  }
};

const searchInPublic = async (
  query: string,
  pageToken?: string
): Promise<SearchResponse> => {
  try {
    const offset = pageToken ? parseInt(pageToken) : 0;
    
    // Correct usage of getUpdates
    const updates = await bot.telegram.getUpdates(0, RESULTS_PER_PAGE, offset, ['message']);

    const videoMessages = updates
      .map(update => update.message)
      .filter((msg): msg is NonNullable<typeof msg> => msg?.video !== undefined);

    const results: VideoResult[] = videoMessages.map(msg => ({
      id: `${msg.chat.id}_${msg.message_id}`,
      title: msg.caption || 'Untitled Video',
      duration: msg.video?.duration ? `${msg.video.duration}s` : '',
      source: 'telegram' as const,
      thumbnail: msg.video?.thumb?.file_id,
      url: msg.chat.username 
        ? `https://t.me/${msg.chat.username}/${msg.message_id}`
        : `https://t.me/c/${msg.chat.id}/${msg.message_id}`
    }));

    return {
      results,
      hasMore: videoMessages.length === RESULTS_PER_PAGE,
      nextPageToken: (offset + RESULTS_PER_PAGE).toString()
    };
  } catch (error) {
    console.error('Error searching Telegram public:', error);
    throw new Error('Failed to search Telegram public messages');
  }
};
