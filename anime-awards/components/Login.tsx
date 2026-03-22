'use client'

import { supabase } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { FaDiscord, FaGoogle } from 'react-icons/fa'
import { HiOutlineShieldCheck } from 'react-icons/hi'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { Vote, LogOut, ChevronDown, User as UserIcon } from 'lucide-react'

interface LoginProps {
  compact?: boolean
  showReassurance?: boolean
  hideWhenLoggedOut?: boolean
}

export default function Login({ 
  compact = false,
  showReassurance = true,
  hideWhenLoggedOut = false
}: LoginProps) {
  const [user, setUser] = useState<User | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => listener?.subscription.unsubscribe()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.user-menu')) setDropdownOpen(false)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  async function signInDiscord() {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.origin }
    })
  }

  async function signInGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        scopes: 'openid profile',
        queryParams: { prompt: 'consent' }
      }
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
    setDropdownOpen(false)
  }

  if (hideWhenLoggedOut && !user) return null

  if (user) {
    return (
      <div className="relative user-menu">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full hover:bg-black/30 transition-colors"
        >
          <img 
            src={user.user_metadata.avatar_url} 
            className="w-8 h-8 rounded-full border-2 border-purple-400" 
            alt="avatar"
          />
          <span className="text-sm text-white hidden sm:inline">
            {user.user_metadata.full_name || user.user_metadata.name}
          </span>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
            <Link
              href="/my-votes"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors"
            >
              <Vote size={16} />
              My Votes
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/10 transition-colors text-left"
            >
              <LogOut size={16} />
              Exit
            </button>
          </div>
        )}
      </div>
    )
  }

  // Not logged in
  if (compact) {
    return (
      <div className="flex gap-1">
        <button onClick={signInDiscord} className="p-2 bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white rounded-lg transition-all" title="Discord">
          <FaDiscord size={20} />
        </button>
        <button onClick={signInGoogle} className="p-2 bg-white/10 hover:bg-white text-gray-400 hover:text-gray-900 rounded-lg transition-all border border-white/20" title="Google (No Email)">
          <FaGoogle size={20} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <button onClick={signInDiscord} className="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white font-medium px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg w-full sm:w-auto">
          <FaDiscord className="text-xl" />
          <span>Continue with Discord</span>
        </button>
        <button onClick={signInGoogle} className="flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 font-medium px-6 py-3 rounded-lg transition-all shadow-md hover:shadow-lg border border-gray-300 w-full sm:w-auto">
          <FaGoogle className="text-xl text-[#4285F4]" />
          <span>Continue with Google</span>
        </button>
      </div>
      {showReassurance && (
        <div className="flex items-center gap-2 text-xs text-gray-300 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
          <HiOutlineShieldCheck className="text-green-400 text-base" />
          <span>Privacy first. Your data is erased instantly after authentication.</span>
        </div>
      )}
    </div>
  )
        }
