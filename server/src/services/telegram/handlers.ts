import { Context } from 'telegraf';
import { searchTelegramVideos } from './search';
import { videoStorage } from './storage';
import { extractGenre } from './utils';
import { ExtendedVideoResult } from './types';

export const handleStart = (ctx: Context) => {
  ctx.reply(
    'Welcome to WatchTogether Movie Bot! 🎬\n\n' +
    'You can:\n' +
    '1. Search for movies by typing "@WatchTogetherMovieBot movie_name" in any chat\n' +
    '2. Use /search command followed by movie name\n' +
    '3. Browse our collection on watchtogether.com\n\n' +
    'We automatically index movies from popular Telegram channels!'
  );
};

export const handleHelp = (ctx: Context) => {
  ctx.reply(
    'Available commands:\n' +
    '/start - Show welcome message\n' +
    '/search <query> - Search for movies\n' +
    '/latest - Show latest added movies\n' +
    '/genres - Browse movies by genre\n' +
    '/help - Show this help message\n\n' +
    'Pro tip: You can also search inline by typing "@WatchTogetherMovieBot" in any chat!'
  );
};

export const handleInlineQuery = async (ctx: Context) => {
  if (!ctx.inlineQuery) return;
  
  const query = ctx.inlineQuery.query;
  const results = await searchTelegramVideos(query);
  
  const inlineResults = results.results.map((video: ExtendedVideoResult) => {
    const extendedVideo = video as ExtendedVideoResult;
    return {
      type: 'article' as const,
      id: video.id,
      title: video.title,
      description: extendedVideo.description || 'Click to watch on WatchTogether',
      thumb_url: video.thumbnail,
      input_message_content: {
        message_text: `🎬 ${video.title}\n\nWatch now on WatchTogether: ${process.env.WEBSITE_URL}/watch/${video.id}`
      },
      reply_markup: {
        inline_keyboard: [[
          { text: '▶️ Watch Now', url: `${process.env.WEBSITE_URL}/watch/${video.id}` }
        ]]
      }
    };
  });

  await ctx.answerInlineQuery(inlineResults);
};

export const handleChannelPost = (channelUsername: string) => async (ctx: Context) => {
  if (!ctx.channelPost) return;
  
  const message = ctx.channelPost;
  
  // Check if the message has a video
  const video = 'video' in message ? message.video : null;
  if (!video) return;

  const videoId = `video_${video.file_unique_id}`;
  
  // Only add if not already in storage
  if (!videoStorage.has(videoId)) {
    const caption = 'caption' in message ? message.caption : '';
    const storedVideo = {
      id: videoId,
      title: caption || 'Untitled Movie',
      duration: `${video.duration}s`,
      source: 'telegram' as const,
      thumbnail: video.file_id,
      url: `https://t.me/${channelUsername}/${message.message_id}`,
      timestamp: message.date * 1000,
      description: caption,
      genre: extractGenre(caption || '')
    };
    
    videoStorage.set(videoId, storedVideo);
    console.log(`Added new movie: ${storedVideo.title}`);
  }
};
