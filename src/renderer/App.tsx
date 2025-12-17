import React, { useEffect, useMemo, useState } from "react";
import { simulateScenario } from "@services/calcService";
import type { ScenarioType, Scenario } from "@models/scenario";
import type { SimulationResult } from "@models/result";
import type { Portfolio, PortfolioStore } from "@models/portfolio";
import { getPortfolioTotalValue } from "@services/portfolioService";
import { ResultChart } from "@components/ResultChart";

function formatCurrency(value: number): string {
  if (!isFinite(value)) return "-";
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 0
  });
}

// 요약 카드/포트폴리오용: 억/만원 단위 표시
function formatCurrencyWithUnit(value: number): string {
  if (!isFinite(value)) return "-";
  const abs = Math.abs(value);

  if (abs >= 100_000_000) {
    // 1억 이상
    const unit = value / 100_000_000;
    return `${unit.toFixed(2)} 억원`;
  }

  if (abs >= 10_000) {
    // 1만원 이상
    const unit = value / 10_000;
    return `${unit.toFixed(2)} 만원`;
  }

  return `${value.toLocaleString("ko-KR")} 원`;
}

function formatPercent(value: number): string {
  if (!isFinite(value)) return "-";
  return (value * 100).toFixed(2) + "%";
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"simulation" | "portfolio">(
    "simulation"
  );
  const [scenarioType, setScenarioType] = useState<ScenarioType>("lumpSum");
  const [months, setMonths] = useState(120);
  const [initialInvestment, setInitialInvestment] = useState(10_000_000);
  const [contributionPerPeriod, setContributionPerPeriod] = useState(500_000);
  const [annualPriceGrowthRate, setAnnualPriceGrowthRate] = useState(0.05);
  const [annualDividendYield, setAnnualDividendYield] = useState(0.04);
  const [dividendFrequencyPerYear, setDividendFrequencyPerYear] = useState(4);
  const [dividendTaxRate, setDividendTaxRate] = useState(0.154);
  const [reinvestDividend, setReinvestDividend] = useState(true);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [portfolioStore, setPortfolioStore] = useState<PortfolioStore>({
    portfolios: []
  });

  useEffect(() => {
    if (!window.api) return;
    window.api
      .loadPortfolio()
      .then((store) => {
        if (store && Array.isArray(store.portfolios)) {
          setPortfolioStore(store);
        }
      })
      .catch(() => {
        // 파일이 없거나 에러이면 빈 스토어 유지
      });
  }, []);

  const scenario: Scenario = useMemo(
    () => ({
      id: "quick-sim",
      name: "빠른 시뮬레이션",
      scenarioType,
      startDate: "2025-01-01",
      months,
      symbol: "TICK",
      initialPrice: 100_000,
      annualPriceGrowthRate,
      annualDividendYield,
      dividendFrequencyPerYear,
      dividendTaxRate,
      reinvestDividend,
      applyCapitalGainTaxOnExit: false,
      capitalGainTaxRate: 0,
      ...(scenarioType === "lumpSum"
        ? { initialInvestment }
        : {
            contributionPerPeriod,
            contributionFrequencyPerYear: 12
          })
    }),
    [
      scenarioType,
      months,
      initialInvestment,
      contributionPerPeriod,
      annualPriceGrowthRate,
      annualDividendYield,
      dividendFrequencyPerYear,
      dividendTaxRate,
      reinvestDividend
    ]
  ) as Scenario;

  const handleRun = () => {
    const r = simulateScenario(scenario);
    setResult(r);

    // 기본 포트폴리오에 현재 시나리오 결과를 추가하고 저장
    setPortfolioStore((prev: PortfolioStore) => {
      const portfolios = prev.portfolios.length
        ? prev.portfolios
        : [{ id: "default", name: "기본 포트폴리오", items: [] }];

      const [first, ...rest] = portfolios;
      const updatedFirst = {
        ...first,
        items: [
          ...first.items,
          {
            id: `item-${Date.now()}`,
            name: scenario.name,
            symbol: scenario.symbol,
            note: scenario.note,
            scenario,
            lastSummary: r.summary
          }
        ]
      };

      const nextStore: PortfolioStore = {
        portfolios: [updatedFirst, ...rest]
      };

      if (window.api) {
        void window.api.savePortfolio(nextStore);
      }

      return nextStore;
    });
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="app-title">주가·배당 계산기 (거치식/적립식)</div>
        <div className="app-tabs">
          <button
            className={`tab-button ${
              activeTab === "simulation" ? "active" : ""
            }`}
            onClick={() => setActiveTab("simulation")}
          >
            시뮬레이션
          </button>
          <button
            className={`tab-button ${
              activeTab === "portfolio" ? "active" : ""
            }`}
            onClick={() => setActiveTab("portfolio")}
          >
            포트폴리오
          </button>
        </div>
      </header>

      {activeTab === "simulation" && (
        <main className="app-content">
          <section className="panel panel-left">
            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
              시나리오 입력
            </div>

            <div className="field-group">
              <div className="field-label">시나리오 타입</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={`tab-button ${
                    scenarioType === "lumpSum" ? "active" : ""
                  }`}
                  onClick={() => setScenarioType("lumpSum")}
                >
                  거치식
                </button>
                <button
                  className={`tab-button ${
                    scenarioType === "dca" ? "active" : ""
                  }`}
                  onClick={() => setScenarioType("dca")}
                >
                  적립식
                </button>
              </div>
            </div>

            <div className="field-group">
              <div className="field-label">투자 기간 (개월)</div>
              <input
                className="field-input"
                type="number"
                value={months}
                min={1}
                onChange={(e) => setMonths(Number(e.target.value) || 1)}
              />
            </div>

            {scenarioType === "lumpSum" ? (
              <div className="field-group">
                <div className="field-label">초기 투자 금액</div>
                <input
                  className="field-input"
                  type="number"
                  value={initialInvestment}
                  min={0}
                  onChange={(e) =>
                    setInitialInvestment(Number(e.target.value) || 0)
                  }
                />
              </div>
            ) : (
              <div className="field-group">
                <div className="field-label">적립 금액 (월)</div>
                <input
                  className="field-input"
                  type="number"
                  value={contributionPerPeriod}
                  min={0}
                  onChange={(e) =>
                    setContributionPerPeriod(Number(e.target.value) || 0)
                  }
                />
              </div>
            )}

            <div className="field-group">
              <div className="field-label">기대 연 주가 상승률 (%)</div>
              <input
                className="field-input"
                type="number"
                value={annualPriceGrowthRate * 100}
                step={0.1}
                onChange={(e) =>
                  setAnnualPriceGrowthRate(Number(e.target.value) / 100 || 0)
                }
              />
            </div>

            <div className="field-group">
              <div className="field-label">기대 연 배당 수익률 (%)</div>
              <input
                className="field-input"
                type="number"
                value={annualDividendYield * 100}
                step={0.1}
                onChange={(e) =>
                  setAnnualDividendYield(Number(e.target.value) / 100 || 0)
                }
              />
            </div>

            <div className="field-group">
              <div className="field-label">연 배당 횟수</div>
              <select
                className="field-select"
                value={dividendFrequencyPerYear}
                onChange={(e) =>
                  setDividendFrequencyPerYear(Number(e.target.value) || 1)
                }
              >
                <option value={1}>연 1회</option>
                <option value={2}>연 2회</option>
                <option value={4}>연 4회 (분기)</option>
                <option value={12}>연 12회 (월)</option>
              </select>
            </div>

            <div className="field-group">
              <div className="field-label">배당소득세율 (%)</div>
              <input
                className="field-input"
                type="number"
                value={dividendTaxRate * 100}
                step={0.1}
                onChange={(e) =>
                  setDividendTaxRate(Number(e.target.value) / 100 || 0)
                }
              />
            </div>

            <div className="field-group">
              <label style={{ fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={reinvestDividend}
                  onChange={(e) => setReinvestDividend(e.target.checked)}
                  style={{ marginRight: 6 }}
                />
                배당금 자동 재투자
              </label>
            </div>

            <button className="primary-button" onClick={handleRun}>
              시뮬레이션 실행
            </button>
          </section>

          <section className="panel panel-right">
            <div className="panel">
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                요약
              </div>
              <div className="summary-grid">
                <div className="summary-card">
                  <div className="summary-label">최종 평가액</div>
                  <div className="summary-value">
                    {result
                      ? formatCurrencyWithUnit(result.summary.finalValue)
                      : "-"}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">투입 원금</div>
                  <div className="summary-value">
                    {result
                      ? formatCurrencyWithUnit(
                          result.summary.totalPrincipal
                        )
                      : "-"}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">총 배당금</div>
                  <div className="summary-value">
                    {result
                      ? formatCurrencyWithUnit(result.summary.totalDividend)
                      : "-"}
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">연환산 수익률(CAGR)</div>
                  <div className="summary-value">
                    {result ? formatPercent(result.summary.cagr) : "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="panel" style={{ flex: 1, overflow: "auto" }}>
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 13,
                  fontWeight: 500
                }}
              >
                기간별 상세 (테이블)
              </div>
              <table className="result-table">
                <thead>
                  <tr>
                    <th>월</th>
                    <th>주가</th>
                    <th>보유 주식</th>
                    <th>현금</th>
                    <th>평가액</th>
                    <th>원금</th>
                    <th>당기 배당</th>
                    <th>누적 배당</th>
                  </tr>
                </thead>
                <tbody>
                  {result?.points.map((p) => (
                    <tr key={p.monthIndex}>
                      <td>{p.monthIndex}</td>
                      <td>{formatCurrency(p.price)}</td>
                      <td>{p.shares.toFixed(4)}</td>
                      <td>{formatCurrency(p.cash)}</td>
                      <td>{formatCurrency(p.totalValue)}</td>
                      <td>{formatCurrency(p.principalInvested)}</td>
                      <td>{formatCurrency(p.dividendReceivedThisPeriod)}</td>
                      <td>{formatCurrency(p.dividendReceivedCumulative)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!result && (
                <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>
                  왼쪽에서 파라미터를 입력하고 &quot;시뮬레이션 실행&quot;을
                  눌러주세요.
                </div>
              )}
              {result && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      marginBottom: 8,
                      fontSize: 13,
                      fontWeight: 500
                    }}
                  >
                    그래프
                  </div>
                  <ResultChart points={result.points} />
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {activeTab === "portfolio" && (
        <main className="app-content">
          <section className="panel" style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
              포트폴리오
            </div>
            {portfolioStore.portfolios.length === 0 ? (
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                아직 저장된 포트폴리오가 없습니다. 시뮬레이션을 실행하면 기본
                포트폴리오에 종목이 추가됩니다.
              </div>
            ) : (
              portfolioStore.portfolios.map((p: Portfolio) => {
                const total = getPortfolioTotalValue(p);
                return (
                  <div key={p.id} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 4
                      }}
                    >
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        총 평가액: {formatCurrencyWithUnit(total)}
                      </div>
                    </div>
                    <table className="result-table">
                      <thead>
                        <tr>
                          <th>종목명</th>
                          <th>티커</th>
                          <th>최종 평가액</th>
                          <th>비중</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.items.map((item) => {
                          const v = item.lastSummary?.finalValue ?? 0;
                          const weight =
                            total > 0
                              ? ((v / total) * 100).toFixed(1) + "%"
                              : "-";
                          return (
                            <tr key={item.id}>
                              <td>{item.name}</td>
                              <td>{item.symbol}</td>
                              <td>{formatCurrencyWithUnit(v)}</td>
                              <td>{weight}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })
            )}
          </section>
        </main>
      )}
    </div>
  );
};


