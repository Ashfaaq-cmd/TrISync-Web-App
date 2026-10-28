import "dotenv/config"
const apiKey = process.env.YOUTUBE_API_KEY ?? ""
const query = process.argv.slice(2).join(" ")

if (!apiKey){
    console.error("Set YOUTUBE_API_KEY in .env first")
    process.exit(1)
}
if (!query){
    console.error('Usage: npm run yt:search -- "brick workout triathlon"')
    process.exit(1)
}

type SearchResponse = {
    items?:{
        id: { videoId: string }
        snippet: { title: string; channelTitle: string }
    }[]
    error?: { message: string }
}
async function main() {
    const url = new URL("https://www.googleapis.com/youtube/v3/search")
    url.search = new URLSearchParams({
        part: "snippet",
        type: "video",
        videoEmbeddable: "true",
        q: query,
        key: apiKey,
    }).toString()
    
    const response = await fetch(url)
    const data = (await response.json()) as SearchResponse

    if(!response.ok){
         console.error("YouTube API error:", data.error?.message ?? response.status)
    process.exit(1)
    }
    // Each search costs 100 quota units, so choose your queries carefully
  for (const item of data.items ?? []) {
    console.log(`${item.id.videoId}  ${item.snippet.title}  (${item.snippet.channelTitle})`)
  }
}
main()