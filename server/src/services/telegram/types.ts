// Video as stored in our system
export interface ExtendedVideoResult {
  id: string;
  title: string;
  duration: string;
  source: 'telegram' | 'dailymotion';
  thumbnail?: string;
  url: string;
  embedUrl?: string;
  timestamp: number;
  description?: string;
  genre?: string;
  views?: number;
  messageId?: string;
  chatId?: string;
  fileId?: string;
}

export interface SearchResult {
  results: ExtendedVideoResult[];
  hasMore: boolean;
  nextPageToken?: string;
  nextPage?: number;
  total?: number;
}

export const RESULTS_PER_PAGE = 5;
export const MOVIE_CHANNELS = [
  '@HD_ACTIONMOVIES',
  // Add more channels here
];
