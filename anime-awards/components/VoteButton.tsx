'use client'

import { supabase } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'

interface VoteButtonProps {
    nomineeId: string
    category: string
    className?: string
    children?: React.ReactNode
    onVoteSuccess?: () => void
    isHero?: boolean
}

export default function VoteButton({
    nomineeId,
    category,
    className = "",
    children,
    onVoteSuccess,
    isHero = false
}: VoteButtonProps) {
    const [user, setUser] = useState<User | null>(null)
    const [voted, setVoted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [pendingVote, setPendingVote] = useState(false)

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }, [])

    useEffect(() => {
        if (pendingVote && user) {
            setPendingVote(false)
            const categoriesSection = document.getElementById('categories-section')
            if (categoriesSection) {
                categoriesSection.scrollIntoView({ behavior: 'smooth' })
                categoriesSection.classList.add('ring-4', 'ring-yellow-400', 'rounded-lg')
                setTimeout(() => categoriesSection.classList.remove('ring-4', 'ring-yellow-400'), 2000)
            }
        }
    }, [user, pendingVote])

    // Check if user already voted in this category (public vote)
    useEffect(() => {
        if (!user || isHero) return
        const currentUser = user
        async function checkVote() {
            const { data } = await supabase
                .from('votes')
                .select('id')
                .eq('user_id', currentUser.id)
                .eq('category', category)
                .eq('is_jury', false)
                .maybeSingle()
            setVoted(!!data)
        }
        checkVote()
    }, [user, category, isHero])

    async function handleVote() {
        if (isHero) {
            if (!user) {
                setPendingVote(true)
                const loginSection = document.getElementById('login-section')
                if (loginSection) {
                    loginSection.scrollIntoView({ behavior: 'smooth' })
                    loginSection.classList.add('ring-4', 'ring-yellow-400', 'rounded-lg')
                    setTimeout(() => loginSection.classList.remove('ring-4', 'ring-yellow-400'), 2000)
                }
                alert(' Please log in first – you\'ll be taken to the categories after login.')
                return
            } else {
                const categoriesSection = document.getElementById('categories-section')
                if (categoriesSection) {
                    categoriesSection.scrollIntoView({ behavior: 'smooth' })
                    categoriesSection.classList.add('ring-4', 'ring-yellow-400', 'rounded-lg')
                    setTimeout(() => categoriesSection.classList.remove('ring-4', 'ring-yellow-400'), 2000)
                }
                return
            }
        }

        if (!user) {
            setPendingVote(true)
            const loginSection = document.getElementById('login-section')
            if (loginSection) {
                loginSection.scrollIntoView({ behavior: 'smooth' })
                loginSection.classList.add('ring-4', 'ring-yellow-400', 'rounded-lg')
                setTimeout(() => loginSection.classList.remove('ring-4', 'ring-yellow-400'), 2000)
            }
            alert(' Please log in first – you\'ll be taken back to vote after login.')
            return
        }

        setLoading(true)

        // Call the upsert RPC
        const { data, error } = await supabase.rpc('upsert_vote', {
            p_category: category,
            p_nominee_id: nomineeId,
            p_is_jury: false
        })

        if (error) {
            alert('Error: ' + error.message)
            setLoading(false)
            return
        }

        if (data && data.success) {
            if (!data.changed) {
                alert(' You already voted for this nominee.')
            } else {
                alert(' Your vote has been updated!')
            }
            setVoted(true) // Always mark as voted (or keep true)
            onVoteSuccess?.()
        } else {
            alert('Something went wrong. Please try again.')
        }

        setLoading(false)
    }

    return (
        <button
            onClick={handleVote}
            disabled={loading}
            className={`bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-4 py-2 rounded-full text-sm transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {loading ? 'Submitting...' : (voted ? 'Change Vote' : (children || '🗳️ Vote'))}
        </button>
    )
}
