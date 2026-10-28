/*
  Composant de pagination générique et unifié.
  Offre un comportement "fixe" (nombre de slots constant) et un champ de saisie directe.
*/
"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  baseUrl?: string; 
  queryParam?: string; 
  className?: string;
  variant?: 'default' | 'sidebar';
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  baseUrl,
  queryParam = 'page',
  className = '',
  variant = 'default'
}: PaginationProps) {
  
  const [inputValue, setInputValue] = React.useState(currentPage.toString());

  // On synchronise l'input avec la page actuelle si elle change par clic
  React.useEffect(() => {
    setInputValue(currentPage.toString());
  }, [currentPage]);

  if (totalPages <= 1) return null;

  const navigateToPage = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages);
    if (target !== currentPage) {
      if (onPageChange) {
        onPageChange(target);
      } else if (baseUrl) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        window.location.assign(`${baseUrl}${separator}${queryParam}=${target}`);
      }
    } else {
        // Si c'est la même page, on reset l'input au cas où
        setInputValue(currentPage.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const page = parseInt(inputValue, 10);
      if (!isNaN(page)) {
        navigateToPage(page);
      }
    }
  };

  // Logique de génération à nombre de slots fixe (5 slots pour les numéros)
  const renderFixedPages = () => {
    const slots: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) slots.push(i);
    } else {
      if (currentPage <= 2) {
        slots.push(1, 2, 3, '...', totalPages);
      } 
      else if (currentPage >= totalPages - 1) {
        slots.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      }
      else {
        slots.push(1, '...', currentPage, '...', totalPages);
      }
    }

    return slots.map((page, index) => {
      if (page === '...') {
        return <span key={`ell-${index}`} className="pagination-ellipsis">...</span>;
      }

      const isCurrent = page === currentPage;
      
      return (
        <button
          key={`page-${page}`}
          onClick={() => navigateToPage(page as number)}
          className={`pagination-item ${isCurrent ? 'active' : ''}`}
          disabled={isCurrent}
        >
          {page}
        </button>
      );
    });
  };

  const NavButton = ({ page, icon: Icon, type }: { page: number, icon: any, type: string }) => {
    const isDisabled = (type === 'prev' || type === 'first') ? currentPage <= 1 : currentPage >= totalPages;
    return (
      <button
        onClick={() => navigateToPage(page)}
        className={`pagination-item nav-btn ${type} ${isDisabled ? 'disabled' : ''}`}
        disabled={isDisabled}
        title={type}
      >
        <Icon size={variant === 'sidebar' ? 12 : 16} />
      </button>
    );
  };

  return (
    <nav className={`pagination-container ${variant} ${className}`} aria-label="Pagination">
      {variant === 'sidebar' && (
        <div className="pagination-header-sidebar">
          <span className="pagination-label">Pages</span>
          <div className="pagination-goto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={handleKeyDown}
              className="pagination-input"
              onBlur={() => setInputValue(currentPage.toString())}
            />
            <span className="pagination-total">/ {totalPages}</span>
          </div>
        </div>
      )}

      <div className="pagination-list">
        <NavButton page={1} icon={ChevronsLeft} type="first" />
        <NavButton page={Math.max(1, currentPage - 1)} icon={ChevronLeft} type="prev" />
        <div className="pagination-numbers">
          {renderFixedPages()}
        </div>
        <NavButton page={Math.min(totalPages, currentPage + 1)} icon={ChevronRight} type="next" />
        <NavButton page={totalPages} icon={ChevronsRight} type="last" />
      </div>
    </nav>
  );
}
