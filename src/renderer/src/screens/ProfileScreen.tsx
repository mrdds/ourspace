import React, { useEffect, useState } from 'react'
import {
  User,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Shield,
  LogOut,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getEmployeeProfile, EmployeeProfile } from '../services/api'

export default function ProfileScreen(): React.JSX.Element {
  const { user, logout } = useAuthStore()
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const data = await getEmployeeProfile()
      setProfile(data as EmployeeProfile)
    } catch (err) {
      console.error('Failed to fetch employee profile', err)
      setError('Impossible de charger les informations du profil')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const firstName = profile?.user?.first_name || user?.first_name || 'Utilisateur'
  const lastName = profile?.user?.last_name || user?.last_name || ''

  if (loading && !profile) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4 opacity-20">
          <RefreshCw className="animate-spin" size={48} />
          <p className="font-black uppercase tracking-widest text-sm">Chargement du profil...</p>
        </div>
      </div>
    )
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
            <h1 className="text-xl font-extrabold text-[#1E293B]">Mon Profil</h1>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Informations Personnelles
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchProfile}
            className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => logout()}
            className="px-6 py-2.5 bg-red-50 text-red-500 rounded-xl font-black text-xs uppercase tracking-widest border border-red-100 flex items-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-500">
              <AlertCircle size={20} />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {/* Profile Header Card */}
          <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-32 h-32 bg-primary/10 rounded-[40px] border-4 border-white shadow-xl flex items-center justify-center text-primary text-4xl font-black overflow-hidden">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>
                  {firstName[0]}
                  {lastName[0]}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-black text-[#1E293B] mb-2">
                {firstName} {lastName}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
                  {profile?.job_title || user?.role || 'Collaborateur'}
                </span>
                <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                  Compte Actif
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-[#1E293B] mb-6 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Informations de Contact
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Mail size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Email Professionnel
                    </p>
                    <p className="text-sm font-black text-[#1E293B]">
                      {profile?.user?.email || user?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Phone size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Téléphone
                    </p>
                    <p className="text-sm font-black text-[#1E293B]">
                      {profile?.phone_number || 'Non renseigné'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <MapPin size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Localisation
                    </p>
                    <p className="text-sm font-black text-[#1E293B]">
                      {profile?.city && profile?.country
                        ? `${profile.city}, ${profile.country}`
                        : 'Non renseigné'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Info */}
            <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
              <h3 className="text-lg font-black text-[#1E293B] mb-6 flex items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                Détails Professionnels
              </h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Shield size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Département
                    </p>
                    <p className="text-sm font-black text-[#1E293B]">
                      {profile?.department || 'Général'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Date d&apos;embauche
                    </p>
                    <p className="text-sm font-black text-[#1E293B]">
                      {profile?.hire_date
                        ? new Date(profile.hire_date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'Non renseigné'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Briefcase size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Type de Contrat
                    </p>
                    <p className="text-sm font-black text-[#1E293B]">
                      {profile?.contract_type || 'CDI'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
