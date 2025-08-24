'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Send, Loader2, Calendar, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '../contexts/AuthContext'
import GoogleCalendarConnect from './GoogleCalendarConnect'

const inputSchema = z.object({
    text: z.string().min(1, 'Please enter a task description')
})

type InputForm = z.infer<typeof inputSchema>

interface Task {
    id: string
    title: string
    description: string | null
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    due_date: string | null
    source: 'voice' | 'text' | 'ai_generated'
    created_at: string
    external_id?: string
    external_platform?: string
}

export default function Talk2TaskInterface() {
    const [isListening, setIsListening] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [tasks, setTasks] = useState<Task[]>([])
    const [showTasks, setShowTasks] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    const supabase = createClientComponentClient()
    const { user } = useAuth()

    // Debug environment variables and Supabase connection
    useEffect(() => {
        console.log('=== ENVIRONMENT DEBUG ===')
        console.log('NODE_ENV:', process.env.NODE_ENV)
        console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')
        console.log('Supabase client:', supabase)
        console.log('User:', user)
        console.log('=== END ENVIRONMENT DEBUG ===')

        // Test Supabase connection
        if (user) {
            testSupabaseConnection()
        }
    }, [supabase, user])

    // Test Supabase connection
    const testSupabaseConnection = async () => {
        try {
            console.log('Testing Supabase connection...')

            // Test basic connection by checking auth
            const { data: { session }, error: authError } = await supabase.auth.getSession()
            if (authError) {
                console.error('Auth connection error:', authError)
            } else {
                console.log('Auth connection successful, session:', session ? 'exists' : 'none')
            }

            // Test database connection by checking if we can query
            const { error: testError } = await supabase
                .from('tasks')
                .select('count')
                .limit(1)

            if (testError) {
                console.error('Database connection error:', testError)
            } else {
                console.log('Database connection successful')
            }

        } catch {
            console.error('Connection test error:')
        }
    }

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<InputForm>({
        resolver: zodResolver(inputSchema)
    })

    // Fetch tasks from database
    const fetchTasks = async () => {
        if (!user) {
            console.log("No user found, skipping task fetch")
            return
        }

        try {
            setIsLoading(true)
            console.log("Fetching tasks for user:", user.id)

            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Supabase error:", error)
                throw error
            }

            if (!data || data.length === 0) {
                console.log("No tasks found for user:", user.id)
                // 👇 don’t set tasks or show error, just return
                return
            }

            console.log("Tasks fetched successfully:", data.length, "tasks")
            setTasks(data)
        } catch {
            console.error("Error fetching tasks:")
            toast.error("Failed to fetch tasks")
        } finally {
            setIsLoading(false)
        }
    }


    // Load tasks on component mount
    useEffect(() => {
        if (user) {
            fetchTasks()
        }
    }, [user])

    const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
                await processVoiceInput(audioBlob)
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorder.start()
            setIsListening(true)
            toast.success('Listening... Speak now!')
        } catch {
            toast.error('Microphone access denied')
            console.error('Error accessing microphone:')
        }
    }

    const stopListening = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop()
            setIsListening(false)
        }
    }

    const processVoiceInput = async (audioBlob: Blob) => {
        setIsProcessing(true)

        try {
            // Convert audio blob to base64 for API processing
            const arrayBuffer = await audioBlob.arrayBuffer()
            // const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

            // For now, we'll use a simple approach - in production, you'd integrate with:
            // - Web Speech API (free, browser-based)
            // - OpenAI Whisper API (paid, high quality)
            // - Google Speech-to-Text API (paid, high quality)

            // Using Web Speech API as a free alternative
            if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
                const recognition = new SpeechRecognition()

                recognition.continuous = false
                recognition.interimResults = false
                recognition.lang = 'en-US'

                recognition.onresult = async (event) => {
                    const transcript = event.results[0][0].transcript
                    console.log('Voice transcript:', transcript)
                    await processTextInput(transcript)
                }

                recognition.onerror = (event) => {
                    console.error('Speech recognition error:', event.error)
                    toast.error('Voice recognition failed. Please try typing instead.')
                    setIsProcessing(false)
                }

                recognition.onend = () => {
                    setIsProcessing(false)
                }

                recognition.start()
            } else {
                // Fallback for browsers without speech recognition
                toast('Voice recognition not supported in this browser. Please type your task.')
                setIsProcessing(false)
            }
        } catch {
            console.error('Voice processing error:')
            toast.error('Voice processing failed. Please try typing instead.')
            setIsProcessing(false)
        }
    }

    const processTextInput = async (text: string) => {
        if (!user) {
            toast.error('Please sign in to create tasks')
            return
        }

        setIsProcessing(true)

        try {
            console.log('=== DEBUG: Starting task creation ===')
            console.log('Processing text input:', text)
            console.log('User ID:', user.id)
            console.log('User object:', user)
            console.log('Supabase client:', supabase)

            // Test Supabase connection first
            console.log('Testing Supabase connection...')
            const { error: testError } = await supabase
                .from('tasks')
                .select('count')
                .limit(1)

            if (testError) {
                console.error('❌ Supabase connection test failed:', testError)
                throw new Error(`Database connection failed: ${testError.message}`)
            } else {
                console.log('✅ Supabase connection test successful')
            }

            // Process with AI to extract task details
            console.log('Calling AI API...')
            const aiResponse = await fetch('/api/ai/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, userId: user.id })
            })

            if (!aiResponse.ok) {
                const errorText = await aiResponse.text()
                console.error('❌ AI API error:', aiResponse.status, errorText)
                throw new Error(`AI processing failed: ${aiResponse.status}`)
            }

            const aiData = await aiResponse.json()
            console.log('✅ AI response:', aiData)
            const taskData = aiData.task

            // Create task in database
            console.log('Creating task in Supabase...')
            console.log('Task data to insert:', {
                user_id: user.id,
                title: taskData.title,
                description: taskData.description,
                status: 'pending',
                priority: taskData.priority,
                due_date: taskData.due_date,
                source: 'ai_generated',
                ai_context: JSON.stringify(taskData)
            })

            const { data: newTask, error: taskError } = await supabase
                .from('tasks')
                .insert({
                    user_id: user.id,
                    title: taskData.title,
                    description: taskData.description,
                    status: 'pending',
                    priority: taskData.priority,
                    due_date: taskData.due_date,
                    source: 'ai_generated',
                    ai_context: JSON.stringify(taskData)
                })
                .select()
                .single()

            if (taskError) {
                console.error('❌ Supabase task creation error:', taskError)
                console.error('Error details:', {
                    code: taskError.code,
                    message: taskError.message,
                    details: taskError.details,
                    hint: taskError.hint
                })
                throw taskError
            }

            console.log('✅ Task created successfully:', newTask)
            console.log('=== DEBUG: Task creation completed ===')

            // Show AI response to user
            if (taskData.ai_response) {
                toast.success(taskData.ai_response)
            } else {
                toast.success('Task created successfully!')
            }

            // If Google Calendar integration is suggested and due_date exists, create calendar event
            if (taskData.integrations?.includes('google_calendar') && taskData.due_date) {
                try {
                    console.log('Attempting Google Calendar integration...')
                    // Get user's Google Calendar access token
                    const { data: integration, error: integrationError } = await supabase
                        .from('integrations')
                        .select('access_token')
                        .eq('user_id', user.id)
                        .eq('platform', 'google_calendar')
                        .eq('is_active', true)
                        .single()

                    if (integrationError) {
                        console.error('Integration fetch error:', integrationError)
                        toast('Task created! Connect Google Calendar for automatic scheduling')
                        return
                    }

                    if (integration?.access_token) {
                        const calendarResponse = await fetch('/api/integrations/google-calendar', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                task: {
                                    id: newTask.id,
                                    title: taskData.title,
                                    description: taskData.description,
                                    due_date: taskData.due_date,
                                    priority: taskData.priority
                                },
                                accessToken: integration.access_token
                            })
                        })

                        if (calendarResponse.ok) {
                            const calendarData = await calendarResponse.json()

                            // Update task with calendar event ID
                            await supabase
                                .from('tasks')
                                .update({
                                    external_id: calendarData.event.id,
                                    external_platform: 'google_calendar'
                                })
                                .eq('id', newTask.id)

                            toast.success('✅ Task created and added to Google Calendar!')
                        } else {
                            const errorData = await calendarResponse.json()
                            console.error('Calendar API error:', errorData)
                            toast('Task created! (Calendar integration failed)')
                        }
                    } else {
                        toast('Task created! Connect Google Calendar for automatic scheduling')
                        return
                    }
                } catch (calendarError) {
                    console.error('Calendar integration error:', calendarError)
                                            toast('Task created! (Calendar integration failed)')
                }
            }

            // Refresh tasks list
            await fetchTasks()
            reset()
        } catch {
            console.error('Error processing input:')
            console.error('Full error details:', {
                message: 'Unknown error',
                stack: undefined,
                user: user?.id,
                text: text
            })
            toast.error('Failed to create task')
        } finally {
            setIsProcessing(false)
        }
    }

    const onSubmit = async (data: InputForm) => {
        await processTextInput(data.text)
    }

    const deleteTask = async (taskId: string) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .delete()
                .eq('id', taskId)

            if (error) throw error

            toast.success('Task deleted successfully!')
            await fetchTasks()
        } catch {
            console.error('Error deleting task:')
            toast.error('Failed to delete task')
        }
    }

    const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', taskId)

            if (error) throw error

            toast.success('Task updated successfully!')
            await fetchTasks()
        } catch {
            console.error('Error updating task:')
            toast.error('Failed to update task')
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'text-red-500'
            case 'high': return 'text-orange-500'
            case 'medium': return 'text-yellow-500'
            case 'low': return 'text-green-500'
            default: return 'text-gray-500'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />
            case 'cancelled': return <AlertCircle className="w-4 h-4 text-red-500" />
            default: return <Clock className="w-4 h-4 text-gray-500" />
        }
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">Please sign in to use Talk2Task</h2>
                <p className="text-muted">You need to be authenticated to create and manage tasks.</p>
            </div>
        )
    }

    // Environment check for debugging
    const isDevelopment = process.env.NODE_ENV === 'development'
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
            >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                    Talk2Task
                </h1>
                <p className="text-lg text-muted max-w-2xl mx-auto">
                    Transform your voice and text into actionable tasks with AI-powered intelligence.
                    Simply speak or type, and let AI handle the rest.
                </p>

                {/* Debug Info (Development Only) */}
                {isDevelopment && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                        <h3 className="font-semibold mb-2">🔧 Debug Information</h3>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Supabase URL: {hasSupabaseUrl ? '✅ Set' : '❌ Missing'}</div>
                            <div>Supabase Key: {hasSupabaseKey ? '✅ Set' : '❌ Missing'}</div>
                            <div>User ID: {user?.id ? `✅ ${user.id.substring(0, 8)}...` : '❌ None'}</div>
                            <div>User Email: {user?.email || '❌ None'}</div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Input Interface */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface rounded-2xl p-8 shadow-lg border border-border"
            >
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    {/* Voice Input */}
                    <button
                        onClick={isListening ? stopListening : startListening}
                        disabled={isProcessing}
                        className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-200 ${isListening
                            ? 'bg-red-500 text-white shadow-lg scale-105'
                            : 'bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isListening ? (
                            <>
                                <MicOff className="w-5 h-5" />
                                Stop Recording
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5" />
                                Voice Input
                            </>
                        )}
                    </button>

                    {/* Text Input */}
                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex gap-2">
                        <input
                            {...register('text')}
                            placeholder="Type your task here..."
                            className="flex-1 px-4 py-4 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            disabled={isProcessing}
                        />
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="px-6 py-4 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </form>
                </div>

                {errors.text && (
                    <p className="text-red-500 text-sm mt-2">{errors.text.message}</p>
                )}

                {/* Processing Indicator */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-center gap-3 py-4 text-muted"
                        >
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>AI is processing your request...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Tasks Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-surface rounded-2xl p-8 shadow-lg border border-border"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold">Your Tasks</h2>
                    <div className="flex items-center gap-3">
                        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
                        <button
                            onClick={() => setShowTasks(!showTasks)}
                            className="text-accent hover:text-accent/80 transition-colors"
                        >
                            {showTasks ? 'Hide' : 'Show'} Tasks
                        </button>
                        <button
                            onClick={testSupabaseConnection}
                            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            title="Test Supabase connection"
                        >
                            Test Connection
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showTasks && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            {tasks.length === 0 ? (
                                <p className="text-center text-muted py-8">
                                    {isLoading ? 'Loading tasks...' : 'No tasks yet. Create your first task above!'}
                                </p>
                            ) : (
                                tasks.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-background rounded-xl p-4 border border-border hover:border-accent/50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {getStatusIcon(task.status)}
                                                    <h3 className="font-medium">{task.title}</h3>
                                                    <span className={`text-xs px-2 py-1 rounded-full bg-accent/10 text-accent ${getPriorityColor(task.priority)}`}>
                                                        {task.priority}
                                                    </span>
                                                    {task.external_platform && (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                            {task.external_platform === 'google_calendar' ? '📅 Calendar' : task.external_platform}
                                                        </span>
                                                    )}
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-muted mb-2">{task.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-muted">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                                                    </span>
                                                    <span className="capitalize">{task.source}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                                                    className="text-xs px-2 py-1 rounded border border-border bg-background"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="text-red-500 hover:text-red-700 transition-colors"
                                                    title="Delete task"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Google Calendar Integration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <GoogleCalendarConnect />
            </motion.div>

            {/* Features Preview */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid md:grid-cols-3 gap-6"
            >
                {[
                    {
                        icon: <Mic className="w-8 h-8" />,
                        title: 'Voice Input',
                        description: 'Speak naturally and let AI convert your words into structured tasks'
                    },
                    {
                        icon: <Calendar className="w-8 h-8" />,
                        title: 'Smart Scheduling',
                        description: 'AI automatically suggests optimal times and creates calendar events'
                    },
                    {
                        icon: <CheckCircle className="w-8 h-8" />,
                        title: 'Multi-Platform Sync',
                        description: 'Seamlessly integrate with Google Calendar, Notion, Trello, and Slack'
                    }
                ].map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="bg-surface rounded-xl p-6 text-center border border-border hover:border-accent/50 transition-colors"
                    >
                        <div className="text-accent mb-4 flex justify-center">{feature.icon}</div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted">{feature.description}</p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}
