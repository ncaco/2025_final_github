/**
 * 알림 드롭다운 컴포넌트
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, MessageSquare, Heart, UserPlus, AtSign, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Button as ButtonComponent } from '@/components/ui/button';
import { notificationApi } from '@/lib/api/reports';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Notification } from '@/lib/api/reports';

export function NotificationDropdown() {
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 알림 목록 로드
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications({ limit: 20 });
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('알림 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
      toast({
        title: '오류',
        description: '알림 읽음 처리에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast({
        title: '완료',
        description: '모든 알림이 읽음 처리되었습니다.',
        variant: 'success',
      });
    } catch (error) {
      console.error('모든 알림 읽음 처리 실패:', error);
      toast({
        title: '오류',
        description: '알림 읽음 처리에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 알림 클릭 처리
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // 알림 타입에 따라 이동
    if (notification.related_post_id) {
      router.push(`/boards/${notification.related_post_id}`);
    } else if (notification.related_user_id) {
      router.push(`/profile?user=${notification.related_user_id}`);
    }
  };

  // 알림 타입별 아이콘
  const getNotificationIcon = (type: Notification['typ']) => {
    switch (type) {
      case 'NEW_COMMENT':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'NEW_LIKE':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'NEW_FOLLOW':
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case 'POST_MENTION':
      case 'COMMENT_MENTION':
        return <AtSign className="h-4 w-4 text-purple-500" />;
      case 'ADMIN_NOTICE':
        return <Shield className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // 알림 타입별 텍스트
  const getNotificationText = (type: Notification['typ']) => {
    switch (type) {
      case 'NEW_COMMENT':
        return '새 댓글';
      case 'NEW_LIKE':
        return '좋아요';
      case 'NEW_FOLLOW':
        return '새 팔로우';
      case 'POST_MENTION':
        return '게시글 멘션';
      case 'COMMENT_MENTION':
        return '댓글 멘션';
      case 'ADMIN_NOTICE':
        return '관리자 공지';
      default:
        return '알림';
    }
  };

  // 드롭다운 열릴 때 알림 로드
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // 주기적으로 알림 확인 (5분마다)
  useEffect(() => {
    loadNotifications();
    intervalRef.current = setInterval(() => {
      loadNotifications();
    }, 5 * 60 * 1000); // 5분

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[500px] overflow-y-auto bg-white">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel>알림</DropdownMenuLabel>
          {unreadCount > 0 && (
            <ButtonComponent
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-7 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              모두 읽음
            </ButtonComponent>
          )}
        </div>
        <DropdownMenuSeparator />
        {loading ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            로딩 중...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">알림이 없습니다</p>
          </div>
        ) : (
          <div className="py-1">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-blue-50/50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.typ)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        {getNotificationText(notification.typ)}
                      </p>
                      {!notification.is_read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-medium mt-0.5 line-clamp-2">
                      {notification.ttl}
                    </p>
                    {notification.msg && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {notification.msg}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.crt_dt).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <div className="p-2">
          <ButtonComponent
            variant="outline"
            size="sm"
            className="w-full"
            asChild
          >
            <Link href="/notifications">모든 알림 보기</Link>
          </ButtonComponent>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
