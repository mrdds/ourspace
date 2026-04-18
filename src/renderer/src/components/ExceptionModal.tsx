import React, { useState } from 'react'
import { X, Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { submitPresenceException } from '../services/api'

interface ExceptionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    initialDate?: string
}

export default function ExceptionModal({ isOpen, onClose, onSuccess, initialDate }: ExceptionModalProps): React.JSX.Element | null {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        type: 'OUBLI',
        date: initialDate || new Date().toISOString().split('T')[0],
        time: '08:00',
        reason: '',
    })

    // Reset form when initialDate changes or modal opens
    React.useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({
                ...prev,
                date: initialDate || new Date().toISOString().split('T')[0]
            }))
            setSuccess(false)
            setError('')
        }
    }, [isOpen, initialDate])

    const [file, setFile] = useState < File | null > (null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const data = new FormData()
            data.append('exception_type', formData.type)
            data.append('target_date', formData.date)
            data.append('target_time', formData.time)
            data.append('reason', formData.reason)
            if (file) {
                data.append('evidence', file)
            }

            await submitPresenceException(data)
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                onSuccess()
                onClose()
            }, 2000)
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.detail || "Erreur lors de l'envoi de la réclamation.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 mb-10">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Nouvelle Réclamation</h2>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mt-1">Exception de Présence</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {success ? (
                        <div className="py-12 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-20 h-20 bg-green-50 rounded-[24px] flex items-center justify-center text-green-500 mb-6 shadow-sm">
                                <CheckCircle size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Réclamation Envoyée !</h3>
                            <p className="text-slate-500 font-medium max-w-[280px]">Votre demande a été transmise au service RH pour validation.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type d&apos;anomalie</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="OUBLI">Oubli de pointage</option>
                                        <option value="ERREUR">Erreur de site</option>
                                        <option value="TECHNIQUE">Problème Technique</option>
                                        <option value="AUTRE">Autre raison</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date concernée</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Explications</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Expliquez brièvement l'anomalie..."
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preuve / Justificatif</label>
                                <label className="group relative flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-100 hover:border-primary/30 transition-all">
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        accept="image/*,.pdf"
                                    />
                                    {file ? (
                                        <div className="flex items-center gap-2 text-primary">
                                            <CheckCircle size={20} />
                                            <span className="text-sm font-bold truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                                            <Upload size={24} />
                                            <span className="text-xs font-black uppercase tracking-widest">Choisir un fichier</span>
                                        </div>
                                    )}
                                </label>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 animate-in shake-100">
                                    <AlertTriangle size={20} className="shrink-0" />
                                    <p className="text-xs font-bold leading-tight">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-[20px] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : "Soumettre ma réclamation"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
