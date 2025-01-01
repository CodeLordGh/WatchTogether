import { RoomState } from '../types/room';
import { model } from '../config';

export class RoomService {
  private rooms: Map<string, RoomState>;

  constructor() {
    this.rooms = new Map<string, RoomState>();
  }

  createRoom(roomId: string, userId: string) {
    this.rooms.set(roomId, {
      users: new Set([userId]),
    });
  }

  joinRoom(roomId: string, userId: string) {
    const room = this.getRoom(roomId);
    if (!room) {
      this.createRoom(roomId, userId);
    } else {
      room.users.add(userId);
    }
  }

  leaveRoom(roomId: string, userId: string) {
    const room = this.getRoom(roomId);
    if (room) {
      room.users.delete(userId);
      if (room.users.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  updateVideoState(roomId: string, currentTime: number, isPlaying: boolean) {
    const room = this.getRoom(roomId);
    if (room) {
      room.currentVideoState = {
        currentTime,
        isPlaying,
        lastUpdate: Date.now(),
      };
    }
  }

  updateMovieContext(roomId: string, context: string) {
    const room = this.getRoom(roomId);
    if (room) {
      room.movieContext = context;
    }
  }

  getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  async generateAiSuggestion(roomId: string, username: string, relationship: string) {
    const room = this.getRoom(roomId);
    if (!room || !room.movieContext) return null;

    try {
      const prompt = `You are helping two people watching a movie together have a meaningful conversation. 
      Their relationship is: ${relationship}. 
      The current movie context is: ${room.movieContext}
      Generate a natural conversation starter or question that would be appropriate for their relationship and the current movie scene.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        id: crypto.randomUUID(),
        sender: "AI Assistant",
        content: text || "I'm not sure what to suggest right now.",
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      return null;
    }
  }
}
