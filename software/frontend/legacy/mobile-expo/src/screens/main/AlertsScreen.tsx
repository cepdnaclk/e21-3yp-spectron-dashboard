/**
 * Alerts Screen
 * 
 * Displays all alerts and notifications for the user.
 * Shows threshold breaches, sensor failures, and other important events.
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Text,
  Chip,
  ActivityIndicator,
  useTheme,
  IconButton,
} from 'react-native-paper';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {getAlerts, acknowledgeAlert, Alert} from '../../services/alertService';
import {formatDate} from '../../utils/dateFormatter';

const AlertsScreen = () => {
  const theme = useTheme();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getAlerts();
      // Sort by most recent first
      data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      setAlerts(data);
    } catch (error: any) {
      console.log('Error loading alerts:', error.message);
      setAlerts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAlerts();
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      // Reload alerts
      loadAlerts();
    } catch (error: any) {
      console.log('Error acknowledging alert:', error.message);
    }
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return '#f44336';
      case 'WARN':
        return '#ff9800';
      case 'INFO':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'THRESHOLD_BREACH':
        return 'alert-circle';
      case 'SENSOR_OFFLINE':
        return 'thermometer-off';
      case 'CONTROLLER_OFFLINE':
        return 'chip-off';
      default:
        return 'bell';
    }
  };

  const renderAlert = ({item}: {item: Alert}) => (
    <Card
      style={[
        styles.alertCard,
        item.acknowledged_at && styles.acknowledgedCard,
      ]}
      mode="elevated">
      <Card.Content>
        <View style={styles.alertHeader}>
          <View style={styles.alertTitleRow}>
            <Icon
              name={getAlertIcon(item.type)}
              size={24}
              color={getSeverityColor(item.severity)}
            />
            <View style={styles.alertInfo}>
              <Text variant="titleSmall" style={styles.alertTitle}>
                {item.type.replace(/_/g, ' ')}
              </Text>
              <Text variant="bodySmall" style={styles.alertTime}>
                {formatDate(item.created_at, 'MMM dd, yyyy HH:mm')}
              </Text>
            </View>
          </View>
          <Chip
            style={[
              styles.severityChip,
              {
                backgroundColor:
                  getSeverityColor(item.severity) + '20',
              },
            ]}
            textStyle={{color: getSeverityColor(item.severity)}}>
            {item.severity}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={styles.alertMessage}>
          {item.message}
        </Text>

        {!item.acknowledged_at && (
          <View style={styles.alertActions}>
            <IconButton
              icon="check-circle"
              size={20}
              onPress={() => handleAcknowledge(item.id)}
              iconColor={theme.colors.primary}
            />
            <Text variant="bodySmall" style={styles.acknowledgeText}>
              Tap to acknowledge
            </Text>
          </View>
        )}

        {item.acknowledged_at && (
          <Text variant="bodySmall" style={styles.acknowledgedText}>
            Acknowledged at{' '}
            {formatDate(item.acknowledged_at, 'MMM dd, yyyy HH:mm')}
          </Text>
        )}
      </Card.Content>
    </Card>
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
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="bell-off" size={64} color="#ccc" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No alerts
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              You're all caught up! No alerts to display.
            </Text>
          </View>
        }
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
  alertCard: {
    marginBottom: 12,
  },
  acknowledgedCard: {
    opacity: 0.7,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  alertTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertInfo: {
    marginLeft: 8,
    flex: 1,
  },
  alertTitle: {
    fontWeight: 'bold',
  },
  alertTime: {
    color: '#666',
    marginTop: 2,
  },
  severityChip: {
    height: 28,
  },
  alertMessage: {
    marginTop: 8,
    color: '#333',
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  acknowledgeText: {
    marginLeft: 4,
    color: '#666',
  },
  acknowledgedText: {
    marginTop: 8,
    color: '#999',
    fontStyle: 'italic',
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

export default AlertsScreen;
