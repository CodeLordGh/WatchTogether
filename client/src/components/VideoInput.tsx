import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface VideoInputProps {
  onSubmit: (videoId: string) => void;
}

export const VideoInput: React.FC<VideoInputProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let videoId = input;
    
    try {
      const url = new URL(input);
      if (url.hostname.includes('youtube.com')) {
        videoId = url.searchParams.get('v') || '';
      } else if (url.hostname === 'youtu.be') {
        videoId = url.pathname.slice(1);
      }
    } catch {
      // Input is not a URL, assume it's a video ID
    }

    if (videoId) {
      onSubmit(videoId);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter YouTube URL or video ID"
          className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-500 dark:placeholder-gray-400"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 dark:text-gray-400
                   hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};