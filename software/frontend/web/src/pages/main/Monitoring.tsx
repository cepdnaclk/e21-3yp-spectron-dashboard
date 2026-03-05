import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { getControllers } from '../../services/controllerService';
import { getSensors, getSensorReadings, Sensor, SensorReading } from '../../services/sensorService';

type SensorMonitoringItem = {
  controllerName: string;
  sensor: Sensor;
  trend: Array<{
    day: string;
    value: number;
  }>;
};

const formatDay = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const toReadingValue = (reading: SensorReading): number | null => {
  if (typeof reading.avg_value === 'number') return reading.avg_value;
  if (typeof reading.value === 'number') return reading.value;
  return null;
};

const Monitoring: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [items, setItems] = useState<SensorMonitoringItem[]>([]);

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const controllers = await getControllers();
      const controllerSensorResults = await Promise.all(
        controllers.map(async (controller) => {
          const sensors = await getSensors(controller.id);
          return sensors.map((sensor) => ({
            controllerName: controller.name || controller.hw_id || 'Controller',
            sensor,
          }));
        })
      );

      const allSensors = controllerSensorResults.flat();

      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 7);

      const withReadings = await Promise.all(
        allSensors.map(async ({ controllerName, sensor }) => {
          try {
            const readings = await getSensorReadings(sensor.id, {
              from: from.toISOString(),
              to: to.toISOString(),
              interval: '1 day',
            });

            const trend = readings
              .map((reading) => ({
                day: formatDay(reading.time),
                value: toReadingValue(reading),
              }))
              .filter((point): point is { day: string; value: number } => point.value !== null);

            return {
              controllerName,
              sensor,
              trend,
            };
          } catch {
            return {
              controllerName,
              sensor,
              trend: [],
            };
          }
        })
      );

      setItems(withReadings);
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
      setErrorMessage('Failed to load monitoring data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const total = items.length;
    const online = items.filter((item) => item.sensor.status === 'OK').length;
    const configured = items.filter((item) => item.sensor.config_active).length;
    return { total, online, configured };
  }, [items]);

  const getSensorActivityChip = (sensor: Sensor) => {
    const isActive = sensor.config_active && sensor.status === 'OK';
    return isActive
      ? { label: 'Active', color: 'success' as const }
      : { label: 'Not Active', color: 'default' as const };
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Monitoring Dashboard
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">Total Sensors</Typography>
            <Typography variant="h5">{summary.total}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">Online Sensors</Typography>
            <Typography variant="h5">{summary.online}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">Configured Sensors</Typography>
            <Typography variant="h5">{summary.configured}</Typography>
          </CardContent>
        </Card>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <CircularProgress />
        </Box>
      )}

      {errorMessage && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {!loading && !errorMessage && items.length === 0 && (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No sensors available yet. Pair a controller and configure sensors to start monitoring.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && !errorMessage && items.length > 0 && (
        <Grid container spacing={2}>
          {items.map((item) => {
            const activity = getSensorActivityChip(item.sensor);
            return (
              <Grid item xs={12} md={6} key={item.sensor.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="h6">
                        {item.sensor.name || `${item.sensor.type} Sensor`}
                      </Typography>
                      <Chip size="small" label={activity.label} color={activity.color} />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Controller: {item.controllerName}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 1 }}>
                      <Chip size="small" label={`Runtime: ${item.sensor.status}`} color={item.sensor.status === 'OK' ? 'success' : 'default'} />
                      <Chip
                        size="small"
                        label={item.sensor.config_active ? 'Configured' : 'Not Configured'}
                        color={item.sensor.config_active ? 'primary' : 'default'}
                      />
                    </Stack>

                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Last 7 Days Trend
                    </Typography>

                    {item.trend.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No readings available in the last 7 days.
                      </Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                          <LineChart data={item.trend} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="day" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={theme.palette.primary.main}
                              strokeWidth={2}
                              dot={{ r: 2 }}
                              activeDot={{ r: 5 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography>
            Tip: sensors marked as <strong>Not Active</strong> are either not configured yet or currently offline.
            Configure a sensor and keep the controller online to activate continuous monitoring.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Monitoring;
