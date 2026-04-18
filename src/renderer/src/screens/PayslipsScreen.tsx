import React, { useEffect, useState } from 'react'
import { FileText, Download, Calendar, ArrowLeft } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { getMyPayslips } from '../services/api'
import OurSpaceLoader from '../components/OurSpaceLoader'

interface Payslip {
    id: string | number
    period?: string
    month?: number
    year?: number
    net_salary?: string | number
    status?: string
    file_url?: string
}

export default function PayslipsScreen(): React.JSX.Element {
    const [payslips, setPayslips] = useState < Payslip[] > ([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPayslips = async (): Promise<void> => {
            try {
                const data = await getMyPayslips()
                setPayslips((data as Payslip[]) || [])
            } catch (error) {
                console.error('Failed to fetch payslips', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPayslips()
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
                    <div className="w-10 h-10 bg-green-100/50 rounded-xl flex items-center justify-center text-[#1DBF73] shadow-sm">
                        <FileText size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold text-[#1E293B]">Fiches de Paie</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                            Historique et documents
                        </p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                    {payslips.length === 0 ? (
                        <div className="bg-white rounded-[32px] border border-dashed border-slate-200 p-16 text-center shadow-sm">
                            <FileText className="text-slate-200 mx-auto mb-6" size={64} />
                            <h3 className="text-xl font-black text-[#1E293B] mb-2">Aucune fiche de paie</h3>
                            <p className="text-slate-400 font-medium max-w-md mx-auto">
                                Vos fiches de paie apparaîtront ici une fois qu'elles auront été générées par
                                l'équipe RH.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {payslips.map((payslip) => (
                                <div
                                    key={payslip.id}
                                    className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#1DBF73]">
                                                <Calendar size={24} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[#1E293B] capitalize">
                                                    {payslip.period || `${payslip.month || 'Mois'} ${payslip.year || ''}`}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                    Ref: {payslip.id}
                                                </p>
                                            </div>
                                        </div>
                                        {payslip.status === 'paid' && (
                                            <span className="px-3 py-1 bg-green-100 text-[#1DBF73] text-[10px] font-black uppercase tracking-widest rounded-full">
                                                Payé
                                            </span>
                                        )}
                                    </div>

                                    {payslip.net_salary && (
                                        <div className="mb-6 p-4 bg-slate-50 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                                                Net à payer
                                            </p>
                                            <p className="text-xl font-black text-[#1E293B]">{payslip.net_salary} FCFA</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => payslip.file_url && window.open(payslip.file_url, '_blank')}
                                        disabled={!payslip.file_url}
                                        className="w-full py-4 rounded-2xl font-black text-sm flex justify-center items-center gap-2 transition-all 
                                            bg-slate-50 text-slate-600 hover:bg-[#1DBF73] hover:text-white hover:shadow-lg hover:shadow-green-500/20 disabled:opacity-50 disabled:hover:bg-slate-50 disabled:hover:text-slate-600 disabled:cursor-not-allowed"
                                    >
                                        <Download size={18} />
                                        Télécharger
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
