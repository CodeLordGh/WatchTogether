export const isYouTubeUrl = (url: string): boolean => {
  // Check if it's a full URL
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return true;
  }
  // Check if it's just a video ID (11 characters)
  return /^[a-zA-Z0-9_-]{11}$/.test(url);
};

export const isDailymotionUrl = (url: string): boolean => {
  // Check if it's a full URL
  if (url.includes('dailymotion.com')) {
    return true;
  }
  // Check if it's just a video ID (e.g., x7tgd2g)
  return /^[a-zA-Z0-9]{6,}$/.test(url);
};

export const extractDailymotionId = (url: string): string => {
  // If it's already an ID, return it
  if (/^[a-zA-Z0-9]{6,}$/.test(url)) {
    return url;
  }
  // Otherwise extract from URL
  const match = url.match(/dailymotion.com\/video\/([a-zA-Z0-9]+)/);
  return match ? match[1] : url;
};

export const extractYouTubeId = (url: string): string => {
  // If it's already an ID, return it
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  // Otherwise extract from URL
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : url;
};
