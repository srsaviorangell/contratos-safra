import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Share } from "react-native"
import { api } from "../services/api"
import { formatCurrency, formatDate } from "../services/calculations"
import ContractPreview from "../components/ContractPreview"

const statusColors: Record<string, string> = {
  rascunho: "#71717A", aguardando_confirmacao: "#16A34A", confirmado: "#15803D", divergencia: "#DC2626", expirado: "#A1A1AA",
}

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho", aguardando_confirmacao: "Aguardando", confirmado: "Confirmado", divergencia: "Divergência", expirado: "Expirado",
}

export default function ContratoDetailScreen({ route, navigation }: any) {
  const { id } = route.params
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    api.contracts.get(id).then(setContract).catch(() => Alert.alert("Erro", "Não foi possível carregar")).finally(() => setLoading(false))
  }, [id])

  async function handleSend() {
    setSending(true)
    try {
      const result = await api.contracts.send(contract.id)
      setContract((prev: any) => ({ ...prev, status: "aguardando_confirmacao", confirmation_token: result.token, confirmation_expires_at: result.expiresAt }))
      Alert.alert("Link gerado!", "Compartilhe o link com o comprador.")
    } catch (err: any) { Alert.alert("Erro", err.message || "Falha ao gerar link") }
    setSending(false)
  }

  async function handleShare() {
    if (!contract?.confirmation_token) return
    const link = `http://localhost:3000/confirmar/${contract.confirmation_token}`
    await Share.share({ message: `Confirme os dados do contrato: ${link}` })
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#16A34A" /></View>
  }

  if (!contract) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#94A3B8" }}>Contrato não encontrado</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.back}>← Histórico</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.buyerName}>{contract.buyer_name}</Text>
        <View style={[styles.badge, { backgroundColor: statusColors[contract.status] || "#71717A" }]}>
          <Text style={styles.badgeText}>{statusLabels[contract.status] || contract.status}</Text>
        </View>
      </View>
      <Text style={styles.date}>Criado em {formatDate(contract.created_at)}</Text>

      <View style={styles.card}>
        <Section title="Comprador">
          <Row label="Nome" value={contract.buyer_name} />
          {contract.buyer_document && <Row label="Documento" value={contract.buyer_document} />}
          {contract.buyer_contact && <Row label="Contato" value={contract.buyer_contact} />}
        </Section>
        <Section title="Cultura">
          <Row label="Tipo" value={contract.crop_types?.name ?? contract.crop_type_custom ?? "—"} />
          <Row label="Unidade" value={contract.unit_type} />
          <Row label="Quantidade" value={String(contract.quantity)} />
        </Section>
        <Section title="Valor">
          <Row label="Valor por unidade" value={formatCurrency(contract.unit_price)} />
          <Row label="Valor total" value={formatCurrency(contract.total_value)} highlight />
        </Section>
        <Section title="Pagamento">
          <Row label="Forma" value={contract.payment_method} />
          <Row label="Prazo" value={contract.payment_term} />
          {contract.delivery_date && <Row label="Data entrega" value={formatDate(contract.delivery_date)} />}
        </Section>
      </View>

      {contract.divergence_note && (
        <View style={styles.divergenceBox}>
          <Text style={styles.divergenceTitle}>⚠ Observação do comprador</Text>
          <Text style={styles.divergenceText}>{contract.divergence_note}</Text>
        </View>
      )}

      <View style={styles.actions}>
        <ContractPreview contract={contract}>
          <View style={styles.previewButton}>
            <Text style={styles.previewButtonText}>👁 Visualizar Contrato</Text>
          </View>
        </ContractPreview>
        {contract.status === "rascunho" && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleSend} disabled={sending}>
            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Gerar link para comprador</Text>}
          </TouchableOpacity>
        )}
        {contract.status === "aguardando_confirmacao" && (
          <>
            <TouchableOpacity style={styles.primaryButton} onPress={handleShare}>
              <Text style={styles.primaryButtonText}>Compartilhar link</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={handleSend}>
              <Text style={styles.outlineButtonText}>Gerar novo link</Text>
            </TouchableOpacity>
          </>
        )}
        {contract.status === "divergencia" && (
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("NovoContrato")}>
            <Text style={styles.primaryButtonText}>Criar nova versão</Text>
          </TouchableOpacity>
        )}
        {contract.status === "expirado" && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleSend} disabled={sending}>
            {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Gerar novo link</Text>}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 12, fontWeight: "600", color: "#94A3B8", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>{title}</Text>
      {children}
    </View>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
      <Text style={{ fontSize: 14, color: "#94A3B8" }}>{label}</Text>
      <Text style={[styles.rowValue, highlight && { color: "#34D399", fontWeight: "700" }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  content: { padding: 24, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B1220" },
  back: { fontSize: 14, color: "#94A3B8", marginBottom: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  buyerName: { fontSize: 22, fontWeight: "600", color: "#F1F5F9", flex: 1, marginRight: 12 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  badgeText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  date: { fontSize: 14, color: "#94A3B8", marginTop: 4, marginBottom: 24 },
  card: { backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.2)", marginBottom: 16 },
  rowValue: { fontSize: 14, color: "#F1F5F9", fontWeight: "500" },
  divergenceBox: { backgroundColor: "rgba(220, 38, 38, 0.12)", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "rgba(248, 113, 113, 0.4)", marginBottom: 16 },
  divergenceTitle: { fontSize: 14, fontWeight: "600", color: "#F87171", marginBottom: 8 },
  divergenceText: { fontSize: 14, color: "#FECACA" },
  actions: { gap: 12 },
  primaryButton: { backgroundColor: "#10B981", borderRadius: 12, padding: 16, alignItems: "center" },
  primaryButtonText: { color: "#06281E", fontSize: 16, fontWeight: "700" },
  outlineButton: { borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.05)" },
  outlineButtonText: { color: "#E2E8F0", fontSize: 16, fontWeight: "500" },
  previewButton: { borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.3)", backgroundColor: "rgba(255, 255, 255, 0.05)" },
  previewButtonText: { color: "#E2E8F0", fontSize: 15, fontWeight: "600" },
})
