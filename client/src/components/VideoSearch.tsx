import React, { useState } from 'react';
import { VideoSource } from '../types/video';
import { useVideoSearch } from '../hooks/useVideoSearch';
import VideoGrid from './VideoGrid';

interface VideoSearchProps {
  onVideoSelect: (url: string) => void;
  isVideoPlaying: boolean;
}

export const VideoSearch: React.FC<VideoSearchProps> = ({ onVideoSelect, isVideoPlaying }) => {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<VideoSource>('youtube');
  const { results, loading, error, hasMore, searchVideos, reset } = useVideoSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (isVideoPlaying) {
      alert('Please pause the current video before searching for a new one.');
      return;
    }
    if (query.trim()) {
      reset();
      searchVideos(query.trim(), source);
    }
  };

  const handleLoadMore = () => {
    if (query.trim()) {
      searchVideos(query.trim(), source);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for movies..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 pr-24"
          />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as VideoSource)}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-l border-gray-300 pl-2"
          >
            <option value="youtube">YouTube</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      <VideoGrid
        videos={results}
        onVideoSelect={onVideoSelect}
        loading={loading}
      />

      {hasMore && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};
