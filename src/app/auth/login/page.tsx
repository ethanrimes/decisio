'use client'

import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="bg-white text-gray-800 px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}