'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

async function fetchGoogleCalendarEvents(accessToken: string) {
  const res = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )
  const data = await res.json()
  console.log('Google Calendar events:', data)
  return data
}

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      setStatus('error')
      return
    }

    const saveIntegration = async (session: any) => {
      // const googleToken = session?.provider_token
      // const refreshToken = session?.provider_refresh_token
      // const expiresAt = session?.expires_at
      //   ? new Date(session.expires_at * 1000).toISOString()
      //   : null

      // if (!googleToken) return

      // // ✅ Save integration in Supabase
      // const { error: insertError } = await supabase.from('integrations').upsert(
      //   {
      //     user_id: session.user.id,
      //     platform: 'google_calendar',
      //     access_token: googleToken,
      //     refresh_token: refreshToken,
      //     expires_at: expiresAt,
      //     is_active: true,
      //     updated_at: new Date().toISOString(),
      //   },
      // )

      // if (insertError) {
      //   console.error('❌ Failed to save Google integration:', insertError)
      // } else {
      //   console.log('✅ Google integration saved for user:', session.user.id)
      // }

      // Optionally fetch events immediately
      // await fetchGoogleCalendarEvents(googleToken)
    }

    // 🔄 Auth state listener
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session) {
          setStatus('success')
          await saveIntegration(session)

          // Redirect after small delay
          setTimeout(() => router.push('/'), 1000)
        }
      }
    )

    // 🔍 Check session immediately
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) {
        setStatus('success')
        await saveIntegration(data.session)

        setTimeout(() => router.push('/'), 1000)
      }
    })

    return () => {
      subscription?.subscription.unsubscribe()
    }
  }, [supabase, searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
            <p>Completing sign in...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-green-600">Logged in successfully! Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-red-600">Authentication failed.</p>
          </>
        )}
      </div>
    </div>
  )
}
