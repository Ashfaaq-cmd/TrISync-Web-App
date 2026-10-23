import type { Discipline } from "@/generated/prisma";

export const DISCIPLINE_LABELS: Record<Discipline, string> = {
    SWIM: "Swim",
    BIKE: "Bike",
    RUN: "Run",
    BRICK: "Brick",
    STRENGTH: "Strength",
    REST: "Rest",
}
export const DISCIPLINE_CHIP_STYLES: Record<Discipline, string> = {
    SWIM: "border-swim text-swim",
    BIKE: "border-bike text-bike",
    RUN: "border-run text-run",
    BRICK: "border-brick text-brick",
    STRENGTH: "border-strength text-strength",
    REST: "border-muted text-muted",
}

export function formatEnum(value: string){
    const text = value.replaceAll("_", " ").toLowerCase()
    return text.charAt(0).toUpperCase() + text.slice(1)
}
// Swims read better in metres, everything else in kilometres
export function formatDistance(km: number, discipline: Discipline) {
  if (discipline === "SWIM") return `${Math.round(km * 1000)} m`
  return `${km} km`
}