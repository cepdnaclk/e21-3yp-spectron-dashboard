import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function LoginScreen({ onSwitchToRegister }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Brand header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>ON</Text>
        </View>
        <View>
          <Text style={styles.title}>Omni-Node</Text>
          <Text style={styles.subtitle}>Modular IoT Platform</Text>
        </View>
      </View>

      {/* Welcome card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Welcome back</Text>
        <Text style={styles.cardDescription}>
          Sign in to manage your nodes, sensors, and device data.
        </Text>

        {/* Form fields */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@omni-node.io"
            placeholderTextColor="#9aa4b2"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#9aa4b2"
            secureTextEntry
          />
        </View>

        {/* Primary action */}
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.linkText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {/* Accent info card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>No devices connected yet</Text>
        <Text style={styles.infoText}>
          Connect your first Omni-Node device to begin configuration and live
          monitoring.
        </Text>
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Connect your first device</Text>
        </TouchableOpacity>
      </View>

      {/* Switch to register */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>New to Omni-Node?</Text>
        <TouchableOpacity onPress={onSwitchToRegister}>
          <Text style={styles.footerLink}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 24,
  },
  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#e5f2ff",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1b74f2",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f1a2b",
  },
  subtitle: {
    marginTop: 2,
    color: "#6d7b90",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    shadowColor: "#0b1f44",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f1a2b",
  },
  cardDescription: {
    marginTop: 6,
    color: "#5f6f86",
    marginBottom: 18,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5b6a80",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f4f7fb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#1b2a40",
  },
  primaryButton: {
    backgroundColor: "#1b74f2",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  linkText: {
    marginTop: 12,
    color: "#1b74f2",
    fontWeight: "600",
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#eef6ff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d6e8ff",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f1a2b",
  },
  infoText: {
    marginTop: 8,
    color: "#4f5f75",
  },
  secondaryButton: {
    marginTop: 14,
    backgroundColor: "#00b7a8",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },
  footer: {
    marginTop: 24,
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    color: "#6d7b90",
  },
  footerLink: {
    color: "#1b74f2",
    fontWeight: "700",
  },
});
