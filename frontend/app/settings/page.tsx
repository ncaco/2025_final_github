/**
 * 사용자 설정 페이지
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, Trash2 } from 'lucide-react';
import { userPreferenceApi } from '@/lib/api/reports';
import { useToast } from '@/hooks/useToast';
import type { UserPreference } from '@/lib/api/reports';

export default function SettingsPage() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // 설정 목록 로드
  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await userPreferenceApi.getPreferences();
      setPreferences(data);
    } catch (error) {
      console.error('설정 로드 실패:', error);
      toast({
        title: '오류',
        description: '설정을 불러오는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // 설정 저장/업데이트
  const handleSavePreference = async (prefKey: string, prefValue: string) => {
    try {
      setSaving(true);
      await userPreferenceApi.setPreference({ pref_key: prefKey, pref_val: prefValue });
      await loadPreferences();
      toast({
        title: '성공',
        description: '설정이 저장되었습니다.',
        variant: 'success',
      });
    } catch (error) {
      console.error('설정 저장 실패:', error);
      toast({
        title: '오류',
        description: '설정 저장에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // 새 설정 추가
  const handleAddPreference = async () => {
    if (!newKey.trim()) {
      toast({
        title: '오류',
        description: '설정 키를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await userPreferenceApi.setPreference({ pref_key: newKey.trim(), pref_val: newValue });
      setNewKey('');
      setNewValue('');
      await loadPreferences();
      toast({
        title: '성공',
        description: '설정이 추가되었습니다.',
        variant: 'success',
      });
    } catch (error) {
      console.error('설정 추가 실패:', error);
      toast({
        title: '오류',
        description: '설정 추가에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // 설정 삭제
  const handleDeletePreference = async (prefKey: string) => {
    if (!confirm('이 설정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setSaving(true);
      await userPreferenceApi.deletePreference(prefKey);
      await loadPreferences();
      toast({
        title: '성공',
        description: '설정이 삭제되었습니다.',
        variant: 'success',
      });
    } catch (error) {
      console.error('설정 삭제 실패:', error);
      toast({
        title: '오류',
        description: '설정 삭제에 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  // 편집 중인 설정 상태
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  const handleStartEdit = (pref: UserPreference) => {
    setEditingKey(pref.pref_key);
    setEditingValue(pref.pref_val || '');
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditingValue('');
  };

  const handleSaveEdit = async () => {
    if (editingKey) {
      await handleSavePreference(editingKey, editingValue);
      handleCancelEdit();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8" />
            사용자 설정
          </h1>
          <p className="text-muted-foreground mt-1">
            개인 설정을 관리하고 저장하세요
          </p>
        </div>

        {/* 기존 설정 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>저장된 설정</CardTitle>
            <CardDescription>현재 저장된 모든 설정 목록</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                로딩 중...
              </div>
            ) : preferences.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>저장된 설정이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {preferences.map((pref) => (
                  <div
                    key={pref.pref_key}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{pref.pref_key}</Label>
                      {editingKey === pref.pref_key ? (
                        <div className="mt-2 flex gap-2">
                          <Input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="flex-1"
                            placeholder="설정 값"
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={saving}
                          >
                            <Save className="h-4 w-4 mr-1" />
                            저장
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={saving}
                          >
                            취소
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <p className="text-sm text-muted-foreground">
                            {pref.pref_val || '(값 없음)'}
                          </p>
                          {pref.upd_dt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              수정일: {new Date(pref.upd_dt).toLocaleString('ko-KR')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    {editingKey !== pref.pref_key && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(pref)}
                        >
                          수정
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePreference(pref.pref_key)}
                          disabled={saving}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 새 설정 추가 */}
        <Card>
          <CardHeader>
            <CardTitle>새 설정 추가</CardTitle>
            <CardDescription>새로운 설정을 추가하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-key">설정 키</Label>
                <Input
                  id="new-key"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="예: theme, language, notification_enabled"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  설정을 식별하는 고유한 키를 입력하세요
                </p>
              </div>
              <div>
                <Label htmlFor="new-value">설정 값</Label>
                <Input
                  id="new-value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="설정 값"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={handleAddPreference}
                disabled={saving || !newKey.trim()}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                설정 추가
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 설정 예시 */}
        <Card>
          <CardHeader>
            <CardTitle>설정 예시</CardTitle>
            <CardDescription>자주 사용하는 설정 예시</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">테마 설정</p>
                <p className="text-muted-foreground text-xs mt-1">
                  키: <code className="bg-background px-1 rounded">theme</code> | 값: <code className="bg-background px-1 rounded">dark</code> 또는 <code className="bg-background px-1 rounded">light</code>
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">언어 설정</p>
                <p className="text-muted-foreground text-xs mt-1">
                  키: <code className="bg-background px-1 rounded">language</code> | 값: <code className="bg-background px-1 rounded">ko</code> 또는 <code className="bg-background px-1 rounded">en</code>
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">알림 설정</p>
                <p className="text-muted-foreground text-xs mt-1">
                  키: <code className="bg-background px-1 rounded">notification_enabled</code> | 값: <code className="bg-background px-1 rounded">true</code> 또는 <code className="bg-background px-1 rounded">false</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
