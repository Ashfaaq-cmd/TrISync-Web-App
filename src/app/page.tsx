import { Suspense } from "react"
import { redirect } from "next/navigation"
import { connection } from "next/server"

export default function Home() {
  return (
    <Suspense fallback={null}>
      <RedirectToDashboard />
    </Suspense>
  )
}

async function RedirectToDashboard(): Promise<never> {
  await connection()
  redirect("/dashboard")
}