import Link from "next/link"
import DisciplineChip from "@/components/discipline-chip"
import type { LearningListItem } from "@/lib/learning"

export default function ResourceCard({ resource }: { resource: LearningListItem }) {
  return (
    <Link
      href={`/learning-hub/${resource.id}`}
      className="flex flex-col rounded-lg border border-border bg-surface p-4 hover:border-primary"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full border border-border px-2 py-0.5 text-xs font-bold text-muted">
          {resource.type === "COACH_LESSON" ? "Coach lesson" : "Video"}
        </span>
        {resource.discipline && <DisciplineChip discipline={resource.discipline} />}
      </div>

      <h3 className="mt-3 font-semibold text-foreground">{resource.title}</h3>
      {resource.description && (
        <p className="mt-1 line-clamp-3 text-sm text-muted">{resource.description}</p>
      )}

      {resource.topicTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {resource.topicTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary-soft px-2 py-0.5 text-xs text-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}