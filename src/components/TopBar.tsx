
import React from 'react';

const TopBar = () => {
  return (
    <nav className="bg-black w-full fixed top-0 left-0 right-0 px-4 py-3 z-50 border-b border-white/10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white font-bold text-2xl">
          <img 
            src="/lovable-uploads/262cb9bf-0b9d-479a-901c-35d17ebd1a29.png" 
            alt="Logo" 
            className="h-8"
          />
        </div>
        <div className="hidden md:flex space-x-8 text-white/80">
          <a href="#" className="hover:text-white">PRICING</a>
          <a href="#" className="hover:text-white">FEATURES</a>
          <a href="#" className="hover:text-white">ENTERPRISE</a>
          <a href="#" className="hover:text-white">BLOG</a>
          <a href="#" className="hover:text-white">FORUM</a>
          <a href="#" className="hover:text-white">CAREERS</a>
        </div>
        <div className="hidden md:flex items-center space-x-4">
          <button className="px-4 py-2 border border-white/20 text-white hover:bg-white/10 rounded">SIGN IN</button>
          <button className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded flex items-center">
            <span className="mr-2">DOWNLOAD</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
