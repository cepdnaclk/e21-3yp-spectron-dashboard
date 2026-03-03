/**
 * Sign In Screen
 * 
 * Allows users to sign in with email and password.
 */

import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
} from 'react-native-paper';
import {useAuth} from '../../contexts/AuthContext';
import {useNavigation} from '@react-navigation/native';
import api from '../../services/api';
import {API_BASE_URL} from '../../config/api';

const SignInScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testingBackend, setTestingBackend] = useState(false);

  const handleTestBackend = async () => {
    setTestingBackend(true);
    setError('');
    try {
      // Call a lightweight endpoint; we only care that the server responds
      await api.get('/healthz');
      setError(`Backend reachable at ${API_BASE_URL}`);
    } catch (err: any) {
      // If it's 404/401/etc, it still means the server is reachable
      if (err?.status && err.status !== 0) {
        setError(
          `Backend reachable at ${API_BASE_URL} (HTTP ${err.status}: ${err.message})`,
        );
      } else {
        setError(
          `Backend NOT reachable: ${
            err?.message || 'Unable to connect to server'
          }`,
        );
      }
    } finally {
      setTestingBackend(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login({email, password});
      // Navigation will happen automatically via AuthContext
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to sign in';
      // Make error message more user-friendly
      if (errorMsg.includes('connect') || errorMsg.includes('network')) {
        setError('Unable to connect to server. Please check your connection and try again.');
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <Surface style={styles.surface} elevation={2}>
          <Text variant="headlineMedium" style={styles.title}>
            Welcome to Spectron
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sign in to manage your monitoring kit
          </Text>

          {error ? (
            <Text style={[styles.error, {color: theme.colors.error}]}>
              {error}
            </Text>
          ) : null}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!passwordVisible}
            style={styles.input}
            disabled={loading}
            right={
              <TextInput.Icon
                icon={passwordVisible ? 'eye-off' : 'eye'}
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            }
          />

          <Button
            mode="outlined"
            onPress={handleTestBackend}
            style={styles.testButton}
            disabled={loading || testingBackend}
            loading={testingBackend}
            icon="lan-connect">
            Test Backend
          </Button>

          <Button
            mode="contained"
            onPress={handleSignIn}
            style={styles.button}
            disabled={loading}
            loading={loading}>
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate('SignUp' as never)}
            style={styles.linkButton}
            disabled={loading}>
            Don't have an account? Sign Up
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  testButton: {
    marginTop: 8,
  },
  linkButton: {
    marginTop: 16,
  },
});

export default SignInScreen;
