import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuth();
  
  if (!isLoggedIn) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="text-gray-600 mb-4">Please sign in to view your profile</p>
        <button 
          className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200"
        >
          Sign In
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 font-bold text-xl">
            {user?.name.charAt(0)}
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-gray-500">@{user?.username}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold">23</p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold">142</p>
              <p className="text-sm text-gray-500">Answers</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-2xl font-bold">1.2k</p>
              <p className="text-sm text-gray-500">Likes</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="text-red-500 hover:text-red-600 transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;