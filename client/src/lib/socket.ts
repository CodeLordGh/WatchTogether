import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket;
  private static instance: SocketClient;

  private constructor() {
    this.socket = io('http://localhost:3001', {
      path: '/socket.io',
      withCredentials: true,
    });
    this.setupConnectionHandlers();
  }

  static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  private setupConnectionHandlers() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  joinRoom(roomId: string) {
    this.socket.emit('join_room', roomId);
  }

  onRoomState(roomId: string, callback: (state: any) => void) {
    this.socket.on(`room_state:${roomId}`, callback);
  }

  play(roomId: string) {
    this.socket.emit('play', { roomId });
  }

  onPlay(roomId: string, callback: () => void) {
    this.socket.on(`play:${roomId}`, callback);
  }

  pause(roomId: string) {
    this.socket.emit('pause', { roomId });
  }

  onPause(roomId: string, callback: () => void) {
    this.socket.on(`pause:${roomId}`, callback);
  }

  seek(roomId: string, time: number) {
    this.socket.emit('seek', { roomId, time });
  }

  onSeek(roomId: string, callback: (time: number) => void) {
    this.socket.on(`seek:${roomId}`, callback);
  }

  syncTime(roomId: string, time: number) {
    this.socket.emit('sync_time', { roomId, time });
  }

  onSyncTime(roomId: string, callback: (time: number) => void) {
    this.socket.on(`sync_time:${roomId}`, callback);
  }

  requestSync(roomId: string) {
    this.socket.emit('request_sync', { roomId });
  }

  cleanup(roomId: string) {
    this.socket.off(`room_state:${roomId}`);
    this.socket.off(`play:${roomId}`);
    this.socket.off(`pause:${roomId}`);
    this.socket.off(`seek:${roomId}`);
    this.socket.off(`sync_time:${roomId}`);
  }
}

export const socketClient = SocketClient.getInstance();