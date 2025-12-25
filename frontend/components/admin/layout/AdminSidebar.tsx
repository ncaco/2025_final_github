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

  const isActive = (href: string) => {
    if (!pathname) return false;
    
    // 정확히 일치하는 경우
    if (pathname === href) return true;
    
    // /admin은 정확히 일치할 때만 active
    if (href === '/admin') {
      return pathname === '/admin';
    }
    
    // 다른 메뉴는 해당 경로로 시작할 때 active
    return pathname.startsWith(href + '/') || pathname === href;
  };

  return (
    <aside className="w-64 border-r bg-muted/30 min-h-screen">
      <div className="p-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active
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

