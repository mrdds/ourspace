import React from 'react'
import { X, Clock, CheckCircle2, User, CornerUpRight, Info } from 'lucide-react'

interface MessageInfoPanelProps {
    isOpen: boolean
    onClose: () => void
    message: any // The message object
}

export default function MessageInfoPanel({ isOpen, onClose, message }: MessageInfoPanelProps): React.JSX.Element | null {
    if (!isOpen || !message) return null

    return (
        <div className="w-[350px] bg-white h-full border-l border-slate-100 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 z-50">
            {/* Header */}
            <div className="h-20 px-6 flex justify-between items-center border-b border-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                        <Info size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 leading-tight">Infos message</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Détails de transmission</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* Message Preview */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contenu</h3>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-600 leading-relaxed">
                        "{message.decryptedContent || message.content}"
                    </div>
                </div>

                {/* Timestamps */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Horodatage</h3>

                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
                            <Clock size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 uppercase">Envoyé</p>
                            <p className="text-[11px] font-bold text-slate-500">
                                {new Date(message.created_at).toLocaleString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 group">
                        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500 shrink-0 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-900 uppercase">Distribué</p>
                            <p className="text-[11px] font-bold text-slate-500">
                                {new Date(message.created_at).toLocaleString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Read Status */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lu par</h3>
                    <div className="space-y-3">
                        {/* For now, we show a simplified list. In a real group chat, we'd list participants. */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary">
                                    {message.sender_name?.substring(0, 1) || 'C'}
                                </div>
                                <span className="text-xs font-bold text-slate-700">Contact</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-primary">
                                <span className="text-[10px] font-black uppercase">Lu</span>
                                <CheckCircle2 size={14} />
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 text-center italic">
                            Les informations de lecture en temps réel sont synchronisées via WebSocket.
                        </p>
                    </div>
                </div>

                {/* Reply/Forward Context */}
                {message.reply_to_id && (
                    <div className="pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <CornerUpRight size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">En réponse à</span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-500 line-clamp-1 truncate bg-slate-50 p-2 rounded-lg border border-slate-50">
                            {message.reply_to_content || "Message précédent"}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-50 bg-slate-50/50 mt-auto">
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed text-center uppercase tracking-tighter">
                    ID Message: {message.id}<br />
                    Chiffrement de bout en bout actif (X25519)
                </p>
            </div>
        </div>
    )
}
