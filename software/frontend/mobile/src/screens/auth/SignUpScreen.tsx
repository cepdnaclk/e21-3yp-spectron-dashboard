/**
 * Sign Up Screen
 * 
 * Allows new users to create an account.
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

const SignUpScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {register} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({email, password, phone: phone || undefined, name: name || undefined});
      // Navigation will happen automatically via AuthContext
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to create account';
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
            Create Account
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Sign up to get started with Spectron
          </Text>

          {error ? (
            <Text style={[styles.error, {color: theme.colors.error}]}>
              {error}
            </Text>
          ) : null}

          <TextInput
            label="Name (Optional)"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Email *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Phone (Optional)"
            value={phone}
            onChangeText={setPhone}
            mode="outlined"
            keyboardType="phone-pad"
            style={styles.input}
            disabled={loading}
          />

          <TextInput
            label="Password *"
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

          <TextInput
            label="Confirm Password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry={!confirmPasswordVisible}
            style={styles.input}
            disabled={loading}
            right={
              <TextInput.Icon
                icon={confirmPasswordVisible ? 'eye-off' : 'eye'}
                onPress={() =>
                  setConfirmPasswordVisible(!confirmPasswordVisible)
                }
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleSignUp}
            style={styles.button}
            disabled={loading}
            loading={loading}>
            Sign Up
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            style={styles.linkButton}
            disabled={loading}>
            Already have an account? Sign In
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
  linkButton: {
    marginTop: 16,
  },
});

export default SignUpScreen;
