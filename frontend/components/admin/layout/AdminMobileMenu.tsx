/**
 * 관리자 모바일 하단 메뉴 컴포넌트
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface MobileMenuProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function AdminMobileMenu({ onMenuToggle, isSidebarOpen }: MobileMenuProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: '홈',
      href: '/admin',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      title: '즐겨찾기',
      href: '/admin/favorites',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: isSidebarOpen ? '메뉴닫기' : '메뉴열기',
      href: '#',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onMenuToggle();
      },
      icon: isSidebarOpen ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      ),
    },
    {
      title: '마이페이지',
      href: '/admin/profile',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      title: '설정',
      href: '/admin/settings',
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden bg-white border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around h-16 px-2">
        {menuItems.map((item, index) => {
          const active = isActive(item.href);
          
          if (item.onClick) {
            return (
              <button
                key={index}
                onClick={item.onClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "transition-colors",
                  active && "text-primary"
                )}>
                  {item.icon}
                </div>
                <span className="text-xs font-medium">{item.title}</span>
              </button>
            );
          }

          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "transition-colors",
                active && "text-primary"
              )}>
                {item.icon}
              </div>
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

