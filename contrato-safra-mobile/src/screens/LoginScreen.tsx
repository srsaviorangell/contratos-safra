import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native"
import { api } from "../services/api"

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos")
      return
    }
    setLoading(true)
    try {
      await api.auth.signIn({ email, password })
      navigation.reset({ index: 0, routes: [{ name: "Home" }] })
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao fazer login")
    }
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.content}>
        <Text style={styles.logo}>📄</Text>
        <Text style={styles.title}>Contrato de Safra</Text>
        <Text style={styles.subtitle}>Acesse sua conta</Text>

        <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor="#64748B" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Senha" placeholderTextColor="#64748B" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Cadastro")}>
          <Text style={styles.link}>Não tem conta? Criar conta</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { fontSize: 48, textAlign: "center", marginBottom: 8 },
  title: { fontSize: 24, fontWeight: "600", textAlign: "center", color: "#F1F5F9" },
  subtitle: { fontSize: 14, textAlign: "center", color: "#94A3B8", marginBottom: 32, marginTop: 4 },
  input: { borderWidth: 1, borderColor: "rgba(148, 163, 184, 0.25)", borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12, backgroundColor: "rgba(255, 255, 255, 0.06)", color: "#F1F5F9" },
  button: { backgroundColor: "#10B981", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#06281E", fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", color: "#34D399", marginTop: 20, fontSize: 14 },
})
