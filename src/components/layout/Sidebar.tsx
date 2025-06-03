import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, Bell, User } from 'lucide-react';

interface SidebarProps {
  onAddQuestion: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddQuestion }) => {
  return (
    <div className="w-16 md:w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 fixed h-full">
      <div className="text-2xl font-bold text-blue-500 mb-10">
        <span className="bg-blue-500 text-white px-2 py-1 rounded">QA</span>
      </div>
      
      <div className="flex flex-col space-y-8">
        <NavLink to="/" className={({ isActive }) => 
          `text-${isActive ? 'blue-500' : 'gray-500'} hover:text-blue-500 transition-colors duration-200`
        }>
          <Home size={24} />
        </NavLink>
        
        <button 
          onClick={onAddQuestion}
          className="text-gray-500 hover:text-blue-500 transition-colors duration-200"
          aria-label="Add question"
        >
          <PlusCircle size={24} />
        </button>
        
        <NavLink to="/notifications" className={({ isActive }) => 
          `text-${isActive ? 'blue-500' : 'gray-500'} hover:text-blue-500 transition-colors duration-200`
        }>
          <Bell size={24} />
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => 
          `text-${isActive ? 'blue-500' : 'gray-500'} hover:text-blue-500 transition-colors duration-200`
        }>
          <User size={24} />
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;