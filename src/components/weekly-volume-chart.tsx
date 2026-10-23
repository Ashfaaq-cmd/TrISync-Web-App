"use client"
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis, } from "recharts"
  import type { WeekVolume, VolumeDiscipline } from "@/lib/dashboard"

const SERIES: { key: VolumeDiscipline; label: string; color:string }[]=[
  { key: "SWIM", label: "Swim", color: "var(--swim)" },
  { key: "BIKE", label: "Bike", color: "var(--bike)" },
  { key: "RUN", label: "Run", color: "var(--run)" },
  { key: "BRICK", label: "Brick", color: "var(--brick)" },
  { key: "STRENGTH", label: "Strength", color: "var(--strength)" },
]
export default function WeeklyVolumeChart({ data }: { data: WeekVolume[] }){
    const hasData = data.some((week)=> 
    SERIES.some((series)=> week[series.key] > 0))

    if(!hasData){
        return(
            <p className="py-16 text-center text-sm text-muted">Log a session to see your weekly training volume here</p>
        )
    }
  return (
    <div role="img" aria-label="Stacked bar chart of weekly training hours by discipline over the last 8 weeks" className="h-72 w-full">

        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top:8, right:8, left:0, bottom:0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: "var(--muted)", fontSize:12 }} stroke="var(--border)"/>
            <YAxis width={40} tick={{ fill: "var(--muted)", fontSize: 12 }} stroke="var(--border)" tickFormatter={(value) => `${value}h`} />
          <Tooltip
            cursor={{ fill: "var(--primary-soft)" }}
            contentStyle={{
              background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--foreground)",
            }}
            labelFormatter={(label) => `Week of ${label}`}
            formatter={(value, name) => [`${value} h`, name]}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: "var(--foreground)" }}>{value}</span>
            )}
          />
          {SERIES.map((series) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              name={series.label}
              stackId="volume"
              fill={series.color}
              isAnimationActive={false}
            />
          ))}
            </BarChart>
        </ResponsiveContainer>
    </div>
  )
}
