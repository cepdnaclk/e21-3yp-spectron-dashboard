import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Fab,
  CircularProgress,
} from '@mui/material';
import { Add, Chip as ChipIcon } from '@mui/icons-material';
import { getControllers, Controller } from '../../services/controllerService';

const Controllers: React.FC = () => {
  const navigate = useNavigate();
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadControllers();
  }, []);

  const loadControllers = async () => {
    try {
      const data = await getControllers();
      setControllers(data);
    } catch (error) {
      console.error('Error loading controllers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'success';
      case 'OFFLINE':
        return 'error';
      case 'PENDING_CONFIG':
        return 'warning';
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

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Controllers
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {controllers.length === 0 ? (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography align="center" color="text.secondary">
                  No controllers found. Tap the + button to scan a QR code and add a controller.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ) : (
          controllers.map((controller) => (
            <Grid item xs={12} sm={6} md={4} key={controller.id}>
              <Card
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/controllers/${controller.id}`)}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ChipIcon color="primary" />
                      <Typography variant="h6">
                        {controller.name || 'Unnamed Controller'}
                      </Typography>
                    </Box>
                    <Chip
                      label={controller.status}
                      color={getStatusColor(controller.status) as any}
                      size="small"
                    />
                  </Box>
                  {controller.purpose && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
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
            </Grid>
          ))
        )}
      </Grid>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 80, right: 16 }}
        onClick={() => navigate('/controllers/pair')}
      >
        <Add />
      </Fab>
    </Container>
  );
};

export default Controllers;
