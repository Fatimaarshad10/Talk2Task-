'use client'

import { useState, useEffect } from 'react'
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function GoogleCalendarConnect() {
    const [isConnecting, setIsConnecting] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [isChecking, setIsChecking] = useState(true)
    const [tableExists, setTableExists] = useState(true)

    const supabase = createClientComponentClient()
    const { user } = useAuth()

    // Check if integrations table exists
    const checkTableExists = async () => {
        try {
            const { error } = await supabase
                .from('integrations')
                .select('count')
                .limit(1)

            if (error && error.code === '42P01') {
                setTableExists(false)
                console.warn('Integrations table does not exist')
            } else {
                setTableExists(true)
            }
        } catch {
            console.error('Error checking table existence:')
            setTableExists(false)
        }
    }

    // Check if user has Google Calendar connected
    const checkConnection = async () => {
        if (!user) return

        try {
            setIsChecking(true)
            console.log('Checking Google Calendar integration for user:', user.id)

            const { data, error } = await supabase
                .from('integrations')
                .select('*')
                .eq('user_id', user.id)
                .eq('platform', 'google_calendar')
                .eq('is_active', true)
                .single()

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows returned - user has no integrations
                    console.log('No Google Calendar integration found for user')
                    setIsConnected(false)
                } else if (error.code === '42P01') {
                    // Table doesn't exist
                    console.warn('Integrations table does not exist - database setup may be incomplete')
                    setIsConnected(false)
                } else if (error.code === '42501') {
                    // Permission denied
                    console.error('Permission denied accessing integrations table')
                    setIsConnected(false)
                } else {
                    console.error('Error checking integration:', {
                        code: error.code,
                        message: error.message,
                        details: error.details,
                        hint: error.hint
                    })
                    setIsConnected(false)
                }
            } else {
                console.log('Integration found:', data)
                setIsConnected(!!data && data.access_token)
            }
        } catch {
            console.error('Unexpected error checking connection:')
            setIsConnected(false)
        } finally {
            setIsChecking(false)
        }
    }

    // Connect Google Calendar
    const connectGoogleCalendar = async () => {
        if (!user) {
            toast.error('Please sign in to connect Google Calendar')
            return
        }

        try {
            setIsConnecting(true)

            // Generate OAuth URL
            const response = await fetch('/api/integrations/google-calendar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    redirectUri: `${window.location.origin}/auth/callback`
                })
            })

            if (!response.ok) {
                throw new Error('Failed to generate OAuth URL')
            }

            const { authUrl } = await response.json()

            // Open OAuth popup
            const popup = window.open(
                authUrl,
                'google-oauth',
                'width=500,height=600,scrollbars=yes,resizable=yes'
            )

            // Listen for OAuth completion
            const checkClosed = setInterval(() => {
                if (popup?.closed) {
                    clearInterval(checkClosed)
                    checkConnection()
                    setIsConnecting(false)
                }
            }, 1000)

        } catch {
            console.error('Error connecting Google Calendar:')
            toast.error('Failed to connect Google Calendar')
            setIsConnecting(false)
        }
    }

    // Disconnect Google Calendar
    const disconnectGoogleCalendar = async () => {
        if (!user) return

        try {
            const { error } = await supabase
                .from('integrations')
                .update({ is_active: false })
                .eq('user_id', user.id)
                .eq('platform', 'google_calendar')

            if (error) throw error

            setIsConnected(false)
            toast.success('Google Calendar disconnected')
        } catch {
            console.error('Error disconnecting:')
            toast.error('Failed to disconnect Google Calendar')
        }
    }

    // Check connection on mount
    useEffect(() => {
        if (user) {
            checkTableExists()
            checkConnection()
        }
    }, [user])

    if (isChecking) {
        return (
            <div className="flex items-center gap-2 text-sm text-muted">
                <div className="w-4 h-4 border-2 border-muted border-t-accent rounded-full animate-spin"></div>
                Checking connection...
            </div>
        )
    }

    return (
        <div className="bg-surface rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-accent" />
                <h3 className="text-lg font-semibold">Google Calendar Integration</h3>
                {isConnected && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                )}
            </div>

            <p className="text-sm text-muted mb-4">
                Connect your Google Calendar to automatically create events when you create tasks with due dates.
            </p>

            {!tableExists && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-red-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-medium">Database Setup Required</span>
                    </div>
                    <p className="text-xs text-red-700 mt-1">
                        The integrations table does not exist. Please run the database setup script in your Supabase project.
                    </p>
                </div>
            )}

            {isConnected ? (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Connected to Google Calendar
                    </div>
                    <button
                        onClick={disconnectGoogleCalendar}
                        className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        Disconnect
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                        <AlertCircle className="w-4 h-4" />
                        Not connected
                    </div>
                    <button
                        onClick={connectGoogleCalendar}
                        disabled={isConnecting || !tableExists}
                        className="px-4 py-2 text-sm bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isConnecting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Connecting...
                            </>
                        ) : (
                            <>
                                {/* <ExternalLink className="w-4 h-4" /> */}
                                Connect Google Calendar
                            </>
                        )}
                    </button>
                </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">How it works:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Create tasks with natural language like &quot;Meeting tomorrow at 2 PM&quot;</li>
                    <li>• AI automatically detects dates and suggests calendar integration</li>
                    <li>• Tasks with due dates are automatically added to your Google Calendar</li>
                    <li>• Get reminders and notifications through Google Calendar</li>
                </ul>
            </div>

            {!tableExists && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Setup Required:</h4>
                    <ol className="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
                        <li>Go to your Supabase project dashboard</li>
                        <li>Open the SQL Editor</li>
                        <li>Run the <code className="bg-yellow-100 px-1 rounded">database-setup.sql</code> script</li>
                        <li>Refresh this page after setup</li>
                    </ol>
                </div>
            )}
        </div>
    )
}
