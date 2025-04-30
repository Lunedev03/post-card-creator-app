
import React from 'react';
import PostSimulator from '@/components/PostSimulator';
import Header from '@/components/Header';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <Header />
        <PostSimulator />
      </div>
    </div>
  );
};

export default Index;
