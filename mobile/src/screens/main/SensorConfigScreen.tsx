/**
 * Sensor Configuration Screen
 * 
 * Allows users to configure a sensor with:
 * - Purpose description (natural language)
 * - AI-suggested configuration
 * - Manual configuration (name, thresholds, power management)
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  ActivityIndicator,
  useTheme,
  Divider,
  Card,
} from 'react-native-paper';
import {useRoute, useNavigation} from '@react-navigation/native';
import {getSensor, Sensor} from '../../services/sensorService';
import {
  getAISuggestedConfig,
  saveSensorConfig,
  SensorConfig,
  AISuggestRequest,
} from '../../services/sensorService';

const SensorConfigScreen = () => {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const {sensorId} = route.params as {sensorId: string};

  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Form fields
  const [purpose, setPurpose] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [thresholdMin, setThresholdMin] = useState('');
  const [thresholdMax, setThresholdMax] = useState('');
  const [warningMin, setWarningMin] = useState('');
  const [warningMax, setWarningMax] = useState('');
  const [reportsPerDay, setReportsPerDay] = useState('');
  const [batteryLifeDays, setBatteryLifeDays] = useState('');

  useEffect(() => {
    loadSensor();
  }, [sensorId]);

  const loadSensor = async () => {
    try {
      const sensorData = await getSensor(sensorId);
      setSensor(sensorData);
      setPurpose(sensorData.purpose || '');
      setFriendlyName(sensorData.name || '');
    } catch (error) {
      console.error('Error loading sensor:', error);
      Alert.alert('Error', 'Failed to load sensor data');
    } finally {
      setLoading(false);
    }
  };

  const handleAISuggest = async () => {
    if (!purpose.trim()) {
      Alert.alert('Error', 'Please enter a purpose description first');
      return;
    }

    setAiLoading(true);
    try {
      const request: AISuggestRequest = {
        purpose: purpose,
        desired_battery_life_days: batteryLifeDays
          ? parseInt(batteryLifeDays)
          : undefined,
      };

      const response = await getAISuggestedConfig(sensorId, request);
      const config = response.suggested_config;

      // Fill form with AI suggestions
      setFriendlyName(config.friendly_name);
      setThresholdMin(config.thresholds.min?.toString() || '');
      setThresholdMax(config.thresholds.max?.toString() || '');
      setWarningMin(config.thresholds.warning_min?.toString() || '');
      setWarningMax(config.thresholds.warning_max?.toString() || '');
      setReportsPerDay(config.report_interval_per_day.toString());
      setBatteryLifeDays(
        config.power_management.battery_life_days.toString(),
      );

      Alert.alert(
        'AI Suggestion',
        response.explanation || 'Configuration suggested based on your purpose',
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to get AI suggestion',
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!friendlyName.trim()) {
      Alert.alert('Error', 'Please enter a sensor name');
      return;
    }

    setSaving(true);
    try {
      const config: SensorConfig = {
        friendly_name: friendlyName,
        thresholds: {
          min: thresholdMin ? parseFloat(thresholdMin) : undefined,
          max: thresholdMax ? parseFloat(thresholdMax) : undefined,
          warning_min: warningMin ? parseFloat(warningMin) : undefined,
          warning_max: warningMax ? parseFloat(warningMax) : undefined,
        },
        report_interval_per_day: reportsPerDay
          ? parseInt(reportsPerDay)
          : 24,
        power_management: {
          battery_life_days: batteryLifeDays
            ? parseInt(batteryLifeDays)
            : 30,
          sampling_frequency: reportsPerDay ? parseInt(reportsPerDay) : 24,
        },
      };

      await saveSensorConfig(sensorId, config);
      Alert.alert('Success', 'Sensor configuration saved!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'Failed to save configuration',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!sensor) {
    return (
      <View style={styles.center}>
        <Text>Sensor not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Sensor Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sensorTitle}>
              {sensor.type} Sensor
            </Text>
            <Text variant="bodySmall" style={styles.sensorId}>
              ID: {sensor.hw_id}
            </Text>
          </Card.Content>
        </Card>

        {/* Purpose Description */}
        <Surface style={styles.section} elevation={1}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Purpose Description
          </Text>
          <Text variant="bodySmall" style={styles.sectionSubtitle}>
            Describe what this sensor will be used for (e.g., "Monitor
            temperature in the living room")
          </Text>
          <TextInput
            label="Purpose"
            value={purpose}
            onChangeText={setPurpose}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            placeholder="e.g., Monitor garbage bin fill level and odor"
          />
          <Button
            mode="contained"
            onPress={handleAISuggest}
            style={styles.aiButton}
            loading={aiLoading}
            disabled={aiLoading || !purpose.trim()}
            icon="robot">
            Get AI Suggestion
          </Button>
        </Surface>

        <Divider style={styles.divider} />

        {/* Configuration Form */}
        <Surface style={styles.section} elevation={1}>
          <Text variant="titleSmall" style={styles.sectionTitle}>
            Configuration
          </Text>

          <TextInput
            label="Sensor Name *"
            value={friendlyName}
            onChangeText={setFriendlyName}
            mode="outlined"
            style={styles.input}
            placeholder="e.g., Living Room Temperature"
          />

          <Text variant="bodySmall" style={styles.subsectionTitle}>
            Thresholds
          </Text>

          <View style={styles.row}>
            <TextInput
              label="Min Value"
              value={thresholdMin}
              onChangeText={setThresholdMin}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Max Value"
              value={thresholdMax}
              onChangeText={setThresholdMax}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <Text variant="bodySmall" style={styles.subsectionTitle}>
            Warning Thresholds (Optional)
          </Text>

          <View style={styles.row}>
            <TextInput
              label="Warning Min"
              value={warningMin}
              onChangeText={setWarningMin}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              label="Warning Max"
              value={warningMax}
              onChangeText={setWarningMax}
              mode="outlined"
              keyboardType="numeric"
              style={[styles.input, styles.halfInput]}
            />
          </View>

          <Text variant="bodySmall" style={styles.subsectionTitle}>
            Power Management
          </Text>

          <TextInput
            label="Reports Per Day"
            value={reportsPerDay}
            onChangeText={setReportsPerDay}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            placeholder="24"
            helperText="How many times per day the sensor should send data"
          />

          <TextInput
            label="Desired Battery Life (Days)"
            value={batteryLifeDays}
            onChangeText={setBatteryLifeDays}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
            placeholder="30"
            helperText="How long you want the battery to last"
          />
        </Surface>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={saving}
          disabled={saving}>
          Save Configuration
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  infoCard: {
    marginBottom: 16,
  },
  sensorTitle: {
    fontWeight: 'bold',
  },
  sensorId: {
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#666',
    marginBottom: 12,
  },
  subsectionTitle: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  aiButton: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 32,
    paddingVertical: 4,
  },
});

export default SensorConfigScreen;
