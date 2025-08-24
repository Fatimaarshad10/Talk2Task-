"use client"

import { Suspense } from "react"
import AuthPage from "@/app/components/AuthPage"

export default function AuthRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <p className="text-lg">Loading...</p>
        </div>
      }
    >
      <AuthPage />
    </Suspense>
  )
}
