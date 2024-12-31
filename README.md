# Watch Together: Synchronized Movie Watching for Long-Distance Relationships

Watch Together is a web application that enables synchronized movie watching experiences for couples and friends in long-distance relationships. Born from personal experience with my girlfriend living abroad, this app makes movie nights feel intimate despite the physical distance.
## The Story Behind Watch Together

Long-distance relationships come with their unique challenges, and one of the things I missed most was the simple joy of watching movies together with my girlfriend. While living in different countries, we tried various ways to watch movies together - screen sharing on video calls, counting down to press play at the same time, and using different watch party apps. But none of them quite captured the natural feel of sitting together and enjoying a movie.

The breaking point came during one movie night when our video kept getting out of sync, and we spent more time trying to coordinate our playback than actually watching the movie. That's when I decided to build Watch Together. I wanted to create something that would make our movie nights feel as natural as possible, despite being thousands of miles apart.

The journey of building this app has been deeply personal. Every feature was inspired by our actual experiences:
- The synchronized playback came from our frustration with constantly asking "Are you at the part where...?"
- The AI-powered chat suggestions were added because sometimes we wanted to discuss the movie but didn't want to interrupt the flow
- The transparent chat overlay was designed so we could comment without missing any scenes
- The relationship context in chat suggestions helps make conversations more meaningful and personal

What started as a solution for our long-distance movie nights has grown into a platform that helps other couples and friends stay connected through shared experiences. Every time we use the app for our movie nights, we think of new ways to make it better, and that's what keeps this project evolving.

## Features

### Core Features
- **Synchronized Video Playback**: 
  - Real-time synchronization of play/pause actions
  - Synchronized seeking across all devices
  - Automatic time-drift compensation
  - Support for YouTube videos

- **Smart Chat System**:
  - Real-time messaging
  - AI-powered conversation suggestions based on movie context
  - Relationship-aware chat topics
  - Transparent overlay design that doesn't obstruct the video
  - Emoji support

- **Room Management**:
  - Private viewing rooms
  - Persistent room states
  - Multiple concurrent rooms support
  - User presence tracking

## Technical Requirements

### Prerequisites
- Node.js (v16 or higher)
- npm (v7 or higher)
- A Google AI API key for chat suggestions

### Environment Variables
Create a `.env` file in the project root with:
```env
# Required for AI chat suggestions
GOOGLE_AI_KEY=your_google_ai_api_key

# Server Port (optional, defaults to 3001)
PORT=3001
```

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd watch-together
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Usage Guide

### Starting a Watch Session

1. **Create a Room**:
   - Open the app in your browser
   - A unique room ID will be automatically generated
   - Share this room ID with your watching partner

2. **Join a Room**:
   - Enter the room ID shared with you
   - You'll automatically sync with the current video state

3. **Adding Videos**:
   - Paste a YouTube video URL or ID
   - The video will automatically sync for all room participants

### Using the Chat

1. **Regular Chat**:
   - Click the chat icon in the bottom right
   - Type your message and press send or Enter

2. **AI Suggestions**:
   - Enter your relationship with other viewers (e.g., "girlfriend", "best friend")
   - Click the robot icon for movie-relevant conversation starters
   - AI suggestions are context-aware and consider both the movie and your relationship

### Video Controls

- **Play/Pause**: 
  - Use the video controls or spacebar
  - Changes sync automatically with other viewers

- **Seeking**:
  - Click anywhere on the progress bar
  - Drag the progress indicator
  - All viewers will sync to the new position

## Technical Architecture

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Socket.IO client for real-time communication
- YouTube Player API for video playback
- Tailwind CSS for styling

### Backend
- Express.js server
- Socket.IO for WebSocket handling
- Google Generative AI for chat suggestions
- Room state management system

### Real-time Synchronization
- WebSocket-based event system
- Time drift compensation
- Buffering state handling
- Periodic sync checks

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Local Development
```bash
npm run dev
```

## Future Roadmap

### Planned Features
1. **Custom Reactions**
   - Quick emoji reactions to movie moments
   - Favorite scene marking

2. **Movie Recommendations**
   - AI-powered suggestions
   - Movie database integration

3. **Watch History**
   - Session tracking
   - Resume functionality

4. **Voice Chat**
   - Optional voice communication
   - Push-to-talk feature

5. **Movie Queue**
   - Shared watchlists
   - Voting system

6. **Custom Subtitles**
   - Multi-language support
   - Custom subtitle sync

7. **Smart Home Integration**
   - Mood lighting sync
   - Room ambiance control

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

Special thanks to my girlfriend for inspiring this project and being the first beta tester. Your feedback and patience have been invaluable in making this app better with each update.
