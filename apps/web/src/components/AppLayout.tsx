import { BookOpen, LineChart, Target, User } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useI18n } from '@/i18n';
import type { TranslationKey } from '@/i18n/translations';
import { useSync } from '@/hooks/useSync';
import { cn } from '@/lib/utils';

const TABS: { to: string; icon: typeof Target; label: TranslationKey }[] = [
  { to: '/', icon: Target, label: 'nav.train' },
  { to: '/progress', icon: LineChart, label: 'nav.progress' },
  { to: '/guide', icon: BookOpen, label: 'nav.guide' },
  { to: '/profile', icon: User, label: 'nav.profile' },
];

export function AppLayout() {
  const { t } = useI18n();
  const { mutate } = useSync();

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <main className="flex-1 px-4 pb-28 pt-6">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md justify-around border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-3 text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )
            }>
            <tab.icon className="h-6 w-6" />
            {t(tab.label)}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
