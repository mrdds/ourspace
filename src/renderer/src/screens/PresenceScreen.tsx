import React, { useEffect, useState } from 'react'
import { Clock, ArrowLeft, History, RefreshCw, MapPin, AlertCircle, FileText } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getPresenceMe } from '../services/api'
import ExceptionModal from '../components/ExceptionModal'

interface PresenceItem {
  id: number
  date: string
  check_in: string | null
  check_out: string | null
  status: string
  work_site_name?: string
}

export default function PresenceScreen(): React.JSX.Element {
  const [history, setHistory] = useState < PresenceItem[] > ([])
  const [loading, setLoading] = useState(true)
  const [todayPresence, setTodayPresence] = useState < PresenceItem | null > (null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState < string | undefined > (undefined)

  const handleOpenModal = (date?: string): void => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const fetchHistory = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await getPresenceMe()
      const presenceData = data as PresenceItem[]
      setHistory(presenceData)

      const today = new Date().toISOString().split('T')[0]
      const todayData = presenceData.find((item: PresenceItem) => item.date === today)
      setTodayPresence(todayData || null)
    } catch (error) {
      console.error('Failed to fetch presence history', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (timeStr: string | null): string => {
    if (!timeStr) return '--:--'
    return timeStr.substring(0, 5)
  }

  const calculateDuration = (checkIn: string | null, checkOut: string | null): string => {
    if (!checkIn) return '0h 0m'
    const start = new Date(`2000-01-01T${checkIn}`)
    const end = checkOut ? new Date(`2000-01-01T${checkOut}`) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const diffHrs = Math.floor(diffMs / 3600000)
    const diffMins = Math.floor((diffMs % 3600000) / 60000)
    return `${diffHrs}h ${diffMins}m`
  }

  const isClockedIn = todayPresence && todayPresence.check_in && !todayPresence.check_out

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
            <h1 className="text-xl font-extrabold text-[#1E293B]">Ma Présence</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Consultation & Réclamations
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center gap-2"
          >
            <AlertCircle size={14} />
            Réclamation
          </button>
          <button
            onClick={fetchHistory}
            className="p-2 text-slate-400 hover:text-primary transition-all active:rotate-180 duration-500"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Status Info Card */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm mb-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>

              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-inner transition-colors ${isClockedIn ? 'bg-green-50 text-green-500' : 'bg-slate-50 text-slate-400'}`}>
                  <Clock size={32} />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black text-slate-900 mb-1">
                    {isClockedIn ? 'En cours de service' : todayPresence?.check_out ? 'Service terminé' : 'Pas de session active'}
                  </h2>
                  <p className="text-slate-400 font-bold text-sm">
                    {isClockedIn ? (
                      <>Pointez votre départ depuis l&apos;application mobile</>
                    ) : (
                      <>Consultez votre historique et gérez vos réclamations</>
                    )}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Arrivée</p>
                  <p className="font-black text-slate-900">{formatTime(todayPresence?.check_in)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Départ</p>
                  <p className="font-black text-slate-900">{formatTime(todayPresence?.check_out)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Durée</p>
                  <p className="font-black text-primary">{calculateDuration(todayPresence?.check_in, todayPresence?.check_out)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Statut</p>
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
                    <span className="font-black text-xs uppercase tracking-tighter">
                      {isClockedIn ? 'Présent' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* History Table-like List */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-[#1E293B] flex items-center gap-2">
                  <History size={20} className="text-primary" />
                  Historique de Présence
                </h3>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-300 gap-4">
                    <RefreshCw size={40} className="animate-spin" />
                    <p className="font-bold uppercase tracking-widest text-xs">Chargement...</p>
                  </div>
                ) : history.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 font-medium">
                    Aucun historique trouvé
                  </div>
                ) : (
                  history.slice(0, 10).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 hover:bg-white transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex flex-col items-center justify-center">
                          <span className="text-xs font-black text-slate-900">{new Date(item.date).getDate()}</span>
                          <span className="text-[8px] font-black text-primary uppercase">
                            {new Date(item.date).toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-sm font-black text-slate-900">{item.work_site_name || 'Site Standard'}</p>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${item.status === 'PRESENT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                            <div className="flex items-center gap-1">
                              <MapPin size={10} /> {item.work_site_name || 'Bureau'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={10} /> {formatTime(item.check_in)} - {formatTime(item.check_out)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="hidden group-hover:block transition-all animate-in fade-in slide-in-from-right-2">
                          <p className="text-[10px] font-black text-primary">{calculateDuration(item.check_in, item.check_out)}</p>
                        </div>
                        <button
                          onClick={() => handleOpenModal(item.date)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 transition-all"
                          title="Signaler une anomalie"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#1E293B] p-8 rounded-[32px] text-white overflow-hidden relative shadow-2xl shadow-slate-200">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              <h4 className="text-sm font-black uppercase tracking-widest text-primary mb-6">Résumé Mensuel</h4>
              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter mb-1">Total Heures</p>
                  <p className="text-3xl font-black">
                    {history.reduce((acc, item) => {
                      if (!item.check_in || !item.check_out) return acc
                      const start = new Date(`2000-01-01T${item.check_in}`)
                      const end = new Date(`2000-01-01T${item.check_out}`)
                      return acc + (end.getTime() - start.getTime()) / 3600000
                    }, 0).toFixed(1)} h
                  </p>
                </div>
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-3/4 shadow-[0_0_10px_rgba(58,123,255,0.5)]"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter mb-1">Taux Présence</p>
                    <p className="text-lg font-black text-green-400">
                      {history.length > 0 ? ((history.filter(i => i.status === 'PRESENT').length / history.length) * 100).toFixed(0) : 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-tighter mb-1">Retards</p>
                    <p className="text-lg font-black text-orange-400">02</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Horloge Système</p>
              <p className="text-2xl font-black text-[#1E293B]">
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            </div>

            <div className="bg-orange-50/50 border border-orange-100 p-6 rounded-[28px]">
              <div className="flex gap-3">
                <AlertCircle className="text-orange-500 shrink-0" size={18} />
                <div>
                  <p className="text-xs font-black text-orange-900 uppercase mb-1">Information</p>
                  <p className="text-[10px] font-bold text-orange-700 leading-relaxed">
                    Le pointage s&apos;effectue exclusivement via l&apos;application mobile Klock. OurSpace Desktop est réservé à la consultation et à la gestion des exceptions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ExceptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchHistory}
        initialDate={selectedDate}
      />
    </div>
  )
}
