import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { store } from "../lib/store"
import { useAuth } from "../contexts/AuthContext"
import { calculateTotalValue, formatCurrency } from "../lib/calculations"
import { maskDocument, maskPhone } from "../lib/masks"
import type { CropType } from "../lib/types"
import Header from "../components/Header"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select } from "../components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"

export default function NovoContrato() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [cropTypes, setCropTypes] = useState<CropType[]>([])

  const [cropTypeId, setCropTypeId] = useState("")
  const [cropTypeCustom, setCropTypeCustom] = useState("")
  const [unitType, setUnitType] = useState("")
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [totalClosedValue, setTotalClosedValue] = useState("")
  const [tonCondition, setTonCondition] = useState("")
  const [packagingSize, setPackagingSize] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentTerm, setPaymentTerm] = useState("")
  const [deliveryDate, setDeliveryDate] = useState("")
  const [sellerName, setSellerName] = useState("")
  const [sellerDocument, setSellerDocument] = useState("")
  const [sellerContact, setSellerContact] = useState("")
  const [buyerName, setBuyerName] = useState("")
  const [buyerDocument, setBuyerDocument] = useState("")
  const [buyerContact, setBuyerContact] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setCropTypes(store.cropTypes.list())
  }, [])

  const qty = Number(quantity) || 0
  const price = Number(unitPrice) || 0
  const total = totalClosedValue ? Number(totalClosedValue) : calculateTotalValue(qty, price)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    try {
      const contract = store.contracts.create({
        seller_id: user.id,
        crop_type_id: cropTypeId || null,
        crop_type_custom: cropTypeCustom || null,
        unit_type: unitType,
        quantity: qty,
        unit_price: price,
        total_value: calculateTotalValue(qty, price),
        total_closed_value: totalClosedValue ? Number(totalClosedValue) : null,
        ton_condition: tonCondition || null,
        packaging_size: packagingSize || null,
        payment_method: paymentMethod,
        payment_term: paymentTerm,
        delivery_date: deliveryDate || null,
        buyer_name: buyerName,
        buyer_document: buyerDocument || null,
        buyer_contact: buyerContact || null,
        seller_name: sellerName,
        seller_document: sellerDocument || null,
        seller_contact: sellerContact || null,
        status: "rascunho",
        confirmation_token: null,
        confirmation_expires_at: null,
        confirmed_at: null,
        divergence_note: null,
        parent_contract_id: null,
        verification_hash: null,
        pdf_url: null,
      })

      navigate(`/contratos/${contract.id}`)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Novo Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-500 uppercase">Vendedor</h3>
                <div>
                  <Label>Nome</Label>
                  <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} required />
                </div>
                <div>
                  <Label>CPF/CNPJ</Label>
                  <Input value={sellerDocument} onChange={(e) => setSellerDocument(maskDocument(e.target.value))} placeholder="000.000.000-00" />
                </div>
                <div>
                  <Label>Contato</Label>
                  <Input value={sellerContact} onChange={(e) => setSellerContact(maskPhone(e.target.value))} placeholder="(99)-99999-9999" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-500 uppercase">Comprador</h3>
                <div>
                  <Label>Nome</Label>
                  <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} required />
                </div>
                <div>
                  <Label>CPF/CNPJ</Label>
                  <Input value={buyerDocument} onChange={(e) => setBuyerDocument(maskDocument(e.target.value))} placeholder="000.000.000-00" />
                </div>
                <div>
                  <Label>Contato</Label>
                  <Input value={buyerContact} onChange={(e) => setBuyerContact(maskPhone(e.target.value))} placeholder="(99)-99999-9999" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-500 uppercase">Produto</h3>
                <div>
                  <Label>Tipo de produto</Label>
                  <Select value={cropTypeId} onChange={(e) => { setCropTypeId(e.target.value); setCropTypeCustom("") }}>
                    <option value="">Selecione...</option>
                    {cropTypes.map((ct) => (
                      <option key={ct.id} value={ct.id}>{ct.name}</option>
                    ))}
                    <option value="__other__">Outro</option>
                  </Select>
                </div>
                {cropTypeId === "__other__" && (
                  <div>
                    <Label>Especifique o produto</Label>
                    <Input value={cropTypeCustom} onChange={(e) => setCropTypeCustom(e.target.value)} required />
                  </div>
                )}
                <div>
                  <Label>Unidade</Label>
                  <Input value={unitType} onChange={(e) => setUnitType(e.target.value)} required placeholder="ex: saco, caixa, kg" />
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>
                <div>
                  <Label>Tamanho da embalagem</Label>
                  <Input value={packagingSize} onChange={(e) => setPackagingSize(e.target.value)} placeholder="ex: 20kg, caixa com 10 und" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-500 uppercase">Financeiro</h3>
                <div>
                  <Label>Preço unitário (R$)</Label>
                  <Input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required />
                </div>
                <div>
                  <Label>Valor total fechado (R$) — opcional</Label>
                  <Input type="number" step="0.01" value={totalClosedValue} onChange={(e) => setTotalClosedValue(e.target.value)} placeholder="Se vazio, calcula automático" />
                </div>
                <div>
                  <Label>Valor total calculado</Label>
                  <p className="text-lg font-semibold text-green-700">{formatCurrency(total)}</p>
                </div>
                <div>
                  <Label>Condição da tonelada</Label>
                  <Input value={tonCondition} onChange={(e) => setTonCondition(e.target.value)} placeholder="ex: à vista no carregamento" />
                </div>
                <div>
                  <Label>Forma de pagamento</Label>
                  <Input value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required />
                </div>
                <div>
                  <Label>Prazo de pagamento</Label>
                  <Input value={paymentTerm} onChange={(e) => setPaymentTerm(e.target.value)} required />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium text-sm text-gray-500 uppercase">Entrega</h3>
                <div>
                  <Label>Data de entrega</Label>
                  <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Salvando..." : "Salvar Rascunho"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
