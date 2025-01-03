import { Telegraf, Context } from 'telegraf';
import { Message, Update } from 'telegraf/typings/core/types/typegram';
import { ExtendedVideoResult } from './types';

const RESULTS_PER_PAGE = 5;
const BOT_TOKEN = '7231407597:AAGmTfN2BB9b66pZKfFzmMEc7xSS76idOlc'// process.env.TELEGRAM_BOT_TOKEN || '';

const videoStorage = new Map<string, ExtendedVideoResult>();

const bot = new Telegraf(BOT_TOKEN);

// Helper function to extract video info from different link formats
const extractVideoInfo = (text: string) => {
  const privateFormat = /t\.me\/c\/(-?\d+)\/(\d+)/;
  const publicFormat = /t\.me\/([^/]+)\/(\d+)/;
  const longFormat = /telegram\.me\/([^/]+)\/(\d+)/;
  
  const match = text.match(privateFormat) || text.match(publicFormat) || text.match(longFormat);
  
  if (match) {
    const [_, channelId, messageId] = match;
    return {
      channelId: channelId.replace('-', ''),
      messageId,
      isPrivate: text.includes('/c/')
    };
  }
  return null;
};

// Initialize bot commands and handlers
bot.command('start', (ctx) => {
  ctx.reply(
    'Welcome to WatchTogether Movie Bot! \n\n' +
    'You can:\n' +
    '1. Forward me video messages\n' +
    '2. Share video links from Telegram channels\n' +
    '3. Search for videos using /search <query>\n\n' +
    'I\'ll remember these videos for everyone to search!'
  );
});

bot.command('help', (ctx) => {
  ctx.reply(
    'Available commands:\n' +
    '/start - Show welcome message\n' +
    '/search <query> - Search for videos across all sources\n' +
    '/search_dm <query> - Search only Dailymotion videos\n' +
    '/search_tg <query> - Search only Telegram videos\n' +
    '/help - Show this help message\n\n' +
    'You can also:\n' +
    '• Forward me videos directly\n' +
    '• Share links from channels (t.me/...)\n' +
    '• Share links from private groups'
  );
});

// // Handle forwarded videos
// bot.on('video', (ctx) => {
//   if ('video' in ctx.message) {
//     handleVideo(ctx).catch(error => {
//       console.error('Error handling video:', error);
//       ctx.reply('Sorry, I couldn\'t process that video ').catch(console.error);
//     });
//   }
// });

// async function handleVideo(ctx: Context) {
//   const message = ctx.message as Update.New & Update.NonChannel & Message.VideoMessage;
//   const video = message.video;
//   const videoId = `video_${video.file_unique_id}`;
//   const messageId = message.message_id.toString();
//   const chatId = message.chat.id.toString();
  
//   const storedVideo: ExtendedVideoResult = {
//     id: videoId,
//     title: message.caption || 'Untitled Video',
//     duration: `${video.duration}s`,
//     source: 'telegram',
//     thumbnail: video.file_id,
//     url: `https://t.me/c/${chatId.replace('-', '')}/${messageId}`,
//     timestamp: Date.now(),
//     messageId,
//     chatId,
//     fileId: video.file_id,
//     description: message.caption || undefined
//   };

//   videoStorage.set(videoId, storedVideo);
//   await ctx.reply(
//     'Video received and indexed! \nOthers can now find it using /search'
//   );
// }

// // Handle messages with video links
// bot.on('text', (ctx) => {
//   if ('text' in ctx.message) {
//     handleText(ctx).catch(error => {
//       console.error('Error handling text:', error);
//       ctx.reply('Sorry, I couldn\'t process that link ').catch(console.error);
//     });
//   }
// });

// async function handleText(ctx: Context) {
//   const message = ctx.message as Update.New & Update.NonChannel & Message.TextMessage;
//   const text = message.text;
  
//   if (text.includes('t.me/') || text.includes('telegram.me/')) {
//     const videoInfo = extractVideoInfo(text);
    
//     if (videoInfo) {
//       const { channelId, messageId, isPrivate } = videoInfo;
//       const videoId = `link_${channelId}_${messageId}`;
      
//       try {
//         const forwardedMsg = await ctx.telegram.forwardMessage(
//           ctx.chat!.id,
//           parseInt(channelId),
//           parseInt(messageId)
//         ) as Message.VideoMessage;
        
//         if ('video' in forwardedMsg) {
//           const storedVideo: ExtendedVideoResult = {
//             id: videoId,
//             title: forwardedMsg.caption || 'Video from Telegram',
//             duration: forwardedMsg.video?.duration ? `${forwardedMsg.video.duration}s` : 'Unknown',
//             source: 'telegram',
//             thumbnail: forwardedMsg.video?.file_id,
//             url: isPrivate 
//               ? `https://t.me/c/${channelId}/${messageId}`
//               : `https://t.me/${channelId}/${messageId}`,
//             timestamp: Date.now(),
//             messageId,
//             chatId: channelId,
//             fileId: forwardedMsg.video?.file_id,
//             description: forwardedMsg.caption || undefined
//           };

