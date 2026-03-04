/**
 * Profile Screen
 * 
 * User profile and account settings.
 */

import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Card,
  Text,
  Button,
  List,
  Divider,
  useTheme,
  Snackbar,
} from 'react-native-paper';
import {useAuth} from '../../contexts/AuthContext';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import api from '../../services/api';
import {API_BASE_URL} from '../../config/api';

const ProfileScreen = () => {
  const theme = useTheme();
  const {user, logout} = useAuth();
  const [testing, setTesting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleTestBackend = async () => {
    setTesting(true);
    try {
      // Simple ping using an existing endpoint
      // We don't care about the exact data, only that the server responds
      await api.get('/auth/me');
      setSnackbarMessage(`Backend reachable at ${API_BASE_URL}`);
    } catch (error: any) {
      // If we get 401, it still means the backend is reachable
      if (error?.status === 401 || error?.message === 'Unauthorized') {
        setSnackbarMessage(`Backend reachable at ${API_BASE_URL} (401 Unauthorized – login required)`);
      } else {
        setSnackbarMessage(
          `Backend NOT reachable: ${error?.message || 'Unknown error'}`,
        );
      }
    } finally {
      setTesting(false);
      setSnackbarVisible(true);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
              <Icon name="account" size={32} color="white" />
            </View>
            <View style={styles.profileInfo}>
              <Text variant="titleLarge" style={styles.name}>
                {user?.email || 'User'}
              </Text>
              {user?.phone && (
                <Text variant="bodyMedium" style={styles.phone}>
                  {user.phone}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {user?.accounts && user.accounts.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Accounts
            </Text>
            {user.accounts.map(account => (
              <View key={account.id} style={styles.accountItem}>
                <Text variant="bodyLarge">{account.name}</Text>
                <Text variant="bodySmall" style={styles.role}>
                  {account.role}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title="Settings"
            left={props => <List.Icon {...props} icon="cog" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="About"
            left={props => <List.Icon {...props} icon="information" />}
            onPress={() => {}}
          />
          <Divider />
          <List.Item
            title="Help & Support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained-tonal"
        onPress={handleTestBackend}
        loading={testing}
        disabled={testing}
        style={styles.testButton}
        icon="lan-connect">
        Test Backend Connection
      </Button>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor={theme.colors.error}
        icon="logout">
        Logout
      </Button>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}>
        {snackbarMessage}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  phone: {
    color: '#666',
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  accountItem: {
    marginBottom: 12,
  },
  role: {
    color: '#666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  testButton: {
    marginTop: 8,
  },
});

export default ProfileScreen;
