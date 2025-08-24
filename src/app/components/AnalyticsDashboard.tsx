'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, Target } from 'lucide-react'

interface TaskStats {
    total: number
    completed: number
    pending: number
    in_progress: number
    cancelled: number
}

interface ProductivityMetrics {
    completionRate: number
    averageCompletionTime: number
    tasksPerDay: number
    priorityDistribution: {
        urgent: number
        high: number
        medium: number
        low: number
    }
}

export default function AnalyticsDashboard() {
    const [taskStats, setTaskStats] = useState<TaskStats>({
        total: 0,
        completed: 0,
        pending: 0,
        in_progress: 0,
        cancelled: 0
    })

    const [productivityMetrics, setProductivityMetrics] = useState<ProductivityMetrics>({
        completionRate: 0,
        averageCompletionTime: 0,
        tasksPerDay: 0,
        priorityDistribution: {
            urgent: 0,
            high: 0,
            medium: 0,
            low: 0
        }
    })

    useEffect(() => {
        // Mock data for demo
        setTaskStats({
            total: 24,
            completed: 18,
            pending: 4,
            in_progress: 2,
            cancelled: 0
        })

        setProductivityMetrics({
            completionRate: 75,
            averageCompletionTime: 2.3,
            tasksPerDay: 3.2,
            priorityDistribution: {
                urgent: 2,
                high: 8,
                medium: 12,
                low: 2
            }
        })
    }, [])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100'
            case 'pending': return 'text-yellow-600 bg-yellow-100'
            case 'in_progress': return 'text-blue-600 bg-blue-100'
            case 'cancelled': return 'text-red-600 bg-red-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-600'
            case 'high': return 'text-orange-600'
            case 'medium': return 'text-yellow-600'
            case 'low': return 'text-green-600'
            default: return 'text-gray-600'
        }
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
                <p className="text-lg text-muted max-w-2xl mx-auto">
                    Track your productivity progress and gain insights into your task management patterns.
                </p>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid md:grid-cols-4 gap-6"
            >
                {[
                    {
                        icon: Target,
                        title: 'Total Tasks',
                        value: taskStats.total,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50'
                    },
                    {
                        icon: CheckCircle,
                        title: 'Completed',
                        value: taskStats.completed,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50'
                    },
                    {
                        icon: TrendingUp,
                        title: 'Completion Rate',
                        value: `${productivityMetrics.completionRate}%`,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50'
                    },
                    {
                        icon: Clock,
                        title: 'Avg. Time (days)',
                        value: productivityMetrics.averageCompletionTime,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50'
                    }
                ].map((metric, index) => {
                    const Icon = metric.icon
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className={`${metric.bgColor} rounded-xl p-6 border border-border`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted mb-1">{metric.title}</p>
                                    <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${metric.color} bg-white`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Task Status Distribution */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-2 gap-6"
            >
                <div className="bg-surface rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-accent" />
                        Task Status Distribution
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(taskStats).filter(([key]) => key !== 'total').map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(status)}`}>
                                        {status.replace('_', ' ')}
                                    </span>
                                    <span className="text-sm text-muted">{count} tasks</span>
                                </div>
                                <div className="text-sm font-medium">
                                    {taskStats.total > 0 ? Math.round((count / taskStats.total) * 100) : 0}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-surface rounded-xl p-6 border border-border">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        Priority Distribution
                    </h3>
                    <div className="space-y-4">
                        {Object.entries(productivityMetrics.priorityDistribution).map(([priority, count]) => (
                            <div key={priority} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(priority)} bg-accent/10`}>
                                        {priority}
                                    </span>
                                    <span className="text-sm text-muted">{count} tasks</span>
                                </div>
                                <div className="text-sm font-medium">
                                    {taskStats.total > 0 ? Math.round((count / taskStats.total) * 100) : 0}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Productivity Trends */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-surface rounded-xl p-6 border border-border"
            >
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    Weekly Productivity Trends
                </h3>

                <div className="grid md:grid-cols-7 gap-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const mockTasks = Math.floor(Math.random() * 5) + 1
                        const mockCompleted = Math.floor(Math.random() * mockTasks) + 1
                        const height = mockTasks > 0 ? (mockCompleted / mockTasks) * 100 : 0

                        return (
                            <div key={day} className="text-center">
                                <div className="text-sm text-muted mb-2">{day}</div>
                                <div className="relative h-24 bg-gray-100 rounded-lg overflow-hidden">
                                    <div
                                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-accent to-accent/70 transition-all duration-300"
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <div className="text-xs text-muted mt-2">
                                    {mockCompleted}/{mockTasks}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Insights */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-surface rounded-xl p-6 border border-border"
            >
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-accent" />
                    AI Insights & Recommendations
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-800 mb-2">🎯 Great Progress!</h4>
                            <p className="text-sm text-green-700">
                                You&apos;re completing 75% of your tasks on time. Keep up the excellent work!
                            </p>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-800 mb-2">📅 Time Management</h4>
                            <p className="text-sm text-blue-700">
                                Consider breaking down larger tasks into smaller, manageable subtasks for better completion rates.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="font-medium text-yellow-800 mb-2">⚡ Priority Balance</h4>
                            <p className="text-sm text-yellow-700">
                                You have 8 high-priority tasks. Consider delegating some to maintain focus on urgent items.
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-800 mb-2">🚀 Optimization Tip</h4>
                            <p className="text-sm text-purple-700">
                                Your average task completion time is 2.3 days. Try time-blocking to improve efficiency.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
