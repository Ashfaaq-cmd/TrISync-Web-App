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
  {
    videoId: "fFTUPkGTh_A",
    title: "Run Faster In A Triathlon With This Brick Workout",
    description:
      "Learn how brick workouts combine cycling and running to help triathletes adapt to running after a bike session.",
    discipline: "BRICK",
    muscleGroups: ["QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES"],
    topicTags: ["brick training", "bike to run", "triathlon", "transition"],
  },
  {
    videoId: "B-_-tVKrMUs",
    title: "IRONMAN 70.3: What Are Triathlon Brick Sessions and Why Are They Important?",
    description:
      "Understand the purpose of brick sessions, why triathletes use them, and how they prepare you for the demands of race day.",
    discipline: "BRICK",
    muscleGroups: ["QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES"],
    topicTags: ["brick training", "IRONMAN", "race preparation", "bike to run"],
  },
  {
    videoId: "JeluJHvClaE",
    title: "5 Freestyle Drills For Beginner Swimmers",
    description:
      "Explore beginner-friendly freestyle drills designed to help develop swimming technique, coordination, and body position.",
    discipline: "SWIM",
    muscleGroups: ["SHOULDERS", "BACK", "CORE"],
    topicTags: ["swimming", "freestyle", "technique", "beginner", "drills"],
  },
  {
    videoId: "p5OLDtnSNLo",
    title: "4 Essential Tips To Improve Your Swim Technique",
    description:
      "Learn practical swimming technique tips that can help improve efficiency and build better freestyle habits for triathlon training.",
    discipline: "SWIM",
    muscleGroups: ["SHOULDERS", "BACK", "CORE"],
    topicTags: ["swimming", "freestyle", "technique", "efficiency"],
  },
  {
    videoId: "4VrwO-RdMds",
    title: "6 Easy Ways To Improve Your Average Speed On A Road Bike",
    description:
      "Discover practical cycling tips to improve your riding efficiency and work towards maintaining a better average speed.",
    discipline: "BIKE",
    muscleGroups: ["QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES"],
    topicTags: ["cycling", "road cycling", "speed", "performance"],
  },
  {
    videoId: "iJg5MbP-PTs",
    title: "7 Tips To Take You From Amateur To Accomplished Cyclist",
    description:
      "Explore useful cycling skills and habits to build confidence, improve riding technique, and become a more capable cyclist.",
    discipline: "BIKE",
    muscleGroups: ["QUADRICEPS", "HAMSTRINGS", "GLUTES", "CORE"],
    topicTags: ["cycling", "cycling skills", "technique", "beginner"],
  },
  {
    videoId: "v-p_0Bs4KNU",
    title: "The 10 Biggest Mistakes New Runners Make (and How to Avoid Them)",
    description:
      "Learn about common mistakes made by beginner runners and practical ways to develop better running habits.",
    discipline: "RUN",
    muscleGroups: ["QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES"],
    topicTags: ["running", "beginner", "running tips", "technique"],
  },
  {
    videoId: "msw3RZMvq1c",
    title: "How to Run Properly: Improve Your Running Form and Technique",
    description:
      "Explore running form tips and technique adjustments that may help you develop a more efficient and controlled running style.",
    discipline: "RUN",
    muscleGroups: ["QUADRICEPS", "HAMSTRINGS", "GLUTES", "CALVES", "CORE"],
    topicTags: ["running", "running form", "technique", "beginner"],
  },
];
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