import { useState } from "react"
import type { StoredContract } from "../lib/store"
import { formatCurrency, formatDate } from "../lib/calculations"
import { Button } from "./ui/button"

interface Props {
  contract: StoredContract & { crop_types?: { name: string } | null }
}

export default function ContractPreview({ contract }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Visualizar Contrato</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative print:shadow-none print:max-h-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between print:hidden">
              <h2 className="font-semibold">Pré-visualização do Contrato</h2>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => window.print()}>Imprimir / PDF</Button>
                <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
              </div>
            </div>

            <div className="p-8 relative">
              {contract.status !== "confirmado" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                  <span className="text-8xl font-bold text-red-200/50 -rotate-30">RASCUNHO</span>
                </div>
              )}

              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">CONTRATO DE COMPRA E VENDA</h1>
                <p className="text-sm text-gray-500">Produtos Agrícolas</p>
              </div>

              <div className="space-y-6">
                <section>
                  <h2 className="font-semibold text-lg border-b pb-1 mb-3">1. IDENTIFICAÇÃO DAS PARTES</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Vendedor</p>
                      <p className="font-medium">{contract.seller_name}</p>
                    </div>
                    {contract.seller_document && (
                      <div>
                        <p className="text-sm text-gray-500">CPF/CNPJ</p>
                        <p className="font-medium">{contract.seller_document}</p>
                      </div>
                    )}
                    {contract.seller_contact && (
                      <div>
                        <p className="text-sm text-gray-500">Contato</p>
                        <p className="font-medium">{contract.seller_contact}</p>
                      </div>
                    )}
                  </div>
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
                  </div>
                </section>

                <section>
                  <h2 className="font-semibold text-lg border-b pb-1 mb-3">2. DO PRODUTO</h2>
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                </section>

                <section>
                  <h2 className="font-semibold text-lg border-b pb-1 mb-3">3. DAS CONDIÇÕES FINANCEIRAS</h2>
                  <div className="grid grid-cols-2 gap-4">
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
                      <p className="text-sm text-gray-500">Forma de pagamento</p>
                      <p className="font-medium">{contract.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Prazo de pagamento</p>
                      <p className="font-medium">{contract.payment_term}</p>
                    </div>
                  </div>
                </section>

                {contract.delivery_date && (
                  <section>
                    <h2 className="font-semibold text-lg border-b pb-1 mb-3">4. DA ENTREGA</h2>
                    <p>Data de entrega: <strong>{formatDate(contract.delivery_date)}</strong></p>
                  </section>
                )}

                <section>
                  <h2 className="font-semibold text-lg border-b pb-1 mb-3">5. DISPOSIÇÕES GERAIS</h2>
                  <p className="text-sm text-gray-600">
                    O presente contrato é firmado entre as partes acima identificadas para compra e venda de produtos agrícolas,
                    comprometendo-se o vendedor a entregar o produto conforme as especificações e o comprador a efetuar o pagamento
                    nas condições estabelecidas. Para validação deste documento, é obrigatório o reconhecimento de firma das
                    assinaturas em cartório, conferindo fé pública ao instrumento. A confirmação digital pelo comprador não
                    substitui o reconhecimento de firma.
                  </p>
                </section>

                <div className="pt-8 flex justify-around">
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 px-12">
                      <p className="font-medium">{contract.seller_name}</p>
                      <p className="text-sm text-gray-500">Vendedor</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-gray-400 pt-2 px-12">
                      <p className="font-medium">{contract.buyer_name}</p>
                      <p className="text-sm text-gray-500">Comprador</p>
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs text-gray-400 mt-4">
                  <p>Assinaturas sujeitas a reconhecimento de firma em cartório.</p>
                </div>

                {contract.confirmed_at && (
                  <div className="text-center text-sm text-green-600 mt-4">
                    <p>Contrato confirmado em {formatDate(contract.confirmed_at)}</p>
                  </div>
                )}

                {contract.created_at && (
                  <div className="text-center text-xs text-gray-400 mt-4">
                    <p>Emitido em {formatDate(contract.created_at)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
