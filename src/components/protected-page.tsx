import { Suspense } from "react";
import type { ReactNode } from "react";
import { requireOnboardedUser } from "@/lib/session";
import { connection } from "next/server";

async function Gate({ children }:{ children: React.ReactNode}) {
  //run this part for every request, never at build time
  await connection()
await requireOnboardedUser()
return <>{children}</>    
}

// Wrap any page that needs a signed-in user who has finished onboarding
export default function ProtectedPage({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading...</p>}>
      <Gate>{children}</Gate>
    </Suspense>
  )
}