export interface SimulationPoint {
  monthIndex: number;
  dateLabel: string;
  price: number;
  shares: number;
  cash: number;
  totalValue: number;
  principalInvested: number;
  dividendReceivedThisPeriod: number;
  dividendReceivedCumulative: number;
}

export interface SimulationSummary {
  finalValue: number;
  totalPrincipal: number;
  totalGain: number;
  totalDividend: number;
  cagr: number; // 연환산 수익률 (근사)
}

export interface SimulationResult {
  points: SimulationPoint[];
  summary: SimulationSummary;
}


