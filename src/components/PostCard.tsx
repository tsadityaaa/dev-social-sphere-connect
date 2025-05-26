
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
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

interface PostCardProps {
  post: Post;
  onFollowChange?: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onFollowChange }) => {
  const { user: currentUser, token, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isFollowing = currentUser?.following.includes(post.userId._id) || false;
  const isOwnPost = currentUser?._id === post.userId._id;

  const handleFollow = async () => {
    if (!currentUser || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${post.userId._id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedFollowing = isFollowing
          ? currentUser.following.filter(id => id !== post.userId._id)
          : [...currentUser.following, post.userId._id];
        
        updateUser({ following: updatedFollowing });
        onFollowChange?.();
        
        toast({
          title: "Success",
          description: `${isFollowing ? 'Unfollowed' : 'Followed'} ${post.userId.name}`
        });
      } else {
        throw new Error('Failed to update follow status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {post.userId.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">{post.userId.name}</h3>
                <span className="text-gray-500 text-sm">
                  {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                </span>
              </div>
              <p className="text-gray-800">{post.text}</p>
            </div>
          </div>
          
          {!isOwnPost && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
              disabled={isLoading}
              size="sm"
              className="ml-4"
            >
              {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
