import { useAuth } from "../contexts/AuthContext"
import { Button } from "./ui/button"

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <span className="font-semibold text-green-700">Contrato Safra</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.full_name}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>Sair</Button>
        </div>
      </div>
    </header>
  )
}