//           videoStorage.set(videoId, storedVideo);
//           await ctx.reply(
//             'Video link saved! \nOthers can now find it using /search'
//           );
//         } else {
//           throw new Error('Forwarded message is not a video');
//         }
//       } catch (error) {
//         console.error('Error forwarding message:', error);
//         // If we can't get the message info, store basic info
//         const storedVideo: ExtendedVideoResult = {
//           id: videoId,
//           title: 'Video from Telegram',
//           duration: 'Unknown',
//           source: 'telegram',
//           url: isPrivate 
//             ? `https://t.me/c/${channelId}/${messageId}`
//             : `https://t.me/${channelId}/${messageId}`,
//           timestamp: Date.now(),
//           messageId,
//           chatId: channelId
//         };
        
//         videoStorage.set(videoId, storedVideo);
//         await ctx.reply(
//           'Video link saved with limited info! To get full video details:\n' +
//           '1. Add me to the source channel/group\n' +
//           '2. Make sure I have permission to read messages\n' +
//           '3. Try sharing the link again'
//         );
//       }
//     } else {
//       await ctx.reply('Sorry, I couldn\'t recognize this link format ');
//     }
//   }
// }

// // Add new search commands
// bot.command('search_dm', async (ctx) => {
//   const query = ctx.message.text.replace('/search_dm', '').trim();
//   if (!query) {
//     return ctx.reply('Please provide a search query. Example: /search_dm matrix');
//   }

//   try {
//     const results = await searchVideos(query, 'dailymotion');
//     if (results.results.length === 0) {
//       return ctx.reply('No videos found. Try a different search term.');
//     }

//     for (const video of results.results) {
//       await ctx.reply(
//         `🎬 ${video.title}\n` +
//         `⏱ Duration: ${video.duration}\n` +
//         `📝 ${video.description?.substring(0, 100)}...\n` +
//         `🔗 ${video.url}\n` +
//         (video.embedUrl ? `▶️ Watch: ${video.embedUrl}\n` : ''),
//         { disable_web_page_preview: false }
//       );
//     }

//     if (results.hasMore) {
//       await ctx.reply(
//         'There are more results. Use /search_dm_page <query> <page> to see more.\n' +
//         'Example: /search_dm_page matrix 2'
//       );
//     }
//   } catch (error) {
//     console.error('Error searching Dailymotion:', error);
//     ctx.reply('Sorry, there was an error searching Dailymotion videos. Please try again later.');
//   }
// });

// bot.command('search_dm_page', async (ctx) => {
//   const [, query, page] = ctx.message.text.split(' ');
//   if (!query || !page) {
//     return ctx.reply('Please provide both query and page number. Example: /search_dm_page matrix 2');
//   }

//   try {
//     const pageNum = parseInt(page);
//     if (isNaN(pageNum) || pageNum < 1) {
//       return ctx.reply('Please provide a valid page number (1 or greater)');
//     }

//     const results = await searchVideos(query, 'dailymotion', pageNum);
//     if (results.results.length === 0) {
//       return ctx.reply('No more videos found.');
//     }

//     for (const video of results.results) {
//       await ctx.reply(
//         `🎬 ${video.title}\n` +
//         `⏱ Duration: ${video.duration}\n` +
//         `📝 ${video.description?.substring(0, 100)}...\n` +
//         `🔗 ${video.url}\n` +
//         (video.embedUrl ? `▶️ Watch: ${video.embedUrl}\n` : ''),
//         { disable_web_page_preview: false }
//       );
//     }

//     if (results.hasMore) {
//       await ctx.reply(
//         `There are more results. Use /search_dm_page ${query} ${pageNum + 1} to see more.`
//       );
//     }
//   } catch (error) {
//     console.error('Error searching Dailymotion:', error);
//     ctx.reply('Sorry, there was an error searching Dailymotion videos. Please try again later.');
//   }
// });

// // Start the bot
// bot.launch().then(() => {
//   console.log('Bot is running!');
// }).catch((error) => {
//   console.error('Failed to start bot:', error);
// });

// // Handle graceful shutdown
// process.once('SIGINT', () => bot.stop('SIGINT'));
// process.once('SIGTERM', () => bot.stop('SIGTERM'));

// export const searchTelegramVideos = async (
//   query: string,
//   pageToken?: string
// ): Promise<{ results: ExtendedVideoResult[]; hasMore: boolean; nextPageToken: string }> => {
//   try {
//     const offset = pageToken ? parseInt(pageToken) : 0;
    
//     const allVideos = Array.from(videoStorage.values())
//       .sort((a, b) => b.timestamp - a.timestamp);

//     const filteredVideos = query
//       ? allVideos.filter(video => 
//           video.title.toLowerCase().includes(query.toLowerCase()) ||
//           (video.description?.toLowerCase().includes(query.toLowerCase()))
//       )
//       : allVideos;

//     const paginatedVideos = filteredVideos.slice(
//       offset,
//       offset + RESULTS_PER_PAGE
//     );

//     return {
//       results: paginatedVideos,
//       hasMore: offset + RESULTS_PER_PAGE < filteredVideos.length,
//       nextPageToken: (offset + RESULTS_PER_PAGE).toString()
//     };
//   } catch (error) {
//     console.error('Error searching Telegram videos:', error);
//     return {
//       results: [],
//       hasMore: false,
//       nextPageToken: ''
//     };
//   }
// };