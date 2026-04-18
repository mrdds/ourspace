import { useEffect, useState } from 'react'
import { getInformations, getMeetings } from '../services/api'
import { motion } from 'framer-motion'
import {
    Clock,
    CalendarCheck,
    MessageSquare,
    Video,
    User,
    FileText,
    CheckSquare,
    ChevronRight,
    Search,
    ArrowRight,
    Calendar,
    LayoutDashboard,
    MessageCircle,
    Bell
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

interface Information {
    id: number
    title: string
    content: string
    color: string
    created_at: string
    created_by_name?: string
}

const QUICK_ACTIONS = [
    {
        id: 'presence',
        label: 'Présence',
        icon: <Clock size={20} />,
        color: '#FF8A00',
        bg: 'bg-orange-100/50',
        path: '/presence'
    },
    {
        id: 'meeting',
        label: 'Réunion',
        icon: <Video size={20} />,
        color: '#E64545',
        bg: 'bg-red-100/50',
        path: '/meetings'
    },
    {
        id: 'chat',
        label: 'Chat',
        icon: <MessageSquare size={20} />,
        color: '#7B61FF',
        bg: 'bg-purple-100/50',
        path: '/chat'
    },
    {
        id: 'approval',
        label: 'Approbation',
        icon: <CheckSquare size={20} />,
        color: '#3A7BFF',
        bg: 'bg-blue-100/50',
        path: '/approvals'
    },
    {
        id: 'payslip',
        label: 'Fiche paie',
        icon: <FileText size={20} />,
        color: '#1DBF73',
        bg: 'bg-green-100/50',
        path: '/payslips'
    },
    {
        id: 'leave',
        label: 'Gestion congé',
        icon: <CalendarCheck size={20} />,
        color: '#3A7BFF',
        bg: 'bg-blue-100/50',
        path: '/absences'
    },
    {
        id: 'account',
        label: 'Mon Compte',
        icon: <User size={20} />,
        color: '#FF8A00',
        bg: 'bg-orange-100/50',
        path: '/profile'
    }
]

interface DashboardMeeting {
    id?: string | number
    title?: string
    start_time?: string
    end_time?: string
    participants_count?: number
    meeting_link?: string
    provider?: string
    status: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}

export default function DashboardScreen(): React.JSX.Element {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const [informations, setInformations] = useState < Information[] > ([])
    const [meetings, setMeetings] = useState < DashboardMeeting[] > ([])
    const [loadingInfos, setLoadingInfos] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)

        // Fetch News
        getInformations()
            .then((data) => setInformations((data as Information[]) || []))
            .catch((err) => console.error('Failed to fetch infos', err))
            .finally(() => setLoadingInfos(false))

        // Fetch Meetings for the calendar widget
        getMeetings()
            .then((data) => setMeetings((data as DashboardMeeting[]) || []))
            .catch((err) => console.error('Failed to fetch dashboard meetings', err))

        return () => clearInterval(timer)
    }, [])

    const firstName = user?.first_name || 'Utilisateur'
    const today = currentTime.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })

    // Find the current live meeting or the next one
    const liveMeeting = meetings.find((m) => m.status === 'live')
    const upcomingMeetings = meetings.filter((m) => m.status === 'upcoming').slice(0, 3)

    return (
        <div className="flex-1 h-screen flex flex-col bg-[#F8FAFC] overflow-hidden">
            {/* Horizontal Header */}
            <header className="h-20 px-8 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <LayoutDashboard size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-[#1E293B]">Tableau de Bord</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{today}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors"
                            size={18}
                        />
                        <input
                            type="text"
                            placeholder="Rechercher sur OurSpace..."
                            className="bg-slate-50 border border-transparent focus:bg-white focus:border-primary/20 pl-10 pr-4 py-2.5 rounded-2xl w-72 outline-none transition-all text-sm font-medium"
                        />
                    </div>
                    <button className="w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                        <div className="text-right">
                            <p className="text-sm font-black text-[#1E293B] leading-none mb-1">{firstName}</p>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
                                {user?.role || 'Collaborateur'}
                            </p>
                        </div>
                        <div className="w-11 h-11 bg-slate-100 rounded-2xl border-2 border-white shadow-sm flex items-center justify-center text-primary font-black">
                            {firstName[0]}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    {/* Welcome Hero */}
                    <div className="mb-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative overflow-hidden rounded-[32px] bg-[#1E293B] p-10 text-white shadow-2xl shadow-slate-200"
                        >
                            <div className="absolute top-0 right-0 w-1/2 h-full">
                                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-primary/30 to-transparent opacity-50"></div>
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
                            </div>

                            <div className="relative z-10 max-w-xl">
                                <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10">
                                    OurSpace Ecosystem
                                </span>
                                <h2 className="text-4xl font-black mb-4 leading-tight">
                                    Bienvenue, <span className="text-primary italic">{firstName}</span> !
                                </h2>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed mb-8">
                                    Restez connecté avec votre équipe et gérez toutes vos activités professionnelles
                                    depuis une interface centrale et intelligente.
                                </p>
                                <div className="flex gap-4">
                                    <button className="px-8 py-3 bg-primary rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-xl shadow-primary/20">
                                        Voir mes tâches
                                    </button>
                                    <button className="px-8 py-3 bg-white/10 backdrop-blur-md rounded-2xl font-black text-sm hover:bg-white/20 transition-all border border-white/10">
                                        Calendrier
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Access Refined */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-extrabold text-[#1E293B] flex items-center gap-2">
                                <LayoutDashboard size={20} className="text-primary" />
                                Accès Rapide
                            </h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {QUICK_ACTIONS.map((action, index) => (
                                <motion.button
                                    key={action.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ y: -5 }}
                                    onClick={() => navigate(action.path)}
                                    className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col items-center justify-center transition-all hover:shadow-xl hover:shadow-slate-200 hover:border-primary/10 group"
                                >
                                    <div
                                        className={`w-14 h-14 ${action.bg} rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm`}
                                        style={{ color: action.color }}
                                    >
                                        {action.icon}
                                    </div>
                                    <span className="text-[11px] font-black text-[#475569] uppercase tracking-wide group-hover:text-primary transition-colors">
                                        {action.label}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </section>

                    {/* Actualités Section */}
                    <section className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-extrabold text-[#1E293B] flex items-center gap-2">
                                <FileText size={20} className="text-primary" />
                                Actualités Récentes
                            </h2>
                            <button className="text-[11px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:gap-2 transition-all">
                                Voir tout <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loadingInfos ? (
                                [1, 2].map((i) => (
                                    <div key={i} className="h-48 bg-slate-100 rounded-[32px] animate-pulse"></div>
                                ))
                            ) : informations.length === 0 ? (
                                <div className="col-span-2 bg-white rounded-[32px] border border-dashed border-slate-200 p-12 text-center">
                                    <FileText className="text-slate-200 mx-auto mb-4" size={48} />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest">
                                        Aucune information pour le moment
                                    </p>
                                </div>
                            ) : (
                                informations.slice(0, 2).map((info, index) => (
                                    <motion.div
                                        key={info.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <span
                                                className="px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
                                                style={{ backgroundColor: info.color }}
                                            >
                                                News
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(info.created_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-[#1E293B] mb-3 group-hover:text-primary transition-colors leading-tight">
                                            {info.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                                            {info.content}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar Widgets */}
                <aside className="w-96 bg-white border-l border-slate-100 p-8 overflow-y-auto hidden xl:block shrink-0">
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-[#1E293B]">Mon Calendrier</h3>
                            <button className="text-slate-400 hover:text-primary transition-colors">
                                <Calendar size={20} />
                            </button>
                        </div>

                        {liveMeeting ? (
                            <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-[28px] text-white shadow-xl shadow-primary/20 mb-4">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Video size={22} color="white" />
                                    </div>
                                    <span className="bg-red-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse">
                                        Live
                                    </span>
                                </div>
                                <h4 className="text-sm font-black mb-1">{liveMeeting.title}</h4>
                                <p className="text-white/70 text-[10px] font-bold mb-6 italic">
                                    {liveMeeting.participants_count || 0} participants • En cours
                                </p>
                                <button
                                    onClick={() => (window.location.hash = '/meetings')}
                                    className="w-full bg-white text-primary font-black py-3 rounded-2xl hover:bg-slate-50 transition-colors text-xs uppercase tracking-widest shadow-lg"
                                >
                                    Rejoindre
                                </button>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 mb-4 text-center">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Aucune réunion en direct
                                </p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {upcomingMeetings.length > 0 ? (
                                upcomingMeetings.map((mt) => {
                                    const time = mt.start_time
                                        ? new Date(mt.start_time).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })
                                        : ''
                                    return (
                                        <div
                                            key={mt.id}
                                            className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-transparent hover:border-slate-100 transition-all group cursor-pointer"
                                            onClick={() => (window.location.hash = '/meetings')}
                                        >
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:shadow-sm transition-all font-black text-[10px] uppercase tracking-tighter">
                                                {time}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h5 className="text-[11px] font-black text-[#1E293B] truncate">
                                                    {mt.title}
                                                </h5>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    Réunion prévue
                                                </p>
                                            </div>
                                            <ChevronRight
                                                size={14}
                                                className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all"
                                            />
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-center py-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">
                                    Chargement du planning...
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black text-[#1E293B]">Collaborateurs</h3>
                            <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-[10px] font-black">
                                +
                            </span>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((_, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl border border-slate-100 relative overflow-hidden flex items-center justify-center text-primary font-black text-xs">
                                            {String.fromCharCode(65 + i)}
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-[#1E293B]">Collaborateur {i + 1}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider italic">
                                                En ligne
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => (window.location.hash = '/chat')}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 transition-all"
                                    >
                                        <MessageCircle size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-3 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-primary/20 hover:text-primary hover:bg-slate-50 transition-all">
                            Voir tout l&apos;annuaire
                        </button>
                    </div>
                </aside>
            </main>
        </div>
    )
}
