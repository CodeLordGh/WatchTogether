export type VideoSource = 'youtube' | 'telegram' | 'dailymotion';

export interface VideoResult {
  id: string;
  title: string;
  duration: string;
  source: VideoSource;
  thumbnail?: string;
  url: string;
  embedUrl?: string;
}

export interface SearchResponse {
  results: VideoResult[];
  hasMore: boolean;
  nextPageToken?: string;
}
