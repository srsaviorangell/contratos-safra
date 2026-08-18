import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { store, type StoredContract } from "../lib/store"
import { formatCurrency, formatDate } from "../lib/calculations"
import Header from "../components/Header"
import { Button } from "../components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import ContractPreview from "../components/ContractPreview"

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

export default function ContratoDetalhe() {
  const { id } = useParams()
  const [contract, setContract] = useState<(StoredContract & { crop_types?: { name: string } | null }) | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (id) setContract(store.contracts.getById(id))
  }, [id])

  if (!contract) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-gray-500">Contrato não encontrado</p>
          <Link to="/contratos"><Button className="mt-4">Voltar</Button></Link>
        </main>
      </div>
    )
  }

  async function handleSend() {
    if (!contract) return
    if (!confirm("Enviar este contrato para confirmação do comprador?")) return
    setSending(true)
    try {
      const { token } = store.contracts.send(contract.id)
      setContract(store.contracts.getById(contract.id))
      const link = `${window.location.origin}/confirmar/${token}`
      await navigator.clipboard.writeText(link)
      alert("Link copiado! Compartilhe com o comprador.")
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  async function handleDelete() {
    if (!contract) return
    if (!confirm("Excluir este contrato?")) return
    store.contracts.update(contract.id, { status: "expirado" })
    setContract(store.contracts.getById(contract.id))
  }

  async function handleConfirmDirect() {
    if (!contract) return
    if (!confirm("Confirmar este contrato sem enviar link ao comprador?")) return
    setSending(true)
    try {
      store.contracts.update(contract.id, {
        status: "confirmado",
        confirmed_at: new Date().toISOString(),
      })
      setContract(store.contracts.getById(contract.id))
      alert("Contrato confirmado. Validação por reconhecimento de firma pendente em cartório.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/contratos" className="text-sm text-green-600 hover:underline">&larr; Voltar</Link>
          <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[contract.status]}`}>
            {statusLabels[contract.status]}
          </span>
        </div>

        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Validação do documento:</strong> para que este contrato tenha validade, é necessário o
          reconhecimento de firma das assinaturas em cartório.
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Comprador</p>
                <p className="font-medium">{contract.buyer_name}</p>
              </div>
              {contract.buyer_document && (
                <div>
                  <p className="text-sm text-gray-500">CPF/CNPJ</p>
                  <p className="font-medium">{contract.buyer_document}</p>
                </div>
              )}
              {contract.buyer_contact && (
                <div>
                  <p className="text-sm text-gray-500">Contato</p>
                  <p className="font-medium">{contract.buyer_contact}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Produto</p>
                <p className="font-medium">{contract.crop_types?.name || contract.crop_type_custom || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unidade</p>
                <p className="font-medium">{contract.unit_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantidade</p>
                <p className="font-medium">{contract.quantity}</p>
              </div>
              {contract.packaging_size && (
                <div>
                  <p className="text-sm text-gray-500">Tamanho da embalagem</p>
                  <p className="font-medium">{contract.packaging_size}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Preço unitário</p>
                <p className="font-medium">{formatCurrency(contract.unit_price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Valor total</p>
                <p className="font-medium">{formatCurrency(contract.total_value)}</p>
              </div>
              {contract.total_closed_value !== null && (
                <div>
                  <p className="text-sm text-gray-500">Valor fechado total</p>
                  <p className="font-medium">{formatCurrency(contract.total_closed_value)}</p>
                </div>
              )}
              {contract.ton_condition && (
                <div>
                  <p className="text-sm text-gray-500">Condição da tonelada</p>
                  <p className="font-medium">{contract.ton_condition}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Pagamento</p>
                <p className="font-medium">{contract.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Prazo</p>
                <p className="font-medium">{contract.payment_term}</p>
              </div>
              {contract.delivery_date && (
                <div>
                  <p className="text-sm text-gray-500">Data de entrega</p>
                  <p className="font-medium">{formatDate(contract.delivery_date)}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Criado em</p>
                <p className="font-medium">{formatDate(contract.created_at)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t flex-wrap">
              <ContractPreview contract={contract} />
              {contract.status === "rascunho" && (
                <>
                  <Button onClick={handleSend} disabled={sending} variant="outline">Enviar Link ao Comprador</Button>
                  <Button onClick={handleConfirmDirect} disabled={sending}>Confirmar Direto</Button>
                  <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
                </>
              )}
              {contract.status === "aguardando_confirmacao" && contract.confirmation_token && (
                <Button onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/confirmar/${contract.confirmation_token}`)
                  alert("Link copiado!")
                }}>
                  Copiar Link
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
