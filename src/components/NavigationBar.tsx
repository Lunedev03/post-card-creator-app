
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History } from 'lucide-react';

const NavigationBar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md w-full fixed bottom-0 left-0 right-0 px-4 py-3 z-50">
      <div className="container mx-auto flex justify-around items-center">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
            isActive('/') ? 'text-indigo-900' : 'text-gray-600 hover:text-indigo-900'
          }`}
        >
          <LayoutDashboard size={24} />
          <span className="text-xs">Editor</span>
        </Link>
        
        <Link 
          to="/history" 
          className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg transition-colors ${
            isActive('/history') ? 'text-indigo-900' : 'text-gray-600 hover:text-indigo-900'
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
