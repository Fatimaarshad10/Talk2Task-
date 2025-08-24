"use client"

import { Suspense } from "react"
import AuthCallback from "@/app/auth/callback/auth"

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-lg">Loading...</p>
        </div>
      }
    >
      <AuthCallback />
    </Suspense>
  )
}
