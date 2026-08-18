import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from "react-native"
import { api } from "../services/api"
import { maskPhone } from "../services/masks"

export default function CadastroScreen({ navigation }: any) {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" })
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleCadastro() {
    if (!form.fullName || !form.email || !form.phone || !form.password) {
      Alert.alert("Erro", "Preencha todos os campos")
      return
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert("Erro", "Senhas não conferem")
      return
    }
    setLoading(true)
    try {
      await api.auth.signUp({ email: form.email, password: form.password, fullName: form.fullName, phone: form.phone })
      Alert.alert("Conta criada!", "Faça login para continuar.")
      navigation.navigate("Login")
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao criar conta")
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>📄</Text>
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>Comece a gerenciar seus contratos</Text>

        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.backLink}>
          <Text style={styles.link}>← Voltar</Text>
        </TouchableOpacity>

        <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor="#64748B" value={form.fullName} onChangeText={(v) => update("fullName", v)} />
        <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#64748B" value={form.email} onChangeText={(v) => update("email", v)} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Telefone (WhatsApp)" placeholderTextColor="#64748B" value={form.phone} onChangeText={(v) => update("phone", maskPhone(v))} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#64748B" value={form.password} onChangeText={(v) => update("password", v)} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirmar senha" placeholderTextColor="#64748B" value={form.confirmPassword} onChangeText={(v) => update("confirmPassword", v)} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
          {loading ? <ActivityIndicator color="#06281E" /> : <Text style={styles.buttonText}>Criar conta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Já tem conta? Entrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  content: { padding: 24, paddingTop: 60 },
  logo: { fontSize: 48, textAlign: "center", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "600", textAlign: "center", color: "#F1F5F9" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#94A3B8", marginBottom: 24, marginTop: 4 },
  input: { borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.25)", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, backgroundColor: "rgba(255, 255, 255, 0.06)", color: "#F1F5F9" },
  button: { backgroundColor: "#10B981", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#06281E", fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", color: "#34D399", marginTop: 20, fontSize: 14 },
  backLink: { marginBottom: 12 },
})