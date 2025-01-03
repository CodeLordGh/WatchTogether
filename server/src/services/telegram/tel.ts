import { Telegraf, Context } from 'telegraf';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import { SearchResponse, VideoResult } from '../../types/video';

// Update VideoResult interface to include description
interface ExtendedVideoResult extends VideoResult {
  description?: string;
}

const RESULTS_PER_PAGE = 5;
const BOT_TOKEN = '7231407597:AAGmTfN2BB9b66pZKfFzmMEc7xSS76idOlc';

// Movie channels to monitor
const MOVIE_CHANNELS = [
  '@HD_ACTIONMOVIES',
  // Add more channels here
];

// In-memory storage for videos (replace with database in production)
interface StoredVideo {
  id: string;
  title: string;
  duration: string;
  source: 'telegram';
  thumbnail?: string;
  url: string;
  timestamp: number;
  description?: string;
  genre?: string;
}

const videoStorage = new Map<string, StoredVideo>();

const bot = new Telegraf(BOT_TOKEN);

// Initialize bot commands and handlers
bot.command('start', (ctx) => {
  ctx.reply(
    'Welcome to WatchTogether Movie Bot! 🎬\n\n' +
    'You can:\n' +
    '1. Search for movies by typing "@WatchTogetherMovieBot movie_name" in any chat\n' +
    '2. Use /search command followed by movie name\n' +
    '3. Browse our collection on watchtogether.com\n\n' +
    'We automatically index movies from popular Telegram channels!'
  );
});

bot.command('help', (ctx) => {
  ctx.reply(
    'Available commands:\n' +
    '/start - Show welcome message\n' +
    '/search <query> - Search for movies\n' +
    '/latest - Show latest added movies\n' +
    '/genres - Browse movies by genre\n' +
    '/help - Show this help message\n\n' +
    'Pro tip: You can also search inline by typing "@WatchTogetherMovieBot" in any chat!'
  );
});

// Handle inline queries for quick search
bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query;
  const results = await searchTelegramVideos(query);
  
  const inlineResults = results.results.map((video) => ({
    type: 'article' as const,
    id: video.id,
    title: video.title,
    description: (video as ExtendedVideoResult).description || 'Click to watch on WatchTogether',
    thumb_url: video.thumbnail,
    input_message_content: {
      message_text: `🎬 ${video.title}\n\nWatch now on WatchTogether: ${process.env.WEBSITE_URL}/watch/${video.id}`
    },
    reply_markup: {
      inline_keyboard: [[
        { text: '▶️ Watch Now', url: `${process.env.WEBSITE_URL}/watch/${video.id}` }
      ]]
    }
  }));

  await ctx.answerInlineQuery(inlineResults);
});

// Monitor new videos in channels
async function monitorChannels() {
  for (const channelUsername of MOVIE_CHANNELS) {
    try {
      const chat = await bot.telegram.getChat(channelUsername);
      console.log(`Monitoring channel: ${channelUsername}`);

      // Subscribe to new messages in the channel
      bot.on(['channel_post'], (ctx) => {
        if (!ctx.channelPost) return;
        
        const message = ctx.channelPost;
        if (message.chat.id !== chat.id) return;

        // Check if the message has a video
        const video = 'video' in message ? message.video : null;
        if (!video) return;

        const videoId = `video_${video.file_unique_id}`;
        
        // Only add if not already in storage
        if (!videoStorage.has(videoId)) {
          const caption = 'caption' in message ? message.caption : '';
          const storedVideo: StoredVideo = {
            id: videoId,
            title: caption || 'Untitled Movie',
            duration: `${video.duration}s`,
            source: 'telegram',
            thumbnail: video.file_id,
            url: `https://t.me/${channelUsername}/${message.message_id}`,
            timestamp: message.date * 1000,
            description: caption,
            genre: extractGenre(caption || '')
          };
          
          videoStorage.set(videoId, storedVideo);
          console.log(`Added new movie: ${storedVideo.title}`);
        }
      });

    } catch (error) {
      console.error(`Error monitoring channel ${channelUsername}:`, error);
    }
  }
}

// Extract genre from video caption
function extractGenre(caption: string): string {
  const commonGenres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Adventure'];
  for (const genre of commonGenres) {
    if (caption.includes(genre)) {
      return genre;
    }
  }
  return 'Other';
}

// Start monitoring channels
monitorChannels().then(() => {
  console.log('Started monitoring channels');
});

// Start the bot
bot.launch().then(() => {
  console.log('Bot is running and monitoring channels!');
}).catch((error) => {
  console.error('Failed to start bot:', error);
});

// Handle graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export const searchTelegramVideos = async (
  query: string,
  pageToken?: string
): Promise<SearchResponse> => {
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

    // Convert to VideoResult format
    const results: ExtendedVideoResult[] = paginatedVideos.map(video => ({
      id: video.id,
      title: video.title,
      duration: video.duration,
      source: video.source,
      thumbnail: video.thumbnail,
      url: video.url,
      description: video.description
    }));

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