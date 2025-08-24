'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, FileText, Trello, MessageSquare, CheckCircle, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

interface Integration {
    id: string
    platform: 'google_calendar' | 'notion' | 'trello' | 'slack'
    is_active: boolean
    connected_at?: string
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
    const [integrations, setIntegrations] = useState<Integration[]>([])
    const [isConnecting, setIsConnecting] = useState<string | null>(null)

    useEffect(() => {
        // Mock integrations data
        setIntegrations([
            {
                id: '1',
                platform: 'google_calendar',
                is_active: true,
                connected_at: '2024-01-10T09:00:00Z'
            }
        ])
    }, [])

    const connectPlatform = async (platform: string) => {
        setIsConnecting(platform)

        try {
            // Simulate OAuth flow
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Mock successful connection
            const newIntegration: Integration = {
                id: Date.now().toString(),
                platform: platform as Integration['platform'],
                is_active: true,
                connected_at: new Date().toISOString()
            }

            setIntegrations(prev => [...prev, newIntegration])
            toast.success(`${platforms.find(p => p.key === platform)?.name} connected successfully!`)

        } catch {
            toast.error(`Failed to connect ${platform}`)
        } finally {
            setIsConnecting(null)
        }
    }

    const disconnectPlatform = async (platform: string) => {
        try {
            setIntegrations(prev => prev.filter(i => i.platform !== platform))
            toast.success(`${platforms.find(p => p.key === platform)?.name} disconnected`)
        } catch {
            toast.error(`Failed to disconnect ${platform}`)
        }
    }

    const isConnected = (platform: string) => {
        return integrations.some(i => i.platform === platform && i.is_active)
    }

    const getIntegration = (platform: string) => {
        return integrations.find(i => i.platform === platform)
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
                            className={`bg-surface rounded-xl p-6 border-2 transition-all duration-200 ${connected
                                    ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20'
                                    : 'border-border hover:border-accent/50'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-gradient-to-r ${platform.color} text-white`}>
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
                                    Connected since {new Date(integration.connected_at).toLocaleDateString()}
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

            {/* Integration Status */}
            {integrations.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-surface rounded-xl p-6 border border-border"
                >
                    <h3 className="text-xl font-semibold mb-4">Integration Status</h3>
                    <div className="space-y-3">
                        {integrations.map((integration) => {
                            const platform = platforms.find(p => p.key === integration.platform)
                            return (
                                <div key={integration.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-gradient-to-r ${platform?.color} text-white`}>
                                            {platform && <platform.icon className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <div className="font-medium">{platform?.name}</div>
                                            <div className="text-sm text-muted">
                                                Connected {integration.connected_at && new Date(integration.connected_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-green-600">Active</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* Help Text */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center text-muted"
            >
                <p className="text-sm">
                    Need help setting up integrations? Check our{' '}
                    <a href="#" className="text-accent hover:underline">documentation</a> or{' '}
                    <a href="#" className="text-accent hover:underline">contact support</a>.
                </p>
            </motion.div>
        </div>
    )
}
