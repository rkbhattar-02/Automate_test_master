import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FolderTree, Activity, Bot } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="bg-white text-gray-800 p-4 border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-xl font-bold flex items-center text-primary-600">
            <FolderTree className="w-6 h-6 mr-2" />
            Test Manager
          </Link>
          
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 rounded-md ${
                location.pathname === '/' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/api-test" 
              className={`px-3 py-2 rounded-md flex items-center ${
                location.pathname === '/api-test' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary-600'
              }`}
            >
              <Activity className="w-4 h-4 mr-1" />
              API Tester
            </Link>
          </div>
        </div>

        <button 
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          onClick={() => {
            // Add OI Agent functionality here
            console.log('OI Agent clicked');
          }}
        >
          <Bot className="w-5 h-5 mr-2" />
          OI Agent
        </button>
      </div>
    </nav>
  );
}