import ForumSidebar from "@/components/forum/ForumSidebar";
import "./forum.css";

export default function ForumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container forum-container" style={{ paddingBottom: '5rem' }}>
      <div className="forum-layout">
        <div className="forum-main-content">
          {children}
        </div>
        <ForumSidebar />
      </div>
    </main>
  );
}
