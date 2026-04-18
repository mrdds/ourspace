import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { authApi, getEmployeeProfile } from '../services/api'
import AppIcon from '../components/AppIcon'

export default function LoginScreen(): React.JSX.Element {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const login = useAuthStore((state) => state.login)
    const setToken = useAuthStore((state) => state.setToken)

    const handleLogin = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // 1. SSO Login
            const res = await authApi.post('/auth/login/', { username: email, password })

            if (res.data && res.data.access) {
                const token = res.data.access

                // 2. Set token in store (triggers interceptors to use it)
                setToken(token)
                localStorage.setItem('kumba_token', token)

                // 3. Fetch Employee Profile from Business API
                try {
                    const userProfile = await getEmployeeProfile()
                    login(token, userProfile)
                } catch (err) {
                    console.error('Failed to fetch profile after login', err)
                    setError('Erreur lors de la récupération du profil collaborateur.')
                }
            } else {
                setError('Accès refusé. Veuillez vérifier vos identifiants.')
            }
        } catch (err: unknown) {
            console.error('Login error:', err)
            setError(
                (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
                'Une erreur est survenue lors de la connexion.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="p-8">
                    <div className="flex flex-col items-center mb-8 text-center text-slate-900 font-black">
                        <AppIcon className="mb-4" />
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">KumbaBusiness OurSpace</h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">Connectez-vous à votre espace collaborateur</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Email professionnel
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
                                placeholder="votre.nom@kumbabusiness.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error ? (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none active:scale-[0.98]"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </button>
                    </form>
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-center text-xs text-slate-400 font-medium">
                    © 2026 KumbaBusiness Platform. Tous droits réservés.
                </div>
            </div>
        </div>
    )
}
