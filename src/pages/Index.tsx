
import React from 'react';
import Header from '@/components/Header';
import PostSimulator from '@/components/PostSimulator';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-8 facebook-container">
      <div className="container mx-auto px-4">
        <Header />
        <PostSimulator />
      </div>
    </div>
  );
};

export default Index;
