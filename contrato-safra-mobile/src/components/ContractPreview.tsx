import React, { useState } from "react"
import { Modal, View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from "react-native"
import * as Print from "expo-print"
import { formatCurrency, formatDate } from "../services/calculations"

interface Props {
  contract: any
  children?: React.ReactNode
}

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function buildHtml(c: any): string {
  const cropName = esc(c.crop_types?.name ?? c.crop_type_custom ?? "—")
  const rows = (label: string, value: unknown) => `
    <tr><td class="lbl">${label}</td><td class="val">${esc(value ?? "—")}</td></tr>`
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; padding: 32px; }
  h1 { font-size: 20px; text-align: center; margin: 0; }
  .sub { text-align: center; color: #555; font-size: 12px; margin-bottom: 24px; }
  h2 { font-size: 14px; border-bottom: 1px solid #999; padding-bottom: 4px; margin-top: 20px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 4px 0; font-size: 13px; }
  .lbl { color: #555; width: 45%; }
  .val { font-weight: 600; }
  .note { font-size: 12px; color: #333; text-align: justify; margin-top: 8px; }
  .sign { display: flex; justify-content: space-around; margin-top: 48px; }
  .sign div { text-align: center; border-top: 1px solid #444; padding-top: 6px; width: 220px; font-weight: 600; }
</style>
</head>
<body>
  <h1>CONTRATO DE COMPRA E VENDA</h1>
  <p class="sub">Produtos Agrícolas — Safra</p>

  <h2>1. IDENTIFICAÇÃO DAS PARTES</h2>
  <table>
    ${rows("Vendedor", c.seller_name)}
    ${rows("CPF/CNPJ", c.seller_document)}
    ${rows("Contato", c.seller_contact)}
    ${rows("Comprador", c.buyer_name)}
    ${rows("CPF/CNPJ", c.buyer_document)}
    ${rows("Contato", c.buyer_contact)}
  </table>

  <h2>2. DO PRODUTO</h2>
  <table>
    ${rows("Produto", cropName)}
    ${rows("Unidade", c.unit_type)}
    ${rows("Quantidade", `${c.quantity} ${c.unit_type ?? ""}`.trim())}
    ${rows("Tamanho da embalagem", c.packaging_size)}
  </table>

  <h2>3. DAS CONDIÇÕES FINANCEIRAS</h2>
  <table>
    ${rows("Preço unitário", formatCurrency(c.unit_price))}
    ${rows("Valor total", formatCurrency(c.total_value))}
    ${c.total_closed_value != null ? rows("Valor fechado total", formatCurrency(c.total_closed_value)) : ""}
    ${rows("Condição da tonelada", c.ton_condition)}
    ${rows("Forma de pagamento", c.payment_method)}
    ${rows("Prazo de pagamento", c.payment_term)}
  </table>

  <h2>4. DA ENTREGA</h2>
  <table>${rows("Data de entrega", c.delivery_date ? formatDate(c.delivery_date) : "—")}</table>

  <h2>5. DISPOSIÇÕES GERAIS</h2>
  <p class="note">
    O presente contrato é firmado entre as partes acima identificadas para compra e venda de produtos agrícolas,
    comprometendo-se o vendedor a entregar o produto conforme as especificações e o comprador a efetuar o pagamento
    nas condições estabelecidas. Para validação deste documento, é obrigatório o reconhecimento de firma das
    assinaturas em cartório, conferindo fé pública ao instrumento. A confirmação digital pelo comprador não
    substitui o reconhecimento de firma.
  </p>

  <div class="sign">
    <div>${esc(c.seller_name ?? "Vendedor")}</div>
    <div>${esc(c.buyer_name ?? "Comprador")}</div>
  </div>
  <p style="text-align:center; font-size:11px; color:#777; margin-top:12px;">Assinaturas sujeitas a reconhecimento de firma em cartório.</p>
</body>
</html>`
}

export default function ContractPreview({ contract, children }: Props) {
  const [open, setOpen] = useState(false)
  const [printing, setPrinting] = useState(false)

  async function handlePrint() {
    setPrinting(true)
    try {
      await Print.printAsync({ html: buildHtml(contract) })
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao imprimir")
    }
    setPrinting(false)
  }

  const cropName = contract.crop_types?.name ?? contract.crop_type_custom ?? "—"

  return (
    <>
      {children ? (
        <TouchableOpacity onPress={() => setOpen(true)}>{children}</TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.openBtn} onPress={() => setOpen(true)}>
          <Text style={styles.openBtnText}>Visualizar Contrato</Text>
        </TouchableOpacity>
      )}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Pré-visualização do Contrato</Text>
              <View style={styles.sheetActions}>
                <TouchableOpacity style={styles.printBtn} onPress={handlePrint} disabled={printing}>
                  {printing ? <ActivityIndicator color="#06281E" /> : <Text style={styles.printBtnText}>🖨 Imprimir / PDF</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)}>
                  <Text style={styles.closeBtnText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.docScroll} contentContainerStyle={styles.doc}>
              <View style={styles.docPaper}>
                <Text style={styles.docTitle}>CONTRATO DE COMPRA E VENDA</Text>
                <Text style={styles.docSub}>Produtos Agrícolas — Safra</Text>

                <Text style={styles.docSection}>1. IDENTIFICAÇÃO DAS PARTES</Text>
                <DocRow label="Vendedor" value={contract.seller_name} />
                {contract.seller_document && <DocRow label="CPF/CNPJ" value={contract.seller_document} />}
                {contract.seller_contact && <DocRow label="Contato" value={contract.seller_contact} />}
                <DocRow label="Comprador" value={contract.buyer_name} />
                {contract.buyer_document && <DocRow label="CPF/CNPJ" value={contract.buyer_document} />}
                {contract.buyer_contact && <DocRow label="Contato" value={contract.buyer_contact} />}

                <Text style={styles.docSection}>2. DO PRODUTO</Text>
                <DocRow label="Produto" value={cropName} />
                <DocRow label="Unidade" value={contract.unit_type} />
                <DocRow label="Quantidade" value={String(contract.quantity)} />
                {contract.packaging_size && <DocRow label="Tamanho da embalagem" value={contract.packaging_size} />}

                <Text style={styles.docSection}>3. DAS CONDIÇÕES FINANCEIRAS</Text>
                <DocRow label="Preço unitário" value={formatCurrency(contract.unit_price)} />
                <DocRow label="Valor total" value={formatCurrency(contract.total_value)} />
                {contract.total_closed_value != null && <DocRow label="Valor fechado total" value={formatCurrency(contract.total_closed_value)} />}
                {contract.ton_condition && <DocRow label="Condição da tonelada" value={contract.ton_condition} />}
                <DocRow label="Forma de pagamento" value={contract.payment_method} />
                <DocRow label="Prazo de pagamento" value={contract.payment_term} />

                <Text style={styles.docSection}>4. DA ENTREGA</Text>
                <DocRow label="Data de entrega" value={contract.delivery_date ? formatDate(contract.delivery_date) : "—"} />

                <Text style={styles.docSection}>5. DISPOSIÇÕES GERAIS</Text>
                <Text style={styles.docNote}>
                  O presente contrato é firmado entre as partes acima identificadas para compra e venda de produtos agrícolas,
                  comprometendo-se o vendedor a entregar o produto conforme as especificações e o comprador a efetuar o pagamento
                  nas condições estabelecidas. Para validação deste documento, é obrigatório o reconhecimento de firma das
                  assinaturas em cartório, conferindo fé pública ao instrumento. A confirmação digital pelo comprador não
                  substitui o reconhecimento de firma.
                </Text>

                <View style={styles.signRow}>
                  <View style={styles.signBox}>
                    <Text style={styles.signName}>{contract.seller_name || "Vendedor"}</Text>
                    <Text style={styles.signRole}>Vendedor</Text>
                  </View>
                  <View style={styles.signBox}>
                    <Text style={styles.signName}>{contract.buyer_name || "Comprador"}</Text>
                    <Text style={styles.signRole}>Comprador</Text>
                  </View>
                </View>
                <Text style={styles.docFoot}>Assinaturas sujeitas a reconhecimento de firma em cartório.</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

function DocRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.docRow}>
      <Text style={styles.docRowLabel}>{label}</Text>
      <Text style={styles.docRowValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.8)",
    ...(Platform.OS === "web" ? { backdropFilter: "blur(12px)" } : {}),
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  sheet: {
    width: "100%",
    maxWidth: 760,
    maxHeight: "92%",
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    overflow: "hidden",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.15)",
    flexWrap: "wrap",
    gap: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "600", color: "#F1F5F9" },
  sheetActions: { flexDirection: "row", gap: 8 },
  printBtn: { backgroundColor: "#10B981", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  printBtnText: { color: "#06281E", fontSize: 13, fontWeight: "700" },
  closeBtn: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.3)" },
  closeBtnText: { color: "#CBD5E1", fontSize: 13, fontWeight: "600" },
  docScroll: { flexGrow: 0 },
  doc: { padding: 20 },
  docPaper: { backgroundColor: "#FFFFFF", borderRadius: 12, padding: 24 },
  docTitle: { fontSize: 18, fontWeight: "700", textAlign: "center", color: "#111" },
  docSub: { fontSize: 12, textAlign: "center", color: "#555", marginBottom: 16 },
  docSection: { fontSize: 13, fontWeight: "700", color: "#222", borderBottomWidth: 1, borderBottomColor: "#CCC", paddingBottom: 4, marginTop: 16, marginBottom: 8 },
  docRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  docRowLabel: { fontSize: 13, color: "#555" },
  docRowValue: { fontSize: 13, fontWeight: "600", color: "#111" },
  docNote: { fontSize: 12, color: "#333", textAlign: "justify", marginTop: 8 },
  signRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 40 },
  signBox: { borderTopWidth: 1, borderTopColor: "#444", paddingTop: 6, alignItems: "center", width: 160 },
  signName: { fontSize: 13, fontWeight: "600", color: "#111" },
  signRole: { fontSize: 11, color: "#555" },
  docFoot: { fontSize: 11, color: "#777", textAlign: "center", marginTop: 12 },
  openBtn: { borderRadius: 10, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.05)" },
  openBtnText: { color: "#E2E8F0", fontSize: 15, fontWeight: "600" },
})