/**
 * 마이페이지 전용 사이드바 컴포넌트
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, FileText, MessageSquare, Bookmark, UserPlus, Flag, HelpCircle, ChevronRight, Settings } from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: '대시보드',
    href: '/mypage',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: '내 활동',
    children: [
      {
        title: '내 게시글',
        href: '/mypage/my-posts',
        icon: <FileText className="h-4 w-4" />,
      },
      {
        title: '내 댓글',
        href: '/mypage/my-comments',
        icon: <MessageSquare className="h-4 w-4" />,
      },
      {
        title: '내 북마크',
        href: '/mypage/my-bookmarks',
        icon: <Bookmark className="h-4 w-4" />,
      },
      {
        title: '내 팔로우',
        href: '/mypage/my-follows',
        icon: <UserPlus className="h-4 w-4" />,
      },
    ],
  },
  {
    title: '신청 및 등록',
    children: [
      {
        title: '서비스 신청',
        href: '/mypage/applications',
        icon: <Settings className="h-4 w-4" />,
      },
      {
        title: '콘텐츠 등록',
        href: '/mypage/content-registration',
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
  {
    title: '고객 지원',
    children: [
      {
        title: '내 문의',
        href: '/mypage/inquiries',
        icon: <HelpCircle className="h-4 w-4" />,
      },
      {
        title: '내 신고',
        href: '/mypage/my-reports',
        icon: <Flag className="h-4 w-4" />,
      },
    ],
  },
];

interface MyPageSidebarProps {
  isOpen: boolean; // 모바일에서만 사용 (콜랩스 상태)
  onClose?: () => void;
}

export function MyPageSidebar({ isOpen, onClose }: MyPageSidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['내 활동', '신청 및 등록', '고객 지원']));

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuTitle)) {
        newSet.delete(menuTitle);
      } else {
        newSet.add(menuTitle);
      }
      return newSet;
    });
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === '/mypage') {
      return pathname === '/mypage';
    }
    return pathname.startsWith(href + '/') || pathname === href;
  };

  const isMenuActive = (item: NavItem): boolean => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some(child => child.href && isActive(child.href));
    }
    return false;
  };

  // 2뎁스 메뉴가 활성화되어 있으면 부모 메뉴도 자동으로 확장
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => child.href && isActive(child.href));
        if (hasActiveChild) {
          setExpandedMenus(prev => {
            const newSet = new Set(prev);
            newSet.add(item.title);
            return newSet;
          });
        }
      }
    });
  }, [pathname]);

  useEffect(() => {
    if (!isOpen || !onClose) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (window.innerWidth < 1024 && e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <aside
      className={cn(
        'bg-white border-b lg:border-r border-border',
        // 모바일: 콜랩스 애니메이션 (콘텐츠 영역에 포함)
        'lg:hidden',
        isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden',
        // 데스크탑: 항상 표시 (왼쪽 사이드바)
        'lg:block lg:sticky lg:top-0 lg:self-start lg:h-screen lg:overflow-y-auto lg:w-64 lg:max-h-none lg:opacity-100',
        'transition-all duration-300 ease-in-out',
        'z-30 lg:z-auto'
      )}
      onClick={(e) => {
        // 사이드바 내부 클릭 시 이벤트 전파 방지 (메인 콘텐츠 클릭 핸들러 실행 방지)
        e.stopPropagation();
      }}
    >
        <div className="h-full">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isExpanded = expandedMenus.has(item.title);
              const menuActive = isMenuActive(item);

              if (item.children) {
                return (
                  <div key={item.title}>
                    <button
                      onClick={() => toggleMenu(item.title)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap w-full text-left',
                        menuActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <ChevronRight
                        className={cn(
                          'h-4 w-4 transition-transform duration-200',
                          isExpanded ? 'rotate-90' : ''
                        )}
                      />
                      <span>{item.title}</span>
                    </button>
                    {isExpanded && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const active = child.href && isActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href || '#'}
                              onClick={() => {
                                // 모바일에서 메뉴 선택 시 콜랩스 닫기
                                if (isMobile && onClose) {
                                  onClose();
                                }
                              }}
                              className={cn(
                                'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap relative',
                                active
                                  ? 'bg-primary text-primary-foreground shadow-sm'
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                              )}
                            >
                              {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                              )}
                              {child.icon}
                              <span className={cn(active && 'font-semibold')}>{child.title}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              } else {
                const active = item.href && isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href || '#'}
                    onClick={() => {
                      // 모바일에서 메뉴 선택 시 콜랩스 닫기
                      if (isMobile && onClose) {
                        onClose();
                      }
                    }}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                );
              }
            })}
          </nav>
        </div>
      </aside>
  );
}
