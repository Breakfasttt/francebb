import SidebarPagination from "@/app/forum/component/SidebarPagination";

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
            <SidebarPagination 
              currentPage={currentPage}
              totalPages={totalPages}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
