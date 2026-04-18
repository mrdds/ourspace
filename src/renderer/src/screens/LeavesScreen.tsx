import React, { useEffect, useState } from 'react'
import { CalendarCheck, Calendar, ArrowLeft, Clock, CheckCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getMyLeaves } from '../services/api'
import OurSpaceLoader from '../components/OurSpaceLoader'

interface Leave {
    id: string | number
    leave_type?: string
    start_date?: string
    end_date?: string
    status?: string
    days_count?: number
    reason?: string
}

export default function LeavesScreen(): React.JSX.Element {
    const [leaves, setLeaves] = useState < Leave[] > ([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchLeaves = async (): Promise<void> => {
            try {
                const data = await getMyLeaves()
                setLeaves((data as Leave[]) || [])
            } catch (error) {
                console.error('Failed to fetch leaves', error)
            } finally {
                setLoading(false)
            }
        }

        fetchLeaves()
    }, [])

    const getStatusColor = (status?: string): string => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'text-[#1DBF73] bg-green-100'
            case 'rejected':
                return 'text-red-500 bg-red-100'
            case 'pending':
                return 'text-orange-500 bg-orange-100'
            default:
                return 'text-slate-400 bg-slate-100'
        }
    }

    const getStatusText = (status?: string): string => {
        switch (status?.toLowerCase()) {
            case 'approved':
                return 'Approuvé'
            case 'rejected':
                return 'Rejeté'
            case 'pending':
                return 'En attente'
            default:
                return status || 'Inconnu'
        }
    }

    if (loading) {
        return <OurSpaceLoader />
    }

    return (
        <div className="flex-1 h-screen flex flex-col bg-[#F8FAFC]">
            <header className="h-20 px-8 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-4">
                    <NavLink
                        to="/"
                        className="w-10 h-10 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </NavLink>
                    <div className="w-10 h-10 bg-blue-100/50 rounded-xl flex items-center justify-center text-[#3A7BFF] shadow-sm">
                        <CalendarCheck size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-[#1E293B]">Gestion des Congés</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Mes demandes et absences
                        </p>
                    </div>
                </div>
                <button className="px-6 py-2.5 bg-[#3A7BFF] text-white rounded-2xl font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                    Nouvelle Demande
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-[#3A7BFF]">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Solde disponible
                                </p>
                                <p className="text-2xl font-black text-[#1E293B]">12 <span className="text-sm font-medium text-slate-400">jours</span></p>
                            </div>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF8A00]">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    En attente
                                </p>
                                <p className="text-2xl font-black text-[#1E293B]">
                                    {leaves.filter(l => l.status?.toLowerCase() === 'pending').length}
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-[#1DBF73]">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Pris cette année
                                </p>
                                <p className="text-2xl font-black text-[#1E293B]">8 <span className="text-sm font-medium text-slate-400">jours</span></p>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-lg font-black text-[#1E293B] mb-6">Historique des Demandes</h2>

                    {leaves.length === 0 ? (
                        <div className="bg-white rounded-[32px] border border-dashed border-slate-200 p-16 text-center shadow-sm">
                            <CalendarCheck className="text-slate-200 mx-auto mb-6" size={64} />
                            <h3 className="text-xl font-black text-[#1E293B] mb-2">Aucune demande</h3>
                            <p className="text-slate-400 font-medium max-w-md mx-auto">
                                Vous n'avez pas encore fait de demande de congé ou d'absence.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {leaves.map((leave) => (
                                <div
                                    key={leave.id}
                                    className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                                            <Calendar size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[#1E293B] mb-1">
                                                {leave.leave_type || 'Congé'}
                                                {leave.days_count && <span className="text-slate-400 ml-2 font-medium">({leave.days_count} jours)</span>}
                                            </p>
                                            <p className="text-xs font-bold text-slate-400">
                                                {leave.start_date ? new Date(leave.start_date).toLocaleDateString('fr-FR') : 'N/A'}
                                                {leave.start_date && leave.end_date && ' - '}
                                                {leave.end_date ? new Date(leave.end_date).toLocaleDateString('fr-FR') : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(leave.status)}`}>
                                            {getStatusText(leave.status)}
                                        </span>
                                        {leave.reason && (
                                            <p className="text-[11px] text-slate-400 max-w-[200px] truncate text-right">
                                                {leave.reason}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
