import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Button,
} from '@mui/material';
import { getAlerts, acknowledgeAlert, Alert as AlertItem } from '../../services/alertService';
import { format } from 'date-fns';

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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Alerts
      </Typography>

      {alerts.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary">
              No alerts. You're all caught up!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        alerts.map((alert) => (
          <Card key={alert.id} sx={{ mb: 2, opacity: alert.acknowledged_at ? 0.7 : 1 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6">
                  {alert.type.replace(/_/g, ' ')}
                </Typography>
                <Chip
                  label={alert.severity}
                  color={getSeverityColor(alert.severity) as any}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {format(new Date(alert.created_at), 'MMM dd, yyyy HH:mm')}
              </Typography>
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
