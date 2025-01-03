import axios from 'axios';
import { SearchResponse, VideoResult } from '../../types/video';
import dotenv from 'dotenv';

dotenv.config();

interface DailymotionVideo {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail_url: string;
  embed_url: string;
}

interface DailymotionResponse {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
  list: DailymotionVideo[];
}

const RESULTS_PER_PAGE = 10;
const BASE_URL = process.env.DAILYMOTION_API_URL || 'https://api.dailymotion.com';

const buildSearchParams = (query: string, page: number = 1): URLSearchParams => 
  new URLSearchParams({
    search: query,
    page: page.toString(),
    limit: RESULTS_PER_PAGE.toString(),
    fields: 'id,title,description,duration,thumbnail_url,embed_url',
    sort: 'relevance',
    longer_than: '30',
  });

  const formatDuration = (seconds: number): string => 
    `${Math.floor(seconds / 60)}m`;

    const buildVideoUrl = (id: string): string => 
    `https://www.dailymotion.com/video/${id}`;

  const mapToVideoResult = (video: DailymotionVideo): VideoResult => ({
    id: video.id,
    title: video.title,
    //description: video.description,
    duration: formatDuration(video.duration),
  thumbnail: video.thumbnail_url,
  url: buildVideoUrl(video.id),
  embedUrl: video.embed_url,
  source: 'dailymotion',
  //timestamp: Date.now(),
});

export const searchDailymotionVideos = async (
  query: string,
  page: number = 1
): Promise<SearchResponse> => {
  try {
    const searchUrl = `${BASE_URL}/videos?${buildSearchParams(query, page)}`;
    const { data } = await axios.get<DailymotionResponse>(searchUrl);
    
    return {
      results: data.list.map(mapToVideoResult),
      hasMore: data.has_more,
      nextPageToken: data.has_more ? (page + 1).toString() : undefined
    };
  } catch (error) {
    console.error('Error searching Dailymotion:', error);
    throw new Error('Failed to search Dailymotion videos');
  }
};
