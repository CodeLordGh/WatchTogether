import { useState } from 'react';
import { VideoResult, VideoSource, SearchResponse } from '../types/video';

export const useVideoSearch = () => {
  const [results, setResults] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();

  const searchVideos = async (
    query: string,
    source: VideoSource,
    pageToken?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        query,
        source,
        ...(pageToken && { pageToken })
      });

      const response = await fetch(`/api/videos/search?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data: SearchResponse = await response.json();
      
      if (pageToken) {
        setResults(prev => [...prev, ...data.results]);
      } else {
        setResults(data.results);
      }
      
      setHasMore(data.hasMore);
      setNextPageToken(data.nextPageToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResults([]);
    setHasMore(false);
    setNextPageToken(undefined);
    setError(null);
  };

  return {
    results,
    loading,
    error,
    hasMore,
    nextPageToken,
    searchVideos,
    reset
  };
};
