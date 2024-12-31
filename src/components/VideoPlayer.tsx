import React, { useCallback, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import { Play, Pause } from 'lucide-react';
import { Socket } from 'socket.io-client';

interface VideoPlayerProps {
  videoId: string;
  roomId: string;
  socket: Socket;
  onContextUpdate: (context: string) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, roomId, socket, onContextUpdate }) => {
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isBuffering, setIsBuffering] = React.useState(false);
  const [isReady, setIsReady] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const syncThreshold = 2; // seconds of difference before syncing
  const isUserSeeking = useRef(false);

  useEffect(() => {
    socket.emit('join_room', roomId);

    socket.on('play', (timestamp: number) => {
      if (playerRef.current && !isUserSeeking.current) {
        const currentTime = playerRef.current.getCurrentTime();
        if (Math.abs(currentTime - timestamp) > syncThreshold) {
          playerRef.current.seekTo(timestamp);
        }
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    });

    socket.on('pause', (timestamp: number) => {
      if (playerRef.current && !isUserSeeking.current) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      }
    });

    socket.on('seek', (timestamp: number) => {
      if (playerRef.current && !isUserSeeking.current) {
        playerRef.current.seekTo(timestamp);
      }
    });

    // Sync state on initial join
    socket.on('sync_state', (state: { currentTime: number; isPlaying: boolean }) => {
      if (playerRef.current && !isUserSeeking.current) {
        playerRef.current.seekTo(state.currentTime);
        if (state.isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
        setIsPlaying(state.isPlaying);
      }
    });

    const syncInterval = setInterval(() => {
      if (playerRef.current && isPlaying && !isUserSeeking.current) {
        const currentTime = playerRef.current.getCurrentTime();
        socket.emit('sync_time', { roomId, currentTime });
      }
    }, 5000); // Sync every 5 seconds while playing

    return () => {
      socket.off('play');
      socket.off('pause');
      socket.off('seek');
      socket.off('sync_state');
      clearInterval(syncInterval);
    };
  }, [socket, roomId, isPlaying]);

  // Update context every 30 seconds
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(async () => {
      if (playerRef.current) {
        const time = await playerRef.current.getCurrentTime();
        const duration = await playerRef.current.getDuration();
        const title = await playerRef.current.getVideoData().title;
        
        const context = `Currently watching "${title}" at ${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')} out of ${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`;
        onContextUpdate(context);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isReady, onContextUpdate]);

  const handleStateChange = useCallback((event: any) => {
    const UNSTARTED = -1;
    const ENDED = 0;
    const PLAYING = 1;
    const PAUSED = 2;
    const BUFFERING = 3;
    const CUED = 5;

    switch (event.data) {
      case UNSTARTED:
        setIsReady(false);
        setIsBuffering(false);
        break;
      case ENDED:
        setIsPlaying(false);
        setIsBuffering(false);
        socket.emit('pause', { roomId, currentTime: playerRef.current?.getCurrentTime() || 0 });
        break;
      case PLAYING:
        if (!isUserSeeking.current) {
          setIsPlaying(true);
          setIsBuffering(false);
          setIsReady(true);
          socket.emit('play', { roomId, currentTime: playerRef.current?.getCurrentTime() || 0 });
        }
        break;
      case PAUSED:
        if (!isUserSeeking.current) {
          setIsPlaying(false);
          setIsBuffering(false);
          socket.emit('pause', { roomId, currentTime: playerRef.current?.getCurrentTime() || 0 });
        }
        break;
      case BUFFERING:
        setIsBuffering(true);
        break;
      case CUED:
        setIsReady(true);
        setIsBuffering(false);
        break;
    }
  }, [roomId, socket]);

  const handleReady = useCallback((event: any) => {
    playerRef.current = event.target;
    socket.emit('request_sync', roomId);
  }, [roomId, socket]);

  const handleSeek = useCallback((event: any) => {
    isUserSeeking.current = true;
    const newTime = Math.floor(event.target.getCurrentTime());
    if (Math.abs(newTime - currentTime) > syncThreshold) {
      setCurrentTime(newTime);
      socket.emit('seek', { roomId, currentTime: newTime });
    }
    setTimeout(() => {
      isUserSeeking.current = false;
    }, 1000);
  }, [currentTime, roomId, socket]);

  const opts = {
    height: '500',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 1,
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative">
        <YouTube
          videoId={videoId}
          opts={opts}
          onStateChange={handleStateChange}
          onReady={handleReady}
          onPlaybackRateChange={handleSeek}
        />
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => playerRef.current?.playVideo()}
          disabled={!isReady || isPlaying}
        >
          <Play className="w-6 h-6" />
        </button>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => playerRef.current?.pauseVideo()}
          disabled={!isReady || !isPlaying}
        >
          <Pause className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};