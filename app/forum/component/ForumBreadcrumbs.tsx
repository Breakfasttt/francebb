import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { parseInlineBBCode } from "@/lib/bbcode";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isCategory?: boolean;
}

interface ForumBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function ForumBreadcrumbs({ items }: ForumBreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
      <ol style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
        <li style={{ display: 'flex', alignItems: 'center' }}>
          <Link href="/forum" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none', fontWeight: 600 }}>
            <Home size={14} />
            Accueil Forum
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ChevronRight size={14} style={{ color: '#666' }} />
            {item.href ? (
              <Link 
                href={item.href} 
                style={{ 
                  color: item.isCategory ? '#aaa' : 'var(--primary)', 
                  textDecoration: 'none',
                  pointerEvents: item.isCategory ? 'none' : 'auto',
                  fontWeight: item.isCategory ? 400 : 500
                }}
                dangerouslySetInnerHTML={{ __html: parseInlineBBCode(item.label) }}
              />
            ) : (
              <span 
                style={{ color: '#ddd', fontWeight: 500 }}
                dangerouslySetInnerHTML={{ __html: parseInlineBBCode(item.label) }}
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
