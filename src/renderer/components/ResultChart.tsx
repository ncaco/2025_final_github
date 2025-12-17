import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import type { SimulationPoint } from "@models/result";

interface Props {
  points: SimulationPoint[];
}

export const ResultChart: React.FC<Props> = ({ points }) => {
  const data = points.map((p) => ({
    month: p.monthIndex,
    totalValue: Math.round(p.totalValue),
    principal: Math.round(p.principalInvested),
    dividendCum: Math.round(p.dividendReceivedCumulative)
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="totalValue"
          stroke="#3b82f6"
          name="평가액"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="principal"
          stroke="#10b981"
          name="원금"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="dividendCum"
          stroke="#fbbf24"
          name="누적 배당"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};


