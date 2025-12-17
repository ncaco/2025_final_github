export type ScenarioType = "lumpSum" | "dca";

export interface ScenarioCommon {
  id: string;
  name: string;
  symbol?: string;
  note?: string;
  scenarioType: ScenarioType;

  startDate: string; // ISO yyyy-mm-dd
  months: number; // 시뮬레이션 기간(월)

  initialPrice: number; // 초기 주가
  annualPriceGrowthRate: number; // 기대 연간 주가 상승률 (예: 0.05 = 5%)

  annualDividendYield: number; // 기대 연간 배당 수익률 (예: 0.04 = 4%)
  dividendFrequencyPerYear: number; // 연 배당 지급 횟수 (1, 4, 12 등)

  dividendTaxRate: number; // 배당소득세율 (예: 0.154)
  reinvestDividend: boolean; // 배당 재투자 여부

  applyCapitalGainTaxOnExit: boolean;
  capitalGainTaxRate: number; // 매매차익 과세 시 단일 세율
}

export interface LumpSumScenario extends ScenarioCommon {
  scenarioType: "lumpSum";
  initialInvestment: number;
}

export interface DcaScenario extends ScenarioCommon {
  scenarioType: "dca";
  contributionPerPeriod: number; // 적립 주기마다 투자 금액
  contributionFrequencyPerYear: number; // 연 적립 횟수 (월 1회면 12)
}

export type Scenario = LumpSumScenario | DcaScenario;


