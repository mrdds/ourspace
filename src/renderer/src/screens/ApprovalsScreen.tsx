import React, { useState } from 'react'
import { CheckSquare, ArrowLeft, Clock, CheckCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'

// Placeholder for Approvals. Currently we don't have a distinct endpoint for approvals
// in `api.ts`. In a real scenario, this would fetch from `/hr/approvals` or similar.

export default function ApprovalsScreen(): React.JSX.Element {
    const [activeTab, setActiveTab] = useState < 'pending' | 'history' > ('pending')

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
                        <CheckSquare size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-[#1E293B]">Approbations</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Gérer les demandes
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    {/* Tabs */}
                    <div className="flex bg-slate-100/50 p-1.5 rounded-2xl w-fit mb-8 border border-slate-100">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'pending'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            En Attente (0)
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeTab === 'history'
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            Historique
                        </button>
                    </div>

                    {activeTab === 'pending' ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[32px] border border-dashed border-slate-200 p-16 text-center shadow-sm"
                        >
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#3A7BFF]">
                                <Clock size={40} />
                            </div>
                            <h3 className="text-xl font-black text-[#1E293B] mb-2">Tout est à jour !</h3>
                            <p className="text-slate-400 font-medium max-w-md mx-auto">
                                Vous n'avez aucune demande en attente d'approbation pour le moment.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[32px] border border-dashed border-slate-200 p-16 text-center shadow-sm"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-xl font-black text-[#1E293B] mb-2">Historique vide</h3>
                            <p className="text-slate-400 font-medium max-w-md mx-auto">
                                L'historique de vos approbations traitées apparaîtra ici.
                            </p>
                        </motion.div>
                    )}

                </div>
            </main>
        </div>
    )
}
