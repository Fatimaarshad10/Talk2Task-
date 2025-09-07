'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, FileText, Trello, MessageSquare, CheckCircle, Settings } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../contexts/AuthContext'

interface Integration {
  id: string
  platform: 'google_calendar' | 'notion' | 'trello' | 'slack'
  is_active: boolean
  connected_at?: string
  workspace_name?: string
}

const platforms = [
  {
    key: 'google_calendar',
    name: 'Google Calendar',
    icon: Calendar,
    description: 'Create calendar events from your tasks',
    color: 'from-blue-500 to-blue-600'
  },
  {
    key: 'notion',
    name: 'Notion',
    icon: FileText,
    description: 'Sync tasks to your Notion workspace',
    color: 'from-gray-800 to-gray-900'
  },
  {
    key: 'trello',
    name: 'Trello',
    icon: Trello,
    description: 'Create Trello cards for your tasks',
    color: 'from-blue-400 to-blue-500'
  },
  {
    key: 'slack',
    name: 'Slack',
    icon: MessageSquare,
    description: 'Send task notifications to Slack',
    color: 'from-purple-500 to-purple-600'
  }
]

export default function IntegrationsManager() {
  const supabase = createClientComponentClient()
  const { user } = useAuth()

  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  // ✅ Fetch integrations from DB
  useEffect(() => {
    const fetchIntegrations = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('integrations')
        .select('id, platform, is_active, created_at')
        .eq('user_id', user.id)

      if (error) {
        console.error(error)
        return
      }

      if (data) {
        setIntegrations(
          data.map((i) => ({
            id: i.id,
            platform: i.platform,
            is_active: i.is_active,
            connected_at: i.created_at
          }))
        )
      }
    }

    fetchIntegrations()
  }, [supabase, user])

  // ✅ Check for Notion OAuth success/error on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    const error = urlParams.get('error')

    if (success === 'notion_connected') {
      toast.success('Notion connected successfully!')
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (error) {
      if (error === 'notion_oauth_failed') {
        toast.error('Failed to connect to Notion')
      } else if (error === 'notion_config_missing') {
        toast.error('Notion integration not configured. Please check your environment variables.')
      } else if (error === 'notion_token_exchange_failed') {
        toast.error('Failed to get Notion access token')
      }
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // ✅ Connect platform (Google Calendar or Notion)
  const connectPlatform = async (platform: string) => {
    if (platform !== 'google_calendar' && platform !== 'notion') {
      toast.error('Only Google Calendar and Notion are implemented')
      return
    }

    setIsConnecting(platform)

    try {
      if (platform === 'google_calendar') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
              scope:
                'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email'
            }
          }
        })

        if (error) {
          toast.error('Failed to connect Google Calendar')
          console.error(error)
        }
      } else if (platform === 'notion') {
        // Redirect to Notion OAuth flow
        window.location.href = '/api/notion/auth'
        return // Don't set isConnecting to null since we're redirecting
      }
      // ⬆️ Supabase will redirect → after callback we insert into DB
    } finally {
      setIsConnecting(null)
    }
  }

  // ✅ Disconnect by deleting from Supabase integrations or clearing cookies
  const disconnectPlatform = async (platform: string) => {
    try {
      if (platform === 'notion') {
        // For Notion, clear the cookies
        document.cookie = 'notion_access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie = 'notion_workspace_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        toast.success('Notion disconnected successfully')
        return
      }

      // For other platforms, delete from database
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('user_id', user?.id)
        .eq('platform', platform)

      if (error) {
        toast.error(`Failed to disconnect ${platform}`)
        console.error(error)
      } else {
        setIntegrations((prev) => prev.filter((i) => i.platform !== platform))
        toast.success(`${platforms.find((p) => p.key === platform)?.name} disconnected`)
      }
    } catch (err) {
      console.error(err)
      toast.error(`Failed to disconnect ${platform}`)
    }
  }

  const isConnected = (platform: string) => {
    // For Notion, also check for access token cookie
    if (platform === 'notion') {
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };

      const notionToken = getCookie('notion_access_token');
      return !!notionToken || integrations.some((i) => i.platform === platform && i.is_active)
    }

    // For other platforms, only check database
    return integrations.some((i) => i.platform === platform && i.is_active)
  }

  const getIntegration = (platform: string) => {
    const dbIntegration = integrations.find((i) => i.platform === platform)

    // For Notion, if we have a token but no DB entry, create a virtual integration
    if (platform === 'notion' && !dbIntegration && document.cookie.includes('notion_access_token')) {
      // Try to get workspace name from cookie
      const workspaceName = document.cookie
        .split('; ')
        .find(row => row.startsWith('notion_workspace_name='))
        ?.split('=')[1]

      return {
        id: 'notion-virtual',
        platform: 'notion',
        is_active: true,
        connected_at: new Date().toISOString(), // Use current time as fallback
        workspace_name: workspaceName
      }
    }

    return dbIntegration
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl font-bold">Integrations</h2>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          Connect your favorite productivity tools to automatically sync tasks and stay organized across platforms.
        </p>
      </motion.div>

      {/* Platforms Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {platforms.map((platform, index) => {
          const Icon = platform.icon
          const connected = isConnected(platform.key)
          const integration = getIntegration(platform.key)

          return (
            <motion.div
              key={platform.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-surface rounded-xl p-6 border-2 transition-all duration-200 ${
                connected
                  ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
                  : 'border-border hover:border-accent/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-r ${platform.color} text-white`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                {connected && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Connected</span>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-semibold mb-2">{platform.name}</h3>
              <p className="text-muted mb-4">{platform.description}</p>

              {connected && integration?.connected_at && (
                <div className="text-sm text-muted mb-4">
                  Connected since{' '}
                  {new Date(integration.connected_at).toLocaleDateString()}
                  {integration.workspace_name && (
                    <div className="text-xs mt-1">
                      Workspace: {decodeURIComponent(integration.workspace_name)}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                {connected ? (
                  <>
                    <button
                      onClick={() => disconnectPlatform(platform.key)}
                      className="flex-1 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Disconnect
                    </button>
                    <button className="px-4 py-2 text-accent border border-accent rounded-lg hover:bg-accent/10 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => connectPlatform(platform.key)}
                    disabled={isConnecting === platform.key}
                    className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isConnecting === platform.key ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Connecting...
                      </div>
                    ) : (
                      'Connect'
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
