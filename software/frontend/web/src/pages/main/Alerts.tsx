import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Button,
  Stack,
} from '@mui/material';
import { NotificationsActive, DoneAll } from '@mui/icons-material';
import { getAlerts, acknowledgeAlert, Alert as AlertItem } from '../../services/alertService';
import { format } from 'date-fns';
import { AlertsSkeleton } from '../../components/LoadingSkeletons';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = (await getAlerts()) ?? [];
      data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setAlerts(data);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId);
      loadAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'WARN':
        return 'warning';
      case 'INFO':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <AlertsSkeleton />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="secondary" fontWeight={800}>
          Attention center
        </Typography>
        <Typography variant="h4">Alerts</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Review critical events and clear resolved notifications.
        </Typography>
      </Box>

      {alerts.length === 0 ? (
        <Card>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <DoneAll color="primary" sx={{ fontSize: 46, mb: 1 }} />
            <Typography variant="h6">No alerts</Typography>
            <Typography color="text.secondary">
              You are all caught up.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        alerts.map((alert) => (
          <Card key={alert.id} sx={{ mb: 2, opacity: alert.acknowledged_at ? 0.7 : 1 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} mb={1}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(235, 79, 18, 0.12)' }}>
                    <NotificationsActive color="secondary" />
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      {alert.type.replace(/_/g, ' ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label={alert.severity}
                  color={getSeverityColor(alert.severity) as any}
                  size="small"
                />
              </Box>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {alert.message}
              </Typography>
              {!alert.acknowledged_at && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => handleAcknowledge(alert.id)}
                  sx={{ mt: 2 }}
                >
                  Acknowledge
                </Button>
              )}
              {alert.acknowledged_at && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Acknowledged at {format(new Date(alert.acknowledged_at), 'MMM dd, yyyy HH:mm')}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
};

export default Alerts;
