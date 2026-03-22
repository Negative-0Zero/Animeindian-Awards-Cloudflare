'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import FingerLoader from '@/components/FingerLoader'
import { Download, ArrowLeft, CheckCircle, Trophy } from 'lucide-react'
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
        .bg-slate-950, .bg-slate-900, .bg-slate-800, .bg-slate-700 {
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
        .shadow-2xl, .shadow-xl, .shadow-lg {
          box-shadow: none !important;
        }
        .border-white, .border-white\\/10 {
          border-color: #ccc !important;
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
        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
          My Votes
        </h1>
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-12 no-print">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <button
            onClick={downloadAsPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full text-sm font-medium transition shadow-lg"
          >
            <Download size={16} />
            Download as PDF
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
            My Votes
          </h1>
          <p className="text-gray-400">You have voted in {categoryNames.length} categories</p>
        </div>

        {categoryNames.length === 0 ? (
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-sm">
            <p className="text-gray-400 mb-6 text-lg">You haven't voted in any categories yet.</p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg"
            >
              Start Voting
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {categoryNames.map((category) => {
              const votes = votesByCategory[category]
              return (
                <section key={category}>
                  <div className="flex items-center gap-3 mb-6">
                    <Trophy className="text-yellow-400" size={28} />
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                      {category}
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {votes.map((vote) => (
                      <div
                        key={vote.nominee_id}
                        className="group bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-yellow-500/50 hover:shadow-2xl transition-all duration-300"
                      >
                        <div className="aspect-video overflow-hidden bg-slate-800">
                          {vote.image_url ? (
                            <img
                              src={vote.image_url}
                              alt={vote.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-1 line-clamp-2">{vote.title}</h3>
                          {vote.anime_name && (
                            <p className="text-gray-400 text-sm mb-2 line-clamp-1">{vote.anime_name}</p>
                          )}
                          <div className="flex items-center mt-2">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <CheckCircle size={12} className="text-green-400" />
                              Your pick
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
  }
