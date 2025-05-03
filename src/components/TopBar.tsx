
import React, { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sun, Moon, FileImage } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const TopBar = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme ? savedTheme === 'dark' : systemPrefersDark;
  });

  useEffect(() => {
    // Apply theme when component mounts and when theme changes
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const applyTheme = (dark: boolean) => {
    const root = window.document.documentElement;
    
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };
  
  return (
    <nav className="bg-white/80 dark:bg-black/80 backdrop-blur-lg w-full fixed top-0 left-0 right-0 px-4 py-3 z-50 border-b border-gray-200 dark:border-white/10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileImage size={24} className="text-blue-500" />
          <h1 className="text-gray-800 dark:text-white font-bold text-xl">AI Post Editor</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
            aria-label={isDarkMode ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
