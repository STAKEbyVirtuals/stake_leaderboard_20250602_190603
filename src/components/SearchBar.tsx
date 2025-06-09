/**
 * @fileoverview 리더보드 검색 기능을 위한 검색 바 컴포넌트.
 */

import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchChange, placeholder = 'Discord ID 또는 지갑 주소 검색' }) => {
  return (
    <div className="my-4">
      <input
        type="text"
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar; 