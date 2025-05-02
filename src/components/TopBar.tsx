
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const TopBar = () => {
  const isMobile = useIsMobile();
  
  return (
    <nav className="bg-black w-full fixed top-0 left-0 right-0 px-4 py-3 z-50 border-b border-white/10">
      <div className="container mx-auto flex justify-center items-center">
        <h1 className="text-white font-bold text-xl">AI Post Editor</h1>
      </div>
    </nav>
  );
};

export default TopBar;
