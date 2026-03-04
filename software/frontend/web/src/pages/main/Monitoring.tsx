import React from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';

const Monitoring: React.FC = () => {
  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Monitoring Dashboard
      </Typography>
      <Card>
        <CardContent>
          <Typography>
            Detailed charts and real-time data visualization will be available here.
            This screen will show sensor readings, trends, and analytics.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Monitoring;
