import React, { useEffect, useRef } from 'react';
import { extractDailymotionId } from '../../utils/videoUtils';

interface DailymotionPlayerProps {
  videoId: string;
  onReady: (player: any) => void;
  onStateChange: (event: any) => void;
  onTimeUpdate: (event: any) => void;
}

export const DailymotionPlayer: React.FC<DailymotionPlayerProps> = ({
  videoId,
  onReady,
  onStateChange,
  onTimeUpdate,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const dmVideoId = extractDailymotionId(videoId);
    if (!dmVideoId) return;

    // Create the iframe with the embed URL
    if (iframeRef.current) {
      iframeRef.current.src = `https://www.dailymotion.com/embed/video/${dmVideoId}?api=postMessage`;
    }

    // Initialize player when iframe loads
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.dailymotion.com') return;
      
      try {
        const data = JSON.parse(event.data);
        
        switch (data.event) {
          case 'apiready':
            playerRef.current = {
              play: () => postMessage({ command: 'play' }),
              pause: () => postMessage({ command: 'pause' }),
              seek: (time: number) => postMessage({ command: 'seek', value: time }),
              destroy: () => {
                if (iframeRef.current) {
                  iframeRef.current.src = '';
                }
              }
            };
            onReady(playerRef.current);
            break;
          case 'playing':
            onStateChange({ data: 1 });
            break;
          case 'pause':
            onStateChange({ data: 2 });
            break;
          case 'timeupdate':
            onTimeUpdate(data);
            break;
        }
      } catch (error) {
        console.error('Error processing Dailymotion player message:', error);
      }
    };

    const postMessage = (message: any) => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify(message), 'https://www.dailymotion.com');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [videoId, onReady, onStateChange, onTimeUpdate]);

  return (
    <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
      <div className="absolute inset-0">
        <iframe
          ref={iframeRef}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};
