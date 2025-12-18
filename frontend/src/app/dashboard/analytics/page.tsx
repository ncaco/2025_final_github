\"use client\";

import { useMemo, useState } from \"react\";

import { DashboardShell } from \"@/src/components/layout/shell\";
import { Button } from \"@/src/components/ui/button\";

type RangeKey = \"7d\" | \"30d\" | \"90d\";

type DailyMetric = {
  dayLabel: string;
  visitors: number;
  signups: number;
  revenue: number;
};

type PlanShare = {
  plan: string;
  percent: number;
  colorClass: string;
};

const baseDailyMetrics: DailyMetric[] = [
  { dayLabel: \"D-29\", visitors: 210, signups: 24, revenue: 210_000 },
  { dayLabel: \"D-28\", visitors: 240, signups: 28, revenue: 250_000 },
  { dayLabel: \"D-27\", visitors: 260, signups: 31, revenue: 270_000 },
  { dayLabel: \"D-26\", visitors: 230, signups: 26, revenue: 230_000 },
  { dayLabel: \"D-25\", visitors: 250, signups: 30, revenue: 260_000 },
  { dayLabel: \"D-24\", visitors: 270, signups: 32, revenue: 280_000 },
  { dayLabel: \"D-23\", visitors: 290, signups: 35, revenue: 310_000 },
  { dayLabel: \"D-22\", visitors: 310, signups: 37, revenue: 330_000 },
  { dayLabel: \"D-21\", visitors: 320, signups: 38, revenue: 340_000 },
  { dayLabel: \"D-20\", visitors: 330, signups: 40, revenue: 360_000 },
  { dayLabel: \"D-19\", visitors: 340, signups: 41, revenue: 370_000 },
  { dayLabel: \"D-18\", visitors: 360, signups: 44, revenue: 390_000 },
  { dayLabel: \"D-17\", visitors: 380, signups: 46, revenue: 420_000 },
  { dayLabel: \"D-16\", visitors: 390, signups: 47, revenue: 430_000 },
  { dayLabel: \"D-15\", visitors: 410, signups: 49, revenue: 450_000 },
  { dayLabel: \"D-14\", visitors: 430, signups: 52, revenue: 470_000 },
  { dayLabel: \"D-13\", visitors: 440, signups: 53, revenue: 480_000 },
  { dayLabel: \"D-12\", visitors: 460, signups: 55, revenue: 500_000 },
  { dayLabel: \"D-11\", visitors: 470, signups: 57, revenue: 510_000 },
  { dayLabel: \"D-10\", visitors: 490, signups: 59, revenue: 530_000 },
  { dayLabel: \"D-9\", visitors: 510, signups: 61, revenue: 550_000 },
  { dayLabel: \"D-8\", visitors: 520, signups: 62, revenue: 560_000 },
  { dayLabel: \"D-7\", visitors: 540, signups: 64, revenue: 580_000 },
  { dayLabel: \"D-6\", visitors: 560, signups: 66, revenue: 600_000 },
  { dayLabel: \"D-5\", visitors: 580, signups: 68, revenue: 620_000 },
  { dayLabel: \"D-4\", visitors: 600, signups: 70, revenue: 640_000 },
  { dayLabel: \"D-3\", visitors: 620, signups: 72, revenue: 660_000 },
  { dayLabel: \"D-2\", visitors: 640, signups: 75, revenue: 690_000 },
  { dayLabel: \"D-1\", visitors: 660, signups: 78, revenue: 720_000 },
  { dayLabel: \"오늘\", visitors: 680, signups: 80, revenue: 750_000 },
];

const planSharesByRange: Record<RangeKey, PlanShare[]> = {
  \"7d\": [
    { plan: \"FREE\", percent: 36, colorClass: \"bg-slate-500\" },
    { plan: \"PRO\", percent: 44, colorClass: \"bg-emerald-500\" },
    { plan: \"BUSINESS\", percent: 20, colorClass: \"bg-indigo-500\" },
  ],
  \"30d\": [
    { plan: \"FREE\", percent: 40, colorClass: \"bg-slate-500\" },
    { plan: \"PRO\", percent: 42, colorClass: \"bg-emerald-500\" },
    { plan: \"BUSINESS\", percent: 18, colorClass: \"bg-indigo-500\" },
  ],
  \"90d\": [
    { plan: \"FREE\", percent: 48, colorClass: \"bg-slate-500\" },
    { plan: \"PRO\", percent: 38, colorClass: \"bg-emerald-500\" },
    { plan: \"BUSINESS\", percent: 14, colorClass: \"bg-indigo-500\" },
  ],
};

function RangeToggle({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (next: RangeKey) => void;
}) {
  const ranges: { key: RangeKey; label: string }[] = [
    { key: \"7d\", label: \"최근 7일\" },
    { key: \"30d\", label: \"최근 30일\" },
    { key: \"90d\", label: \"최근 90일\" },
  ];

  return (
    <div className=\"inline-flex items-center gap-1 rounded-full bg-muted p-1\">
      {ranges.map((r) => (
        <Button
          key={r.key}
          size=\"sm\"
          type=\"button\"
          variant={value === r.key ? \"default\" : \"ghost\"}
          className={
            value === r.key
              ? \"h-7 rounded-full px-3 text-xs\"
              : \"h-7 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground\"
          }
          onClick={() => onChange(r.key)}
        >
          {r.label}
        </Button>
      ))}
    </div>
  );
}

function MiniBarChart({
  labels,
  series,
}: {
  labels: string[];
  series: number[];
}) {
  const max = Math.max(...series);

  return (
    <div className=\"flex h-40 items-end gap-1 rounded-md bg-muted/60 p-2 md:h-48\">
      {series.map((v, idx) => {
        const height = max === 0 ? \"0%\" : `${(v / max) * 100}%`;

        return (
          <div key={labels[idx] ?? idx} className=\"group flex-1\">
            <div
              className=\"h-full rounded-sm bg-gradient-to-t from-primary/80 to-primary/40 transition-colors group-hover:from-primary group-hover:to-primary/60\"
              style={{ height }}
              aria-hidden=\"true\"
            />
            <div className=\"mt-1 text-center text-[10px] text-muted-foreground group-hover:text-foreground/80\">
              {labels[idx]}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PlanShareLegend({ items }: { items: PlanShare[] }) {
  return (
    <div className=\"space-y-2\">
      {items.map((item) => (
        <div
          key={item.plan}
          className=\"flex items-center justify-between gap-2 text-sm\"
        >
          <div className=\"flex items-center gap-2\">
            <span
              className={`h-2.5 w-2.5 rounded-full ${item.colorClass}`}
              aria-hidden=\"true\"
            />
            <span className=\"text-xs font-medium\">{item.plan}</span>
          </div>
          <span className=\"text-xs tabular-nums text-muted-foreground\">
            {item.percent}%
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeKey>(\"7d\");

  const slicedMetrics = useMemo(() => {
    if (range === \"7d\") {
      return baseDailyMetrics.slice(-7);
    }
    if (range === \"30d\") {
      return baseDailyMetrics.slice(-30);
    }

    // 90일은 아직 더미 데이터가 30일 분량이므로 일단 전체를 사용
    return baseDailyMetrics;
  }, [range]);

  const labels = slicedMetrics.map((m) => m.dayLabel);
  const visitorsSeries = slicedMetrics.map((m) => m.visitors);
  const signupSeries = slicedMetrics.map((m) => m.signups);

  const totalVisitors = slicedMetrics.reduce((acc, cur) => acc + cur.visitors, 0);
  const totalSignups = slicedMetrics.reduce((acc, cur) => acc + cur.signups, 0);
  const totalRevenue = slicedMetrics.reduce((acc, cur) => acc + cur.revenue, 0);

  const avgConversion =
    totalVisitors === 0 ? 0 : (totalSignups / totalVisitors) * 100;

  const planShares = planSharesByRange[range];

  return (
    <DashboardShell>
      <div className=\"space-y-6\">
        <div className=\"flex flex-col gap-3 md:flex-row md:items-center md:justify-between\">
          <div className=\"space-y-1\">
            <h1 className=\"text-xl font-semibold tracking-tight md:text-2xl\">
              트래픽 & 매출 분석
            </h1>
            <p className=\"text-sm text-muted-foreground\">
              기간 필터에 따라 방문자 수, 가입 수, 플랜별 매출 비율을 비교 분석합니다.
            </p>
          </div>
          <RangeToggle value={range} onChange={setRange} />
        </div>

        <section
          aria-label=\"요약 지표 카드\"
          className=\"grid gap-4 sm:grid-cols-2 lg:grid-cols-4\"
        >
          <div className=\"rounded-lg border bg-card p-4\">
            <div className=\"text-xs font-medium uppercase tracking-wide text-muted-foreground\">
              기간 총 방문자
            </div>
            <div className=\"mt-2 text-2xl font-semibold tabular-nums\">
              {totalVisitors.toLocaleString(\"ko-KR\")}
            </div>
            <p className=\"mt-1 text-xs text-muted-foreground\">
              선택한 기간 동안의 총 방문자 수입니다.
            </p>
          </div>

          <div className=\"rounded-lg border bg-card p-4\">
            <div className=\"text-xs font-medium uppercase tracking-wide text-muted-foreground\">
              기간 총 가입 수
            </div>
            <div className=\"mt-2 text-2xl font-semibold tabular-nums\">
              {totalSignups.toLocaleString(\"ko-KR\")}
            </div>
            <p className=\"mt-1 text-xs text-muted-foreground\">
              신규 가입을 통해 생성된 계정 수입니다.
            </p>
          </div>

          <div className=\"rounded-lg border bg-card p-4\">
            <div className=\"text-xs font-medium uppercase tracking-wide text-muted-foreground\">
              추정 매출 합계
            </div>
            <div className=\"mt-2 text-2xl font-semibold tabular-nums\">
              ₩ {totalRevenue.toLocaleString(\"ko-KR\")}
            </div>
            <p className=\"mt-1 text-xs text-muted-foreground\">
              단순 예시 더미 데이터로, 실제 연동 시 Billing 데이터와 연결할 수 있습니다.
            </p>
          </div>

          <div className=\"rounded-lg border bg-card p-4\">
            <div className=\"text-xs font-medium uppercase tracking-wide text-muted-foreground\">
              평균 전환율
            </div>
            <div className=\"mt-2 text-2xl font-semibold tabular-nums\">
              {avgConversion.toFixed(1)}%
            </div>
            <p className=\"mt-1 text-xs text-muted-foreground\">
              방문 대비 가입 비율로, 마케팅 퍼널 최적화에 활용할 수 있습니다.
            </p>
          </div>
        </section>

        <section
          aria-label=\"방문자 및 가입 추이 차트\"
          className=\"grid gap-4 lg:grid-cols-3\"
        >
          <div className=\"rounded-lg border bg-card p-4 lg:col-span-2\">
            <div className=\"mb-3 flex items-center justify-between gap-2\">
              <div>
                <h2 className=\"text-sm font-medium\">기간별 방문자 추이</h2>
                <p className=\"text-xs text-muted-foreground\">
                  선택한 기간 동안 일별 방문자 수 흐름을 막대형 차트로 표현합니다.
                </p>
              </div>
              <span className=\"rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground\">
                예시 데이터
              </span>
            </div>
            <MiniBarChart labels={labels} series={visitorsSeries} />
            <p className=\"mt-2 text-[11px] text-muted-foreground\">
              실제 서비스 연동 시, `metrics` 테이블(예: 일별 방문자 수)을 조회하여 이
              영역에 매핑할 수 있습니다.
            </p>
          </div>

          <div className=\"rounded-lg border bg-card p-4\">
            <div className=\"mb-3\">
              <h2 className=\"text-sm font-medium\">기간별 신규 가입 추이</h2>
              <p className=\"text-xs text-muted-foreground\">
                동일한 기간 동안의 신규 가입 수를 비교해, 캠페인 성과를 가늠합니다.
              </p>
            </div>
            <MiniBarChart labels={labels} series={signupSeries} />
            <p className=\"mt-2 text-[11px] text-muted-foreground\">
              예를 들어 특정 캠페인 시작일을 기준으로, 이전/이후 가입량을 나눠 보는
              분석에 활용할 수 있습니다.
            </p>
          </div>
        </section>

        <section
          aria-label=\"플랜별 매출 비율 및 메모\"
          className=\"grid gap-4 md:grid-cols-2\"
        >
          <div className=\"rounded-lg border bg-card p-4\">
            <div className=\"mb-3 flex items-center justify-between gap-2\">
              <div>
                <h2 className=\"text-sm font-medium\">플랜별 매출 비율</h2>
                <p className=\"text-xs text-muted-foreground\">
                  선택한 기간 동안 요금제별 매출 기여도를 단순 비율로 표현합니다.
                </p>
              </div>
            </div>

            <div className=\"mb-4 h-2.5 w-full overflow-hidden rounded-full bg-muted\">
              <div className=\"flex h-full w-full\">
                {planShares.map((item) => (
                  <div
                    key={item.plan}
                    className={`${item.colorClass} h-full`}
                    style={{ width: `${item.percent}%` }}
                  />
                ))}
              </div>
            </div>

            <PlanShareLegend items={planShares} />

            <p className=\"mt-3 text-[11px] text-muted-foreground\">
              실제 구현에서는 구독/결제 테이블을 기준으로, 플랜별 MRR/ARR 비율을 이
              컴포넌트에 바인딩하도록 설계할 수 있습니다.
            </p>
          </div>

          <div className=\"rounded-lg border bg-card p-4\">
            <h2 className=\"text-sm font-medium\">분석 인사이트 메모</h2>
            <p className=\"mt-1 text-xs text-muted-foreground\">
              이 섹션은 PM/마케터가 주간 리포트나 실험 결과를 요약하는 영역으로
              사용할 수 있습니다.
            </p>
            <ul className=\"mt-3 space-y-2 text-xs text-muted-foreground\">
              <li>
                - 최근 {range === \"7d\" ? \"1주\" : range === \"30d\" ? \"1개월\" : \"분기\"}
                간 PRO/BUSINESS 비율이 안정적으로 유지되고 있습니다.
              </li>
              <li>
                - 방문 대비 가입 전환율이 3~5% 구간에 머물고 있어, 랜딩 페이지 A/B 테스트의
                여지가 있습니다.
              </li>
              <li>
                - 구체적인 비즈니스 로직이 확정되면, 이 영역에 자동 생성되는 코멘트 또는
                수동 메모 입력 UI를 추가할 수 있습니다.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
