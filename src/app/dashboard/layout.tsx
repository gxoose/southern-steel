import TopNav from '@/components/TopNav';
import ChatBubble from '@/components/ChatBubble';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>
      <ChatBubble />
    </div>
  );
}
