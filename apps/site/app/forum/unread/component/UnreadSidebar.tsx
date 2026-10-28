import Pagination from "@/common/components/Pagination/Pagination";

interface UnreadSidebarProps {
  currentPage: number;
  totalPages: number;
}

export default function UnreadSidebar({ currentPage, totalPages }: UnreadSidebarProps) {
  return (
    <aside className="forum-sidebar">
      <div className="sidebar-sticky-inner">
        <div className="sidebar-widget-container">
          {totalPages > 1 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              variant="sidebar"
              baseUrl="/forum/unread"
            />
          )}
        </div>
      </div>
    </aside>
  );
}
