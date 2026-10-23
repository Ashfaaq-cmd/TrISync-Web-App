import type {  Discipline } from "@/generated/prisma"
import { DISCIPLINE_CHIP_STYLES, DISCIPLINE_LABELS } from "@/lib/discipline"

export default function DisciplineChip({ discipline }: { discipline: Discipline }){
    return (
        <span className={`inline-block rounded-full border px-2 py-0.5 text-xs fonr-bold ${DISCIPLINE_CHIP_STYLES[discipline]}`}>
            {DISCIPLINE_LABELS[discipline]}
        </span>
    )
}