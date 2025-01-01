import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/roomService';

export class SocketController {
  private io: Server;
  private roomService: RoomService;

  constructor(io: Server) {
    this.io = io;
    this.roomService = new RoomService();
    this.initialize();
  }

  private initialize() {
    this.io.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join_room', (roomId: string) => this.handleJoinRoom(socket, roomId));
      socket.on('play', (data) => this.handlePlay(socket, data));
      socket.on('pause', (data) => this.handlePause(socket, data));
      socket.on('seek', (data) => this.handleSeek(socket, data));
      socket.on('sync_time', (data) => this.handleSyncTime(data));
      socket.on('request_sync', (roomId) => this.handleRequestSync(socket, roomId));
      socket.on('update_movie_context', (data) => this.handleUpdateMovieContext(data));
      socket.on('chat_message', (data) => this.handleChatMessage(data));
      socket.on('request_ai_suggestion', (data) => this.handleAiSuggestion(data));
      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  private handleJoinRoom(socket: Socket, roomId: string) {
    socket.join(roomId);
    this.roomService.joinRoom(roomId, socket.id);
    console.log(`User ${socket.id} joined room ${roomId}`);
  }

  private handlePlay(socket: Socket, { roomId, currentTime }: { roomId: string; currentTime: number }) {
    this.roomService.updateVideoState(roomId, currentTime, true);
    socket.to(roomId).emit('play', currentTime);
  }

  private handlePause(socket: Socket, { roomId, currentTime }: { roomId: string; currentTime: number }) {
    this.roomService.updateVideoState(roomId, currentTime, false);
    socket.to(roomId).emit('pause', currentTime);
  }

  private handleSeek(socket: Socket, { roomId, currentTime }: { roomId: string; currentTime: number }) {
    this.roomService.updateVideoState(roomId, currentTime, true);
    socket.to(roomId).emit('seek', currentTime);
  }

  private handleSyncTime({ roomId, currentTime }: { roomId: string; currentTime: number }) {
    this.roomService.updateVideoState(roomId, currentTime, true);
  }

  private handleRequestSync(socket: Socket, roomId: string) {
    const room = this.roomService.getRoom(roomId);
    if (room?.currentVideoState) {
      const timeDrift = (Date.now() - room.currentVideoState.lastUpdate) / 1000;
      const adjustedTime = room.currentVideoState.currentTime + (room.currentVideoState.isPlaying ? timeDrift : 0);
      
      socket.emit('sync_state', {
        currentTime: adjustedTime,
        isPlaying: room.currentVideoState.isPlaying,
      });
    }
  }

  private handleUpdateMovieContext({ roomId, context }: { roomId: string; context: string }) {
    this.roomService.updateMovieContext(roomId, context);
  }

  private handleChatMessage(data: { roomId: string; message: any }) {
    this.io.to(data.roomId).emit('chat_message', data.message);
  }

  private async handleAiSuggestion(data: { roomId: string; username: string; relationship: string }) {
    const suggestion = await this.roomService.generateAiSuggestion(
      data.roomId,
      data.username,
      data.relationship
    );
    if (suggestion) {
      this.io.to(data.roomId).emit('ai_suggestion', suggestion);
    }
  }

  private handleDisconnect(socket: Socket) {
    console.log('Client disconnected:', socket.id);
  }
}
