export interface RoomState {
  users: Set<string>;
  movieContext?: string;
  currentVideoState?: {
    currentTime: number;
    isPlaying: boolean;
    lastUpdate: number;
  };
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}
