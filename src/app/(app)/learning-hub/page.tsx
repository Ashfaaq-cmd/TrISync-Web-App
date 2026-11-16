import Link from "next/link"
import { ChevronDown } from "lucide-react"
import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import ResourceCard from "@/components/resource-card"
import { DISCIPLINE_LABELS, formatEnum } from "@/lib/discipline"
import { getLearningResources } from "@/lib/learning"
import { MUSCLE_GROUPS } from "@/lib/validations/training-plan"
import { LOG_DISCIPLINES } from "@/lib/validations/workout-log"

type PageProps = {
  searchParams: Promise<{ discipline?: string; muscle?: string | string[] }>
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
  const requestedMuscles = Array.isArray(params.muscle)
    ? params.muscle
    : params.muscle
      ? [params.muscle]
      : []
  const muscles = MUSCLE_GROUPS.filter((value) => requestedMuscles.includes(value))

  const resources = await getLearningResources({ discipline, muscles })
  const hasFilters = Boolean(discipline || muscles.length)
  const activeFilters = [
    ...(discipline ? [DISCIPLINE_LABELS[discipline]] : []),
    ...muscles.map(formatEnum),
  ].join(" · ")

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
              Combine a discipline with one or more muscle groups.
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
          className="space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:items-end">
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

            <details
              open={muscles.length > 0}
              className="group rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
                <span>Muscle groups</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-foreground">
                    {muscles.length > 0 ? `${muscles.length} selected` : "Optional"}
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    size={16}
                    className="transition-transform group-open:rotate-180"
                  />
                </span>
              </summary>
              <p className="mt-2 text-xs text-muted">
                Resources matching any selected group will be shown.
              </p>
              <fieldset className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-2">
                <legend className="sr-only">Choose muscle groups</legend>
                {MUSCLE_GROUPS.map((value) => {
                  const selected = muscles.includes(value)

                  return (
                    <label
                      key={value}
                      className={`flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition-colors ${
                        selected
                          ? "border-primary bg-primary-soft text-foreground"
                          : "border-border bg-surface text-foreground hover:bg-sidebar"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="muscle"
                        value={value}
                        defaultChecked={selected}
                        className="size-4 shrink-0 accent-primary"
                      />
                      <span>{formatEnum(value)}</span>
                    </label>
                  )
                })}
              </fieldset>
            </details>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-auto"
            >
              Apply filters
            </button>
          </div>
        </form>
        {hasFilters && (
          <p className="mt-3 text-xs font-medium text-muted" role="status">
            Active: {activeFilters}
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