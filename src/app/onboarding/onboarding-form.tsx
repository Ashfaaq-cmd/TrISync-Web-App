"use client"

import { useActionState, useState } from "react"
import { saveOnboarding } from "./actions"

const LEVELS = [
    { value: "BEGINNER", label: "Beginner", description:"New to triathlon, or under 1 year of training" },
    { value: "INTERMEDIATE", label: "Intermediate", description:"1-3 years, at least one race completed" },
    { value: "ADVANCED", label: "Advanced", description:"3+ years, competitive racing experience" } 
]
const GOALS = [
    { value: "SPRINT", label: "Sprint" },
    { value: "OLYMPIC", label: "Olympic" },
    { value: "HALF_IRONMAN", label: "Half Ironman" },
    { value: "IRONMAN", label: "Ironman" },
    { value: "GENERAL_FITNESS", label: "General Fitness" }
]
const DAYS = [2,3,4,5,6,7]
const MINUTES = [30,45,60,90,120]

type OptionCardProps ={
    name: string
    value: string
    label: string
    description?: string
    checked: boolean
    onChange: (value:string) => void
}

function OptionCard({name,value,label,description,checked, onChange}: OptionCardProps){
    return(
        <label className="flex flex-col rounded-lg border border-border p-4 has-checked:border-primary has-checked:bg-primary-soft has-[:focus-visible]: ring-2 has-focus-visible:ring-primary">
            <input
            type="radio" name={name} value={value} checked={checked}
            onChange={()=>onChange(value)}
            className="sr-only" />
            <span className="font-semibold text-foreground">{label}</span>{description &&(
                <span className="mt-1 text-sm text-muted">{description}</span>
            )}
        </label>
    )
}

export default function OnboardingForm(){
    const [state,formAction, pending] = useActionState(saveOnboarding,undefined)
    const [step,setStep] = useState(1)
    const [level,setLevel] = useState("")
    const [raceGoal,setRaceGoal] = useState("")
    const [days,setDays] = useState("")
    const [minutes,setMinutes] = useState("")

    //Next button stays disabled until current step has an answer
    const canContinue = step ===1? level!=="" : step ===2? raceGoal !== "" : days !== "" && minutes !== ""

    return(
        <form action={formAction}>
            <p className="text-xs font-bold uppercase text-link">Step {step} of 3</p>

            {/* All steps stays in the form.. every answer is submitted, only 1 is visible */}
            <div className={step === 1 ? "mt-2 space-y-3" : "hidden"}>
                <h1 className="text-2xl font-bold text-foreground">What is your experience level?</h1>
                <p className="text-sm text-muted">This shapes how your training plan is built</p>
                {LEVELS.map((option)=>(
                    <OptionCard
                    key={option.value}
                    name="experienceLevel"
                    checked={level === option.value}
                    onChange={setLevel}
                    {...option}
                    />
                ))}
            </div>
            <div className={step === 2 ? "mt-2 space-y-3" : "hidden"}>
                <h1 className="text-2xl font-bold text-foreground">What are you training for?</h1>
                <p className="text-sm text-muted">Pick the race distance you are aiming at</p>
                <div className="grid grid-cols-2 gap-3">
                {GOALS.map((option)=>(
                    <OptionCard
                    key={option.value}
                    name="raceGoal"
                    checked={raceGoal === option.value}
                    onChange={setRaceGoal}
                    {...option}
                    />
                ))}
                </div>

            <div>
            <label htmlFor="targetRaceDate" className="block text-sm font-medium text-muted">
                Race Date (optional)
                <input 
                id="targetRaceDate"
                name="targetRaceDate"
                type="date"
                className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-foreground"/>
            </label>
            </div>
            </div>
        
            <div className={step === 3 ? "mt-2 space-y-3" : "hidden"}>
                <h1 className="text-2xl font-bold text-foreground">How much time can you train?</h1>
                <p className="text-sm text-muted">Days per week</p>
                <div className="grid grid-cols-6 gap-2">
                {DAYS.map((day)=>(
                    <OptionCard
                    key={day}
                    name="daysPerWeek"
                    value={String(day)}
                    label={String(day)}
                    checked={days === String(day)}
                    onChange={setDays}
                    />
                ))}
            </div>
                <p className="text-sm text-muted">Minutes per session</p>
                <div className="grid grid-cols-5 gap-2">
                {MINUTES.map((minute)=>(
                    <OptionCard
                    key={minute}
                    name="minutesPerSession"
                    value={String(minute)}
                    label={String(minute)}
                    checked={minutes === String(minute)}
                    onChange={setMinutes}
                    />
                ))}
                </div>
                </div>
                {state?.error && (
                    <p role="alert" className="mt-4 text-sm text-danger">{state.error}</p>
                )}
                <div className="mt-6 flex gap-3">
                    {step > 1 && (
                        <button type="button"
                        onClick={()=> setStep(step-1)}
                        className="rounded-lg border border-border px-4 py-2 font-semibold text-muted">
                            Back
                        </button>
                    )}
                     {step < 3 ? (
                        <button type="button"
                        disabled={!canContinue}
                        onClick={()=> setStep(step+1)}
                        className="flex rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60">
                            Next
                        </button>
                    ): (
                        <button type="submit"
                        disabled={!canContinue || pending}
                        className="flex-1 rounded-lg bg-primary py-2 font-semibold text-primary-foreground disabled:opacity-60">{pending? "Saving..." : "Finish"}</button>
                    )}
                </div>
        </form>
            
            )
}