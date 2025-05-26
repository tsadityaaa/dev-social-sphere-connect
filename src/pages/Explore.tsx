
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import UserCard from '../components/UserCard';
import { Input } from '@/components/ui/input';
import { useAuth } from '../contexts/AuthContext';
import { Search } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  followers: string[];
  following: string[];
}

const Explore: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Explore Users</h1>
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">
              {searchTerm ? 'No users found matching your search.' : 'No users to display.'}
            </p>
          </div>
        ) : (
          <div>
            {filteredUsers.map(user => (
              <UserCard key={user._id} user={user} onFollowChange={fetchUsers} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Explore;
