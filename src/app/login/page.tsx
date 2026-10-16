import LoginForm from "./login-form";
import Image from "next/image";

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">
                <h1 className="text-2xl font-bold text-black">Welcome Back</h1>
                <p className="mb-6 mt-1 text-sm text-gray-700">
                    Your next milestone starts here
                </p>
                <LoginForm />
            </div>
        </main>
    )
}