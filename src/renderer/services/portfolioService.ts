import type { Portfolio, PortfolioStore } from "@models/portfolio";

// 간단한 JSON 구조 예시:
// {
//   "portfolios": [
//     {
//       "id": "default",
//       "name": "기본 포트폴리오",
//       "note": "",
//       "items": [ ... PortfolioItem ... ]
//     }
//   ]
// }

export const EMPTY_STORE: PortfolioStore = {
  portfolios: []
};

export function getPortfolioTotalValue(portfolio: Portfolio): number {
  return portfolio.items.reduce((sum, item) => {
    return sum + (item.lastSummary?.finalValue ?? 0);
  }, 0);
}



