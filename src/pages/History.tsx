
import React from 'react';
import { usePostHistory, Post } from '@/contexts/PostHistoryContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { exportAsImage } from '@/utils/imageExport';

const History = () => {
  const { posts, deletePost, clearAllPosts } = usePostHistory();
  const { toast } = useToast();
  
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
    textElement.style.marginBottom = post.image ? '12px' : '0';
    tempDiv.appendChild(textElement);
    
    // Add image if exists
    if (post.image) {
      const imgElement = document.createElement('img');
      imgElement.src = post.image;
      imgElement.style.width = '100%';
      imgElement.style.borderRadius = '8px';
      imgElement.style.display = 'block';
      tempDiv.appendChild(imgElement);
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Histórico de Posts</h1>
        {posts.length > 0 && (
          <Button 
            variant="outline" 
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={handleClearAll}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar histórico
          </Button>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Seu histórico está vazio</p>
          <p className="text-gray-400">Os posts que você salvar aparecerão aqui</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden bg-white shadow-md hover:shadow-lg transition-shadow">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-gray-500">
                    {format(new Date(post.date), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 p-1 h-auto"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <p className="text-gray-800 break-words whitespace-pre-wrap text-sm">
                  {post.text.length > 150 
                    ? `${post.text.substring(0, 150)}...` 
                    : post.text}
                </p>
              </div>
              
              {post.image && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt="Imagem do post" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-3 bg-gray-50">
                <Button 
                  onClick={() => handleExportPost(post)}
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
