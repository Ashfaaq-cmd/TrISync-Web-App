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