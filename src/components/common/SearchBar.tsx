import React from 'react';
import { Search } from 'lucide-react'; //insert icon search icon from lucide-react

interface SearchBarProps { // create interface
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => { //functional component return UI
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search here"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <Search size={20} className="text-gray-400" />
      </div>
    </div>
  );
};

export default SearchBar;