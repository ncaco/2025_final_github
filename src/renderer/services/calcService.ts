import type { Scenario, LumpSumScenario, DcaScenario } from "@models/scenario";
import type { SimulationPoint, SimulationResult, SimulationSummary } from "@models/result";

function annualToMonthlyRate(annualRate: number): number {
  // 복리 기준 월간 이자율
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

function annualToPeriodRate(annualRate: number, periodsPerYear: number): number {
  return Math.pow(1 + annualRate, 1 / periodsPerYear) - 1;
}

function computeCagr(finalValue: number, principal: number, years: number): number {
  if (principal <= 0 || finalValue <= 0 || years <= 0) return 0;
  return Math.pow(finalValue / principal, 1 / years) - 1;
}

function isDividendPeriod(
  monthIndex: number,
  monthsPerDividend: number
): boolean {
  return (monthIndex + 1) % monthsPerDividend === 0;
}

function getMonthsPerPeriod(periodsPerYear: number): number {
  return Math.round(12 / periodsPerYear);
}

function simulateLumpSum(scenario: LumpSumScenario): SimulationResult {
  const {
    months,
    initialPrice,
    annualPriceGrowthRate,
    annualDividendYield,
    dividendFrequencyPerYear,
    dividendTaxRate,
    reinvestDividend
  } = scenario;

  const monthlyPriceRate = annualToMonthlyRate(annualPriceGrowthRate);
  const dividendPeriodRate = annualToPeriodRate(
    annualDividendYield,
    dividendFrequencyPerYear
  );
  const monthsPerDividend = getMonthsPerPeriod(dividendFrequencyPerYear);

  let price = initialPrice;
  let shares = scenario.initialInvestment / initialPrice;
  let cash = 0;
  let principalInvested = scenario.initialInvestment;
  let dividendCumulative = 0;

  const points: SimulationPoint[] = [];

  for (let m = 0; m < months; m++) {
    // 가격 업데이트
    if (m > 0) {
      price *= 1 + monthlyPriceRate;
    }

    let dividendThisPeriod = 0;
    if (annualDividendYield > 0 && isDividendPeriod(m, monthsPerDividend)) {
      const grossDividend = shares * price * dividendPeriodRate;
      const netDividend = grossDividend * (1 - dividendTaxRate);
      dividendThisPeriod = netDividend;
      dividendCumulative += netDividend;

      if (reinvestDividend && netDividend > 0) {
        const addedShares = netDividend / price;
        shares += addedShares;
      } else {
        cash += netDividend;
      }
    }

    const totalValue = shares * price + cash;

    points.push({
      monthIndex: m,
      dateLabel: `M+${m}`,
      price,
      shares,
      cash,
      totalValue,
      principalInvested,
      dividendReceivedThisPeriod: dividendThisPeriod,
      dividendReceivedCumulative: dividendCumulative
    });
  }

  const last = points[points.length - 1];
  const years = months / 12;
  const summary: SimulationSummary = {
    finalValue: last.totalValue,
    totalPrincipal: principalInvested,
    totalGain: last.totalValue - principalInvested,
    totalDividend: dividendCumulative,
    cagr: computeCagr(last.totalValue, principalInvested, years)
  };

  return { points, summary };
}

function simulateDca(scenario: DcaScenario): SimulationResult {
  const {
    months,
    initialPrice,
    annualPriceGrowthRate,
    annualDividendYield,
    dividendFrequencyPerYear,
    dividendTaxRate,
    reinvestDividend,
    contributionPerPeriod,
    contributionFrequencyPerYear
  } = scenario;

  const monthlyPriceRate = annualToMonthlyRate(annualPriceGrowthRate);
  const dividendPeriodRate = annualToPeriodRate(
    annualDividendYield,
    dividendFrequencyPerYear
  );
  const monthsPerDividend = getMonthsPerPeriod(dividendFrequencyPerYear);
  const monthsPerContribution = getMonthsPerPeriod(contributionFrequencyPerYear);

  let price = initialPrice;
  let shares = 0;
  let cash = 0;
  let principalInvested = 0;
  let dividendCumulative = 0;

  const points: SimulationPoint[] = [];

  for (let m = 0; m < months; m++) {
    // 가격 업데이트
    if (m > 0) {
      price *= 1 + monthlyPriceRate;
    }

    // 적립식 매수
    if ((m + 1) % monthsPerContribution === 0) {
      principalInvested += contributionPerPeriod;
      const newShares = contributionPerPeriod / price;
      shares += newShares;
    }

    // 배당
    let dividendThisPeriod = 0;
    if (annualDividendYield > 0 && isDividendPeriod(m, monthsPerDividend)) {
      const grossDividend = shares * price * dividendPeriodRate;
      const netDividend = grossDividend * (1 - dividendTaxRate);
      dividendThisPeriod = netDividend;
      dividendCumulative += netDividend;

      if (reinvestDividend && netDividend > 0) {
        const addedShares = netDividend / price;
        shares += addedShares;
      } else {
        cash += netDividend;
      }
    }

    const totalValue = shares * price + cash;

    points.push({
      monthIndex: m,
      dateLabel: `M+${m}`,
      price,
      shares,
      cash,
      totalValue,
      principalInvested,
      dividendReceivedThisPeriod: dividendThisPeriod,
      dividendReceivedCumulative: dividendCumulative
    });
  }

  const last = points[points.length - 1];
  const years = months / 12;
  const summary: SimulationSummary = {
    finalValue: last.totalValue,
    totalPrincipal: principalInvested,
    totalGain: last.totalValue - principalInvested,
    totalDividend: dividendCumulative,
    cagr: computeCagr(last.totalValue, principalInvested, years)
  };

  return { points, summary };
}

export function simulateScenario(scenario: Scenario): SimulationResult {
  if (scenario.scenarioType === "lumpSum") {
    return simulateLumpSum(scenario);
  }
  return simulateDca(scenario);
}


