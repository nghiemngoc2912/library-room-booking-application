import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#ff4d4f', '#52c41a']; // Xám + Xanh (đẹp, dễ nhìn)

export default function ReputationChart({ violations, score }) {
  const violationTotal = violations.reduce((sum, v) => sum + Math.abs(v.score), 0);
  const data = [
    { name: 'Violation', value: violationTotal },
    { name: 'Score', value: score }
  ];

  return (
    <PieChart width={400} height={320}>
      <Pie
        data={data}
        cx="50%" cy="50%"
        outerRadius={110}
        label={({ name, percent }) =>
          `${name} (${(percent * 100).toFixed(0)}%)`
        }
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend verticalAlign="top" height={36} />
    </PieChart>
  );
}
