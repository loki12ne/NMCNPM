// Description: Main layout component for the application, including searchbar and main content area
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom'; //chuyển trang
import HomePage from '../../pages/HomePage';
import NotificationsPage from '../../pages/NotificationsPage';
import ProfilePage from '../../pages/ProfilePage';
import SearchBar from '../common/SearchBar';

const MainContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div className="flex-1 pl-16 md:pl-20">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainContent;