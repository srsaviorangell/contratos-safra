import React, { useEffect, useState, useCallback } from "react"
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from "react-native"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../services/api"
import { formatCurrency, formatDate } from "../services/calculations"

const statusColors: Record<string, string> = {
  rascunho: "#71717A",
  aguardando_confirmacao: "#16A34A",
  confirmado: "#15803D",
  divergencia: "#DC2626",
  expirado: "#A1A1AA",
}

const statusLabels: Record<string, string> = {
  rascunho: "Rascunho",
  aguardando_confirmacao: "Aguardando",
  confirmado: "Confirmado",
  divergencia: "Divergência",
  expirado: "Expirado",
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth()
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await api.contracts.list()
      setContracts(data)
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { load() }, [load])

  function onRefresh() {
    setRefreshing(true)
    load()
  }

  async function handleLogout() {
    await api.auth.signOut()
    navigation.reset({ index: 0, routes: [{ name: "Login" }] })
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, {user?.full_name?.split(" ")[0] ?? "Vendedor"}</Text>
          <Text style={styles.count}>{contracts.length} contrato(s)</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate("NovoContrato")}>
          <Text style={styles.newButtonText}>+ Novo Contrato</Text>
        </TouchableOpacity>
      </View>

      {contracts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyTitle}>Nenhum contrato</Text>
          <Text style={styles.emptySub}>Crie seu primeiro contrato de safra.</Text>
        </View>
      ) : (
        <FlatList
          data={contracts}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16A34A" />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("ContratoDetail", { id: item.id })}>
              <View style={styles.cardHeader}>
                <Text style={styles.buyerName} numberOfLines={1}>{item.buyer_name}</Text>
                <View style={[styles.badge, { backgroundColor: statusColors[item.status] || "#71717A" }]}>
                  <Text style={styles.badgeText}>{statusLabels[item.status] || item.status}</Text>
                </View>
              </View>
              <Text style={styles.cardSub}>{item.crop_types?.name ?? item.crop_type_custom ?? "—"} · {item.quantity} {item.unit_type}</Text>
              <Text style={styles.cardValue}>{formatCurrency(item.total_value)}</Text>
              <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "rgba(148, 163, 184, 0.15)" },
  greeting: { fontSize: 22, fontWeight: "600", color: "#F1F5F9" },
  count: { fontSize: 14, color: "#94A3B8", marginTop: 2 },
  logoutBtn: { padding: 8 },
  logoutText: { color: "#F87171", fontSize: 14 },
  actions: { padding: 24, paddingBottom: 12 },
  newButton: { backgroundColor: "#10B981", borderRadius: 12, padding: 16, alignItems: "center" },
  newButtonText: { color: "#06281E", fontSize: 16, fontWeight: "700" },
  list: { padding: 24, paddingTop: 12 },
  card: { borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.2)", borderRadius: 12, padding: 16, marginBottom: 12, backgroundColor: "rgba(255, 255, 255, 0.05)" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  buyerName: { fontSize: 16, fontWeight: "600", color: "#F1F5F9", flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  cardSub: { fontSize: 14, color: "#94A3B8", marginTop: 6 },
  cardValue: { fontSize: 18, fontWeight: "700", color: "#34D399", marginTop: 4 },
  cardDate: { fontSize: 12, color: "#64748B", marginTop: 2 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#F1F5F9" },
  emptySub: { fontSize: 14, color: "#94A3B8", marginTop: 4 },
})
