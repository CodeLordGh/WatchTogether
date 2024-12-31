import React from 'react';
import { Youtube } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useDarkMode } from '../hooks/useDarkMode';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isDark, setIsDark] = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Youtube className="w-8 h-8 text-red-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                YouTube Watch Party
              </h1>
            </div>
            <ThemeToggle isDark={isDark} toggle={() => setIsDark(!isDark)} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};