
import React from 'react';

const TopBar = () => {
  return (
    <nav className="bg-black w-full fixed top-0 left-0 right-0 px-4 py-3 z-50 border-b border-white/10">
      <div className="container mx-auto flex justify-center items-center">
        <div className="text-white font-bold text-2xl">
          <img 
            src="/public/lovable-uploads/262cb9bf-0b9d-479a-901c-35d17ebd1a29.png" 
            alt="Logo" 
            className="h-8"
          />
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
