"use client"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { formatMinSec } from "@/lib/format"

export type ProgressKind = "run-pace" | "swim-pace" | "bike-speed"

const KINDS : Record<ProgressKind,{
    name: string
    color: string
    // Pace charts are flipped so faster sits higher
    reversed: boolean
    tick:(value: number) => string
    full: (value: number) => string
}
>={
  "run-pace": {
    name: "Pace",
    color: "var(--run)",
    reversed: true,
    tick: (value) => formatMinSec(value),
    full: (value) => `${formatMinSec(value)} per km`,
  },
  "swim-pace": {
    name: "Pace",
    color: "var(--swim)",
    reversed: true,
    tick: (value) => formatMinSec(value),
    full: (value) => `${formatMinSec(value)} per 100 m`,
  },
  "bike-speed": {
    name: "Speed",
    color: "var(--bike)",
    reversed: false,
    tick: (value) => String(Math.round(value)),
    full: (value) => `${Math.round(value * 10) / 10} km/h`,
  },
}
type ProgressChartProps = {
    kind: ProgressKind
    points: { date: string; value: number }[]
    label: string
}
export default function ProgressChart({ kind, points, label }: ProgressChartProps){
    const config = KINDS[kind]
    return (
    <div role="img" aria-label={label} className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            stroke="var(--border)"
          />
          <YAxis
            width={44}
            reversed={config.reversed}
            domain={["auto", "auto"]}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            stroke="var(--border)"
            tickFormatter={(value) => config.tick(Number(value))}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--foreground)",
            }}
            formatter={(value) => [config.full(Number(value)), config.name]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={config.color}
            strokeWidth={2}
            dot={{ r: 3, fill: config.color }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}