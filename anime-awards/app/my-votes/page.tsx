'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import FingerLoader from '@/components/FingerLoader'
import { Download, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface VoteWithNominee {
  category: string
  nominee_id: string
  title: string
  anime_name: string | null
  image_url: string | null
  votes_public: number
}

export default function MyVotesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [votesByCategory, setVotesByCategory] = useState<Record<string, VoteWithNominee[]>>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserAndVotes()
  }, [])

  async function fetchUserAndVotes() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUser(user)

      const { data: votes, error: voteError } = await supabase
        .from('votes')
        .select(`
          category,
          nominee_id,
          nominees (
            title,
            anime_name,
            image_url,
            votes_public
          )
        `)
        .eq('user_id', user.id)
        .eq('is_jury', false)

      if (voteError) throw voteError

      const grouped: Record<string, VoteWithNominee[]> = {}
      for (const v of votes || []) {
        const nominee = v.nominees as any
        if (!nominee) continue
        const entry: VoteWithNominee = {
          category: v.category,
          nominee_id: v.nominee_id,
          title: nominee.title,
          anime_name: nominee.anime_name,
          image_url: nominee.image_url,
          votes_public: nominee.votes_public,
        }
        if (!grouped[v.category]) grouped[v.category] = []
        grouped[v.category].push(entry)
      }
      setVotesByCategory(grouped)
    } catch (err: any) {
      console.error(err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadAsPDF = () => {
    const style = document.createElement('style')
    style.textContent = `
      @media print {
        body {
          background: white !important;
          color: black !important;
        }
        .no-print {
          display: none !important;
        }
        img {
          max-width: 100% !important;
          page-break-inside: avoid;
        }
        .bg-slate-950, .bg-slate-900, .bg-slate-800 {
          background: white !important;
          color: black !important;
        }
        .text-white, .text-gray-400, .text-gray-300 {
          color: black !important;
        }
        button, .sticky {
          display: none !important;
        }
        a {
          text-decoration: none !important;
          color: black !important;
        }
        .shadow-2xl, .shadow-xl {
          box-shadow: none !important;
        }
      }
    `
    document.head.appendChild(style)
    window.print()
    setTimeout(() => document.head.removeChild(style), 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <FingerLoader />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">My Votes</h1>
        <p className="text-gray-400 mb-6">Please log in to see your votes.</p>
        <Link
          href="/"
          className="bg-white text-slate-950 px-6 py-3 rounded-full font-bold hover:scale-105 transition"
        >
          Go to Homepage
        </Link>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <button
          onClick={() => router.back()}
          className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full"
        >
          Go Back
        </button>
      </div>
    )
  }

  const categoryNames = Object.keys(votesByCategory).sort()

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 no-print">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <button
            onClick={downloadAsPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-sm font-medium transition"
          >
            <Download size={16} />
            Download as PDF
          </button>
        </div>

        <h1 className="text-3xl font-bold mb-2">My Votes</h1>
        <p className="text-gray-400 mb-8">You have voted in {categoryNames.length} categories.</p>

        {categoryNames.length === 0 ? (
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-400">You haven't voted in any categories yet.</p>
            <Link
              href="/"
              className="mt-4 inline-block bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full"
            >
              Start Voting
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {categoryNames.map((category) => (
              <div key={category} className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-400" />
                  {category}
                </h2>
                {votesByCategory[category].map((vote) => (
                  <div key={vote.nominee_id} className="flex items-start gap-4 border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                    {vote.image_url && (
                      <img
                        src={vote.image_url}
                        alt={vote.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{vote.title}</h3>
                      {vote.anime_name && (
                        <p className="text-gray-400 text-sm">{vote.anime_name}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">Total votes: {vote.votes_public}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
        }
