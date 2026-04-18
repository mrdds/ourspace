import React, { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginScreen from './screens/LoginScreen'
import DashboardScreen from './screens/DashboardScreen'
import PresenceScreen from './screens/PresenceScreen'
import ChatScreen from './screens/ChatScreen'
import MeetingsScreen from './screens/MeetingsScreen'
import ProfileScreen from './screens/ProfileScreen'
import SettingsScreen from './screens/SettingsScreen'
import Sidebar from './components/Sidebar'
import OurSpaceLoader from './components/OurSpaceLoader'
import ActivationScreen from './screens/ActivationScreen'
import ChangePasswordScreen from './screens/ChangePasswordScreen'
import PayslipsScreen from './screens/PayslipsScreen'
import LeavesScreen from './screens/LeavesScreen'
import ApprovalsScreen from './screens/ApprovalsScreen'
import InfoCenterScreen from './screens/InfoCenterScreen'

// Un composant de la mis en page (layout) pour les utilisateurs authentifiés
function ProtectedLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col h-full overflow-hidden">{children}</main>
    </div>
  )
}

function AppContent(): React.JSX.Element {
  const { token, user } = useAuthStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <OurSpaceLoader />
  }

  if (!token) {
    return <LoginScreen />
  }

  if (!user?.is_verified) {
    return <ActivationScreen />
  }

  if (user?.must_change_password) {
    return <ChangePasswordScreen />
  }

  return (
    <ProtectedLayout>
      <Routes>
        <Route path="/" element={<DashboardScreen />} />
        <Route path="/presence" element={<PresenceScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/meetings" element={<MeetingsScreen />} />
        <Route path="/absences" element={<LeavesScreen />} />
        <Route path="/payslips" element={<PayslipsScreen />} />
        <Route path="/approvals" element={<ApprovalsScreen />} />
        <Route path="/infocenter" element={<InfoCenterScreen />} />
        <Route path="/annuaire" element={<DashboardScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ProtectedLayout>
  )
}

function App(): React.JSX.Element {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
