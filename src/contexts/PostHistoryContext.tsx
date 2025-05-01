
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type Post = {
  id: string;
  text: string;
  images?: string[]; // Changed from image: string | null to support multiple images
  userName?: string;
  displayName?: string;
  date: string;
  verified?: boolean;
};

interface PostHistoryContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'date'>) => void;
  deletePost: (id: string) => void;
  clearAllPosts: () => void;
}

const PostHistoryContext = createContext<PostHistoryContextType | undefined>(undefined);

export const usePostHistory = () => {
  const context = useContext(PostHistoryContext);
  if (!context) {
    throw new Error('usePostHistory must be used within a PostHistoryProvider');
  }
  return context;
};

export const PostHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>(() => {
    const savedPosts = localStorage.getItem('post-history');
    return savedPosts ? JSON.parse(savedPosts) : [];
  });

  useEffect(() => {
    localStorage.setItem('post-history', JSON.stringify(posts));
  }, [posts]);

  const addPost = (newPost: Omit<Post, 'id' | 'date'>) => {
    const postWithId: Post = {
      ...newPost,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setPosts((prev) => [postWithId, ...prev]);
  };

  const deletePost = (id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  };

  const clearAllPosts = () => {
    setPosts([]);
  };

  return (
    <PostHistoryContext.Provider value={{ posts, addPost, deletePost, clearAllPosts }}>
      {children}
    </PostHistoryContext.Provider>
  );
};
