import React, { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { YouTubePlayer } from './players/YouTubePlayer';
import { DailymotionPlayer } from './players/DailymotionPlayer';
import { isYouTubeUrl, isDailymotionUrl } from '../utils/videoUtils';
import { useVideoSync } from '../hooks/useVideoSync';

interface VideoPlayerProps {
  videoId: string;
  roomId: string;
  socket: Socket;
  onContextUpdate: (context: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoId,
  roomId,
  onContextUpdate,
}) => {
  const { isBuffering, handleReady, handleStateChange, handleSeek } = useVideoSync(roomId, onContextUpdate);

  const handleTimeUpdate = useCallback((event: any) => {
    // Handle time updates from Dailymotion player
    if (event?.currentTime) {
      handleSeek(event);
    }
  }, [handleSeek]);

  const renderPlayer = () => {
    if (!videoId) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No video selected</p>
        </div>
      );
    }

    if (isYouTubeUrl(videoId)) {
      return (
        <YouTubePlayer
          videoId={videoId}
          onReady={handleReady}
          onStateChange={handleStateChange}
          onSeek={handleSeek}
        />
      );
    }

    if (isDailymotionUrl(videoId)) {
      return (
        <DailymotionPlayer
          videoId={videoId}
          onReady={handleReady}
          onStateChange={handleStateChange}
          onTimeUpdate={handleTimeUpdate}
        />
      );
    }

    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">Unsupported video URL</p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        {renderPlayer()}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};