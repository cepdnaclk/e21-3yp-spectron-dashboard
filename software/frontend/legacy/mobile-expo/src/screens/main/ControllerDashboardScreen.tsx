/**
 * Controller Dashboard Screen
 * 
 * Shows details of a specific controller and lists all its sensors.
 * Users can configure sensors from here.
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
  Divider,
} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/native';
import {MaterialCommunityIcons as Icon} from '@expo/vector-icons';
import {
  getController,
  Controller,
  updateController,
} from '../../services/controllerService';
import {getSensors, Sensor} from '../../services/sensorService';

const ControllerDashboardScreen = () => {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const {controllerId} = route.params as {controllerId: string};

  const [controller, setController] = useState<Controller | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [controllerId]);

  const loadData = async () => {
    try {
      const [controllerData, sensorsData] = await Promise.all([
        getController(controllerId),
        getSensors(controllerId),
      ]);
      setController(controllerData);
      setSensors(sensorsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
      case 'OK':
        return '#4caf50';
      case 'OFFLINE':
      case 'ERROR':
        return '#f44336';
      case 'PENDING_CONFIG':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const handleConfigureSensor = (sensor: Sensor) => {
    navigation.navigate('SensorConfig' as never, {sensorId: sensor.id} as never);
  };

  const renderSensor = ({item}: {item: Sensor}) => (
    <Card style={styles.sensorCard} mode="elevated">
      <Card.Content>
        <View style={styles.sensorHeader}>
          <View style={styles.sensorTitleRow}>
            <Icon
              name="thermometer"
              size={24}
              color={theme.colors.primary}
            />
            <View style={styles.sensorInfo}>
              <Text variant="titleSmall">
                {item.name || `${item.type} Sensor`}
              </Text>
              <Text variant="bodySmall" style={styles.sensorType}>
                {item.type}
              </Text>
            </View>
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
        ) : (
          <Text variant="bodySmall" style={styles.notConfigured}>
            Not configured
          </Text>
        )}

        {item.unit && (
          <Text variant="bodySmall" style={styles.unit}>
            Unit: {item.unit}
          </Text>
        )}

        <Divider style={styles.divider} />

        <Button
          mode="outlined"
          onPress={() => handleConfigureSensor(item)}
          style={styles.configureButton}
          icon="cog">
          Configure
        </Button>
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

  if (!controller) {
    return (
      <View style={styles.center}>
        <Text>Controller not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Controller Info Card */}
      <Card style={styles.controllerCard} mode="elevated">
        <Card.Content>
          <View style={styles.controllerHeader}>
            <View>
              <Text variant="titleLarge" style={styles.controllerName}>
                {controller.name || 'Unnamed Controller'}
              </Text>
              {controller.purpose && (
                <Text variant="bodyMedium" style={styles.controllerPurpose}>
                  {controller.purpose}
                </Text>
              )}
            </View>
            <Chip
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    getStatusColor(controller.status) + '20',
                },
              ]}
              textStyle={{color: getStatusColor(controller.status)}}>
              {controller.status}
            </Chip>
          </View>

          {controller.location && (
            <View style={styles.infoRow}>
              <Icon name="map-marker" size={16} color="#666" />
              <Text variant="bodySmall" style={styles.infoText}>
                {controller.location}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Sensors List */}
      <Text variant="titleMedium" style={styles.sectionTitle}>
        Sensors ({sensors.length})
      </Text>

      <FlatList
        data={sensors}
        renderItem={renderSensor}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="thermometer" size={64} color="#ccc" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No sensors found
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtext}>
              Sensors will appear here once the controller discovers them
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
  controllerCard: {
    margin: 16,
    marginBottom: 8,
  },
  controllerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  controllerName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  controllerPurpose: {
    color: '#666',
    marginTop: 4,
  },
  statusChip: {
    height: 28,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    marginLeft: 4,
    color: '#666',
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  sensorCard: {
    marginBottom: 12,
  },
  sensorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sensorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sensorInfo: {
    marginLeft: 8,
    flex: 1,
  },
  sensorType: {
    color: '#666',
    marginTop: 2,
  },
  purpose: {
    marginTop: 8,
    marginBottom: 4,
    color: '#666',
  },
  notConfigured: {
    marginTop: 8,
    marginBottom: 4,
    color: '#999',
    fontStyle: 'italic',
  },
  unit: {
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  configureButton: {
    marginTop: 4,
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

export default ControllerDashboardScreen;
