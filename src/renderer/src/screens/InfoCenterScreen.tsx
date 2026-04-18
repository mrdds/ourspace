import React, { useEffect, useState } from 'react'
import { FileText, ArrowLeft, ArrowRight, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getInformations } from '../services/api'
import OurSpaceLoader from '../components/OurSpaceLoader'
import { motion } from 'framer-motion'

interface Information {
    id: number
    title: string
    content: string
    color: string
    created_at: string
    created_by_name?: string
}

export default function InfoCenterScreen(): React.JSX.Element {
    const [informations, setInformations] = useState < Information[] > ([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchInfo = async (): Promise<void> => {
            try {
                const data = await getInformations()
                setInformations((data as Information[]) || [])
            } catch (error) {
                console.error('Failed to fetch informations', error)
            } finally {
                setLoading(false)
            }
        }

        fetchInfo()
    }, [])

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
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                        <FileText size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-[#1E293B]">Centre d'Actualités</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Dernières annonces de l'entreprise
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-5xl mx-auto">
                    {informations.length === 0 ? (
                        <div className="bg-white rounded-[32px] border border-dashed border-slate-200 p-16 text-center shadow-sm">
                            <FileText className="text-slate-200 mx-auto mb-6" size={64} />
                            <h3 className="text-xl font-black text-[#1E293B] mb-2">Aucune actualité</h3>
                            <p className="text-slate-400 font-medium max-w-md mx-auto">
                                Il n'y a pas d'informations ou d'annonces récentes à afficher pour le moment.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {informations.map((info, index) => (
                                <motion.div
                                    key={info.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all cursor-pointer group flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <span
                                            className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
                                            style={{ backgroundColor: info.color || '#3A7BFF' }}
                                        >
                                            News
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            {new Date(info.created_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-black text-[#1E293B] leading-tight mb-4 group-hover:text-primary transition-colors">
                                        {info.title}
                                    </h3>

                                    <p className="text-sm font-medium text-slate-500 leading-relaxed mb-8 flex-1 line-clamp-4">
                                        {info.content}
                                    </p>

                                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                <User size={14} />
                                            </div>
                                            <span className="text-xs font-bold text-slate-400">
                                                {info.created_by_name || 'Administration'}
                                            </span>
                                        </div>
                                        <button className="w-10 h-10 bg-slate-50 hover:bg-primary hover:text-white rounded-xl flex items-center justify-center text-primary transition-all group-hover:scale-110">
                                            <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
