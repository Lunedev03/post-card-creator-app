
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PostHistoryProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col">
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
    </PostHistoryProvider>
  </QueryClientProvider>
);

export default App;
