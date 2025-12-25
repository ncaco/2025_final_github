/**
 * 관리자 사이드바 컴포넌트
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: '대시보드',
    href: '/admin',
  },
  {
    title: '사용자 관리',
    href: '/admin/users',
  },
  {
    title: '역할 관리',
    href: '/admin/roles',
  },
  {
    title: '권한 관리',
    href: '/admin/permissions',
  },
  {
    title: '감사 로그',
    href: '/admin/audit-logs',
  },
  {
    title: '파일 관리',
    href: '/admin/files',
  },
  {
    title: '시스템 설정',
    href: '/admin/settings',
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-muted/30 min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-6">관리자 메뉴</h2>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

