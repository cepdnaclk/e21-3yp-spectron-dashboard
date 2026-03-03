import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { Settings, Thermometer } from '@mui/icons-material';
import { getController, Controller } from '../../services/controllerService';
import { getSensors, Sensor } from '../../services/sensorService';

const ControllerDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [controller, setController] = useState<Controller | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
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
  };

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
              📍 {controller.location}
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
          sensors.map((sensor) => (
            <Grid item xs={12} sm={6} key={sensor.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Thermometer color="primary" />
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
                  {sensor.purpose ? (
                    <Typography variant="body2" color="text.secondary">
                      {sensor.purpose}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Not configured
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/sensors/${sensor.id}/config`)}
                  >
                    Configure
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default ControllerDashboard;
