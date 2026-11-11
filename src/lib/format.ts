//372 mins => 6h 12m
export function formatDuration(totalMinutes : number){
    const hours = Math.floor(totalMinutes/60)
    const minutes = totalMinutes % 60
    return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`
}
// 350 seconds => 5:50
export function formatMinSec(totalSeconds: number){
    const rounded = Math.round(totalSeconds)
    return `${Math.floor(rounded / 60)}:${String(rounded % 60 ).padStart(2,"0")}`
}