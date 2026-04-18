import { useState, useEffect } from 'react'
import { Mail, RotateCcw, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'

export default function ActivationScreen(): React.JSX.Element {
  const { user, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async (): Promise<void> => {
    setLoading(true)
    try {
      await authApi.post('/auth/request-activation')
      setSent(true)
      setTimeout(() => setSent(false), 5000)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async (isManual = true): Promise<void> => {
    if (isManual) setLoading(true)
    try {
      const { getEmployeeProfile, getAuthProfile } = await import('../services/api')

      // On récupère les profils des deux services en parallèle
      const [businessUser, authUser] = await Promise.all([
        getEmployeeProfile(),
        getAuthProfile()
      ])

      const { refreshUser } = useAuthStore.getState()

      // L'utilisateur est vérifié si les DEUX services le confirment
      // KumbaAuth utilise souvent is_active ou is_verified
      // KumbaBusiness (via Ninja) utilise 'is_activated'
      const isVerifiedAuth = authUser.is_verified || authUser.is_active || false
      const isVerifiedBusiness = businessUser.is_verified || businessUser.is_activated || false

      // On fusionne les données pour le store (Business + statut de vérification combiné)
      const mergedUser = {
        ...businessUser,
        is_verified: isVerifiedAuth && isVerifiedBusiness
      }

      refreshUser(mergedUser)

      // Feedback visuel seulement si c'est une action manuelle
      if (isManual) {
        if (mergedUser.is_verified) {
          alert('Succès : Votre compte est activé sur Business et Auth !')
        } else if (!isVerifiedAuth) {
          alert("KumbaAuth : Votre email n'est pas encore validé. Vérifiez vos messages.")
        } else if (!isVerifiedBusiness) {
          alert("KumbaBusiness : Votre profil n'est pas encore actif. Contactez l'administrateur.")
        }
      }
    } catch (error: any) {
      if (isManual) {
        console.error('Failed to refresh status', error)
        const msg = error.response?.data?.detail || error.message || "Erreur de connexion au serveur."
        alert(`Erreur lors de la vérification : ${msg}`)
      }
    } finally {
      if (isManual) setLoading(false)
    }
  }

  // Vérification automatique toutes le 5 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      checkStatus(false)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="text-blue-600" size={40} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-4">Activez votre compte</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Bonjour <span className="font-semibold text-slate-800">{user?.first_name}</span>. Un email
          de confirmation a été envoyé à{' '}
          <span className="text-blue-600 font-medium">{user?.email}</span>. Veuillez cliquer sur le
          lien dans l&apos;email pour accéder à OurSpace.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => checkStatus()}
            disabled={loading}
            className="flex items-center justify-center w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Vérification...' : "J'ai activé mon compte"}
          </button>

          <button
            onClick={handleResend}
            disabled={loading}
            className="flex items-center justify-center w-full py-3 px-4 rounded-xl border-2 border-blue-100 text-blue-600 font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <RotateCcw size={18} className="mr-2" />
                {sent ? 'Email envoyé !' : "Renvoyer l'email d'activation"}
              </>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <button
            onClick={logout}
            className="flex items-center justify-center mx-auto text-slate-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} className="mr-2" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>

      <p className="mt-8 text-slate-400 text-sm">
        &copy; {new Date().getFullYear()} Kumba Business - Sécurité
      </p>
    </div>
  )
}
