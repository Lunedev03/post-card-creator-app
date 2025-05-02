
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sun, Moon, FileImage } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TopBar = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real implementation, we would apply the theme change here
  };
  
  return (
    <nav className="bg-black/90 backdrop-blur-lg w-full fixed top-0 left-0 right-0 px-4 py-3 z-50 border-b border-white/10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileImage size={24} className="text-blue-400" />
          <h1 className="text-white font-bold text-xl">AI Post Editor</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-gray-400 hover:text-white"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
