
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  followers: string[];
  following: string[];
}

interface UserCardProps {
  user: User;
  onFollowChange?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onFollowChange }) => {
  const { user: currentUser, token, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isFollowing = currentUser?.following.includes(user._id) || false;
  const isOwnProfile = currentUser?._id === user._id;

  const handleFollow = async () => {
    if (!currentUser || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user._id}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedFollowing = isFollowing
          ? currentUser.following.filter(id => id !== user._id)
          : [...currentUser.following, user._id];
        
        updateUser({ following: updatedFollowing });
        onFollowChange?.();
        
        toast({
          title: "Success",
          description: `${isFollowing ? 'Unfollowed' : 'Followed'} ${user.name}`
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
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-gray-600 text-sm">{user.email}</p>
              {user.bio && <p className="text-gray-700 mt-1">{user.bio}</p>}
              <div className="flex space-x-4 mt-2 text-sm text-gray-500">
                <span>{user.followers.length} followers</span>
                <span>{user.following.length} following</span>
              </div>
            </div>
          </div>
          
          {!isOwnProfile && (
            <Button
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UserCard;
