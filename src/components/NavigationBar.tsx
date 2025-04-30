
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, History } from 'lucide-react';

const NavigationBar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md w-full px-4 py-4 mb-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-indigo-900">PostSimulator</div>
        
        <div className="flex space-x-4">
          <Link 
            to="/" 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive('/') ? 'bg-indigo-100 text-indigo-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Editor</span>
          </Link>
          
          <Link 
            to="/history" 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isActive('/history') ? 'bg-indigo-100 text-indigo-900' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <History size={18} />
            <span>Histórico</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
