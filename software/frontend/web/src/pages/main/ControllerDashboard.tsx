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
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { Settings, DeviceThermostat } from '@mui/icons-material';
import { getController, Controller } from '../../services/controllerService';
import { getSensors, Sensor } from '../../services/sensorService';

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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!controller) {
    return (
      <Container>
        <Typography>Controller not found</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
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

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">{controller.name || 'Unnamed Controller'}</Typography>
            <Chip
              label={controller.status}
              color={getStatusColor(controller.status) as any}
            />
          </Box>
          {controller.purpose && (
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {controller.purpose}
            </Typography>
          )}
          {controller.location && (
            <Typography variant="body2" color="text.secondary">
              {controller.location}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Sensors ({sensors.length})
      </Typography>

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
                        }
                      : undefined
                  }
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <DeviceThermostat color="primary" />
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
                      startIcon={<Settings />}
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
