import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Container,
  Fade,
  Grid,
  Paper,
  Skeleton,
  Stack,
} from '@mui/material';

const cardSkeleton = (key: number, height = 168) => (
  <Grid item xs={12} sm={6} md={4} key={key}>
    <Card>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Skeleton variant="rounded" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="70%" height={28} />
            <Skeleton width="45%" height={18} />
          </Box>
          <Skeleton variant="rounded" width={72} height={26} />
        </Stack>
        <Skeleton width="90%" />
        <Skeleton width="58%" />
        <Skeleton variant="rounded" height={height - 116} sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  </Grid>
);

export const PageHeaderSkeleton: React.FC = () => (
  <Box sx={{ mb: 3 }}>
    <Skeleton width={130} height={22} />
    <Skeleton width="min(440px, 80%)" height={48} />
    <Skeleton width="min(680px, 95%)" height={24} />
  </Box>
);

export const AuthGateSkeleton: React.FC = () => (
  <Fade in timeout={350}>
    <Box
      sx={{
        minHeight: '100vh',
        p: 2,
        background:
          'radial-gradient(circle at 5% 0%, rgba(235, 79, 18, 0.12), transparent 30rem), linear-gradient(135deg, #faf0ea 0%, #fff8ed 48%, #edf4df 100%)',
      }}
    >
      <Stack direction="row" spacing={2} sx={{ height: '100%' }}>
        <Skeleton
          variant="rounded"
          width={236}
          sx={{ display: { xs: 'none', md: 'block' }, minHeight: 'calc(100vh - 32px)' }}
        />
        <Box sx={{ flex: 1, pt: { xs: 3, md: 4 }, px: { xs: 0, md: 2 } }}>
          <Skeleton width={180} height={34} sx={{ mb: 3 }} />
          <Skeleton variant="rounded" height={190} sx={{ mb: 3, borderRadius: 2 }} />
          <Grid container spacing={2}>
            {[0, 1, 2, 3].map((item) => cardSkeleton(item, 168))}
          </Grid>
        </Box>
      </Stack>
    </Box>
  </Fade>
);

export const ControllersSkeleton: React.FC = () => (
  <Fade in timeout={350}>
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Skeleton variant="rounded" height={190} sx={{ mb: 3, borderRadius: 2 }} />
      <Grid container spacing={2}>
        {[0, 1, 2, 3, 4, 5].map((item) => cardSkeleton(item))}
      </Grid>
    </Container>
  </Fade>
);

export const ControllerDashboardSkeleton: React.FC = () => (
  <Fade in timeout={350}>
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Skeleton variant="rounded" height={190} sx={{ mb: 3, borderRadius: 2 }} />
      <Box sx={{ mb: 2 }}>
        <Skeleton width={150} height={22} />
        <Skeleton width={220} height={36} />
      </Box>
      <Grid container spacing={2}>
        {[0, 1, 2, 3].map((item) => cardSkeleton(item, 190))}
      </Grid>
    </Container>
  </Fade>
);

export const AlertsSkeleton: React.FC = () => (
  <Fade in timeout={350}>
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <PageHeaderSkeleton />
      <Stack spacing={2}>
        {[0, 1, 2, 3].map((item) => (
          <Card key={item}>
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Skeleton variant="rounded" width={44} height={44} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="55%" height={30} />
                  <Skeleton width="34%" height={20} />
                  <Skeleton width="92%" sx={{ mt: 1 }} />
                </Box>
                <Skeleton variant="rounded" width={84} height={26} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  </Fade>
);

export const MonitoringSkeleton: React.FC = () => (
  <Fade in timeout={350}>
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <PageHeaderSkeleton />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {[0, 1, 2].map((item) => (
          <Card sx={{ flex: 1 }} key={item}>
            <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Skeleton variant="rounded" width={44} height={44} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="70%" />
                <Skeleton width="32%" height={34} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <Grid container spacing={2}>
        {[0, 1, 2, 3].map((item) => (
          <Grid item xs={12} md={6} key={item}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Skeleton width="55%" height={30} />
                <Skeleton width="35%" />
                <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                  <Skeleton variant="rounded" width={92} height={26} />
                  <Skeleton variant="rounded" width={118} height={26} />
                </Stack>
                <Skeleton variant="rounded" height={220} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Fade>
);

export const SensorConfigSkeleton: React.FC = () => (
  <Fade in timeout={350}>
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3.5 }, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton width={120} height={22} />
            <Skeleton width="min(460px, 80%)" height={48} />
          </Box>
          <Skeleton variant="rounded" width={52} height={52} />
        </Stack>
        <Stack spacing={3}>
          {[0, 1, 2].map((section) => (
            <Box key={section}>
              <Skeleton width={180} height={28} />
              <Skeleton width="min(620px, 95%)" />
              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                {[0, 1, 2, 3].map((field) => (
                  <Grid item xs={12} md={6} key={field}>
                    <Skeleton variant="rounded" height={64} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Container>
  </Fade>
);
