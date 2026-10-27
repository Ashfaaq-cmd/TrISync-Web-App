import Link from "next/link"
import { notFound } from "next/navigation"
import DisciplineChip from "@/components/discipline-chip"
import MarkdownContent from "@/components/markdown-content"
import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import { formatEnum } from "@/lib/discipline"
import { getLearningResource } from "@/lib/learning"
type PageProps = { params: Promise<{ resourceId: string }> }
export default function ResourcePage({ params }: PageProps){
    return (
        <ProtectedPage>
            <ResourceContent params={params}/>
        </ProtectedPage>
    )
}
async function ResourceContent({params}:PageProps) {
    const { resourceId } = await params
    const resource = await getLearningResource(resourceId)
    if(!resource) notFound()
        return(
    <>
    <PageHeader title={resource.title}
    subtitle={resource.type === "COACH_LESSON"? "Coach lesson" : "Video"}
    />
    <div className="max-w-2xl space-y-6 p-6 md:p-10">
        <Link
          href="/learning-hub"
          className="text-sm font-medium text-link hover:underline"
        >
          ← Back to Learning Hub
        </Link>
         <div className="flex flex-wrap items-center gap-2">
          {resource.discipline && <DisciplineChip discipline={resource.discipline} />}
          {resource.muscleGroups.map((muscle) => (
            <span
              key={muscle}
              className="rounded-full bg-primary-soft px-3 py-1 text-xs text-foreground"
            >
              {formatEnum(muscle)}
            </span>
          ))}
        </div>
                {resource.content && <MarkdownContent>{resource.content}</MarkdownContent>}
 <p className="border-t border-border pt-4 text-xs text-muted">
          This content is general information for training. It does not replace
          advice from a qualified coach or medical professional.
        </p>
        </div>
    </>

    )
    
}