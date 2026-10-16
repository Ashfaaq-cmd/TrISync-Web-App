"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export type LoginState = { error?: string } | undefined

export async function loginUser( 
    _previousState: LoginState,
    formData: FormData
): Promise<LoginState> {
    try {
        await signIn("credentials", {
            email: formData.get("email") ,
            password: formData.get("password"),
            redirectTo : "/welcome",
        })
    }
    catch (error) {
        //Auth.js throws authError when email or password is invalid
        if (error instanceof AuthError) {
            return { error: "Invalid email or password" }
        }
        throw error
    }
}