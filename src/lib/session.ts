import { redirect } from "next/navigation"
import { auth } from "@/auth"

//return the signed-in user or redirect to login page if not signed in
export async function requireUser(){
    const session = await auth()
    if(!session?.user?.id) redirect("/login")
        return session.user
}