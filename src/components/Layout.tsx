
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, User, Search, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-blue-600">
              DevConnect
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  isActive('/') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Home size={20} />
                <span>Timeline</span>
              </Link>
              
              <Link 
                to="/explore" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  isActive('/explore') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Search size={20} />
                <span>Explore</span>
              </Link>
              
              <Link 
                to="/profile" 
                className={`flex items-center space-x-1 px-3 py-2 rounded-md ${
                  isActive('/profile') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <User size={20} />
                <span>Profile</span>
              </Link>
              
              <Button 
                variant="ghost" 
                onClick={logout}
                className="flex items-center space-x-1"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;
