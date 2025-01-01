export type VideoSource = 'youtube' | 'telegram';

export interface VideoResult {
  id: string;
  title: string;
  duration: string;
  source: VideoSource;
  thumbnail?: string;
  url: string;
}

export interface SearchResponse {
  results: VideoResult[];
  hasMore: boolean;
  nextPageToken?: string;
}
