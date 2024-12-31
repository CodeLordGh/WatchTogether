import { useEffect, useRef, useCallback } from 'react';
import { socketClient } from '../lib/socket';

const SYNC_INTERVAL = 1000;
const SYNC_THRESHOLD = 1;

export function useVideoSync(roomId: string) {
  const playerRef = useRef<any>(null);
  const lastSyncTime = useRef<number>(0);
  const isPlayerReady = useRef<boolean>(false);

  const getPlayer = useCallback(() => {
    if (!playerRef.current?.internalPlayer) {
      return null;
    }
    return playerRef.current.internalPlayer;
  }, []);

  const syncWithPeers = useCallback(async () => {
    const player = getPlayer();
    if (!player || !isPlayerReady.current) return;

    try {
      const currentTime = await player.getCurrentTime();
      const now = Date.now();

      if (now - lastSyncTime.current >= SYNC_INTERVAL) {
        socketClient.syncTime(currentTime);
        lastSyncTime.current = now;
      }
    } catch (error) {
      console.error('Error syncing time:', error);
    }
  }, [getPlayer]);

  useEffect(() => {
    socketClient.joinRoom(roomId);
    const syncInterval = setInterval(syncWithPeers, SYNC_INTERVAL);

    const handlePlayerReady = () => {
      isPlayerReady.current = true;
    };

    socketClient.onRoomState(async (state) => {
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

    socketClient.onPlay(async () => {
      const player = getPlayer();
      if (!player || !isPlayerReady.current) return;
      
      try {
        await player.playVideo();
      } catch (error) {
        console.error('Error playing video:', error);
      }
    });

    socketClient.onPause(async () => {
      const player = getPlayer();
      if (!player || !isPlayerReady.current) return;
      
      try {
        await player.pauseVideo();
      } catch (error) {
        console.error('Error pausing video:', error);
      }
    });

    socketClient.onSeek(async (time) => {
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

    socketClient.onSyncTime(async (time) => {
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
      socketClient.cleanup();
      isPlayerReady.current = false;
    };
  }, [roomId, syncWithPeers, getPlayer]);

  return playerRef;
}