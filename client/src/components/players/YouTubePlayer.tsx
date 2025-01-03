import React, { useCallback } from 'react';
import YouTube from 'react-youtube';
import { extractYouTubeId } from '../../utils/videoUtils';

interface YouTubePlayerProps {
  videoId: string;
  onReady: (player: any) => void;
  onStateChange: (event: any) => void;
  onSeek?: (event: any) => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  onReady,
  onStateChange,
  onSeek,
}) => {
  const handleReady = useCallback((event: any) => {
    onReady(event.target);
  }, [onReady]);

  const youtubeId = extractYouTubeId(videoId);
  if (!youtubeId) return null;

  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
      <div className="absolute inset-0">
        <YouTube
          videoId={youtubeId}
          opts={{
            width: '100%',
            height: '100%',
            playerVars: {
              autoplay: 1,
              controls: 1,
              origin: window.location.origin,
              enablejsapi: 1,
              modestbranding: 1,
            },
          }}
          onStateChange={onStateChange}
          onReady={handleReady}
          onPlaybackRateChange={onSeek}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};
