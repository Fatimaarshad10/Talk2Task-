'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { motion } from 'framer-motion'
import { Settings, Bell, Shield, Palette, Database } from 'lucide-react'
import ProtectedRoute from '@/app/components/ProtectedRoute'

export default function SettingsPage() {
    const { user } = useAuth()

    if (!user) return null

    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto py-8 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    {/* Header */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Settings</h1>
                        <p className="text-muted mt-2">Customize your Talk2Task experience</p>
                    </div>

                    {/* Settings Sections */}
                    <div className="space-y-6">
                        {/* Account Settings */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-surface rounded-2xl p-6 border border-border"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Settings className="w-6 h-6 text-accent" />
                                <h2 className="text-xl font-semibold">Account Settings</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div>
                                        <p className="font-medium">Email Address</p>
                                        <p className="text-sm text-muted">{user.email}</p>
                                    </div>
                                    <button className="text-accent hover:underline text-sm">Change</button>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div>
                                        <p className="font-medium">Full Name</p>
                                        <p className="text-sm text-muted">
                                            {user.user_metadata?.full_name || 'Not set'}
                                        </p>
                                    </div>
                                    <button className="text-accent hover:underline text-sm">Edit</button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Notifications */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-surface rounded-2xl p-6 border border-border"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Bell className="w-6 h-6 text-accent" />
                                <h2 className="text-xl font-semibold">Notifications</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div>
                                        <p className="font-medium">Email Notifications</p>
                                        <p className="text-sm text-muted">Receive updates about your tasks</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div>
                                        <p className="font-medium">Push Notifications</p>
                                        <p className="text-sm text-muted">Get notified about important updates</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                    </label>
                                </div>
                            </div>
                        </motion.div>

                        {/* Security */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-surface rounded-2xl p-6 border border-border"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Shield className="w-6 h-6 text-accent" />
                                <h2 className="text-xl font-semibold">Security</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div>
                                        <p className="font-medium">Change Password</p>
                                        <p className="text-sm text-muted">Update your account password</p>
                                    </div>
                                    <button className="text-accent hover:underline text-sm">Change</button>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div>
                                        <p className="font-medium">Two-Factor Authentication</p>
                                        <p className="text-sm text-muted">Add an extra layer of security</p>
                                    </div>
                                    <button className="text-accent hover:underline text-sm">Enable</button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Appearance */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-surface rounded-2xl p-6 border border-border"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Palette className="w-6 h-6 text-accent" />
                                <h2 className="text-xl font-semibold">Appearance</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div>
                                        <p className="font-medium">Theme</p>
                                        <p className="text-sm text-muted">Choose your preferred theme</p>
                                    </div>
                                    <select className="px-3 py-1 border border-border rounded-lg bg-background text-sm">
                                        <option value="system">System</option>
                                        <option value="light">Light</option>
                                        <option value="dark">Dark</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div>
                                        <p className="font-medium">Language</p>
                                        <p className="text-sm text-muted">Select your preferred language</p>
                                    </div>
                                    <select className="px-3 py-1 border border-border rounded-lg bg-background text-sm">
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                        <option value="fr">French</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>

                        {/* Data & Privacy */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-surface rounded-2xl p-6 border border-border"
                        >
                            <div className="flex items-center space-x-3 mb-4">
                                <Database className="w-6 h-6 text-accent" />
                                <h2 className="text-xl font-semibold">Data & Privacy</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div>
                                        <p className="font-medium">Export Data</p>
                                        <p className="text-sm text-muted">Download your personal data</p>
                                    </div>
                                    <button className="text-accent hover:underline text-sm">Export</button>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                                    <div>
                                        <p className="font-medium">Delete Account</p>
                                        <p className="text-sm text-muted">Permanently delete your account</p>
                                    </div>
                                    <button className="text-red-600 hover:underline text-sm">Delete</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </ProtectedRoute>
    )
}
