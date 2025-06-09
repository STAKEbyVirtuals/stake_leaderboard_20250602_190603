/**
 * @fileoverview 리더보드 테이블의 페이지네이션 컨트롤 컴포넌트.
 */

import React from 'react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null; // 총 페이지가 1개 이하면 페이지네이션 컨트롤을 표시하지 않음
  }

  return (
    <div className="flex justify-center my-6 space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
      >
        이전
      </button>
      <span className="py-2 px-4 text-white text-lg">
        페이지 <span className="font-semibold">{currentPage}</span> / <span className="font-semibold">{totalPages}</span>
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors duration-200"
      >
        다음
      </button>
    </div>
  );
};

export default PaginationControls; 