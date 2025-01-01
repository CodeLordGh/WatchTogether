import React from 'react';
import { VideoResult } from '../types/video';

interface VideoGridProps {
  videos: VideoResult[];
  onVideoSelect: (url: string) => void;
  loading?: boolean;
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos, onVideoSelect, loading }) => {
  if (loading && videos.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onVideoSelect(video.url)}
        >
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No thumbnail</span>
            </div>
          )}
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>{video.duration}</span>
              <span className="capitalize">{video.source}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
