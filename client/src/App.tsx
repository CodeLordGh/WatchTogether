import { useState, useEffect, FC } from 'react';
import { VideoPlayer } from './components/VideoPlayer';
import { VideoInput } from './components/VideoInput';
import { RoomInfo } from './components/RoomInfo';
import { Layout } from './components/Layout';
import { Chat } from './components/Chat';
import { io } from 'socket.io-client';

// In development, Socket.IO will use the Vite proxy
// In production, it will use the environment variable
const SOCKET_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL 
  : '';

const socket = io(SOCKET_URL, {
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

const App: FC = () => {
  const [videoId, setVideoId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      setUsername(savedUsername);
    } else {
      const newUsername = prompt('Enter your name:') || 'Anonymous';
      localStorage.setItem('username', newUsername);
      setUsername(newUsername);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const roomFromUrl = urlParams.get('room');
    const videoFromUrl = urlParams.get('v');

    if (roomFromUrl) {
      setRoomId(roomFromUrl);
      socket.emit('join_room', roomFromUrl);
      if (videoFromUrl) {
        setVideoId(videoFromUrl);
      }
    } else {
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      socket.emit('join_room', newRoomId);
      const newUrl = `${window.location.pathname}?room=${newRoomId}`;
      window.history.pushState({}, '', newUrl);
    }

    // Listen for room state updates
    socket.on('sync_state', (state: { videoId?: string }) => {
      if (state.videoId && !videoFromUrl) {
        setVideoId(state.videoId);
        const newUrl = `${window.location.pathname}?room=${roomFromUrl}&v=${state.videoId}`;
        window.history.pushState({}, '', newUrl);
      }
    });

    // Listen for video updates
    socket.on('video_updated', (newVideoId: string) => {
      setVideoId(newVideoId);
      const newUrl = `${window.location.pathname}?room=${roomFromUrl}&v=${newVideoId}`;
      window.history.pushState({}, '', newUrl);
    });

    return () => {
      socket.off('sync_state');
      socket.off('video_updated');
    };
  }, []);

  const handleVideoSubmit = (newVideoId: string) => {
    setVideoId(newVideoId);
    const newUrl = `${window.location.pathname}?room=${roomId}&v=${newVideoId}`;
    window.history.pushState({}, '', newUrl);
    socket.emit('update_video', { videoId: newVideoId, roomId });
  };

  const handleShareRoom = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}${videoId ? `&v=${videoId}` : ''}`;
    navigator.clipboard.writeText(url);
    alert('Room link copied to clipboard!');
  };

  const updateMovieContext = (context: string) => {
    socket.emit('update_movie_context', { roomId, context });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <RoomInfo roomId={roomId} onShare={handleShareRoom} />
        
        <div className="flex flex-col items-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
            Watch YouTube Together
          </h2>
          
          <VideoInput onSubmit={handleVideoSubmit} />
          
          {videoId && (
            <VideoPlayer
              videoId={videoId}
              socket={socket}
              roomId={roomId}
              onContextUpdate={updateMovieContext}
            />
          )}
        </div>

        {username && roomId && (
          <Chat
            socket={socket}
            roomId={roomId}
            username={username}
          />
        )}
      </div>
    </Layout>
  );
}

export default App;