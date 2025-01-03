import { useEffect, useRef, useCallback, useState } from 'react';
import { socketClient } from '../lib/socket';

const SYNC_INTERVAL = 1000;
const SYNC_THRESHOLD = 1;

export function useVideoSync(roomId: string, onContextUpdate?: (context: string) => void) {
  const playerRef = useRef<any>(null);
  const lastSyncTime = useRef<number>(0);
  const isPlayerReady = useRef<boolean>(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const getPlayer = useCallback(() => {
    if (!playerRef.current?.internalPlayer) {
      return null;
    }
    return playerRef.current.internalPlayer;
  }, []);

  const handleReady = useCallback((player: any) => {
    playerRef.current = player;
    isPlayerReady.current = true;
    socketClient.requestSync(roomId);
  }, [roomId]);

  const handleStateChange = useCallback((event: any) => {
    const UNSTARTED = -1;
    const ENDED = 0;
    const PLAYING = 1;
    const PAUSED = 2;
    const BUFFERING = 3;
    const CUED = 5;

    switch (event.data) {
      case UNSTARTED:
        isPlayerReady.current = false;
        setIsBuffering(false);
        break;
      case ENDED:
        setIsBuffering(false);
        socketClient.pause(roomId);
        break;
      case PLAYING:
        setIsBuffering(false);
        isPlayerReady.current = true;
        socketClient.play(roomId);
        break;
      case PAUSED:
        setIsBuffering(false);
        socketClient.pause(roomId);
        break;
      case BUFFERING:
        setIsBuffering(true);
        break;
      case CUED:
        isPlayerReady.current = true;
        setIsBuffering(false);
        break;
    }
  }, [roomId]);

  const handleSeek = useCallback((event: any) => {
    const player = getPlayer();
    if (!player || !isPlayerReady.current) return;

    try {
      const currentTime = event?.currentTime || player.getCurrentTime();
      socketClient.seek(roomId, currentTime);
    } catch (error) {
      console.error('Error during seek:', error);
    }
  }, [getPlayer, roomId]);

  const syncWithPeers = useCallback(async () => {
    const player = getPlayer();
    if (!player || !isPlayerReady.current) return;

    try {
      const currentTime = await player.getCurrentTime();
      const now = Date.now();

      if (now - lastSyncTime.current >= SYNC_INTERVAL) {
        socketClient.syncTime(roomId, currentTime);
        lastSyncTime.current = now;
      }
    } catch (error) {
      console.error('Error syncing time:', error);
    }
  }, [getPlayer, roomId]);

  useEffect(() => {
    socketClient.joinRoom(roomId);
    const syncInterval = setInterval(syncWithPeers, SYNC_INTERVAL);

    socketClient.onRoomState(roomId, async (state) => {
      const player = getPlayer();
      if (!player || !isPlayerReady.current) return;

      try {
        const currentTime = await player.getCurrentTime();
        if (Math.abs(currentTime - state.currentTime) > SYNC_THRESHOLD) {
          await player.seekTo(state.currentTime, true);
        }

        if (state.isPlaying) {
          await player.playVideo();
        }
      } catch (error) {
        console.error('Error handling room state:', error);
      }
    });

    socketClient.onPlay(roomId, async () => {
      const player = getPlayer();
      if (!player || !isPlayerReady.current) return;
      
      try {
        await player.playVideo();
      } catch (error) {
        console.error('Error playing video:', error);
      }
    });

    socketClient.onPause(roomId, async () => {
      const player = getPlayer();
      if (!player || !isPlayerReady.current) return;
      
      try {
        await player.pauseVideo();
      } catch (error) {
        console.error('Error pausing video:', error);
      }
    });

    socketClient.onSeek(roomId, async (time) => {
      const player = getPlayer();
      if (!player || !isPlayerReady.current) return;
      
      try {
        const currentTime = await player.getCurrentTime();
        if (Math.abs(currentTime - time) > SYNC_THRESHOLD) {
          await player.seekTo(time, true);
        }
      } catch (error) {
        console.error('Error seeking video:', error);
      }
    });

    socketClient.onSyncTime(roomId, async (time) => {
      const player = getPlayer();
      if (!player || !isPlayerReady.current) return;
      
      try {
        const currentTime = await player.getCurrentTime();
        if (Math.abs(currentTime - time) > SYNC_THRESHOLD) {
          await player.seekTo(time, true);
        }
      } catch (error) {
        console.error('Error syncing time:', error);
      }
    });

    return () => {
      clearInterval(syncInterval);
      socketClient.cleanup(roomId);
      isPlayerReady.current = false;
    };
  }, [roomId, syncWithPeers, getPlayer]);

  // Update context every 30 seconds if onContextUpdate is provided
  useEffect(() => {
    if (!onContextUpdate || !isPlayerReady.current) return;

    const interval = setInterval(async () => {
      const player = getPlayer();
      if (player) {
        try {
          const time = await player.getCurrentTime();
          const duration = await player.getDuration();
          const videoData = await player.getVideoData();
          const title = videoData?.title || 'Unknown';
          
          const context = `Currently watching "${title}" at ${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')} out of ${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`;
          onContextUpdate(context);
        } catch (error) {
          console.error('Error updating context:', error);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [getPlayer, onContextUpdate]);

  return {
    playerRef,
    isBuffering,
    handleReady,
    handleStateChange,
    handleSeek
  };
}