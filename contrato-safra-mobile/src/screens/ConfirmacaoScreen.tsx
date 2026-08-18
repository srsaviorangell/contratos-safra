import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, TextInput } from "react-native"
import { api } from "../services/api"
import { formatCurrency, formatDate } from "../services/calculations"

export default function ConfirmacaoScreen({ route }: any) {
  const { token } = route.params
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"view" | "divergence">("view")
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.public.getContract(token).then(setContract).catch((err) => setError(err.message || "Link inválido")).finally(() => setLoading(false))
  }, [token])

  async function handleConfirm() {
    setSubmitting(true)
    try {
      await api.public.confirm(token)
      setContract((prev: any) => ({ ...prev, status: "confirmado" }))
      Alert.alert("Contrato confirmado!", "Os dados foram confirmados com sucesso.")
    } catch { Alert.alert("Erro", "Falha ao confirmar") }
    setSubmitting(false)
  }

  async function handleDivergence() {
    if (!note.trim()) { Alert.alert("Erro", "Descreva o problema"); return }
    setSubmitting(true)
    try {
      await api.public.divergence(token, note)
      setContract((prev: any) => ({ ...prev, status: "divergencia" }))
      Alert.alert("Registrado", "O vendedor foi informado.")
    } catch { Alert.alert("Erro", "Falha ao registrar") }
    setSubmitting(false)
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#16A34A" /></View>
  }

  if (error || !contract) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 48, marginBottom: 12 }}>📄</Text>
        <Text style={styles.errorTitle}>Link inválido</Text>
        <Text style={styles.errorText}>{error || "Contrato não encontrado"}</Text>
      </View>
    )
  }

  if (contract.status === "confirmado") {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>✅</Text>
        <Text style={{ fontSize: 22, fontWeight: "600", color: "#F1F5F9" }}>Contrato confirmado!</Text>
        <Text style={{ color: "#94A3B8", marginTop: 8, textAlign: "center" }}>Os dados foram confirmados.</Text>
      </View>
    )
  }

  if (contract.status === "divergencia") {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 64, marginBottom: 16 }}>⚠️</Text>
        <Text style={{ fontSize: 22, fontWeight: "600", color: "#F1F5F9" }}>Divergência registrada</Text>
        <Text style={{ color: "#94A3B8", marginTop: 8, textAlign: "center" }}>O vendedor foi informado.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Confirmação de Contrato</Text>
      <Text style={styles.subtitle}>Revise os dados e confirme se está tudo correto.</Text>

      <View style={styles.card}>
        <Row label="Comprador" value={contract.buyer_name} />
        {contract.buyer_document && <Row label="Documento" value={contract.buyer_document} />}
        <Divider />
        <Row label="Cultura" value={contract.crop_types?.name ?? contract.crop_type_custom ?? "—"} />
        <Row label="Unidade" value={contract.unit_type} />
        <Row label="Quantidade" value={String(contract.quantity)} />
        <Divider />
        <Row label="Valor por unidade" value={formatCurrency(contract.unit_price)} />
        <Row label="Valor total" value={formatCurrency(contract.total_value)} highlight />
        <Divider />
        <Row label="Pagamento" value={contract.payment_method} />
        <Row label="Prazo" value={contract.payment_term} />
        {contract.delivery_date && <Row label="Data entrega" value={formatDate(contract.delivery_date)} />}
      </View>

      {mode === "divergence" ? (
        <View>
          <Text style={{ fontWeight: "600", marginBottom: 8, color: "#F1F5F9" }}>Descreva o que está errado:</Text>
          <TextInput style={styles.textarea} placeholder="Explique o problema..." placeholderTextColor="#64748B" value={note} onChangeText={setNote} multiline numberOfLines={4} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity style={[styles.outlineBtn, { flex: 1 }]} onPress={() => { setMode("view"); setNote("") }}>
              <Text style={styles.outlineBtnText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.dangerBtn, { flex: 1 }]} onPress={handleDivergence} disabled={submitting || !note.trim()}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.dangerBtnText}>Enviar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={{ gap: 8 }}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Confirmar dados</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.divergenceBtn} onPress={() => setMode("divergence")} disabled={submitting}>
            <Text style={styles.divergenceBtnText}>Isso está errado</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && { color: "#16A34A", fontWeight: "700" }]}>{value}</Text>
    </View>
  )
}

function Divider() { return <View style={{ height: 1, backgroundColor: "#E4E4E7", marginVertical: 8 }} /> }

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  content: { padding: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#0B1220" },
  title: { fontSize: 22, fontWeight: "600", color: "#F1F5F9", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#94A3B8", textAlign: "center", marginTop: 4, marginBottom: 24 },
  card: { backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.2)", marginBottom: 24 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  rowLabel: { fontSize: 14, color: "#94A3B8" },
  rowValue: { fontSize: 14, color: "#F1F5F9", fontWeight: "500" },
  errorTitle: { fontSize: 18, fontWeight: "600", color: "#F1F5F9", marginTop: 12 },
  errorText: { fontSize: 14, color: "#94A3B8", marginTop: 8, textAlign: "center" },
  textarea: { borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.25)", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, backgroundColor: "rgba(255, 255, 255, 0.06)", color: "#F1F5F9", minHeight: 100, textAlignVertical: "top" },
  confirmBtn: { backgroundColor: "#10B981", borderRadius: 12, padding: 16, alignItems: "center" },
  confirmBtnText: { color: "#06281E", fontSize: 16, fontWeight: "700" },
  divergenceBtn: { borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(248, 113, 113, 0.6)" },
  divergenceBtnText: { color: "#F87171", fontSize: 16, fontWeight: "600" },
  outlineBtn: { borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.3)" },
  outlineBtnText: { color: "#E2E8F0", fontSize: 14, fontWeight: "500" },
  dangerBtn: { backgroundColor: "#DC2626", borderRadius: 12, padding: 16, alignItems: "center" },
  dangerBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
})
