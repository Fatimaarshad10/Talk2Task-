'use client'

import { useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            fallback || (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-accent" />
                        <p className="text-muted">Loading...</p>
                    </div>
                </div>
            )
        )
    }

    if (!user) {
        return null // Will redirect to auth page
    }

    return <>{children}</>
}
