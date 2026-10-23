//372 mins => 6h 12m
export function formatDuration(totalMinutes : number){
    const hours = Math.floor(totalMinutes/60)
    const minutes = totalMinutes % 60
    return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`
}