"use server"

import { revalidatePath } from "next/cache"
import { requireOnboardedUser } from "@/lib/session"
import { buildSamplePlan } from "@/lib/sample-plan"
import { saveTrainingPlan } from "@/lib/training-plan"
import { trainingPlanSchema } from "@/lib/validations/training-plan"

// remove once AI plan generation exists
export async function createSamplePlan() {
    if(process.env.NODE_ENV === "production"){
        throw new Error("The sample plan is not available in production")
    }
    const { user } = await requireOnboardedUser()
    //sample goes through same validation ai output will use
    const plan = trainingPlanSchema.parse(buildSamplePlan())
    await saveTrainingPlan(user.id,plan)

    revalidatePath("/training-plan")
}