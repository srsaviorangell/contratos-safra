import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { store } from "../lib/store"
import { formatCurrency, formatDate } from "../lib/calculations"
import type { StoredContract } from "../lib/store"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"

export default function Confirmar() {
  const { token } = useParams()
  const [contract, setContract] = useState<StoredContract | undefined | null>(undefined)
  const [confirming, setConfirming] = useState(false)
  const [note, setNote] = useState("")
  const [showDivergence, setShowDivergence] = useState(false)

  useEffect(() => {
    if (token) setContract(store.contracts.getByToken(token))
  }, [token])

  if (contract === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <p>Carregando...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">Contrato não encontrado ou link inválido</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const expired = contract.confirmation_expires_at && new Date(contract.confirmation_expires_at) < new Date()

  async function handleConfirm() {
    setConfirming(true)
    try {
      store.contracts.update(contract.id, {
        status: "confirmado",
        confirmed_at: new Date().toISOString(),
      })
      setContract(store.contracts.getByToken(token!))
      alert("Contrato confirmado com sucesso!")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setConfirming(false)
    }
  }

  async function handleDivergence() {
    setConfirming(true)
    try {
      store.contracts.update(contract.id, {
        status: "divergencia",
        divergence_note: note,
      })
      setContract(store.contracts.getByToken(token!))
      alert("Divergência registrada. O vendedor será notificado.")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setConfirming(false)
    }
  }

  if (contract.status !== "aguardando_confirmacao") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Contrato {contract.status === "confirmado" ? "Confirmado" : contract.status === "divergencia" ? "com Divergência" : contract.status === "expirado" ? "Expirado" : contract.status}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {contract.status === "confirmado" && (
              <p className="text-green-600">Este contrato já foi confirmado pelo comprador.</p>
            )}
            {contract.status === "divergencia" && (
              <div>
                <p className="text-yellow-600">Este contrato possui divergência apontada.</p>
                {contract.divergence_note && (
                  <p className="mt-2 text-sm text-gray-600">Observação: {contract.divergence_note}</p>
                )}
              </div>
            )}
            {contract.status === "expirado" && (
              <p className="text-gray-500">Este contrato expirou.</p>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (expired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Link Expirado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-500">O prazo para confirmação deste contrato expirou.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-700">Confirmação de Contrato</CardTitle>
            <p className="text-sm text-gray-500 text-center">Revise os dados abaixo</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Produto</p>
                <p className="font-medium">{contract.crop_type_id || contract.crop_type_custom || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantidade</p>
                <p className="font-medium">{contract.quantity} {contract.unit_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preço unitário</p>
                <p className="font-medium">{formatCurrency(contract.unit_price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor total</p>
                <p className="font-medium">{formatCurrency(contract.total_value)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vendedor</p>
                <p className="font-medium">{contract.buyer_name}</p>
              </div>
              {contract.delivery_date && (
                <div>
                  <p className="text-sm text-gray-500">Data de entrega</p>
                  <p className="font-medium">{formatDate(contract.delivery_date)}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t">
              {!showDivergence ? (
                <>
                  <Button onClick={handleConfirm} disabled={confirming} className="w-full">
                    Confirmar Contrato
                  </Button>
                  <Button variant="outline" onClick={() => setShowDivergence(true)} className="w-full">
                    Apontar Divergência
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <textarea
                    className="w-full rounded-md border border-gray-300 p-3 text-sm"
                    rows={3}
                    placeholder="Descreva a divergência..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                  <Button onClick={handleDivergence} disabled={confirming || !note} variant="destructive" className="w-full">
                    Enviar Divergência
                  </Button>
                  <Button variant="ghost" onClick={() => setShowDivergence(false)} className="w-full">
                    Voltar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
