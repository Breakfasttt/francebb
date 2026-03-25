"use client";

import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface SidebarPaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function SidebarPagination({ 
  currentPage, 
  totalPages 
}: SidebarPaginationProps) {
  if (totalPages <= 1) return null;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [inputPage, setInputPage] = useState(String(currentPage));
  const inputRef = useRef<HTMLInputElement>(null);

  const getPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Synchronize state when the prop changes (e.g. navigation)
  useEffect(() => {
    setInputPage(String(currentPage));
  }, [currentPage]);

  function handlePageKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const p = parseInt(inputPage, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        if (p !== currentPage) {
           window.location.assign(getPageHref(p));
        } else {
           inputRef.current?.blur();
        }
      } else {
        setInputPage(String(currentPage));
      }
      inputRef.current?.blur();
    }
    if (e.key === 'Escape') {
      setInputPage(String(currentPage));
      inputRef.current?.blur();
    }
  }

  // Build compact tokens: always 1, current, last — insert '…' between non-consecutive
  function buildTokens(): (number | '...')[] {
    const pages = [...new Set([1, currentPage, totalPages])].sort((a, b) => a - b);
    const result: (number | '...')[] = [];
    for (let i = 0; i < pages.length; i++) {
      if (i > 0 && pages[i] - pages[i - 1] > 1) result.push('...');
      result.push(pages[i]);
    }
    return result;
  }

  const tokens = buildTokens();

  const navBtn = (disabled: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '24px', height: '24px', borderRadius: '4px', flexShrink: 0,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
    color: disabled ? '#444' : 'white',
    textDecoration: 'none', opacity: disabled ? 0.35 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  });

  const pageBtn = (active: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '24px', height: '24px', padding: '0 4px', borderRadius: '4px', flexShrink: 0,
    background: active ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.1)',
    color: 'white', fontSize: '0.75rem', fontWeight: active ? 700 : 400,
    textDecoration: 'none',
  });

  return (
    <div className="sidebar-widget" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '0.85rem', margin: 0, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pages</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem' }}>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={inputPage}
            onChange={e => {
              const v = e.target.value.replace(/[^0-9]/g, '');
              setInputPage(v);
            }}
            onKeyDown={handlePageKeyDown}
            onFocus={() => setInputPage('')}
            onBlur={() => setInputPage(String(currentPage))}
            title="Entrée pour naviguer"
            style={{
              width: '30px', background: 'rgba(50,50,50,0.5)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: '3px',
              color: 'white', textAlign: 'center', fontSize: '0.75rem',
              padding: '2px 0', outline: 'none', fontWeight: 700
            }}
          />
          <span style={{ color: '#555', fontWeight: 600 }}>/ {totalPages}</span>
        </div>
      </div>

      <div style={{ 
        display: 'grid', gridTemplateColumns: 'min-content 1fr min-content', 
        gap: '8px', alignItems: 'center', width: '100%' 
      }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          <Link href={getPageHref(1)} style={navBtn(currentPage === 1)} title="Première page">
            <ChevronsLeft size={11} />
          </Link>
          <Link href={getPageHref(currentPage - 1)} style={navBtn(currentPage === 1)} title="Page précédente">
            <ChevronLeft size={11} />
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '3px', alignItems: 'center', justifyContent: 'center' }}>
          {tokens.map((t, i) =>
            t === '...'
              ? <span key={`d${i}`} style={{ color: '#444', fontSize: '0.7rem' }}>…</span>
              : <Link key={t} href={getPageHref(t)} style={pageBtn(t === currentPage)}>{t}</Link>
          )}
        </div>

        <div style={{ display: 'flex', gap: '2px' }}>
          <Link href={getPageHref(currentPage + 1)} style={navBtn(currentPage === totalPages)} title="Page suivante">
            <ChevronRight size={11} />
          </Link>
          <Link href={getPageHref(totalPages)} style={navBtn(currentPage === totalPages)} title="Dernière page">
            <ChevronsRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}
