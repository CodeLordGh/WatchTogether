import { useState } from 'react';
import { VideoSearch } from './VideoSearch';
import { extractYouTubeId, extractDailymotionId, isYouTubeUrl, isDailymotionUrl } from '../utils/videoUtils';

interface VideoInputProps {
  onSubmit: (videoId: string) => void;
  isVideoPlaying?: boolean;
}

export function VideoInput({ onSubmit, isVideoPlaying }: VideoInputProps) {
  const [url, setUrl] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractVideoId(url);
    if (videoId) {
      onSubmit(videoId);
      setUrl('');
    }
  };

  const extractVideoId = (url: string) => {
    // First check if it's already a valid video ID
    if (isYouTubeUrl(url) || isDailymotionUrl(url)) {
      return url;
    }

    try {
      const urlObj = new URL(url);
      // Handle YouTube URLs
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        const id = extractYouTubeId(url);
        if (id) return id;
      }
      // Handle Dailymotion URLs
      else if (urlObj.hostname.includes('dailymotion.com')) {
        const id = extractDailymotionId(url);
        if (id) return id;
      }
    } catch {
      // If URL parsing fails, check if the input is a direct video ID
      if (isYouTubeUrl(url) || isDailymotionUrl(url)) {
        return url;
      }
    }
    
    alert('Please enter a valid YouTube or Dailymotion URL/video ID');
    return null;
  };

  const handleVideoSelect = (videoUrl: string) => {
    setUrl(videoUrl);
    const videoId = extractVideoId(videoUrl);
    if (videoId) {
      onSubmit(videoId);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-center space-x-4 mb-4">
        <button
          onClick={() => setShowSearch(false)}
          className={`px-4 py-2 rounded-lg ${!showSearch ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Direct URL
        </button>
        <button
          onClick={() => setShowSearch(true)}
          className={`px-4 py-2 rounded-lg ${showSearch ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          Search Videos
        </button>
      </div>

      {showSearch ? (
        <VideoSearch onVideoSelect={handleVideoSelect} isVideoPlaying={isVideoPlaying || false} />
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL or video ID"
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300"
          />
          <button
            type="submit"
            disabled={!url.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Watch
          </button>
        </form>
      )}
    </div>
  );
}