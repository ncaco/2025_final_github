/**
 * 알림 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, MessageSquare, Heart, UserPlus, AtSign, Shield } from 'lucide-react';
import { notificationApi } from '@/lib/api/reports';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Notification } from '@/lib/api/reports';

export default function NotificationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // 알림 목록 로드
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const params: { is_read?: boolean; limit?: number } = { limit: 100 };
      if (filter === 'unread') {
        params.is_read = false;
      }
      const data = await notificationApi.getNotifications(params);
      setNotifications(data);
    } catch (error) {
      console.error('알림 로드 실패:', error);
      toast({
        title: '오류',
        description: '알림을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
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

  // 알림 읽음 처리
  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  // 알림 클릭 처리
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
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
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'NEW_LIKE':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'NEW_FOLLOW':
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'POST_MENTION':
      case 'COMMENT_MENTION':
        return <AtSign className="h-5 w-5 text-purple-500" />;
      case 'ADMIN_NOTICE':
        return <Shield className="h-5 w-5 text-orange-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
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

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">알림</h1>
            <p className="text-muted-foreground mt-1">
              모든 알림을 확인하고 관리하세요
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              모두 읽음
            </Button>
          )}
        </div>

        {/* 필터 */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            전체
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'outline'}
            onClick={() => setFilter('unread')}
            size="sm"
          >
            읽지 않음 ({unreadCount})
          </Button>
        </div>

        {/* 알림 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>알림 목록</CardTitle>
            <CardDescription>
              {filter === 'all' ? '모든 알림' : '읽지 않은 알림'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                로딩 중...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {filter === 'unread' ? '읽지 않은 알림이 없습니다.' : '알림이 없습니다.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50/50 border-blue-200' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getNotificationIcon(notification.typ)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground">
                            {getNotificationText(notification.typ)}
                          </span>
                          {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <h3 className="font-medium mb-1">{notification.ttl}</h3>
                        {notification.msg && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.msg}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.crt_dt).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
