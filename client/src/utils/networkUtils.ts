export const checkInternetConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch('https://www.google.com/favicon.ico', {
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
};

export const withInternetCheck = async <T>(
  callback: () => Promise<T>
): Promise<T> => {
  const isOnline = await checkInternetConnection();
  
  if (!isOnline) {
    alert('No internet connection. Please check your connection and try again.');
    throw new Error('No internet connection');
  }
  
  return callback();
};
