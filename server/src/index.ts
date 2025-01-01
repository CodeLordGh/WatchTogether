import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import routes from './routes';
import { SocketController } from './controllers/socketController';
import { CORS_ORIGINS, PORT } from './config';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Configure CORS
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));

// Initialize socket controller
new SocketController(io);

// Initialize routes
app.use(routes);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});