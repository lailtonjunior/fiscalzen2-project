import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from '@/components/custom/Sidebar'
import { Header } from '@/components/custom/Header'
import { Dashboard } from '@/sections/Dashboard'
import { NotasFiscais } from '@/sections/NotasFiscais'
import { Manifestacao } from '@/sections/Manifestacao'
import { Relatorios } from '@/sections/Relatorios'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/hooks/useStore'
import './App.css'

function App() {
  const { sidebarOpen } = useUIStore()

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div 
          className={cn(
            'transition-all duration-300 ease-in-out',
            sidebarOpen ? 'ml-64' : 'ml-16'
          )}
        >
          <Header />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/notas-fiscais" element={<NotasFiscais />} />
              <Route path="/notas-fiscais/:id" element={<NotasFiscais />} />
              <Route path="/manifestacao" element={<Manifestacao />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/sped" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">SPED Fiscal</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/fornecedores" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Fornecedores</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/tags" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Tags</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/historico" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Histórico</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/notificacoes" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Notificações</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/usuarios" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Usuários</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/empresa" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Dados da Empresa</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/integracoes" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Integrações</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/assinatura" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Assinatura</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/configuracoes" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Configurações</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/perfil" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Meu Perfil</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/ajuda" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Ajuda</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="/consulta-sefaz" element={<div className="text-center py-20"><h2 className="text-2xl font-bold">Consulta SEFAZ</h2><p className="text-muted-foreground">Em desenvolvimento</p></div>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App
