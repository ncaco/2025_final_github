/**
 * 관리자 사이드바 컴포넌트
 */

'use client';

import { useEffect, useState } from 'react';
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
    title: '파일 관리',
    href: '/admin/files',
  },
  {
    title: '역할-권한 관리',
    href: '/admin/role-permissions',
  },
  {
    title: '감사 로그',
    href: '/admin/audit-logs',
  },
  {
    title: '시스템 설정',
    href: '/admin/settings',
  },
];

interface AdminSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export function AdminSidebar({ isOpen, onClose, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 화면 크기 변경에 따른 사이드바 상태 조정
  useEffect(() => {
    if (typeof window === 'undefined' || !onToggle) return;

    const handleResize = () => {
      const newIsMobile = window.innerWidth < 1024;

      if (isMobile && !newIsMobile && !isOpen) {
        // 모바일에서 데스크탑으로 전환 + 사이드바 닫혀있으면 열기
        onToggle();
      } else if (!isMobile && newIsMobile && isOpen) {
        // 데스크탑에서 모바일로 전환 + 사이드바 열려있으면 닫기
        onClose && onClose();
      }
      setIsMobile(newIsMobile);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, isOpen, onClose, onToggle]);

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

  // ESC 키로 메뉴 닫기 (모바일만)
  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleEscape = (e: KeyboardEvent) => {
      // 모바일 화면에서만 동작
      if (window.innerWidth < 1024 && e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* 모바일 오버레이 (바탕 클릭 시 닫기) */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0  z-40"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          // Base styles: fixed, z-index, white background, no shadow
          'fixed left-0 z-49 bg-white shadow-none',

          // Mobile transition for transform
          // 'transition-transform duration-300 ease-in-out',

          // Mobile specific positioning (when open/closed)
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'w-full', // Occupy full width on mobile, this helps -translate-x-full work as expected

          // Desktop specific overrides (lg breakpoint and up)
          'lg:static lg:block lg:min-h-screen', // Override fixed for desktop, make it part of flow
          // 'lg:transition-all lg:duration-300 lg:ease-in-out', // Desktop transition for width
          {
            'lg:w-48 lg:border-r': isOpen, // Desktop: open width and border
            'lg:w-0 lg:border-0': !isOpen, // Desktop: closed width and no border
          }
        )}
        style={{
          top: isMobile ? '64px' : '0px',
          bottom: isMobile ? '64px' : '0px',
        }}
      >
        <div className={cn('p-2', isOpen ? 'opacity-100' : 'opacity-0', isMobile ? 'transition-none' : 'transition-opacity duration-300')}>
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
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
        
        {/* 사이드바 여닫기 버튼 (세로 가운데) */}
        {onToggle && !isMobile && (
          <div
            className="absolute z-50 transition-all duration-300 ease-in-out"
            style={{
              left: isOpen ? '192px' : '0px', // 사이드바 너비에 맞춰 위치 (w-48 = 192px)
              top: '50%',
              transform: 'translateY(-50%) translateX(-50%)' // 버튼 중심을 기준으로 위치
            }}
          >
            {/* 구분선 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent via-border/60 to-transparent" />
            
            {/* 테두리용 외부 div */}
            <div
              className="relative border border-border/40 bg-white transition-all duration-300 hover:border-primary/50 rounded-full flex items-center justify-center shadow-none"
              style={{
                width: '32px',
                height: '32px',
              }}
            >
              {/* 내부 버튼 */}
              <button
                onClick={onToggle}
                className={cn(
                  "w-full h-full bg-white transition-all duration-300 rounded-full",
                  "hover:bg-primary/5",
                  "active:scale-[0.98] cursor-pointer",
                  "flex items-center justify-center",
                  "group",
                  "shadow-none"
                )}
                title={isOpen ? '사이드바 닫기' : '사이드바 열기'}
              >
                <div className="relative z-10 transition-all duration-300 group-hover:scale-110">
                  {isOpen ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-foreground/50 group-hover:text-primary transition-colors"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-foreground/50 group-hover:text-primary transition-colors"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

