import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Grid,
  Alert,
  Stack,
} from '@mui/material';
import { Settings, DeviceThermostat, Place, Memory, Tune } from '@mui/icons-material';
import { getController, Controller } from '../../services/controllerService';
import { getSensors, Sensor } from '../../services/sensorService';
import { ControllerDashboardSkeleton } from '../../components/LoadingSkeletons';

type DashboardNavigationState = {
  configurationSaved?: boolean;
  configuredSensorId?: string;
  configuredSensorName?: string;
  validationWarnings?: string[];
  observationMessage?: string;
};

const ControllerDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [controller, setController] = useState<Controller | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const navigationState = (location.state || null) as DashboardNavigationState | null;
  const [saveNotice, setSaveNotice] = useState<DashboardNavigationState | null>(navigationState);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const [controllerData, sensorsData] = await Promise.all([
        getController(id),
        getSensors(id),
      ]);
      setController(controllerData);
      setSensors(sensorsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, loadData]);

  useEffect(() => {
    if (!navigationState?.configurationSaved) {
      return;
    }

    setSaveNotice(navigationState);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, navigate, navigationState]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
      case 'ONLINE':
        return 'success';
      case 'OFFLINE':
      case 'ERROR':
        return 'error';
      default:
        return 'default';
    }
  };

  const getObservationChip = (sensor: Sensor) => {
    switch (sensor.observation?.status) {
      case 'ready_for_review':
        return { label: 'Ready for Review', color: 'success' as const };
      case 'awaiting_data':
        return { label: 'Awaiting Data', color: 'warning' as const };
      case 'observing':
        return { label: 'Observing', color: 'info' as const };
      default:
        return null;
    }
  };

  if (loading) {
    return <ControllerDashboardSkeleton />;
  }

  if (!controller) {
    return (
      <Container>
        <Typography>Controller not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {saveNotice?.configurationSaved && (
        <Alert
          severity={(saveNotice.validationWarnings || []).length > 0 ? 'warning' : 'success'}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            {saveNotice.configuredSensorName || 'Sensor'} is now configured.
          </Typography>
          <Typography variant="body2">
            {saveNotice.observationMessage || 'The system is now observing live readings and can suggest refinements later.'}
          </Typography>
          {(saveNotice.validationWarnings || []).length > 0 && (
            <Box component="ul" sx={{ pl: 2, mb: 0, mt: 1 }}>
              {(saveNotice.validationWarnings || []).map((warning) => (
                <li key={warning}>
                  <Typography variant="body2">{warning}</Typography>
                </li>
              ))}
            </Box>
          )}
        </Alert>
      )}

      <Card sx={{ mb: 3, bgcolor: '#3c3911', color: '#fffdf8' }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={2}>
            <Box>
              <Typography variant="overline" sx={{ color: '#e1c7a3', fontWeight: 800 }}>
                Controller workspace
              </Typography>
              <Typography variant="h4">{controller.name || 'Unnamed Controller'}</Typography>
            </Box>
            <Chip
              label={controller.status}
              color={getStatusColor(controller.status) as any}
              sx={{ bgcolor: controller.status === 'ONLINE' ? '#6c8930' : undefined, color: '#fffdf8' }}
            />
          </Box>
          {controller.purpose && (
            <Typography variant="body1" sx={{ color: 'rgba(255, 253, 248, 0.76)' }} gutterBottom>
              {controller.purpose}
            </Typography>
          )}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2 }}>
            {controller.location && (
              <Chip icon={<Place />} label={controller.location} sx={{ bgcolor: 'rgba(255, 253, 248, 0.12)', color: '#fffdf8' }} />
            )}
            <Chip icon={<Memory />} label={controller.hw_id} sx={{ bgcolor: 'rgba(255, 253, 248, 0.12)', color: '#fffdf8' }} />
          </Stack>
        </CardContent>
      </Card>

      <Box display="flex" justifyContent="space-between" alignItems="center" gap={2}>
        <Box>
          <Typography variant="overline" color="secondary" fontWeight={800}>
            Connected hardware
          </Typography>
          <Typography variant="h5">Sensors ({sensors.length})</Typography>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {sensors.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography align="center" color="text.secondary">
                  No sensors found. Sensors will appear here once the controller discovers them.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          sensors.map((sensor) => {
            const observationChip = getObservationChip(sensor);

            return (
              <Grid item xs={12} sm={6} key={sensor.id}>
                <Card
                  sx={
                    saveNotice?.configuredSensorId === sensor.id
                      ? {
                          border: '1px solid',
                          borderColor: 'success.main',
                          boxShadow: '0 22px 48px rgba(108, 137, 48, 0.14)',
                        }
                      : undefined
                  }
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(108, 137, 48, 0.12)' }}>
                          <DeviceThermostat color="primary" />
                        </Box>
                        <Typography variant="h6">
                          {sensor.name || `${sensor.type} Sensor`}
                        </Typography>
                      </Box>
                      <Chip
                        label={sensor.status}
                        color={getStatusColor(sensor.status) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {sensor.type}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={sensor.config_active ? 'Configured' : 'Needs Setup'}
                        color={sensor.config_active ? 'primary' : 'default'}
                      />
                      {observationChip && (
                        <Chip
                          size="small"
                          label={observationChip.label}
                          color={observationChip.color}
                        />
                      )}
                    </Stack>
                    {sensor.purpose ? (
                      <Typography variant="body2" color="text.secondary">
                        {sensor.purpose}
                      </Typography>
                    ) : sensor.config_active ? (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        {sensor.observation?.message || 'Configured and collecting live readings for later review.'}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        Set thresholds manually or use AI support to draft a starting point.
                      </Typography>
                    )}
                    <Button
                      variant="outlined"
                      startIcon={sensor.config_active ? <Tune /> : <Settings />}
                      size="small"
                      sx={{ mt: 2 }}
                      onClick={() => navigate(`/sensors/${sensor.id}/config`)}
                    >
                      {sensor.config_active ? 'Review Configuration' : 'Configure'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </Container>
  );
};

export default ControllerDashboard;
