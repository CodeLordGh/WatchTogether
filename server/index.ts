import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro"});

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));

// Health check endpoint for Render
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.send("Hello");
});

interface RoomState {
  users: Set<string>;
  movieContext?: string;
  currentVideoState?: {
    currentTime: number;
    isPlaying: boolean;
    lastUpdate: number;
  };
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

const rooms = new Map<string, RoomState>();

async function generateAiSuggestion(roomId: string, username: string, relationship: string) {
  const room = rooms.get(roomId);
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

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_room', (roomId: string) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        users: new Set([socket.id]),
      });
    } else {
      rooms.get(roomId)?.users.add(socket.id);
    }
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('play', ({ roomId, currentTime }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.currentVideoState = {
        currentTime,
        isPlaying: true,
        lastUpdate: Date.now(),
      };
      socket.to(roomId).emit('play', currentTime);
    }
  });

  socket.on('pause', ({ roomId, currentTime }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.currentVideoState = {
        currentTime,
        isPlaying: false,
        lastUpdate: Date.now(),
      };
      socket.to(roomId).emit('pause', currentTime);
    }
  });

  socket.on('seek', ({ roomId, currentTime }) => {
    const room = rooms.get(roomId);
    if (room && room.currentVideoState) {
      room.currentVideoState.currentTime = currentTime;
      room.currentVideoState.lastUpdate = Date.now();
      socket.to(roomId).emit('seek', currentTime);
    }
  });

  socket.on('sync_time', ({ roomId, currentTime }) => {
    const room = rooms.get(roomId);
    if (room && room.currentVideoState) {
      room.currentVideoState.currentTime = currentTime;
      room.currentVideoState.lastUpdate = Date.now();
    }
  });

  socket.on('request_sync', (roomId: string) => {
    const room = rooms.get(roomId);
    if (room && room.currentVideoState) {
      // Calculate time drift since last update
      const timeDrift = (Date.now() - room.currentVideoState.lastUpdate) / 1000;
      const adjustedTime = room.currentVideoState.currentTime + (room.currentVideoState.isPlaying ? timeDrift : 0);
      
      socket.emit('sync_state', {
        currentTime: adjustedTime,
        isPlaying: room.currentVideoState.isPlaying,
      });
    }
  });

  socket.on('update_movie_context', ({ roomId, context }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.movieContext = context;
    }
  });

  socket.on('chat_message', (data: { roomId: string; message: ChatMessage }) => {
    io.to(data.roomId).emit('chat_message', data.message);
  });

  socket.on('request_ai_suggestion', async (data: { roomId: string; username: string; relationship: string }) => {
    const suggestion = await generateAiSuggestion(data.roomId, data.username, data.relationship);
    if (suggestion) {
      io.to(data.roomId).emit('ai_suggestion', suggestion);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove user from all rooms they were in
    rooms.forEach((room, roomId) => {
      room.users.delete(socket.id);
      if (room.users.size === 0) {
        rooms.delete(roomId);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});