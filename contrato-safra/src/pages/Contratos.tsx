import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { store, type StoredContract } from "../lib/store"
import { useAuth } from "../contexts/AuthContext"
import { formatCurrency } from "../lib/calculations"
import Header from "../components/Header"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  aguardando_confirmacao: "Aguardando Confirmação",
  confirmado: "Confirmado",
  divergencia: "Divergência",
  expirado: "Expirado",
}

const statusColors: Record<string, string> = {
  rascunho: "bg-gray-100 text-gray-700",
  aguardando_confirmacao: "bg-yellow-100 text-yellow-700",
  confirmado: "bg-green-100 text-green-700",
  divergencia: "bg-red-100 text-red-700",
  expirado: "bg-gray-100 text-gray-500",
}

export default function Contratos() {
  const { user } = useAuth()
  const [contracts, setContracts] = useState<(StoredContract & { crop_types?: { name: string } | null })[]>([])

  useEffect(() => {
    if (user) setContracts(store.contracts.listBySeller(user.id))
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Meus Contratos</h1>
          <Link to="/contratos/novo">
            <Button>Novo Contrato</Button>
          </Link>
        </div>
        {contracts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">Nenhum contrato ainda</p>
              <Link to="/contratos/novo">
                <Button className="mt-4">Criar primeiro contrato</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {contracts.map((c) => (
              <Link key={c.id} to={`/contratos/${c.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {c.crop_types?.name || c.crop_type_custom || "Produto não especificado"}
                        </p>
                        <p className="text-sm text-gray-500">{c.buyer_name}</p>
                        <p className="text-sm text-gray-500">
                          {c.quantity} {c.unit_type} x {formatCurrency(c.unit_price)} = {formatCurrency(c.total_value)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[c.status]}`}>
                        {statusLabels[c.status]}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
