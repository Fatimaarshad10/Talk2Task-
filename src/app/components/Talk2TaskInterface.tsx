"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mic,
    MicOff,
    Send,
    Loader2,
    Calendar,
    CheckCircle,
    Clock,
    AlertCircle,
    Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "../contexts/AuthContext";

const inputSchema = z.object({
    text: z.string().min(1, "Please enter a task description"),
});

type InputForm = z.infer<typeof inputSchema>;

interface Task {
    id: string;
    title: string;
    description: string | null;
    status: "pending" | "in_progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high" | "urgent";
    due_date: string | null;
    source: "voice" | "text" | "ai_generated";
    created_at: string;
    external_id?: string;
    external_platform?: string;
}

export default function Talk2TaskInterface() {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [showTasks, setShowTasks] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const supabase = createClientComponentClient();
    const { user, session } = useAuth();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<InputForm>({
        resolver: zodResolver(inputSchema),
    });

    // Fetch tasks from database
    const fetchTasks = async () => {
        if (!user) {
            console.log("No user found, skipping task fetch");
            return;
        }

        try {
            setIsLoading(true);
            console.log("Fetching tasks for user:", user.id);

            const { data, error } = await supabase
                .from("tasks")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Supabase error:", error);
                throw error;
            }

            if (!data || data.length === 0) {
                console.log("No tasks found for user:", user.id);
                // 👇 don’t set tasks or show error, just return
                return;
            }

            console.log("Tasks fetched successfully:", data.length, "tasks");
            setTasks(data);
        } catch {
            console.error("Error fetching tasks:");
            toast.error("Failed to fetch tasks");
        } finally {
            setIsLoading(false);
        }
    };

    // Load tasks on component mount
    useEffect(() => {
        if (user) {
            fetchTasks()
        }
    }, [user]); const startListening = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/wav",
                });
                await processVoiceInput(audioBlob);
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
            toast.success("Listening... Speak now!");
        } catch {
            toast.error("Microphone access denied");
            console.error("Error accessing microphone:");
        }
    };

    const stopListening = () => {
        if (mediaRecorderRef.current && isListening) {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const processVoiceInput = async (audioBlob: Blob) => {
        setIsProcessing(true);

        try {
            const arrayBuffer = await audioBlob.arrayBuffer();

            if (
                "webkitSpeechRecognition" in window ||
                "SpeechRecognition" in window
            ) {
                const SpeechRecognition =
                    window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();

                recognition.continuous = false;
                recognition.interimResults = false;
                recognition.lang = "en-US";

                recognition.onresult = async (event) => {
                    const transcript = event.results[0][0].transcript;
                    console.log("Voice transcript:", transcript);
                    await processAndSaveTask(transcript, 'voice');
                };

                recognition.onerror = (event) => {
                    console.error("Speech recognition error:", event.error);
                    toast.error("Voice recognition failed. Please try typing instead.");
                    setIsProcessing(false);
                };

                recognition.onend = () => {
                    setIsProcessing(false);
                };

                recognition.start();
            } else {
                // Fallback for browsers without speech recognition
                toast(
                    "Voice recognition not supported in this browser. Please type your task."
                );
                setIsProcessing(false);
            }
        } catch {
            console.error("Voice processing error:");
            toast.error("Voice processing failed. Please try typing instead.");
            setIsProcessing(false);
        }
    };

    const processAndSaveTask = async (text: string, source: 'voice' | 'text') => {
        if (!user) {
            toast.error('You must be logged in to create a task.');
            return;
        }
        setIsProcessing(true)
        const toastId = toast.loading('AI is processing your task...')

        try {
            const response = await fetch('/api/ai/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.details || 'AI processing failed')
            }

            const { task: aiTask } = await response.json()

            // Create a new object for insertion with only the valid columns
            const taskToInsert = {
                title: aiTask.title,
                description: aiTask.description,
                priority: aiTask.priority,
                due_date: aiTask.due_date,
                status: 'pending', // Set a default status
                user_id: user.id,
                source,
            };

            // Save to Supabase
            const { data: savedTask, error: dbError } = await supabase
                .from('tasks')
                .insert(taskToInsert)
                .select()
                .single()

            if (dbError) throw dbError

            setTasks(prev => [savedTask, ...prev])
            toast.success('Task created!', { id: toastId })

            // Google Calendar Integration
            if (aiTask.integrations.includes('google_calendar')) {
                await createGoogleCalendarEvent(savedTask)
            }
        } catch (error: any) {
            console.error('Error processing task:', error)
            toast.error(`Error: ${error.message}`, { id: toastId })
        } finally {
            setIsProcessing(false)
        }
    }

    const createGoogleCalendarEvent = async (task: Task) => {
        if (!session || !session.provider_token) {
            toast.error('Please connect your Google account in Settings to create calendar events.')
            return
        }

        try {
            const response = await fetch('/api/google/create-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task, session }),
            })

            if (!response.ok) throw new Error('Failed to create Google Calendar event')

            const { event } = await response.json()
            toast.success(
                <span>
                    Event created in Google Calendar!{' '}
                    <a href={event.htmlLink} target="_blank" rel="noopener noreferrer" className="underline">
                        View Event
                    </a>
                </span>
            )
        } catch (error) {
            console.error('Error creating calendar event:', error)
            toast.error('Could not create Google Calendar event.')
        }
    }

    const onFormSubmit = handleSubmit(async (data: InputForm) => {
        await processAndSaveTask(data.text, 'text');
        reset();
    });

    const deleteTask = async (taskId: string, externalId?: string) => {
        try {
            // If there's a Google Calendar event, delete it first
            if (externalId) {
                await deleteGoogleCalendarEvent(externalId);
            }

            const { error } = await supabase.from("tasks").delete().eq("id", taskId);

            if (error) throw error;

            toast.success("Task deleted successfully!");
            setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId)); // Update state locally
        } catch (error: any) {
            console.error("Error deleting task:", error);
            toast.error(`Failed to delete task: ${error.message}`);
        }
    };

    const updateTaskStatus = async (
        taskId: string,
        newStatus: Task["status"],
        externalId?: string
    ) => {
        try {
            // If there's a Google Calendar event, update it
            if (externalId) {
                await updateGoogleCalendarEvent(externalId, newStatus);
            }

            const { data, error } = await supabase
                .from("tasks")
                .update({ status: newStatus })
                .eq("id", taskId)
                .select()
                .single();

            if (error) throw error;

            toast.success("Task updated successfully!");
            setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? data : t)); // Update state locally
        } catch (error: any) {
            console.error("Error updating task:", error);
            toast.error(`Failed to update task: ${error.message}`);
        }
    };

    const updateGoogleCalendarEvent = async (eventId: string, status: Task["status"]) => {
        if (!session || !session.provider_token) return;

        try {
            await fetch('/api/google/update-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, status, session }),
            });
        } catch (error) {
            console.error("Could not update Google Calendar event:", error);
            // We don't show a toast here to avoid spamming the user
        }
    };

    const deleteGoogleCalendarEvent = async (eventId: string) => {
        if (!session || !session.provider_token) return;

        try {
            await fetch('/api/google/delete-event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, session }),
            });
        } catch (error) {
            console.error("Could not delete Google Calendar event:", error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "text-red-500";
            case "high":
                return "text-orange-500";
            case "medium":
                return "text-yellow-500";
            case "low":
                return "text-green-500";
            default:
                return "text-gray-500";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case "in_progress":
                return <Clock className="w-4 h-4 text-blue-500" />;
            case "cancelled":
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto text-center py-12">
                <h2 className="text-2xl font-semibold mb-4">
                    Please sign in to use Talk2Task
                </h2>
                <p className="text-muted">
                    You need to be authenticated to create and manage tasks.
                </p>
            </div>
        );
    }

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
                    Transform your voice and text into actionable tasks with AI-powered
                    intelligence. Simply speak or type, and let AI handle the rest.
                </p>
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
                            ? "bg-red-500 text-white shadow-lg scale-105"
                            : "bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105"
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
                    <form onSubmit={onFormSubmit} className="flex-1 flex gap-2">
                        <input
                            {...register("text")}
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
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-center gap-3 py-4 text-muted"
                        >
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>AI is processing your request...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* User Guidance */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-sm text-muted"
            >
                <p>Try saying: "Schedule a team meeting for tomorrow at 3pm" or "Add a task to buy milk"</p>
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
                            {showTasks ? "Hide" : "Show"} Tasks
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showTasks && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                        >
                            {tasks.length === 0 ? (
                                <p className="text-center text-muted py-8">
                                    {isLoading
                                        ? "Loading tasks..."
                                        : "No tasks yet. Create your first task above!"}
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
                                                    <span
                                                        className={`text-xs px-2 py-1 rounded-full bg-accent/10 text-accent ${getPriorityColor(
                                                            task.priority
                                                        )}`}
                                                    >
                                                        {task.priority}
                                                    </span>
                                                    {task.external_platform && (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                            {task.external_platform === "google_calendar"
                                                                ? "📅 Calendar"
                                                                : task.external_platform}
                                                        </span>
                                                    )}
                                                </div>
                                                {task.description && (
                                                    <p className="text-sm text-muted mb-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-muted">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {task.due_date
                                                            ? new Date(task.due_date).toLocaleDateString()
                                                            : "No due date"}
                                                    </span>
                                                    <span className="capitalize">{task.source}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={task.status}
                                                    onChange={(e) =>
                                                        updateTaskStatus(
                                                            task.id,
                                                            e.target.value as Task["status"],
                                                            task.external_id
                                                        )
                                                    }
                                                    className="text-xs px-2 py-1 rounded border border-border bg-background"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={() => deleteTask(task.id, task.external_id)}
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
                        title: "Voice Input",
                        description:
                            "Speak naturally and let AI convert your words into structured tasks",
                    },
                    {
                        icon: <Calendar className="w-8 h-8" />,
                        title: "Smart Scheduling",
                        description:
                            "AI automatically suggests optimal times and creates calendar events",
                    },
                    {
                        icon: <CheckCircle className="w-8 h-8" />,
                        title: "Multi-Platform Sync",
                        description:
                            "Seamlessly integrate with Google Calendar, Notion, Trello, and Slack",
                    },
                ].map((feature, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="bg-surface rounded-xl p-6 text-center border border-border hover:border-accent/50 transition-colors"
                    >
                        <div className="text-accent mb-4 flex justify-center">
                            {feature.icon}
                        </div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted">{feature.description}</p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
