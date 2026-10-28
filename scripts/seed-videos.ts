import "dotenv/config"
import { PrismaNeon } from "@prisma/adapter-neon"
import {
  PrismaClient,
  type Discipline,
  type MuscleGroup,
} from "../src/generated/prisma"
import { error } from "console"

const apiKey = process.env.YOUTUBE_API_KEY ?? ""
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type CuratedVideo = {
  videoId: string
  title: string
  description: string
  discipline: Discipline
  muscleGroups: MuscleGroup[]
  topicTags: string[]
}

// Add videos here after finding them with: npm run yt:search -- "your search"
// The title and description are your own words, not copied from YouTube.
const videos: CuratedVideo[] = [
  // {
  //   videoId: "11 characters from the video URL",
  //   title: "Your title",
  //   description: "Why this video is worth watching, in your own words",
  //   discipline: "BRICK",
  //   muscleGroups: ["QUADRICEPS", "CALVES"],
  //   topicTags: ["brick training"],
  // },
]
type VideosResponse = {
    items?: { id: string; status: { embeddable: boolean; privacyStatus:string } }[]
    error?: { message:string }
}
// 1 call (1 quota unit) checks up to 50 videos
async function getUsableVideoIds(ids:string[]){
    const url = new URL("https://www.googleapis.com/youtube/v3/videos")
    url.search = new URLSearchParams({
    part: "status",
    id: ids.join(","),
    key: apiKey,
  }).toString()

  const response = await fetch(url)
  const data = (await response.json()) as VideosResponse
  if (!response.ok) {
    throw new Error(`YouTube API error: ${data.error?.message ?? response.status}`)
  }
  return new Set(
    (data.items ?? [])
    .filter(
        (item) => item.status.embeddable && item.status.privacyStatus === "public"
    )
    .map((item)=> item.id)
  )
}

async function main() {
    if(videos.length === 0 ){
        console.log("No videos  yet. Add some to scripts/seed-videos.ts first.")
    return
    }
        if (videos.length > 50) throw new Error("Add at most 50 videos at a time")
        if (!apiKey) throw new Error("Set YOUTUBE_API_KEY in .env first")

        const usable = await getUsableVideoIds(videos.map((video)=> video.videoId))
        let saved = 0

        for(const video of videos){
            // a video that is private, removed or blocked from embedding is skipped
            if(!usable.has(video.videoId)){
                console.warn(`Skipped ${video.videoId}: not found, not public, or not embeddable`)
                continue
            }
            const { videoId, ...details } = video
            // Running the script again updates the videos instead of duplicating them
        await prisma.learningResource.upsert({
            where: { id: `seed-video-${videoId}` },
      create: {
        id: `seed-video-${videoId}`,
        type: "YOUTUBE_VIDEO",
        youtubeVideoId: videoId,
        ...details,
      },
      update: { type: "YOUTUBE_VIDEO", youtubeVideoId: videoId, ...details },
        })  
        saved +=1      
        }
        console.log(`Saved ${saved} of ${videos.length} videos`)
}

main()
.catch((error)=> {
    console.log(error)
    process.exit(1)
})
.finally(()=> prisma.$disconnect())