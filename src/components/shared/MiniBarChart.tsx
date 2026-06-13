'use client'

import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, Cell } from 'recharts'

interface MiniBarChartProps {
  data: { value: number }[]
  color: string
}

export function MiniBarChart({ data, color }: MiniBarChartProps) {
  return (
    <div className="h-[40px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Bar dataKey="value" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={color} fillOpacity={0.8 + (index * 0.02)} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
