import Link from "next/link"
import type { ReactNode } from "react"
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
function buildHref(discipline?:string,muscle?:string){
  const query = new URLSearchParams()
  if(discipline) query.set("discipline", discipline)
    if(muscle) query.set("muscle", muscle)
      const text = query.toString()
    return text ? `/learning-hub?${text}` : "/learning-hub"
}
function FilterChip({
  href,active,children,}:{ 
    href: string
    active: boolean
    children: ReactNode
}){
  return (
    <Link href={href}
    aria-current={active ? "true" : undefined}
    className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm font-semibold ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-foreground hover:bg-background"
      }`}>{children}
      </Link>
  )
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
    const discipline = LOG_DISCIPLINES.find((value)=> value === params.discipline)
    const muscle = MUSCLE_GROUPS.find((value)=> value === params.muscle)

    const resources = await getLearningResources({ discipline, muscle })
    return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="space-y-3">
        <nav aria-label="Filter by discipline" className="flex gap-2 overflow-x-auto">
          <FilterChip href={buildHref(undefined, muscle)} active={!discipline}>
            All
          </FilterChip>
          {LOG_DISCIPLINES.map((value) => (
            <FilterChip
              key={value}
              href={buildHref(value, muscle)}
              active={discipline === value}
            >
              {DISCIPLINE_LABELS[value]}
            </FilterChip>
          ))}
        </nav>

        <nav aria-label="Filter by muscle group" className="flex gap-2 overflow-x-auto">
          <FilterChip href={buildHref(discipline, undefined)} active={!muscle}>
            Any muscle
          </FilterChip>
          {MUSCLE_GROUPS.map((value) => (
            <FilterChip
              key={value}
              href={buildHref(discipline, value)}
              active={muscle === value}
            >
              {formatEnum(value)}
            </FilterChip>
          ))}
        </nav>
      </div>

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