/**
 * 사용자 대시보드 모바일 하단 메뉴 컴포넌트
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, Menu, X } from 'lucide-react';

interface MobileMenuProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export function DashboardMobileMenu({ onMenuToggle, isSidebarOpen }: MobileMenuProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: '대시보드',
      href: '/mypage',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: isSidebarOpen ? '메뉴닫기' : '메뉴열기',
      href: '#',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        onMenuToggle();
      },
      icon: isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />,
    },
  ];

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/mypage') {
      return pathname === '/mypage';
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
