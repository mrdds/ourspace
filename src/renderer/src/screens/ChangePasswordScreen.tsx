import React, { useState } from 'react'
import { Lock, ShieldCheck, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'

export default function ChangePasswordScreen(): React.JSX.Element {
  const { logout } = useAuthStore()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (newPassword.length < 8) {
      setError('Le nouveau mot de passe doit faire au moins 8 caractères.')
      return
    }

    setLoading(true)
    try {
      await authApi.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      })

      // Re-fetch profile to update flags
      const profileRes = await authApi.get('/auth/me')
      useAuthStore.getState().login(localStorage.getItem('kumba_token') || '', profileRes.data)
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Erreur lors de la mise à jour.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-lg w-full">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
            <Lock className="text-blue-600" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sécurisez votre compte</h1>
            <p className="text-slate-500">Définissez votre nouveau mot de passe</p>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
          <p className="text-blue-700 text-sm leading-relaxed">
            Pour votre première connexion, vous devez remplacer le mot de passe temporaire reçu par
            email par un mot de passe personnel sécurisé.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Mot de passe reçu par email
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              placeholder="Temporaire"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              placeholder="Min. 8 caractères"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              placeholder="Répétez"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center w-full py-4 px-6 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <ShieldCheck size={20} className="mr-2" />
                <span>Activer mon compte</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
          <button
            onClick={logout}
            className="text-slate-400 hover:text-slate-600 flex items-center text-sm"
          >
            <LogOut size={16} className="mr-2" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
