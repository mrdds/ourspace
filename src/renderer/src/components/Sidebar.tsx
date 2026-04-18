import { useAuthStore } from '../store/authStore'
import {
    Home,
    Clock,
    MessageCircle,
    Video,
    User,
    LogOut,
    Calendar,
    FileText,
    CheckSquare,
    Info,
    Search
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import AppIcon from './AppIcon'

export default function Sidebar(): React.JSX.Element {
    const logout = useAuthStore((state) => state.logout)

    const navItems = [
        { path: '/', icon: <Home size={22} />, label: 'Accueil', color: '#3A7BFF' },
        { path: '/presence', icon: <Clock size={22} />, label: 'Présence', color: '#FF8A00' },
        { path: '/chat', icon: <MessageCircle size={22} />, label: 'Messages', color: '#7B61FF' },
        { path: '/meetings', icon: <Video size={22} />, label: 'Réunions', color: '#E64545' },
        { path: '/absences', icon: <Calendar size={22} />, label: 'Absences', color: '#3A7BFF' },
        { path: '/payslips', icon: <FileText size={22} />, label: 'Fiches Paie', color: '#FF8A00' },
        {
            path: '/approvals',
            icon: <CheckSquare size={22} />,
            label: 'Approvals',
            color: '#7B61FF'
        },
        { path: '/infocenter', icon: <Info size={22} />, label: 'Infocenter', color: '#1DBF73' },
        { path: '/annuaire', icon: <Search size={22} />, label: 'Annuaire', color: '#E64545' },
        { path: '/profile', icon: <User size={22} />, label: 'Mon Profil', color: '#1DBF73' }
    ]

    return (
        <div className="w-[110px] bg-white h-screen flex flex-col items-center py-6 border-r border-slate-100 shadow-sm z-50 shrink-0">
            {/* Logo Area */}
            <div className="mb-8">
                <AppIcon size={48} className="shadow-sm" />
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 flex flex-col items-center space-y-4 w-full overflow-y-auto custom-scrollbar px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center group transition-all duration-300 w-full py-2 rounded-2xl ${isActive ? 'bg-slate-50' : 'hover:bg-slate-50/50'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <div className="flex flex-col items-center w-full text-center px-1">
                                <div
                                    className={`transition-all duration-300 mb-1 ${isActive ? 'scale-110' : 'opacity-60 group-hover:opacity-100'
                                        }`}
                                    style={{ color: isActive ? item.color : '#64748B' }}
                                >
                                    {item.icon}
                                </div>
                                <span
                                    className={`text-[9px] font-black uppercase tracking-tighter leading-tight break-words w-full ${isActive ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
                                        }`}
                                    style={{ color: isActive ? item.color : '#1E293B' }}
                                >
                                    {item.label}
                                </span>
                            </div>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Logout Button */}
            <div className="mt-auto pt-6 pb-2 w-full flex flex-col items-center gap-2">
                <button
                    onClick={logout}
                    className="p-3 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all duration-300 group"
                    title="Déconnexion"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <p className="text-[8px] font-bold uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Sortie
                    </p>
                </button>
            </div>
        </div>
    )
}
