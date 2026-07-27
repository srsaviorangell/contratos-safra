import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import Login from "./pages/Login"
import Cadastro from "./pages/Cadastro"
import Contratos from "./pages/Contratos"
import NovoContrato from "./pages/NovoContrato"
import ContratoDetalhe from "./pages/ContratoDetalhe"
import Confirmar from "./pages/Confirmar"
import { Toaster } from "sonner"

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Carregando...</p></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Carregando...</p></div>
  if (user) return <Navigate to="/contratos" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/cadastro" element={<PublicRoute><Cadastro /></PublicRoute>} />
          <Route path="/contratos" element={<PrivateRoute><Contratos /></PrivateRoute>} />
          <Route path="/contratos/novo" element={<PrivateRoute><NovoContrato /></PrivateRoute>} />
          <Route path="/contratos/:id" element={<PrivateRoute><ContratoDetalhe /></PrivateRoute>} />
          <Route path="/confirmar/:token" element={<Confirmar />} />
          <Route path="*" element={<Navigate to="/contratos" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
