import { DashboardShell } from "@/src/components/layout/shell";

type Trend = "up" | "down" | "neutral";

interface KpiCardProps {
  label: string;
  value: string;
  badge?: string;
  trend?: Trend;
  trendValue?: string;
}

interface Activity {
  id: number;
  time: string;
  user: string;
  action: string;
  status: "성공" | "실패" | "대기";
}

const kpis: KpiCardProps[] = [
  {
    label: "오늘 방문자",
    value: "1,234",
    badge: "실시간",
    trend: "up",
    trendValue: "+12.3% vs 어제",
  },
  {
    label: "이번 달 매출",
    value: "₩ 9,876,000",
    badge: "월간",
    trend: "up",
    trendValue: "+8.1% vs 지난달",
  },
  {
    label: "활성 사용자",
    value: "432",
    badge: "7일 평균",
    trend: "neutral",
    trendValue: "전주와 비슷",
  },
  {
    label: "전환율",
    value: "3.4%",
    badge: "전환",
    trend: "down",
    trendValue: "-0.4%p vs 지난주",
  },
];

const trafficSeries = [40, 52, 48, 61, 70, 66, 74];
const signupSeries = [12, 16, 14, 18, 21, 19, 23];

const activities: Activity[] = [
  {
    id: 1,
    time: "오늘 09:24",
    user: "김관리 (ADMIN)",
    action: "신규 사용자 1명 생성",
    status: "성공",
  },
  {
    id: 2,
    time: "오늘 08:51",
    user: "마케팅팀 (MANAGER)",
    action: "프로모션 코드 설정 변경",
    status: "성공",
  },
  {
    id: 3,
    time: "어제 22:13",
    user: "system",
    action: "일간 리포트 생성",
    status: "성공",
  },
  {
    id: 4,
    time: "어제 18:02",
    user: "게스트",
    action: "비정상 로그인 시도 3회",
    status: "실패",
  },
];

function TrendBadge({ trend, value }: { trend?: Trend; value?: string }) {
  if (!trend || !value) return null;

  const base =
    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium";

  if (trend === "up") {
    return (
      <span className={`${base} bg-emerald-500/10 text-emerald-500`}>
        <span aria-hidden="true">▲</span>
        {value}
      </span>
    );
  }

  if (trend === "down") {
    return (
      <span className={`${base} bg-rose-500/10 text-rose-500`}>
        <span aria-hidden="true">▼</span>
        {value}
      </span>
    );
  }

  return (
    <span className={`${base} bg-muted text-muted-foreground`}>{value}</span>
  );
}

function KpiCard({ label, value, badge, trend, trendValue }: KpiCardProps) {
  return (
    <div className="flex flex-col justify-between rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
        </div>
        {badge ? (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <TrendBadge trend={trend} value={trendValue} />
      </div>
    </div>
  );
}

function MiniBarChart({
  label,
  series,
}: {
  label: string;
  series: number[];
}) {
  const max = Math.max(...series);

  return (
    <div className="flex h-32 items-end gap-1 rounded-md bg-muted/60 p-2">
      {series.map((v, idx) => {
        const height = `${(v / max) * 100}%`;
        return (
          <div
            key={`${label}-${idx}`}
            className="flex-1 rounded-sm bg-gradient-to-t from-primary/80 to-primary/40"
            style={{ height }}
          />
        );
      })}
    </div>
  );
}

function ActivityTable({ items }: { items: Activity[] }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b px-4 py-2.5 text-sm font-medium">최근 활동</div>
      <div className="max-h-80 overflow-y-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="sticky top-0 bg-muted/60 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">시간</th>
              <th className="px-4 py-2 font-medium">사용자</th>
              <th className="px-4 py-2 font-medium">이벤트</th>
              <th className="px-4 py-2 font-medium">상태</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-t border-border/70 text-xs last:border-b bg-card hover:bg-muted/40"
              >
                <td className="whitespace-nowrap px-4 py-2 align-top">
                  {item.time}
                </td>
                <td className="whitespace-nowrap px-4 py-2 align-top text-muted-foreground">
                  {item.user}
                </td>
                <td className="px-4 py-2 align-top">{item.action}</td>
                <td className="whitespace-nowrap px-4 py-2 align-top">
                  <span
                    className={
                      item.status === "성공"
                        ? "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500"
                        : item.status === "실패"
                          ? "inline-flex rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-medium text-rose-500"
                          : "inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500"
                    }
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
            대시보드 개요
          </h1>
          <p className="text-sm text-muted-foreground">
            오늘의 핵심 KPI, 트래픽/가입 추이, 최근 관리자 활동을 한눈에 확인합니다.
          </p>
        </div>

        <section
          aria-label="핵심 KPI 카드"
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </section>

        <section
          aria-label="트래픽 및 가입 추이"
          className="grid gap-4 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 rounded-lg border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-medium">7일간 트래픽 추이</h2>
                <p className="text-xs text-muted-foreground">
                  일별 방문자 수 기준으로 최근 일주일의 변화를 확인합니다.
                </p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                예시 데이터
              </span>
            </div>
            <MiniBarChart label="traffic" series={trafficSeries} />
            <p className="mt-2 text-[11px] text-muted-foreground">
              가장 높은 막대는 기준일 대비 상대적인 비율로 표시됩니다.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4">
            <div className="mb-3">
              <h2 className="text-sm font-medium">신규 가입자 추이</h2>
              <p className="text-xs text-muted-foreground">
                같은 기간 동안의 신규 가입자 수입니다.
              </p>
            </div>
            <MiniBarChart label="signup" series={signupSeries} />
            <p className="mt-2 text-[11px] text-muted-foreground">
              실제 서비스 연동 시 Analytics / Metrics 테이블과 연결 가능합니다.
            </p>
          </div>
        </section>

        <section aria-label="최근 활동 테이블">
          <ActivityTable items={activities} />
        </section>
      </div>
    </DashboardShell>
  );
}

