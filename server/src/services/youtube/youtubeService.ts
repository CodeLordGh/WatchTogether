import { google, youtube_v3 } from 'googleapis';
import { SearchResponse, VideoResult } from '../../types/video';
import dotenv from 'dotenv';
dotenv.config();

const RESULTS_PER_PAGE = 5;
const API_KEY = process.env.YOUTUBE_API_KEY;

const youtube = google.youtube({
  version: 'v3',
  auth: API_KEY
});

export const searchYoutubeVideos = async (
  query: string,
  pageToken?: string
): Promise<SearchResponse> => {
  try {
    const searchResponse = await youtube.search.list({
      part: ['snippet'],
      q: query + ' full movie',
      type: ['video'],
      videoType: 'movie',
      maxResults: RESULTS_PER_PAGE,
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

    const videoDetails = await youtube.videos.list({
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
};
