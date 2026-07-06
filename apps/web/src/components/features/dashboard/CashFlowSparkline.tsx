'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyTotal } from '@/types/domain';

interface CashFlowSparklineProps {
  data: DailyTotal[];
}

export function CashFlowSparkline({ data }: CashFlowSparklineProps) {
  if (data.length === 0) {
    return (
      <p style={{ fontSize: '14px', color: 'var(--fg-3)', padding: '16px 0' }}>
        No daily data for this period.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date.slice(5),
    spend: d.spend,
    income: d.income,
  }));

  return (
    <div style={{ width: '100%', height: '180px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: 'var(--fg-3)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Area
            type="monotone"
            dataKey="spend"
            stroke="var(--accent)"
            fill="url(#spendGrad)"
            strokeWidth={1.75}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
