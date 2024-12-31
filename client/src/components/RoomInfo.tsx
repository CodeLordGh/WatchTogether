import React from 'react';
import { Users, Share2 } from 'lucide-react';

interface RoomInfoProps {
  roomId: string;
  onShare: () => void;
}

export const RoomInfo: React.FC<RoomInfoProps> = ({ roomId, onShare }) => {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2">
        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span className="text-sm text-gray-600 dark:text-gray-300">Room: {roomId}</span>
      </div>
      <button
        onClick={onShare}
        className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
      >
        <Share2 className="w-4 h-4" />
        <span>Share</span>
      </button>
    </div>
  );
};