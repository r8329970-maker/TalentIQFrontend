'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/shared/sidebar';
import { AppHeader } from '@/components/shared/app-header';

const routeTitles: Record<string, { title: string; crumbs: { label: string; href?: string }[] }> = {
  '/dashboard': { title: 'Overview', crumbs: [{ label: 'Overview' }] },
  '/candidates': { title: 'Candidates', crumbs: [{ label: 'Overview', href: '/dashboard' }, { label: 'Candidates' }] },
  '/jobs': { title: 'Jobs', crumbs: [{ label: 'Overview', href: '/dashboard' }, { label: 'Jobs' }] },
  '/jobs/new': { title: 'Create Job', crumbs: [{ label: 'Overview', href: '/dashboard' }, { label: 'Jobs', href: '/jobs' }, { label: 'Create' }] },
  '/settings': { title: 'Settings', crumbs: [{ label: 'Overview', href: '/dashboard' }, { label: 'Settings' }] },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const headerInfo = useMemo(() => {
    if (routeTitles[pathname]) return routeTitles[pathname];

    if (pathname.startsWith('/candidates/')) {
      return {
        title: 'Candidate Profile',
        crumbs: [
          { label: 'Overview', href: '/dashboard' },
          { label: 'Candidates', href: '/candidates' },
          { label: 'Profile' },
        ],
      };
    }
    const jobMatch = pathname.match(/^\/jobs\/([^/]+)$/);
    if (jobMatch) {
      return {
        title: 'Job Details',
        crumbs: [
          { label: 'Overview', href: '/dashboard' },
          { label: 'Jobs', href: '/jobs' },
          { label: 'Details' },
        ],
      };
    }
    const matchesMatch = pathname.match(/^\/jobs\/([^/]+)\/matches$/);
    if (matchesMatch) {
      return {
        title: 'Matching Results',
        crumbs: [
          { label: 'Overview', href: '/dashboard' },
          { label: 'Jobs', href: '/jobs' },
          { label: 'Matches' },
        ],
      };
    }
    return { title: 'TalentIQ', crumbs: [{ label: 'Overview', href: '/dashboard' }] };
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          title={headerInfo.title}
          breadcrumbs={headerInfo.crumbs}
        />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
