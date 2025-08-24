'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../../contexts/AuthContext'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function AuthCallback() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClientComponentClient()
    const { user } = useAuth()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const code = searchParams.get('code')
                const error = searchParams.get('error')

                if (error) {
                    setStatus('error')
                    setMessage('Authentication failed: ' + error)
                    return
                }

                if (!code) {
                    setStatus('error')
                    setMessage('No authorization code received')
                    return
                }

                if (!user) {
                    setStatus('error')
                    setMessage('User not authenticated')
                    return
                }

                // Exchange code for access token
                const response = await fetch('/api/integrations/google-calendar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, userId: user.id })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Failed to complete authentication')
                }

                const data = await response.json()

                // Store integration in database
                const { error: dbError } = await supabase
                    .from('integrations')
                    .upsert({
                        user_id: user.id,
                        platform: 'google_calendar',
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        expires_at: data.expires_at,
                        is_active: true
                    })

                if (dbError) {
                    throw new Error('Failed to save integration: ' + dbError.message)
                }

                setStatus('success')
                setMessage('Google Calendar connected successfully!')

                // Redirect back to main page after a delay
                setTimeout(() => {
                    router.push('/')
                }, 2000)

            } catch {
                console.error('Callback error:')
                setStatus('error')
                setMessage('Unknown error occurred')
            }
        }

        handleCallback()
    }, [searchParams, user, router, supabase])

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full mx-auto p-8">
                <div className="text-center space-y-6">
                    {status === 'loading' && (
                        <>
                            <Loader2 className="w-16 h-16 text-accent animate-spin mx-auto" />
                            <h1 className="text-2xl font-semibold">Connecting Google Calendar...</h1>
                            <p className="text-muted">Please wait while we complete the setup.</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                            <h1 className="text-2xl font-semibold text-green-700">Success!</h1>
                            <p className="text-green-600">{message}</p>
                            <p className="text-sm text-muted">Redirecting you back...</p>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                            <h1 className="text-2xl font-semibold text-red-700">Connection Failed</h1>
                            <p className="text-red-600">{message}</p>
                            <button
                                onClick={() => router.push('/')}
                                className="mt-4 px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
                            >
                                Go Back
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
