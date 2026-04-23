import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { AutoGraph, CheckCircle, Refresh, Sensors, TipsAndUpdates } from '@mui/icons-material';
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
import { MonitoringSkeleton } from '../../components/LoadingSkeletons';

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
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [items, setItems] = useState<SensorMonitoringItem[]>([]);

  const loadMonitoringData = useCallback(async ({ showSkeleton = false }: { showSkeleton?: boolean } = {}) => {
    try {
      if (showSkeleton) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
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
      setLastUpdatedAt(new Date());
    } catch (error) {
      console.error('Failed to load monitoring data:', error);
      setErrorMessage('Failed to load monitoring data. Please try again.');
    } finally {
      if (showSkeleton) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMonitoringData({ showSkeleton: true });
    const intervalId = window.setInterval(() => {
      loadMonitoringData({ showSkeleton: false });
    }, 20000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadMonitoringData]);

  const handleManualRefresh = () => {
    loadMonitoringData({ showSkeleton: false });
  };

  const summary = useMemo(() => {
    const total = items.length;
    const online = items.filter((item) => item.sensor.status === 'OK').length;
    const receiving = items.filter((item) => item.trend.length > 0).length;
    return { total, online, receiving };
  }, [items]);

  const getSensorActivityChip = (sensor: Sensor, trendLength: number) => {
    if (trendLength > 0) {
      return { label: 'Receiving Data', color: 'success' as const };
    }
    if (sensor.status === 'OK') {
      return { label: 'Discovered', color: 'info' as const };
    }
    return { label: 'Waiting', color: 'default' as const };
  };

  if (loading) {
    return <MonitoringSkeleton />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="secondary" fontWeight={800}>
          Live environment
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Box>
            <Typography variant="h4">Monitoring Dashboard</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 680 }}>
              Follow sensor health and recent movement across the fleet. Configuration is optional
              for this first controller-to-UI verification pass.
            </Typography>
            {lastUpdatedAt && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                Last updated {lastUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Typography>
            )}
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleManualRefresh}
            disabled={refreshing}
            sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Stack>
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(108, 137, 48, 0.12)' }}>
              <Sensors color="primary" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Total Sensors</Typography>
              <Typography variant="h5">{summary.total}</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(108, 137, 48, 0.12)' }}>
              <CheckCircle color="primary" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Online Sensors</Typography>
              <Typography variant="h5">{summary.online}</Typography>
            </Box>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: 'rgba(235, 79, 18, 0.12)' }}>
              <AutoGraph color="secondary" />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">Receiving Data</Typography>
              <Typography variant="h5">{summary.receiving}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Stack>

      {errorMessage && !loading && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}

      {!loading && !errorMessage && items.length === 0 && (
        <Card>
          <CardContent>
            <Typography color="text.secondary">
              No sensors available yet. Pair a controller, then send the controller discovery packet
              so sensors can appear here.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && !errorMessage && items.length > 0 && (
        <Grid container spacing={2}>
          {items.map((item) => {
            const activity = getSensorActivityChip(item.sensor, item.trend.length);
            return (
              <Grid item xs={12} md={6} key={item.sensor.id}>
                <Card>
                  <CardContent sx={{ p: 2.5 }}>
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
                        label={item.sensor.config_active ? 'Configured' : 'Config Optional'}
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
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(60, 57, 17, 0.12)" />
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
        <CardContent sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
          <TipsAndUpdates color="secondary" />
          <Typography color="text.secondary">
            Tip: for this test phase, a sensor only needs to be discovered and receive at least one
            reading to appear here. Threshold configuration can be completed later.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Monitoring;
