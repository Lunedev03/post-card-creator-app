import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, History } from 'lucide-react';

const NavigationBar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200 dark:border-white/10 w-full fixed bottom-0 left-0 right-0 px-4 py-3 z-50 transition-colors duration-300">
      <div className="container mx-auto flex justify-around items-center">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-all ${
            isActive('/') 
              ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-white/10' 
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/5'
          }`}
        >
          <LayoutGrid size={20} />
          <span className="text-xs font-medium">Editor</span>
        </Link>
        
        <Link 
          to="/history" 
          className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-lg transition-all ${
            isActive('/history') 
              ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-white/10' 
              : 'text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-white hover:bg-blue-50 dark:hover:bg-white/5'
          }`}
        >
          <History size={20} />
          <span className="text-xs font-medium">Posts</span>
        </Link>
      </div>
    </nav>
  );
};

export default NavigationBar;
