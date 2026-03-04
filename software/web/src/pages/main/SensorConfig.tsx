import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
} from '@mui/material';
import { getSensor, Sensor } from '../../services/sensorService';
import {
  getAISuggestedConfig,
  saveSensorConfig,
  SensorConfig as SensorConfigPayload,
  AISuggestRequest,
} from '../../services/sensorService';

const SensorConfig: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const [purpose, setPurpose] = useState('');
  const [friendlyName, setFriendlyName] = useState('');
  const [thresholdMin, setThresholdMin] = useState('');
  const [thresholdMax, setThresholdMax] = useState('');
  const [warningMin, setWarningMin] = useState('');
  const [warningMax, setWarningMax] = useState('');
  const [reportsPerDay, setReportsPerDay] = useState('24');
  const [batteryLifeDays, setBatteryLifeDays] = useState('30');
  const [size, setSize] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('');
  const [readingFlowType, setReadingFlowType] = useState<'CONSTANT_PER_DAY' | 'TRIGGER'>('CONSTANT_PER_DAY');

  useEffect(() => {
    if (id) {
      loadSensor();
    }
  }, [id]);

  const loadSensor = async () => {
    if (!id) return;
    try {
      const sensorData = await getSensor(id);
      setSensor(sensorData);
      setPurpose(sensorData.purpose || '');
      setFriendlyName(sensorData.name || '');
    } catch (error) {
      console.error('Error loading sensor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAISuggest = async () => {
    if (!id || !purpose.trim()) {
      alert('Please enter a purpose description first');
      return;
    }

    setAiLoading(true);
    try {
      const enrichedPurpose = [
        purpose,
        size ? `Target size/dimension: ${size}` : '',
        measurementUnit ? `Measurement unit: ${measurementUnit}` : '',
        `Reading flow type: ${readingFlowType === 'TRIGGER' ? 'trigger-based' : 'constant per day'}`,
      ]
        .filter(Boolean)
        .join('. ');

      const request: AISuggestRequest = {
        purpose: enrichedPurpose,
        desired_battery_life_days: batteryLifeDays ? parseInt(batteryLifeDays) : undefined,
      };

      const response = await getAISuggestedConfig(id, request);
      const config = response.suggested_config;

      setFriendlyName(config.friendly_name);
      setThresholdMin(config.thresholds.min?.toString() || '');
      setThresholdMax(config.thresholds.max?.toString() || '');
      setWarningMin(config.thresholds.warning_min?.toString() || '');
      setWarningMax(config.thresholds.warning_max?.toString() || '');
      setReportsPerDay(config.report_interval_per_day.toString());
      setBatteryLifeDays(config.power_management.battery_life_days.toString());

      alert(response.explanation || 'Configuration suggested based on your purpose');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to get AI suggestion');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !friendlyName.trim()) {
      alert('Please enter a sensor name');
      return;
    }

    setSaving(true);
    try {
      const config: SensorConfigPayload = {
        friendly_name: friendlyName,
        thresholds: {
          min: thresholdMin ? parseFloat(thresholdMin) : undefined,
          max: thresholdMax ? parseFloat(thresholdMax) : undefined,
          warning_min: warningMin ? parseFloat(warningMin) : undefined,
          warning_max: warningMax ? parseFloat(warningMax) : undefined,
        },
        report_interval_per_day: readingFlowType === 'TRIGGER' ? 1 : (reportsPerDay ? parseInt(reportsPerDay) : 24),
        power_management: {
          battery_life_days: batteryLifeDays ? parseInt(batteryLifeDays) : 30,
          sampling_frequency: readingFlowType === 'TRIGGER' ? 1 : (reportsPerDay ? parseInt(reportsPerDay) : 24),
        },
      };

      await saveSensorConfig(id, config);
      alert('Sensor configuration saved!');
      navigate(-1);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!sensor) {
    return (
      <Container>
        <Typography>Sensor not found</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Configure {sensor.type} Sensor
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Purpose Description
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Describe what this sensor will be used for (e.g., "Monitor temperature in the living room")
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g., Monitor garbage bin fill level and odor for a 120L outdoor bin"
            sx={{ mt: 1 }}
          />

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Size / Dimension"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g., 120"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Measurement Unit"
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value)}
                placeholder="e.g., liters, cm, m²"
              />
            </Grid>
          </Grid>

          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="reading-flow-type-label">Reading Flow Type</InputLabel>
            <Select
              labelId="reading-flow-type-label"
              value={readingFlowType}
              label="Reading Flow Type"
              onChange={(e) => setReadingFlowType(e.target.value as 'CONSTANT_PER_DAY' | 'TRIGGER')}
            >
              <MenuItem value="CONSTANT_PER_DAY">Constant readings per day</MenuItem>
              <MenuItem value="TRIGGER">Trigger-based readings</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={handleAISuggest}
            disabled={aiLoading || !purpose.trim()}
            sx={{ mt: 2 }}
          >
            {aiLoading ? 'Getting AI Suggestion...' : 'Get AI Suggestion'}
          </Button>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Configuration
          </Typography>

          <TextField
            fullWidth
            label="Sensor Name *"
            value={friendlyName}
            onChange={(e) => setFriendlyName(e.target.value)}
            margin="normal"
            required
          />

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Thresholds
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min Value"
                type="number"
                value={thresholdMin}
                onChange={(e) => setThresholdMin(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Value"
                type="number"
                value={thresholdMax}
                onChange={(e) => setThresholdMax(e.target.value)}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Warning Thresholds (Optional)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Warning Min"
                type="number"
                value={warningMin}
                onChange={(e) => setWarningMin(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Warning Max"
                type="number"
                value={warningMax}
                onChange={(e) => setWarningMax(e.target.value)}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Power Management
          </Typography>
          <TextField
            fullWidth
            label="Reports Per Day"
            type="number"
            value={reportsPerDay}
            onChange={(e) => setReportsPerDay(e.target.value)}
            margin="normal"
            disabled={readingFlowType === 'TRIGGER'}
            helperText="How many times per day the sensor should send data"
          />
          <TextField
            fullWidth
            label="Desired Battery Life (Days)"
            type="number"
            value={batteryLifeDays}
            onChange={(e) => setBatteryLifeDays(e.target.value)}
            margin="normal"
            helperText="How long you want the battery to last"
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          disabled={saving}
          sx={{ mt: 3 }}
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </Paper>
    </Container>
  );
};

export default SensorConfig;
