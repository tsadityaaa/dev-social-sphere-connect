
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PostCard from '../components/PostCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';

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

const Profile: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    bio: user?.bio || ''
  });

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/posts/user/${user?._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserPosts();
      setEditData({
        name: user.name,
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully!"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editData.bio}
                        onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveProfile} size="sm">Save</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)} size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h2 className="text-xl font-semibold mb-2">{user.name}</h2>
                    <p className="text-gray-600 text-sm mb-4">{user.email}</p>
                    {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}
                    <div className="flex justify-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{user.followers.length}</div>
                        <div className="text-gray-600">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{user.following.length}</div>
                        <div className="text-gray-600">Following</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{posts.length}</div>
                        <div className="text-gray-600">Posts</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">My Posts</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading posts...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">You haven't posted anything yet.</p>
              </div>
            ) : (
              <div>
                {posts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
