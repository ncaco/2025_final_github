import type { PortfolioStore } from "@models/portfolio";

declare global {
  interface Window {
    api: {
      loadPortfolio: () => Promise<PortfolioStore>;
      savePortfolio: (store: PortfolioStore) => Promise<boolean>;
    };
  }
}

export {};


