import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";

export default function RegisterScreen({ onSwitchToLogin }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Brand header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>ON</Text>
        </View>
        <View>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join the Omni-Node platform</Text>
        </View>
      </View>

      {/* Registration card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Start your workspace</Text>
        <Text style={styles.cardDescription}>
          Set up your admin profile and connect your first device.
        </Text>

        {/* Form fields */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor="#9aa4b2"
          />
        </View>

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
            placeholder="Create a password"
            placeholderTextColor="#9aa4b2"
            secureTextEntry
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={styles.input}
            placeholder="Repeat your password"
            placeholderTextColor="#9aa4b2"
            secureTextEntry
          />
        </View>

        {/* Primary action */}
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Create account</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By creating an account you agree to the Omni-Node terms and privacy
          policy.
        </Text>
      </View>

      {/* Value prop card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>What you can do next</Text>
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>1</Text>
          </View>
          <Text style={styles.stepText}>Configure your first node profile</Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>2</Text>
          </View>
          <Text style={styles.stepText}>Select sensors and alert thresholds</Text>
        </View>
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>3</Text>
          </View>
          <Text style={styles.stepText}>Invite your operations team</Text>
        </View>
      </View>

      {/* Switch to login */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={onSwitchToLogin}>
          <Text style={styles.footerLink}>Sign in instead</Text>
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
  termsText: {
    marginTop: 12,
    color: "#7a889b",
    fontSize: 12,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#f3fbf9",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#c8efe8",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f1a2b",
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#dff6f2",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: {
    fontWeight: "700",
    color: "#1a8f7d",
  },
  stepText: {
    color: "#4f5f75",
    flex: 1,
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
