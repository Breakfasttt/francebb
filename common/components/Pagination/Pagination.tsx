/*
  Composant de pagination générique et unifié.
  Supporte la navigation par liens (href) ou par callback (onPageChange).
*/
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  baseUrl?: string; // Si fourni, utilise des liens <Link href={`${baseUrl}?page=${page}`} />
  queryParam?: string; // 'page' par défaut
  className?: string;
  showFirstLast?: boolean;
  variant?: 'default' | 'sidebar';
  showGoto?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  baseUrl,
  queryParam = 'page',
  className = '',
  showFirstLast = true,
  variant = 'default',
  showGoto = false
}) => {
  const [gotoValue, setGotoValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  if (totalPages <= 1) return null;

  const navigateToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      if (onPageChange) {
        onPageChange(page);
      } else if (baseUrl) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        window.location.assign(`${baseUrl}${separator}${queryParam}=${page}`);
      }
    }
  };

  const handleGotoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const page = parseInt(gotoValue, 10);
      if (!isNaN(page)) {
        navigateToPage(page);
      }
      setGotoValue('');
      inputRef.current?.blur();
    }
  };

  const renderPageButton = (page: number | string, label?: React.ReactNode, type: 'page' | 'nav' = 'page') => {
    const isPageNum = typeof page === 'number';
    const isActive = isPageNum && page === currentPage;
    const isDisabled = isPageNum && (page < 1 || page > totalPages);
    
    const pageNum = isPageNum ? page : 1;
    const content = label || page;

    const commonProps = {
      className: `pagination-item ${type} ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`,
      onClick: (e: React.MouseEvent) => {
        if (!baseUrl) e.preventDefault();
        navigateToPage(pageNum);
      },
      title: isPageNum ? `Page ${page}` : undefined
    };

    const separator = baseUrl?.includes('?') ? '&' : '?';
    const href = baseUrl ? `${baseUrl}${separator}${queryParam}=${pageNum}` : '#';

    if (baseUrl && !isDisabled) {
      return (
        <Link key={`${type}-${page}`} href={href} {...commonProps}>
          {content}
        </Link>
      );
    }

    return (
      <button key={`${type}-${page}`} type="button" disabled={isDisabled || isActive} {...commonProps}>
        {content}
      </button>
    );
  };

  // Logique de génération des numéros de pages (compacte)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1; // Nombre de pages autour de la page courante

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1) || 
        (i === currentPage + delta + 1)
      ) {
        pages.push('...');
      }
    }

    return [...new Set(pages)];
  };

  return (
    <nav className={`pagination-container ${variant} ${className}`} aria-label="Pagination">
      {variant === 'sidebar' && (
        <div className="pagination-header">
          <span className="pagination-title">Pages</span>
          <div className="pagination-goto">
            <input
              ref={inputRef}
              type="text"
              placeholder={currentPage.toString()}
              value={gotoValue}
              onChange={(e) => setGotoValue(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={handleGotoKeyDown}
              className="pagination-input"
            />
            <span className="pagination-total">/ {totalPages}</span>
          </div>
        </div>
      )}
      <div className="pagination-list">
        {showFirstLast && renderPageButton(1, <ChevronsLeft size={variant === 'sidebar' ? 14 : 16} />, 'nav')}
        {renderPageButton(Math.max(1, currentPage - 1), <ChevronLeft size={variant === 'sidebar' ? 14 : 16} />, 'nav')}

        {variant !== 'sidebar' && (
          <div className="pagination-numbers">
            {getPageNumbers().map((p, i) => (
              p === '...' 
                ? <span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>
                : renderPageButton(p as number)
            ))}
          </div>
        )}

        {variant === 'sidebar' && (
          <div className="pagination-numbers sidebar-mode">
             {renderPageButton(currentPage)}
          </div>
        )}

        {renderPageButton(Math.min(totalPages, currentPage + 1), <ChevronRight size={variant === 'sidebar' ? 14 : 16} />, 'nav')}
        {showFirstLast && renderPageButton(totalPages, <ChevronsRight size={variant === 'sidebar' ? 14 : 16} />, 'nav')}
      </div>
    </nav>
  );
};

export default Pagination;
