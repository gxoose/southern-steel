'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'New Proposal', href: '/dashboard/proposals/new' },
  { label: 'Jobs', href: '/dashboard/jobs' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-surface sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-1 font-display text-xl tracking-tight">
            <span className="text-text">VantaPoint</span>
            <span className="text-rust">Forge</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-surface3 text-text'
                      : 'text-text-sec hover:text-text hover:bg-surface2'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-green-forge">
            <span className="w-2 h-2 rounded-full bg-green-forge inline-block" />
            Chatbot live
          </div>
          <Link
            href="/dashboard/proposals/new"
            className="btn-rust text-sm px-4 py-2 rounded-md flex items-center gap-1"
          >
            <span>+</span> New Proposal
          </Link>
        </div>
      </div>
    </nav>
  );
}
