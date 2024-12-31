import { io } from 'socket.io-client';

const SOCKET_URL = 'https://youtube-sync-server.stackblitz.io';

export const socket = io(SOCKET_URL);

export const events = {
  JOIN_ROOM: 'join_room',
  SYNC_TIME: 'sync_time',
  PLAY_VIDEO: 'play_video',
  PAUSE_VIDEO: 'pause_video',
  SEEK_VIDEO: 'seek_video',
} as const;