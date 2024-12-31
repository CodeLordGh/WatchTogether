import { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { cn } from '../lib/utils';
import { MessageCircle, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
  isAiSuggestion?: boolean;
}

interface ChatProps {
  socket: Socket;
  roomId: string;
  username: string;
}

export function Chat({ socket, roomId, username }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    socket.on('chat_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('ai_suggestion', (suggestion: ChatMessage) => {
      setMessages(prev => [...prev, { ...suggestion, isAiSuggestion: true }]);
    });

    return () => {
      socket.off('chat_message');
      socket.off('ai_suggestion');
    };
  }, [socket]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: crypto.randomUUID(),
      sender: username,
      content: newMessage,
      timestamp: Date.now(),
    };

    socket.emit('chat_message', { roomId, message });
    setNewMessage('');
  };

  const requestAiSuggestion = () => {
    socket.emit('request_ai_suggestion', {
      roomId,
      username,
      relationship,
    });
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="self-end mb-2 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
      >
        <MessageCircle />
      </button>

      {isOpen && (
        <div className="w-80 h-96 bg-opacity-80 backdrop-blur-sm bg-gray-900/50 rounded-lg shadow-lg flex flex-col border border-gray-700/50">
          <div className="p-4 border-b border-gray-700/50">
            <h3 className="font-semibold text-white">Chat</h3>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              placeholder="Your relationship with the other person"
              className="w-full mt-2 p-2 text-sm border rounded bg-gray-800/50 text-white placeholder-gray-400 border-gray-700/50"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "mb-2 p-2 rounded max-w-[80%]",
                  msg.sender === username
                    ? "ml-auto bg-blue-500/70 text-white"
                    : msg.isAiSuggestion
                    ? "bg-purple-500/70 text-white"
                    : "bg-gray-700/70 text-white",
                )}
              >
                <div className="text-xs opacity-75 mb-1">{msg.sender}</div>
                <div>{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-700/50">
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 rounded bg-gray-800/50 text-white placeholder-gray-400 border border-gray-700/50"
              />
              <button
                type="button"
                onClick={requestAiSuggestion}
                className="p-2 bg-purple-500/70 text-white rounded hover:bg-purple-600/70"
                title="Get AI Suggestion"
              >
                🤖
              </button>
              <button
                type="submit"
                className="p-2 bg-blue-500/70 text-white rounded hover:bg-blue-600/70"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
