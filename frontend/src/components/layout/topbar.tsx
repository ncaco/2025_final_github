import { Bell, Menu } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export function Topbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background/60 px-4 backdrop-blur">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="hidden text-muted-foreground sm:inline">관리자 대시보드</span>
        <span className="inline text-xs text-muted-foreground sm:hidden">대시보드</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">사이드바 열기</span>
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:inline-flex">
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">알림 보기</span>
        </Button>
        <div className="hidden items-center rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground md:flex">
          <span className="mr-2 h-5 w-5 rounded-full bg-primary/10" />
          <span>admin@example.com</span>
        </div>
      </div>
    </header>
  );
}

