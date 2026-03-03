/**
 * Controllers Screen
 * 
 * Displays list of all controllers (ESP32 main controllers) for the user.
 * Users can add new controllers by scanning QR codes.
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Text,
  FAB,
  Chip,
  ActivityIndicator,
  useTheme,
  IconButton,
} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {getControllers, Controller} from '../../services/controllerService';

const ControllersScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadControllers();
  }, []);

  const loadControllers = async () => {
    try {
      const data = await getControllers();
      setControllers(data);
    } catch (error: any) {
      console.log('Error loading controllers:', error.message);
      // Set empty array if backend is unavailable
      setControllers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadControllers();
  };

  const getStatusColor = (status: Controller['status']) => {
    switch (status) {
      case 'ONLINE':
        return '#4caf50';
      case 'OFFLINE':
        return '#f44336';
      case 'PENDING_CONFIG':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const renderController = ({item}: {item: Controller}) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('ControllerDashboard' as never, {
          controllerId: item.id,
        } as never)
      }>
      <Card style={styles.card} mode="elevated">
        <Card.Content>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Icon name="chip" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.cardTitle}>
                {item.name || 'Unnamed Controller'}
              </Text>
            </View>
            <Chip
              style={[
                styles.statusChip,
                {backgroundColor: getStatusColor(item.status) + '20'},
              ]}
              textStyle={{color: getStatusColor(item.status)}}>
              {item.status}
            </Chip>
          </View>

          {item.purpose ? (
            <Text variant="bodyMedium" style={styles.purpose}>
              {item.purpose}
            </Text>
          ) : null}

          {item.location ? (
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.infoText}>
                {item.location}
              </Text>
            </View>
          ) : null}

          {item.last_seen ? (
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.infoText}>
                Last seen: {new Date(item.last_seen).toLocaleString()}
              </Text>
            </View>
          ) : null}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={controllers}
        renderItem={renderController}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="chip" size={64} color="#ccc" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No controllers found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Tap the + button to scan a QR code and add a controller
            </Text>
          </View>
        }
      />

      <FAB
        icon="qrcode-scan"
        style={styles.fab}
        onPress={() => navigation.navigate('QRScan' as never)}
        label="Add Controller"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    marginLeft: 8,
    flex: 1,
  },
  statusChip: {
    height: 28,
  },
  purpose: {
    marginBottom: 8,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    marginLeft: 4,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#999',
    textAlign: 'center',
  },
});

export default ControllersScreen;
