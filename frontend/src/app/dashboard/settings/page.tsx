import { DashboardShell } from "@/src/components/layout/shell";

export default function SettingsPage() {
  return (
    <DashboardShell>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">환경 설정</h1>
        <p className="text-sm text-muted-foreground">
          테마, 알림, 조직 정보 등의 전역 설정이 배치될 페이지입니다.
        </p>
        <div className="mt-4 space-y-4 rounded-lg border bg-card p-4 text-sm">
          <div className="flex items-center justify-between">
            <span>다크 모드</span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs">
              토글 예정
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>이메일 알림</span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs">
              토글 예정
            </span>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}


