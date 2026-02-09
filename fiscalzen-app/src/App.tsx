import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/components/layouts/DashboardLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { Dashboard } from '@/sections/Dashboard'
import { NotasFiscais } from '@/sections/NotasFiscais'
import { Manifestacao } from '@/sections/Manifestacao'
import { Relatorios } from '@/sections/Relatorios'
import { Toaster } from '@/components/ui/sonner'
import { SefazStatusPage } from '@/pages/SefazStatusPage'
import { CompanyPage } from '@/pages/CompanyPage'
import { UsersPage } from '@/pages/UsersPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { TagsPage } from '@/pages/TagsPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { SuppliersPage } from '@/pages/SuppliersPage'
import { IntegrationsPage } from '@/pages/IntegrationsPage'
import { SubscriptionPage } from '@/pages/SubscriptionPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { HelpPage } from '@/pages/HelpPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notas-fiscais" element={<NotasFiscais />} />
          <Route path="/notas-fiscais/:id" element={<NotasFiscais />} />
          <Route path="/manifestacao" element={<Manifestacao />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/consulta-sefaz" element={<SefazStatusPage />} />
          <Route path="/sped" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">SPED Fiscal</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
          <Route path="/fornecedores" element={<SuppliersPage />} />
          <Route path="/tags" element={<TagsPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="/notificacoes" element={<NotificationsPage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/empresa" element={<CompanyPage />} />
          <Route path="/integracoes" element={<IntegrationsPage />} />
          <Route path="/assinatura" element={<SubscriptionPage />} />
          <Route path="/configuracoes" element={<SettingsPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/ajuda" element={<HelpPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App
