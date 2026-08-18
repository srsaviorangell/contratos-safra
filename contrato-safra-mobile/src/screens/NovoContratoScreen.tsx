import React, { useEffect, useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native"
import { api } from "../services/api"
import { formatCurrency, formatDate } from "../services/calculations"
import { maskDocument, maskPhone } from "../services/masks"
import { useAuth } from "../contexts/AuthContext"
import OptionModal from "../components/OptionModal"
import CalendarModal from "../components/CalendarModal"

interface CropType { id: string; name: string; default_unit: string }

const TABS = ["Vendedor", "Comprador", "Cultura", "Qtd", "Valor", "Pagamento", "Revisão"]

const UNITS = ["Saco", "Caixa", "kg", "Tonelada", "Fardo", "Bolsa", "Lata", "Dúzia", "Unidade"]

const PAYMENT_METHODS = ["À vista", "Parcelado", "Cheque", "Depósito", "Pix"]

export default function NovoContratoScreen({ navigation }: any) {
  const { user } = useAuth()
  const [tab, setTab] = useState(0)
  const [cropTypes, setCropTypes] = useState<CropType[]>([])
  const [picker, setPicker] = useState<null | "cultura" | "unidade" | "pagamento">(null)
  const [dateModal, setDateModal] = useState(false)
  const [form, setForm] = useState({
    seller_name: "", seller_document: "", seller_contact: "",
    buyer_name: "", buyer_document: "", buyer_contact: "",
    crop_type_id: "", crop_type_custom: "", unit_type: "", quantity: "",
    unit_price: "", payment_method: "", payment_term: "", delivery_date: "",
  })
  const [loading, setLoading] = useState(false)
  const [cropsLoading, setCropsLoading] = useState(true)

  useEffect(() => {
    api.cropTypes.list().then((data) => { setCropTypes(data); setCropsLoading(false) }).catch(() => setCropsLoading(false))
    setForm((prev) => ({ ...prev, seller_name: prev.seller_name || user?.full_name || "" }))
  }, [])

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const selectedCrop = cropTypes.find((c) => c.id === form.crop_type_id)
  const cropLabel = form.crop_type_id === "outra" ? "Outra" : selectedCrop?.name
  const unitLabel = form.unit_type && form.unit_type !== "outra_unidade" ? form.unit_type : "Outra"
  const payLabel = form.payment_method && form.payment_method !== "outra_pagamento" ? form.payment_method : "Outra"
  const qty = parseFloat(form.quantity) || 0
  const price = parseFloat(form.unit_price) || 0
  const total = qty * price

  async function handleSubmit() {
    if (!form.seller_name) { Alert.alert("Erro", "Nome do vendedor é obrigatório"); setTab(0); return }
    if (!form.buyer_name) { Alert.alert("Erro", "Nome do comprador é obrigatório"); setTab(1); return }
    setLoading(true)
    try {
      await api.contracts.create({
        seller_name: form.seller_name,
        seller_document: form.seller_document || null,
        seller_contact: form.seller_contact || null,
        crop_type_id: form.crop_type_id || null,
        crop_type_custom: form.crop_type_custom || null,
        unit_type: form.unit_type || selectedCrop?.default_unit || "",
        quantity: qty, unit_price: price, total_value: total,
        payment_method: form.payment_method, payment_term: form.payment_term,
        delivery_date: form.delivery_date || null,
        buyer_name: form.buyer_name, buyer_document: form.buyer_document || null,
        buyer_contact: form.buyer_contact || null,
      })
      Alert.alert("Sucesso", "Contrato criado!")
      navigation.goBack()
    } catch (err: any) { Alert.alert("Erro", err.message || "Falha ao criar") }
    setLoading(false)
  }

  function renderTab() {
    switch (tab) {
      case 0:
        return (
          <View>
            <Text style={styles.sectionTitle}>Quem vende</Text>
            <Text style={styles.partsHint}>Deixe em branco se o vendedor é você mesmo</Text>
            <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor="#64748B" value={form.seller_name} onChangeText={(v) => update("seller_name", v)} />
            <TextInput style={styles.input} placeholder="Documento (opcional)" placeholderTextColor="#64748B" value={form.seller_document} onChangeText={(v) => update("seller_document", maskDocument(v))} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Contato (opcional)" placeholderTextColor="#64748B" value={form.seller_contact} onChangeText={(v) => update("seller_contact", maskPhone(v))} keyboardType="phone-pad" />
          </View>
        )
      case 1:
        return (
          <View>
            <Text style={styles.sectionTitle}>Quem compra</Text>
            <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor="#64748B" value={form.buyer_name} onChangeText={(v) => update("buyer_name", v)} />
            <TextInput style={styles.input} placeholder="Documento (opcional)" placeholderTextColor="#64748B" value={form.buyer_document} onChangeText={(v) => update("buyer_document", maskDocument(v))} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Contato (opcional)" placeholderTextColor="#64748B" value={form.buyer_contact} onChangeText={(v) => update("buyer_contact", maskPhone(v))} keyboardType="phone-pad" />
          </View>
        )
      case 2:
        return (
          <View>
            <Text style={styles.sectionTitle}>Cultura</Text>
            <TouchableOpacity style={styles.selectCard} onPress={() => setPicker("cultura")}>
              <Text style={[styles.selectText, !cropLabel && { color: "#64748B" }]}>
                {cropLabel || "Selecione a cultura"}
              </Text>
              <Text style={styles.selectChevron}>▼</Text>
            </TouchableOpacity>
            {form.crop_type_id === "outra" && (
              <View>
                <TextInput style={styles.input} placeholder="Digite a cultura" placeholderTextColor="#64748B" value={form.crop_type_custom} onChangeText={(v) => update("crop_type_custom", v)} />
                <Text style={styles.hint}>Escreva o nome da cultura que deseja registrar.</Text>
              </View>
            )}
          </View>
        )
      case 3:
        return (
          <View>
            <Text style={styles.sectionTitle}>Quantidade e Unidade</Text>
            <TouchableOpacity style={styles.selectCard} onPress={() => setPicker("unidade")}>
              <Text style={[styles.selectText, !unitLabel && { color: "#64748B" }]}>
                {unitLabel || "Selecione a unidade"}
              </Text>
              <Text style={styles.selectChevron}>▼</Text>
            </TouchableOpacity>
            {form.unit_type === "outra_unidade" && (
              <TextInput style={styles.input} placeholder="Digite a unidade" placeholderTextColor="#64748B" value="" onChangeText={(v) => update("unit_type", v)} />
            )}
            {selectedCrop && form.unit_type === "" && (
              <Text style={styles.hint}>Sugerido: {selectedCrop.default_unit} — toque acima para escolher ou digitar</Text>
            )}
            <TextInput style={styles.input} placeholder="Quantidade" placeholderTextColor="#64748B" value={form.quantity} onChangeText={(v) => update("quantity", v)} keyboardType="decimal-pad" />
          </View>
        )
      case 4:
        return (
          <View>
            <Text style={styles.sectionTitle}>Valor</Text>
            <TextInput style={styles.input} placeholder="Valor por unidade (R$)" placeholderTextColor="#64748B" value={form.unit_price} onChangeText={(v) => update("unit_price", v)} keyboardType="decimal-pad" />
            {total > 0 && (
              <View style={styles.totalBox}>
                <Text style={styles.totalLabel}>Valor total</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                <Text style={styles.totalDetail}>{qty} un × R$ {price.toFixed(2)}</Text>
              </View>
            )}
          </View>
        )
      case 5:
        return (
          <View>
            <Text style={styles.sectionTitle}>Pagamento e Prazo</Text>
            <TouchableOpacity style={styles.selectCard} onPress={() => setPicker("pagamento")}>
              <Text style={[styles.selectText, !form.payment_method && { color: "#64748B" }]}>
                {form.payment_method ? payLabel : "Selecione a forma de pagamento"}
              </Text>
              <Text style={styles.selectChevron}>▼</Text>
            </TouchableOpacity>
            {form.payment_method === "outra_pagamento" && (
              <TextInput style={styles.input} placeholder="Digite a forma de pagamento" placeholderTextColor="#64748B" value="" onChangeText={(v) => update("payment_method", v)} />
            )}
            <TextInput style={[styles.input, { marginTop: 12 }]} placeholder="Prazo de pagamento (ex: 30 dias, à vista no carregamento)" placeholderTextColor="#64748B" value={form.payment_term} onChangeText={(v) => update("payment_term", v)} />

            <Text style={styles.sectionTitle}>Entrega</Text>
            <TouchableOpacity style={styles.selectCard} onPress={() => setDateModal(true)}>
              <Text style={[styles.selectText, styles.dateText, !form.delivery_date && { color: "#64748B" }]}>
                {form.delivery_date ? `📅 ${formatDate(form.delivery_date)}` : "📅 Escolher data de entrega (opcional)"}
              </Text>
              <Text style={styles.selectChevron}>►</Text>
            </TouchableOpacity>
            {form.delivery_date && (
              <TouchableOpacity onPress={() => update("delivery_date", "")}>
                <Text style={styles.clearDate}>Limpar data de entrega</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.scrollHint}>⇣ Role para mais conteúdo</Text>
          </View>
        )
      case 6:
        return (
          <View>
            <Text style={styles.sectionTitle}>Revisão</Text>
            <View style={styles.reviewBox}>
              <ReviewRow label="Vendedor" value={form.seller_name} />
              <ReviewRow label="Comprador" value={form.buyer_name} />
              <ReviewRow label="Cultura" value={selectedCrop?.name ?? form.crop_type_custom ?? "—"} />
              <ReviewRow label="Unidade" value={form.unit_type || selectedCrop?.default_unit || "—"} />
              <ReviewRow label="Quantidade" value={form.quantity || "—"} />
              <ReviewRow label="Valor unit." value={form.unit_price ? formatCurrency(price) : "—"} />
              <ReviewRow label="Valor total" value={total > 0 ? formatCurrency(total) : "—"} highlight />
              <ReviewRow label="Pagamento" value={form.payment_method || "—"} />
              <ReviewRow label="Prazo" value={form.payment_term || "—"} />
              <ReviewRow label="Entrega" value={form.delivery_date ? formatDate(form.delivery_date) : "—"} />
            </View>
          </View>
        )
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#0B1220" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} nestedScrollEnabled keyboardShouldPersistTaps="handled">
        <View style={styles.stepHeader}>
          {tab > 0 ? (
            <TouchableOpacity onPress={() => setTab(tab - 1)} style={[styles.backRow, { marginBottom: 0 }]}>
              <Text style={styles.backArrow}>←</Text>
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.backArrow}>📄</Text>
          )}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${((tab + 1) / TABS.length) * 100}%` }]} />
          </View>
        </View>
        <Text style={styles.title}>{TABS[tab]}</Text>
        <Text style={styles.subtitle}>Passo {tab + 1} de {TABS.length}</Text>

        <View style={styles.tabContent}>{renderTab()}</View>

        <View style={styles.footer}>
          <TouchableOpacity disabled={tab === 0} onPress={() => setTab(tab - 1)} style={[styles.footerBtn, tab === 0 && styles.footerBtnDisabled]}>
            <Text style={styles.footerBtnText}>← Voltar</Text>
          </TouchableOpacity>
          {tab === TABS.length - 1 ? (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Criar Contrato</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setTab(tab + 1)}>
              <Text style={styles.primaryBtnText}>Próximo →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <OptionModal
        visible={picker === "cultura"}
        title="Escolha a cultura"
        options={cropsLoading ? [] : cropTypes.map((c) => c.name)}
        selected={selectedCrop?.name ?? ""}
        extraLabel="Outra (digitar)"
        extraValue="outra"
        onSelect={(v) => {
          if (v === "outra") {
            update("crop_type_id", "outra")
            update("crop_type_custom", "")
          } else {
            const crop = cropTypes.find((c) => c.name === v)
            if (crop) {
              update("crop_type_id", crop.id)
              update("crop_type_custom", "")
              update("unit_type", crop.default_unit)
            }
          }
          setPicker(null)
        }}
        onClose={() => setPicker(null)}
      />

      <OptionModal
        visible={picker === "unidade"}
        title="Escolha a unidade"
        options={UNITS}
        selected={form.unit_type === "outra_unidade" ? "Outra (digitar)" : form.unit_type}
        extraLabel="Outra (digitar)"
        extraValue="outra_unidade"
        onSelect={(v) => {
          if (v === "outra_unidade") update("unit_type", "outra_unidade")
          else update("unit_type", v)
          setPicker(null)
        }}
        onClose={() => setPicker(null)}
      />

      <OptionModal
        visible={picker === "pagamento"}
        title="Escolha a forma de pagamento"
        options={PAYMENT_METHODS}
        selected={form.payment_method === "outra_pagamento" ? "Outra (digitar)" : form.payment_method}
        extraLabel="Outra (digitar)"
        extraValue="outra_pagamento"
        onSelect={(v) => {
          if (v === "outra_pagamento") update("payment_method", "outra_pagamento")
          else update("payment_method", v)
          setPicker(null)
        }}
        onClose={() => setPicker(null)}
      />

      <CalendarModal
        visible={dateModal}
        selected={form.delivery_date}
        onSelect={(d) => { update("delivery_date", d); setDateModal(false) }}
        onClose={() => setDateModal(false)}
      />
    </KeyboardAvoidingView>
  )
}

function ReviewRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.reviewRow}>
      <Text style={styles.reviewLabel}>{label}</Text>
      <Text style={[styles.reviewValue, highlight && { color: "#34D399", fontWeight: "700" }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  content: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "600", color: "#F1F5F9", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#94A3B8", marginBottom: 20 },
  stepHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: "rgba(148, 163, 184, 0.2)", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: "#10B981" },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 },
  backArrow: { fontSize: 20, color: "#94A3B8" },
  backText: { fontSize: 14, color: "#94A3B8" },
  tabContent: {},
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#F1F5F9", marginBottom: 16 },
  partsHint: { fontSize: 12, color: "#94A3B8", marginTop: -12, marginBottom: 12 },
  selectCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.2)",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    marginBottom: 12,
    ...(Platform.OS === "web" ? { backdropFilter: "blur(10px)" } : {}),
  },
  selectText: { fontSize: 16, color: "#E2E8F0" },
  selectChevron: { fontSize: 12, color: "#94A3B8" },
  dateText: { flexShrink: 1, marginRight: 8 },
  input: { borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.25)", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, backgroundColor: "rgba(255, 255, 255, 0.06)", color: "#F1F5F9" },
  hint: { fontSize: 12, color: "#94A3B8", marginTop: -8, marginBottom: 12 },
  totalBox: { backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "rgba(16, 185, 129, 0.3)" },
  totalLabel: { fontSize: 14, color: "#94A3B8" },
  totalValue: { fontSize: 28, fontWeight: "700", color: "#34D399", marginTop: 4 },
  totalDetail: { fontSize: 12, color: "#64748B", marginTop: 4 },
  clearDate: { fontSize: 13, color: "#F87171", marginTop: 8, textAlign: "center" },
  scrollHint: { fontSize: 12, color: "#475569", textAlign: "center", marginTop: 24, marginBottom: 8 },
  reviewBox: { backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.15)" },
  reviewRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "rgba(148, 163, 184, 0.12)" },
  reviewLabel: { fontSize: 14, color: "#94A3B8" },
  reviewValue: { fontSize: 14, color: "#E2E8F0", fontWeight: "500" },
  footer: { flexDirection: "row", justifyContent: "space-between", marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(148, 163, 184, 0.15)", gap: 12 },
  footerBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.25)", backgroundColor: "rgba(255, 255, 255, 0.05)" },
  footerBtnDisabled: { opacity: 0.4 },
  footerBtnText: { fontSize: 14, color: "#E2E8F0" },
  primaryBtn: { backgroundColor: "#10B981", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, minWidth: 120, alignItems: "center" },
  primaryBtnText: { color: "#06281E", fontSize: 14, fontWeight: "700" },
})