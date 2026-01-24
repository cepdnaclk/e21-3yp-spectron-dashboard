import React, { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";

export default function App() {
  const [mode, setMode] = useState("login");
  const showingLogin = mode === "login";

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {showingLogin ? (
          <LoginScreen onSwitchToRegister={() => setMode("register")} />
        ) : (
          <RegisterScreen onSwitchToLogin={() => setMode("login")} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6fbff",
  },
  container: {
    flex: 1,
  },
});
