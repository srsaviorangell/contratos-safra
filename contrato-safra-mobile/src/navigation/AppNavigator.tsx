import React from "react"
import { NavigationContainer, DefaultTheme, type Theme } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../screens/LoginScreen"
import CadastroScreen from "../screens/CadastroScreen"
import HomeScreen from "../screens/HomeScreen"
import NovoContratoScreen from "../screens/NovoContratoScreen"
import ContratoDetailScreen from "../screens/ContratoDetailScreen"
import ConfirmacaoScreen from "../screens/ConfirmacaoScreen"

const Stack = createNativeStackNavigator()

const darkTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#0B1220",
    card: "#0B1220",
    text: "#F1F5F9",
    border: "rgba(148, 163, 184, 0.2)",
    primary: "#10B981",
  },
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={darkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NovoContrato" component={NovoContratoScreen} />
        <Stack.Screen name="ContratoDetail" component={ContratoDetailScreen} />
        <Stack.Screen name="Confirmacao" component={ConfirmacaoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
