import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/app/lib/supabaseServer'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)

    try {
        const code = requestUrl.searchParams.get('code')
        const next = requestUrl.searchParams.get('next') || '/'

        if (code) {
            const supabase = await createServerSupabaseClient()

            // Exchange the code for a session
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('Error exchanging code for session:', error)
                // Redirect to auth page with error
                return NextResponse.redirect(`${requestUrl.origin}/auth?error=auth_failed`)
            }

            if (data.session) {
                console.log('Session created successfully')
                // Redirect to the intended page or home
                return NextResponse.redirect(`${requestUrl.origin}${next}`)
            }
        }

        // If no code or session creation failed, redirect to auth
        return NextResponse.redirect(`${requestUrl.origin}/auth`)
    } catch {
        console.error('Callback error:')
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=callback_failed`)
    }
}
