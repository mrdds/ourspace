import React, { useEffect, useState } from 'react'
import {
  Video,
  ArrowLeft,
  Plus,
  Calendar,
  Filter,
  Users,
  VideoIcon,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getMeetings, joinMeeting } from '../services/api'

interface Meeting {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  meeting_link?: string
  participants_count: number
  provider?: string
  status: 'upcoming' | 'live' | 'past'
}

export default function MeetingsScreen(): React.JSX.Element {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetingsData = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMeetings()
      setMeetings(data as Meeting[])
    } catch (err) {
      console.error('Failed to fetch meetings', err)
      setError('Impossible de charger les réunions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMeetingsData()
  }, [])

  const handleJoinMeeting = async (meetingId: string): Promise<void> => {
    try {
      const data = await joinMeeting(meetingId)
      const responseData = data as { meeting_link?: string; server_url?: string; token?: string }
      if (responseData.meeting_link) {
        window.open(responseData.meeting_link, '_blank')
      } else if (responseData.server_url && responseData.token) {
        // If it's a LiveKit meeting, we might need a dedicated UI later.
        // For now, we'll log it or alert.
        alert('Redirection vers la réunion LiveKit (Fonctionnalité en cours)')
        console.log('LiveKit Join Info:', responseData)
      }
    } catch (err) {
      console.error('Failed to join meeting', err)
      alert('Erreur lors de la tentative de rejoindre la réunion')
    }
  }

  return (
    <div className="flex-1 h-screen flex flex-col bg-[#F8FAFC]">
      <header className="h-20 px-8 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-4">
          <NavLink
            to="/"
            className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all"
          >
            <ArrowLeft size={18} />
          </NavLink>
          <div>
            <h1 className="text-xl font-extrabold text-[#1E293B]">Réunions</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Planification & Visioconférence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMeetingsData}
            className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button className="px-6 py-2.5 bg-primary rounded-xl font-black text-white text-xs uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform">
            <Plus size={16} /> Nouvelle Réunion
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-white rounded-xl text-xs font-black text-primary border border-primary/10 shadow-sm shadow-primary/5 uppercase tracking-widest">
              À venir
            </button>
            <button className="px-6 py-2 bg-transparent rounded-xl text-xs font-black text-slate-400 border border-transparent hover:bg-white hover:border-slate-100 transition-all uppercase tracking-widest">
              Passées
            </button>
          </div>
          <button className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:border-primary/20 hover:text-primary transition-all shadow-sm">
            <Filter size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <RefreshCw className="animate-spin mb-4" size={48} />
            <p className="font-black uppercase tracking-widest text-sm">
              Chargement des réunions...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-400">
            <AlertCircle className="mb-4" size={48} />
            <p className="font-black uppercase tracking-widest text-sm">{error}</p>
            <button
              onClick={fetchMeetingsData}
              className="mt-4 px-6 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase"
            >
              Réessayer
            </button>
          </div>
        ) : meetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300">
            <Video size={64} className="mb-4 opacity-20" />
            <p className="font-black uppercase tracking-widest text-sm">Aucune réunion prévue</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {meetings.map((meeting) => {
              const startDate = new Date(meeting.start_time)
              const day = startDate.getDate().toString().padStart(2, '0')
              const month = startDate.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase()
              const timeStr = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`

              return (
                <div
                  key={meeting.id}
                  className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden"
                >
                  {meeting.status === 'live' && (
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary shadow-[0_0_10px_rgba(58,123,255,0.5)]"></div>
                  )}

                  <div className="w-20 h-20 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100 shrink-0 group-hover:bg-primary/5 group-hover:border-primary/10 transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                      {month}
                    </span>
                    <span className="text-2xl font-black text-[#1E293B] group-hover:text-primary transition-colors">
                      {day}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-black text-[#1E293B] group-hover:text-primary transition-colors">
                        {meeting.title}
                      </h3>
                      {meeting.status === 'live' && (
                        <span className="px-3 py-0.5 bg-red-100 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1 animate-pulse">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Live
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-primary" /> {timeStr}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-primary" />{' '}
                        {meeting.participants_count || 0} Participants
                      </div>
                      <div className="flex items-center gap-1.5">
                        <VideoIcon size={12} className="text-primary" />{' '}
                        {meeting.provider || 'Visio'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleJoinMeeting(meeting.id)}
                      className="px-6 py-2 bg-primary rounded-xl font-black text-white text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                      Rejoindre
                    </button>
                    <button className="px-6 py-2 bg-slate-50 border border-slate-100 rounded-xl font-black text-slate-400 text-[10px] uppercase tracking-widest hover:bg-white hover:text-primary hover:border-primary/10 transition-all">
                      Détails
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
