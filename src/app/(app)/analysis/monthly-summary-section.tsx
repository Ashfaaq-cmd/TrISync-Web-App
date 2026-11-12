import { getMonthStart } from "@/lib/monthly-facts"
import { getMonthlySummaries } from "@/lib/monthly-insight"
import { storedFactsSchema } from "@/lib/validations/monthly-insight"
import MonthlySummaryForm from "./monthly-summary-form"

const monthFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})
const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

type Summary = Awaited<ReturnType<typeof getMonthlySummaries>>[number]

function SummaryBody({ item }: { item: Summary }) {
  const facts = storedFactsSchema.safeParse(item.facts)

  return (
    <div className="space-y-2 text-sm">
      <p className="font-semibold text-foreground">{item.headline}</p>
      <p className="text-foreground">{item.summary}</p>
      <p className="text-foreground">
        <span className="font-semibold">Next:</span> {item.suggestion}
      </p>

      {facts.success && (
        <details className="text-muted">
          <summary className="cursor-pointer text-xs font-semibold">
            What this is based on
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {facts.data.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-xs text-muted">
        AI-generated from your logged sessions
        {item.aiModel && ` (${item.aiModel})`}. Up to {dayFormatter.format(item.periodEnd)}.
        General guidance, not medical advice.
      </p>
    </div>
  )
}

export default async function MonthlySummarySection({ userId }: { userId: string }) {
  const summaries = await getMonthlySummaries(userId)
  const monthStart = getMonthStart(new Date())

  const current = summaries.find((item) => item.periodStart.getTime() === monthStart.getTime())
  const earlier = summaries.filter((item) => item !== current)
  const monthLabel = monthFormatter.format(monthStart)

  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-4 text-xs font-bold uppercase text-muted">
        AI summary: {monthLabel}
      </h2>

      {current && <SummaryBody item={current} />}
      <div className={current ? "mt-4" : ""}>
        <MonthlySummaryForm hasSummary={Boolean(current)} monthLabel={monthLabel} />
      </div>

      <p className="mt-3 text-xs text-muted">
        This sends totals and averages from your logged sessions (time, distance, pace
        or speed) to Google&apos;s Gemini service. Your notes, name and email are never
        sent. A summary needs at least 4 sessions this month.
      </p>

      {earlier.length > 0 && (
        <div className="mt-5 space-y-2 border-t border-border pt-4">
          <h3 className="text-xs font-bold uppercase text-muted">Earlier months</h3>
          {earlier.map((item) => (
            <details key={item.id} className="rounded-lg border border-border p-3">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">
                {monthFormatter.format(item.periodStart)}: {item.headline}
              </summary>
              <div className="mt-3">
                <SummaryBody item={item} />
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  )
}