'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { motion } from 'framer-motion'
import { User, Mail, Calendar, Shield } from 'lucide-react'
import ProtectedRoute from '@/app/components/ProtectedRoute'

export default function ProfilePage() {
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
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface rounded-2xl p-8 border border-border shadow-lg"
          >
            <div className="flex items-center space-x-6 mb-8">
              <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata?.full_name || user.email}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <User className="w-10 h-10 text-accent-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold">
                  {user.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-muted">{user.email}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted">Full Name</p>
                    <p className="font-medium">
                      {user.user_metadata?.full_name || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted">Member Since</p>
                    <p className="font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted">Account Status</p>
                    <p className="font-medium text-green-600">Active</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted">User ID:</span>
                    <span className="font-mono text-sm">{user.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Last Sign In:</span>
                    <span className="text-sm">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Email Confirmed:</span>
                    <span className={user.email_confirmed_at ? 'text-green-600' : 'text-red-600'}>
                      {user.email_confirmed_at ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6"
          >
            <div className="bg-surface rounded-xl p-6 border border-border hover:border-accent/50 transition-colors">
              <h3 className="font-semibold mb-2">Account Settings</h3>
              <p className="text-sm text-muted mb-4">Update your profile information and preferences</p>
              <button className="text-accent hover:underline text-sm">Manage Settings →</button>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-border hover:border-accent/50 transition-colors">
              <h3 className="font-semibold mb-2">Security</h3>
              <p className="text-sm text-muted mb-4">Change password and manage security settings</p>
              <button className="text-accent hover:underline text-sm">Security Settings →</button>
            </div>

            <div className="bg-surface rounded-xl p-6 border border-border hover:border-accent/50 transition-colors">
              <h3 className="font-semibold mb-2">Data & Privacy</h3>
              <p className="text-sm text-muted mb-4">Manage your data and privacy preferences</p>
              <button className="text-accent hover:underline text-sm">Privacy Settings →</button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  )
}
