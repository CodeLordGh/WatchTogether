import { io, Socket } from 'socket.io-client';

class SocketClient {
  private socket: Socket;
  private static instance: SocketClient;

  private constructor() {
    this.socket = io('http://localhost:5173', {
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

  onRoomState(callback: (state: any) => void) {
    this.socket.on('room_state', callback);
  }

  play() {
    this.socket.emit('play');
  }

  onPlay(callback: () => void) {
    this.socket.on('play', callback);
  }

  pause() {
    this.socket.emit('pause');
  }

  onPause(callback: () => void) {
    this.socket.on('pause', callback);
  }

  seek(time: number) {
    this.socket.emit('seek', time);
  }

  onSeek(callback: (time: number) => void) {
    this.socket.on('seek', callback);
  }

  syncTime(time: number) {
    this.socket.emit('sync_time', time);
  }

  onSyncTime(callback: (time: number) => void) {
    this.socket.on('sync_time', callback);
  }

  cleanup() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }
}

export const socketClient = SocketClient.getInstance();