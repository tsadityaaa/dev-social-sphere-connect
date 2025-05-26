
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface Post {
  _id: string;
  text: string;
  timestamp: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
}

const Timeline: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchPosts = async () => {
    try {
      // Changed from /timeline to / to get all posts
      const response = await fetch('http://localhost:5000/api/posts/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load posts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const handlePostCreated = () => {
    fetchPosts();
  };

  const handleFollowChange = () => {
    // Refresh posts to update follow status
    fetchPosts();
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Timeline</h1>
        
        <CreatePost onPostCreated={handlePostCreated} />
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No posts to show. Start posting to see content!</p>
          </div>
        ) : (
          <div>
            {posts.map(post => (
              <PostCard key={post._id} post={post} onFollowChange={handleFollowChange} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Timeline;
