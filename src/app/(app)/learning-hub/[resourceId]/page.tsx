import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import DisciplineChip from "@/components/discipline-chip"
import MarkdownContent from "@/components/markdown-content"
import PageHeader from "@/components/page-header"
import ProtectedPage from "@/components/protected-page"
import { formatEnum } from "@/lib/discipline"
import { getLearningResource } from "@/lib/learning"
type PageProps = { params: Promise<{ resourceId: string }> }
//Youtube video id are always 11 letters, digits, "-" or "_"
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/
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
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-semibold text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to Learning Hub
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
         {resource.type === "YOUTUBE_VIDEO" &&
          resource.youtubeVideoId &&
          VIDEO_ID_PATTERN.test(resource.youtubeVideoId) && (
            <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${resource.youtubeVideoId}`}
                title={resource.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}

        {resource.type === "YOUTUBE_VIDEO" && resource.description && (
          <p className="text-foreground">{resource.description}</p>
        )}

        {resource.content && <MarkdownContent>{resource.content}</MarkdownContent>}
 <p className="border-t border-border pt-4 text-xs text-muted">
          This content is general information for training. It does not replace
          advice from a qualified coach or medical professional.
        </p>
        </div>
    </>

    )
    
}