const formatter = new Intl.DateTimeFormat("en-GB",{
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
})
//turn week2, day 6 of a plan into readable data
export function formatWorkoutDate(
    startDate: Date,
    weekNumber: number,
    dayOfWeek: number
){
const date = new Date(startDate)
date.setUTCDate(date.getUTCDate() + (weekNumber - 1) * 7 + (dayOfWeek -1 ))
return formatter.format(date)
}
const logDateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
})
export function formatLogDate(date: Date){
    return logDateFormatter.format(date)
}
// Plans start on the next Monday
// Dates are stored in UTC so server time zone shift them by a day
export function nextMonday(from = new Date()){
    const date = new Date(
        Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate())
    )
    const daysUntilMonday = (8 - date.getUTCDay()) % 7 || 7
    date.setUTCDate(date.getUTCDate() + daysUntilMonday)
    return date
}