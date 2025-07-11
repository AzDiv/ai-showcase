import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Home, Play } from 'lucide-react';
import WebsiteChatbox from './WebsiteChatbox';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors">
              <Brain className="h-8 w-8" />
              <span className="text-xl font-bold">HF AI Showcase</span>
            </Link>
            
            <nav className="flex space-x-6">
              <Link
                to="/"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/playground"
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/playground'
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Play className="h-4 w-4" />
                <span>Playground</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">Built with React, TypeScript, and Tailwind CSS</p>
            <p className="text-sm">Powered by Hugging Face Inference API</p>
          </div>
        </div>
      </footer>
      
      <WebsiteChatbox />
    </div>
  );
};

export default Layout;