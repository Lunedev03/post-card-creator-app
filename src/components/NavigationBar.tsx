
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, History } from 'lucide-react';

const NavigationBar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-black/80 backdrop-blur-lg border-t border-white/10 w-full fixed bottom-0 left-0 right-0 px-4 py-3 z-50">
      <div className="container mx-auto flex justify-around items-center">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
            isActive('/') ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <LayoutGrid size={24} />
          <span className="text-xs">Editor</span>
        </Link>
        
        <Link 
          to="/history" 
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
            isActive('/history') ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        >
          <History size={24} />
          <span className="text-xs">Histórico</span>
        </Link>
      </div>
    </nav>
  );
};

export default NavigationBar;
