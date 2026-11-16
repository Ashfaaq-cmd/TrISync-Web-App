import Link from "next/link"
import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import ResourceCard from "@/components/resource-card"
import { DISCIPLINE_LABELS, formatEnum } from "@/lib/discipline"
import { getLearningResources } from "@/lib/learning"
import { MUSCLE_GROUPS } from "@/lib/validations/training-plan"
import { LOG_DISCIPLINES } from "@/lib/validations/workout-log"

type PageProps = {
  searchParams: Promise<{ discipline?: string; muscle?: string }>
}

export default function LearningHubPage({ searchParams }: PageProps) {
  return (
    <ProtectedPage>
      <PageHeader
        title="Learning Hub"
        subtitle="Coach-authored lessons and curated videos"
      />
     <LearningHubContent searchParams={searchParams}/>
    </ProtectedPage>
  )
}
async function LearningHubContent({ searchParams }:PageProps) {
  const params = await searchParams
  // Only accept values from the known lists; anything else is ignored
  const discipline = LOG_DISCIPLINES.find((value) => value === params.discipline)
  const muscle = MUSCLE_GROUPS.find((value) => value === params.muscle)

  const resources = await getLearningResources({ discipline, muscle })
  const hasFilters = Boolean(discipline || muscle)

  return (
    <div className="space-y-6 p-6 md:p-10">
      <section
        aria-labelledby="resource-filters-title"
        className="rounded-xl border border-border bg-surface p-4 sm:p-5"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="resource-filters-title" className="text-sm font-semibold text-foreground">
              Filter resources
            </h2>
            <p className="mt-1 text-xs text-muted">
              Combine a discipline and muscle group to narrow your results.
            </p>
          </div>
          {hasFilters && (
            <Link
              href="/learning-hub"
              className="shrink-0 text-sm font-semibold text-link hover:underline"
            >
              Clear all
            </Link>
          )}
        </div>

        <form
          action="/learning-hub"
          method="get"
          className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
        >
          <div>
            <label
              htmlFor="discipline-filter"
              className="block text-xs font-semibold text-muted"
            >
              Discipline
            </label>
            <select
              id="discipline-filter"
              name="discipline"
              defaultValue={discipline ?? ""}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <option value="">All disciplines</option>
              {LOG_DISCIPLINES.map((value) => (
                <option key={value} value={value}>
                  {DISCIPLINE_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="muscle-filter"
              className="block text-xs font-semibold text-muted"
            >
              Muscle group
            </label>
            <select
              id="muscle-filter"
              name="muscle"
              defaultValue={muscle ?? ""}
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <option value="">Any muscle group</option>
              {MUSCLE_GROUPS.map((value) => (
                <option key={value} value={value}>
                  {formatEnum(value)}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Apply filters
          </button>
        </form>
        {hasFilters && (
          <p className="mt-3 text-xs font-medium text-muted" role="status">
            Active:{" "}
            {[discipline ? DISCIPLINE_LABELS[discipline] : null, muscle ? formatEnum(muscle) : null]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </section>

      {resources.length === 0 ? (
        <p className="text-sm text-muted">
          Nothing matches these filters yet.{" "}
          <Link href="/learning-hub" className="text-link hover:underline">
            Clear filters
          </Link>
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  )
}