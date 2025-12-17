import type { Scenario } from "@models/scenario";
import type { SimulationSummary } from "@models/result";

export interface PortfolioItem {
  id: string;
  symbol?: string;
  name: string;
  note?: string;
  scenario: Scenario;
  lastSummary?: SimulationSummary;
}

export interface Portfolio {
  id: string;
  name: string;
  note?: string;
  items: PortfolioItem[];
}

export interface PortfolioStore {
  portfolios: Portfolio[];
}



