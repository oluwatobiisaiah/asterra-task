import React, { useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationInfo } from '../../types/common';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

const Pagination = React.memo<PaginationProps>(({ pagination, onPageChange }) => {
  const handlePageChange = useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);

  if (pagination.totalPages <= 1) {
    return null;
  }

  const getVisiblePages = () => {
    const { page, totalPages } = pagination;
    const pages: number[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (page <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i);
      }
      pages.push(-1); // ellipsis
      pages.push(totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1);
      pages.push(-1); // ellipsis
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push(-1); // ellipsis
      for (let i = page - 1; i <= page + 1; i++) {
        pages.push(i);
      }
      pages.push(-1); // ellipsis
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="glass-effect rounded-2xl shadow-xl">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-700">
            Page <span className="text-primary-600">{pagination.page}</span> of{' '}
            <span className="text-primary-600">{pagination.totalPages}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={!pagination.hasPreviousPage}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page Numbers */}
          <div className="hidden sm:flex items-center gap-2">
            {getVisiblePages().map((pageNum, index) => (
              pageNum === -1 ? (
                <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    pageNum === pagination.page
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            ))}
          </div>

          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 border-slate-200 text-slate-700 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:bg-white shadow-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

Pagination.displayName = 'Pagination';

export default Pagination;