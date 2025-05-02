
import React, { useState } from 'react';
import { usePostHistory, Post } from '@/contexts/PostHistoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Download, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { exportAsImage } from '@/utils/imageExport';
import { Input } from '@/components/ui/input';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const History = () => {
  const { posts, deletePost, clearAllPosts } = usePostHistory();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const handleDelete = (id: string) => {
    deletePost(id);
    toast({
      title: "Post excluído",
      description: "O post foi removido do histórico.",
    });
  };
  
  const handleClearAll = () => {
    if (posts.length > 0) {
      clearAllPosts();
      toast({
        title: "Histórico limpo",
        description: "Todos os posts foram removidos do histórico.",
      });
    }
  };

  const handleExportPost = (post: Post) => {
    // Create a temporary div to render the post
    const tempDiv = document.createElement('div');
    tempDiv.style.padding = '16px';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.borderRadius = '8px';
    tempDiv.style.width = '500px';
    tempDiv.style.fontFamily = 'Helvetica, Arial, sans-serif';
    
    // Add text
    const textElement = document.createElement('div');
    textElement.textContent = post.text;
    textElement.style.fontSize = '18px';
    textElement.style.lineHeight = '1.5';
    textElement.style.marginBottom = post.images && post.images.length > 0 ? '12px' : '0';
    tempDiv.appendChild(textElement);
    
    // Add images if they exist
    if (post.images && post.images.length > 0) {
      const imageContainer = document.createElement('div');
      
      if (post.images.length === 1) {
        const img = document.createElement('img');
        img.src = post.images[0];
        img.style.width = '100%';
        img.style.borderRadius = '8px';
        img.style.display = 'block';
        imageContainer.appendChild(img);
      } else {
        imageContainer.style.display = 'grid';
        imageContainer.style.gridTemplateColumns = post.images.length >= 2 ? '1fr 1fr' : '1fr';
        imageContainer.style.gap = '8px';
        
        post.images.forEach(imgSrc => {
          const img = document.createElement('img');
          img.src = imgSrc;
          img.style.width = '100%';
          img.style.borderRadius = '8px';
          img.style.display = 'block';
          imageContainer.appendChild(img);
        });
      }
      
      tempDiv.appendChild(imageContainer);
    }
    
    // Append to body temporarily (hidden)
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    // Export and remove the element
    exportAsImage(tempDiv, `post-${format(new Date(post.date), 'yyyy-MM-dd-HH-mm')}.png`);
    setTimeout(() => {
      document.body.removeChild(tempDiv);
    }, 1000);
  };
  
  // Filter posts based on search term
  const filteredPosts = posts.filter(post => 
    post.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#121212] pb-20 pt-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col space-y-4">
          {/* Header section with search */}
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center">
            <h1 className="text-2xl font-bold text-white">Histórico de Posts</h1>
            
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Buscar posts..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/50 border-gray-700 text-white w-full md:w-64"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={`border-gray-700 ${viewMode === 'grid' ? 'bg-purple-900/50 text-white' : 'bg-black/50 text-gray-400'}`}
                  onClick={() => setViewMode('grid')}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 2H6V6H2V2ZM9 2H13V6H9V2ZM2 9H6V13H2V9ZM9 9H13V13H9V9Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                  </svg>
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className={`border-gray-700 ${viewMode === 'list' ? 'bg-purple-900/50 text-white' : 'bg-black/50 text-gray-400'}`}
                  onClick={() => setViewMode('list')}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3H13V4H2V3ZM2 7H13V8H2V7ZM2 11H13V12H2V11Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
                  </svg>
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-700 bg-black/50 text-gray-400 hover:bg-purple-900/50 hover:text-white"
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                >
                  <Filter size={15} />
                </Button>
                
                {posts.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar histórico
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Filters section */}
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="w-full">
            <CollapsibleContent className="bg-black/30 p-4 rounded-lg border border-gray-800 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Data</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="border-gray-700 bg-black/50 text-gray-400 hover:bg-purple-900/30">
                      Hoje
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-700 bg-black/50 text-gray-400 hover:bg-purple-900/30">
                      Esta semana
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-2">Conteúdo</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="border-gray-700 bg-black/50 text-gray-400 hover:bg-purple-900/30">
                      Com imagens
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-700 bg-black/50 text-gray-400 hover:bg-purple-900/30">
                      Apenas texto
                    </Button>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Empty state */}
          {filteredPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 bg-black/30 rounded-xl border border-gray-800">
              {posts.length === 0 ? (
                <>
                  <div className="h-20 w-20 rounded-full bg-purple-900/20 flex items-center justify-center mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 5V19H5V5H19ZM21 3H3V21H21V3ZM13 7H11V11H7V13H11V17H13V13H17V11H13V7Z" fill="#a78bfa"/>
                    </svg>
                  </div>
                  <p className="text-gray-300 text-lg font-medium mb-1">Seu histórico está vazio</p>
                  <p className="text-gray-500 text-center">Os posts que você salvar aparecerão aqui</p>
                </>
              ) : (
                <>
                  <div className="h-20 w-20 rounded-full bg-purple-900/20 flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-purple-400" />
                  </div>
                  <p className="text-gray-300 text-lg font-medium mb-1">Nenhum resultado encontrado</p>
                  <p className="text-gray-500 text-center">Tente usar termos diferentes na busca</p>
                </>
              )}
            </div>
          )}
          
          {/* Grid View */}
          {filteredPosts.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden bg-black/50 border border-gray-800 text-white hover:border-purple-800 transition-all">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-400">
                        {format(new Date(post.date), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-red-500 hover:bg-red-500/10 p-1 h-auto"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    <p className="text-gray-200 break-words whitespace-pre-wrap text-sm">
                      {post.text.length > 150 
                        ? `${post.text.substring(0, 150)}...` 
                        : post.text}
                    </p>
                  </div>
                  
                  {post.images && post.images.length > 0 && (
                    <div className={`${post.images.length === 1 ? 'h-48' : 'grid grid-cols-2 gap-1 p-1'} overflow-hidden bg-black/30`}>
                      {post.images.length === 1 ? (
                        <img 
                          src={post.images[0]} 
                          alt="Imagem do post" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        post.images.map((img, idx) => (
                          <div key={idx} className="aspect-square overflow-hidden">
                            <img 
                              src={img} 
                              alt={`Imagem ${idx+1} do post`} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  
                  <div className="p-3 bg-black/70">
                    <Button 
                      onClick={() => handleExportPost(post)}
                      size="sm"
                      className="w-full bg-purple-700 hover:bg-purple-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Table/List View */}
          {filteredPosts.length > 0 && viewMode === 'list' && (
            <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400">Conteúdo</TableHead>
                    <TableHead className="text-gray-400">Mídia</TableHead>
                    <TableHead className="text-gray-400 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id} className="border-gray-800">
                      <TableCell className="text-sm text-gray-300">
                        {format(new Date(post.date), "d MMM yyyy", { locale: ptBR })}
                        <div className="text-xs text-gray-500">{format(new Date(post.date), "HH:mm", { locale: ptBR })}</div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-200">
                        {post.text.length > 80 
                          ? `${post.text.substring(0, 80)}...` 
                          : post.text}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {post.images && post.images.length > 0 
                          ? `${post.images.length} imagem(ns)` 
                          : 'Nenhuma'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-purple-400 hover:bg-purple-900/20"
                            onClick={() => handleExportPost(post)}
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-400 hover:bg-red-900/20"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
