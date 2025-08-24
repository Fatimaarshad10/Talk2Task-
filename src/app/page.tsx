'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, BarChart3, Settings } from 'lucide-react'
import Talk2TaskInterface from './components/Talk2TaskInterface'
import IntegrationsManager from './components/IntegrationsManager'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import ProtectedRoute from './components/ProtectedRoute'

type TabType = 'home' | 'integrations' | 'analytics'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('home')

  const tabs = [
    {
      id: 'home' as TabType,
      name: 'Talk2Task',
      icon: Mic,
      description: 'AI-powered task creation'
    },
    {
      id: 'integrations' as TabType,
      name: 'Integrations',
      icon: Settings,
      description: 'Connect your tools'
    },
    {
      id: 'analytics' as TabType,
      name: 'Analytics',
      icon: BarChart3,
      description: 'Track productivity'
    }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Talk2TaskInterface />
      case 'integrations':
        return <IntegrationsManager />
      case 'analytics':
        return <AnalyticsDashboard />
      default:
        return <Talk2TaskInterface />
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Navigation Tabs */}
        <div className="sticky top-0 z-10 bg-surface/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-6xl mx-auto px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-4 border-b-2 transition-all duration-200 ${isActive
                      ? 'border-accent text-accent'
                      : 'border-transparent text-muted hover:text-foreground hover:border-border'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">{tab.name}</div>
                      <div className="text-xs">{tab.description}</div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Quick Actions Floating Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring" }}
          className="fixed bottom-6 right-6 z-20"
        >
          <button
            onClick={() => setActiveTab('home')}
            className="p-4 bg-accent text-accent-foreground rounded-full shadow-lg hover:bg-accent/90 transition-all duration-200 hover:scale-110"
            title="Quick Task Creation"
          >
            <Mic className="w-6 h-6" />
          </button>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
