import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import NavigationBar from "./components/NavigationBar";
import TopBar from "./components/TopBar";
import { PostHistoryProvider } from "./contexts/PostHistoryContext";
import { ChatHistoryProvider } from "./contexts/ChatHistoryContext";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDarkMode = savedTheme ? savedTheme === 'dark' : systemPrefersDark;
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PostHistoryProvider>
        <ChatHistoryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-50 dark:from-gray-900 dark:to-black text-gray-800 dark:text-white flex flex-col transition-colors duration-300">
                <TopBar />
                <div className="flex-grow pt-14 pb-16"> {/* Padding for TopBar and NavigationBar */}
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/history" element={<History />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <NavigationBar />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ChatHistoryProvider>
      </PostHistoryProvider>
    </QueryClientProvider>
  );
};

export default App;
