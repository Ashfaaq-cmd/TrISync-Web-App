"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = { week: number; totalWeeks: number }

export default function WeekNavigation({ week, totalWeeks }: Props) {
  const [selectedWeek, setSelectedWeek] = useState(week)
  const weeks = Array.from({ length: totalWeeks }, (_, index) => index + 1)

  return (
    <section
      aria-label="Training plan week"
      className="rounded-xl border border-border bg-surface p-4 sm:flex sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="mb-3 sm:mb-0">
        <h2 className="text-sm font-semibold text-foreground">Plan week</h2>
        <p className="mt-1 text-xs text-muted">
          Week {week} of {totalWeeks}
        </p>
      </div>
      <nav
        aria-label="Week navigation"
        className="flex w-full items-center gap-2 sm:w-auto"
      >
        {selectedWeek > 1 ? (
          <Link
            href={`/training-plan?week=${selectedWeek - 1}`}
            onClick={() => setSelectedWeek(selectedWeek - 1)}
            aria-label={`Previous week, week ${selectedWeek - 1}`}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </Link>
        ) : (
          <button
            type="button"
            aria-label="No previous week"
            disabled
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted opacity-50"
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
        )}

        <form
          action="/training-plan"
          method="get"
          className="flex min-w-0 flex-1 items-center gap-2 sm:flex-none"
        >
          <label htmlFor="training-week" className="sr-only">
            Choose a week
          </label>
          <select
            id="training-week"
            name="week"
            value={selectedWeek}
            onChange={(event) => setSelectedWeek(Number(event.currentTarget.value))}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-40 sm:flex-none"
          >
            {weeks.map((weekNumber) => (
              <option key={weekNumber} value={weekNumber}>
                Week {weekNumber}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Go
          </button>
        </form>

        {selectedWeek < totalWeeks ? (
          <Link
            href={`/training-plan?week=${selectedWeek + 1}`}
            onClick={() => setSelectedWeek(selectedWeek + 1)}
            aria-label={`Next week, week ${selectedWeek + 1}`}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-sidebar focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChevronRight aria-hidden="true" size={18} />
          </Link>
        ) : (
          <button
            type="button"
            aria-label="No next week"
            disabled
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted opacity-50"
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        )}
      </nav>
    </section>
  )
}
