import React, { useState, useEffect } from 'react'
import { businessApi } from '../services/api'
import { Smartphone, Plus, Trash2, Save, Loader2, MessageCircle } from 'lucide-react'

interface SettingsProfile {
  first_name?: string
  last_name?: string
  email?: string
  position?: string
  department?: string
  kumba_id?: string
  bio?: string
  phone?: string
  photo_url?: string
  phone_numbers?: { number: string; is_whatsapp: boolean }[]
  [key: string]: unknown
}

export default function SettingsScreen(): React.JSX.Element {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<SettingsProfile | null>(null)
  const [form, setForm] = useState({
    bio: '',
    phone: '',
    phone_numbers: [] as { number: string; is_whatsapp: boolean }[],
    avatar_url: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async (): Promise<void> => {
    try {
      const res = await businessApi.get('/hr/me')
      setProfile(res.data as SettingsProfile)
      setForm({
        bio: res.data.bio || '',
        phone: res.data.phone || '',
        phone_numbers: res.data.phone_numbers || [],
        avatar_url: res.data.photo_url || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('bio', form.bio)
      formData.append('phone', form.phone)
      formData.append('phone_numbers', JSON.stringify(form.phone_numbers))

      if (selectedFile) {
        formData.append('avatar', selectedFile)
      }

      await businessApi.patch('/hr/me', formData)
      await fetchProfile()
      alert('Profil mis à jour avec succès !')
      setSelectedFile(null)
    } catch (error) {
      console.error('Failed to update profile', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const addPhone = (): void => {
    setForm({
      ...form,
      phone_numbers: [...form.phone_numbers, { number: '', is_whatsapp: false }]
    })
  }

  const updatePhone = (index: number, field: string, value: string | boolean): void => {
    const newNums = [...form.phone_numbers]
    newNums[index] = { ...newNums[index], [field]: value }
    setForm({ ...form, phone_numbers: newNums })
  }

  const removePhone = (index: number): void => {
    setForm({
      ...form,
      phone_numbers: form.phone_numbers.filter((_, i) => i !== index)
    })
  }

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    )

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Paramètres du Profil</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Hero Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-8">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-primary text-3xl font-bold overflow-hidden border-4 border-slate-50 shadow-inner relative group cursor-pointer">
              {previewUrl || form.avatar_url ? (
                <img
                  src={previewUrl || form.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                profile?.first_name?.[0]
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Smartphone size={24} className="text-white" />
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-slate-500 font-medium mb-4">{profile?.email}</p>
              <div className="bg-slate-100 rounded-lg p-3">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Lien Photo de Profil
                </label>
                <input
                  className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-sm"
                  placeholder="https://..."
                  value={form.avatar_url}
                  onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Bio & Informations</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Biographie
                </label>
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 min-h-[100px] focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="Décrivez votre rôle ou vos compétences..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Poste
                  </p>
                  <p className="font-semibold text-slate-800">{profile?.position || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Département
                  </p>
                  <p className="font-semibold text-slate-800">{profile?.department || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Phones Section */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Smartphone size={20} className="text-slate-400" />
                Numéros de Téléphone
              </h3>
              <button
                type="button"
                onClick={addPhone}
                className="text-sm font-bold text-primary hover:text-primary-dark flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Plus size={16} /> Ajouter
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Numéro Principal
                </label>
                <input
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 focus:bg-white transition-all outline-none"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              {form.phone_numbers.map((num, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 group"
                >
                  <input
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="+225 ..."
                    value={num.number}
                    onChange={(e) => updatePhone(idx, 'number', e.target.value)}
                  />
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary"
                      checked={num.is_whatsapp}
                      onChange={(e) => updatePhone(idx, 'is_whatsapp', e.target.checked)}
                    />
                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${num.is_whatsapp ? 'text-green-600' : 'text-slate-400'}`}
                    >
                      {num.is_whatsapp && <MessageCircle size={14} />}
                      WhatsApp
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removePhone(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-slate-400">
              ID Unique: <span className="font-mono">{profile?.kumba_id}</span>
            </p>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-70 disabled:shadow-none"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
