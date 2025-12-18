import Link from "next/link";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const navItems = [
  {
    href: "/dashboard",
    label: "개요",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/analytics",
    label: "분석",
    icon: BarChart3,
  },
  {
    href: "/dashboard/users",
    label: "사용자 관리",
    icon: Users,
  },
  {
    href: "/dashboard/settings",
    label: "설정",
    icon: Settings,
  },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r bg-background/40 p-4 md:flex md:flex-col">
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          AD
        </span>
        <span>Admin Dashboard</span>
      </div>
      <nav className="space-y-1 text-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

