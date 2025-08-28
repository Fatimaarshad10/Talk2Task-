'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import ThemeToggle from '@/app/components/theme/ThemeToggle'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Settings, ChevronDown, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation' // make sure this is imported




export default function Navbar() {
  const { user, signOut, loading } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter(); // inside your component

  // Helper function to get user initials from name or email
  const getUserInitials = (nameOrEmail: string) => {
    if (!nameOrEmail) return 'U'

    // If it's an email, use the first letter
    if (nameOrEmail.includes('@')) {
      return nameOrEmail.charAt(0).toUpperCase()
    }

    // If it's a name, split by spaces and get first letters
    const nameParts = nameOrEmail.trim().split(' ')
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase()
    }

    // Get first letter of first and last name
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase()
  }

  const handleSignOut = async () => {
    try {
      await signOut() // Supabase sign out
      setShowUserMenu(false)
      router.push('/auth') // Redirect to /auth page
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              Talk2Task
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-foreground hover:text-accent transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-muted hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-muted hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Authentication */}
            {loading ? (
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background transition-colors"
                >
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center overflow-hidden">
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.user_metadata?.full_name || user.email}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-accent-foreground">
                        {getUserInitials(user.user_metadata?.full_name || user.email)}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted" />
                </button>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b border-border">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center overflow-hidden">
                            {user.user_metadata?.avatar_url ? (
                              <img
                                src={user.user_metadata.avatar_url}
                                alt={user.user_metadata?.full_name || user.email}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-base font-semibold text-accent-foreground">
                                {getUserInitials(user.user_metadata?.full_name || user.email)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{user.user_metadata?.full_name || 'User'}</p>
                            <p className="text-xs text-muted">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-background transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>

                      <Link
                        href="/settings"
                        className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-background transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
