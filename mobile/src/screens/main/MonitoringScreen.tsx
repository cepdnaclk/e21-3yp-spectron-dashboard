/**
 * Monitoring Screen
 * 
 * Shows monitoring dashboard with data visualization for all controllers and sensors.
 */

import React, {useState, useEffect} from 'react';
import {View, StyleSheet, ScrollView, RefreshControl} from 'react-native';
import {Text, Card, ActivityIndicator, useTheme} from 'react-native-paper';
import {getControllers, Controller} from '../../services/controllerService';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';

const MonitoringScreen = () => {
  const theme = useTheme();
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await getControllers();
      setControllers(data);
    } catch (error: any) {
      console.log('Error loading controllers:', error.message);
      setControllers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Text variant="headlineSmall" style={styles.title}>
        Monitoring Dashboard
      </Text>

      {controllers.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Card.Content style={styles.emptyContent}>
            <Icon name="chart-line" size={64} color="#ccc" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No controllers to monitor
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Add a controller to start monitoring
            </Text>
          </Card.Content>
        </Card>
      ) : (
        controllers.map(controller => (
          <Card key={controller.id} style={styles.controllerCard}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium" style={styles.cardTitle}>
                  {controller.name || 'Unnamed Controller'}
                </Text>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        controller.status === 'ONLINE' ? '#4caf50' : '#f44336',
                    },
                  ]}
                />
              </View>
              {controller.purpose && (
                <Text variant="bodyMedium" style={styles.purpose}>
                  {controller.purpose}
                </Text>
              )}
              <Text variant="bodySmall" style={styles.info}>
                Tap to view detailed monitoring data
              </Text>
            </Card.Content>
          </Card>
        ))
      )}

      <Text variant="bodySmall" style={styles.note}>
        Detailed charts and real-time data visualization will be available
        here. This screen will show sensor readings, trends, and analytics.
      </Text>
    </ScrollView>
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
  content: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  controllerCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: 'bold',
    flex: 1,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  purpose: {
    color: '#666',
    marginTop: 4,
  },
  info: {
    color: '#999',
    marginTop: 8,
  },
  emptyCard: {
    marginTop: 32,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    color: '#999',
  },
  note: {
    marginTop: 24,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default MonitoringScreen;
