import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Avatar,
  Stack,
  ButtonBase,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Hub as ChipIcon,
  Dashboard,
  Notifications,
  AccountCircle,
  Spa,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const routes = [
  { label: 'Controllers', path: '/controllers', icon: <ChipIcon /> },
  { label: 'Monitoring', path: '/monitoring', icon: <Dashboard /> },
  { label: 'Alerts', path: '/alerts', icon: <Notifications /> },
  { label: 'Profile', path: '/profile', icon: <AccountCircle /> },
];

const getInitials = (name?: string) => {
  const source = (name || 'Spectron User').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [value, setValue] = React.useState(0);
  const displayName = user?.name || 'Spectron User';
  const userInitials = getInitials(user?.name);

  React.useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/controllers')) setValue(0);
    else if (path.startsWith('/monitoring')) setValue(1);
    else if (path.startsWith('/alerts')) setValue(2);
    else if (path.startsWith('/profile')) setValue(3);
  }, [location]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    navigate(routes[newValue].path);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 5% 0%, rgba(235, 79, 18, 0.12), transparent 30rem), linear-gradient(135deg, #faf0ea 0%, #fff8ed 48%, #edf4df 100%)',
      }}
    >
      {isDesktop && (
        <Box
          component="aside"
          sx={{
            width: 268,
            p: 2,
            position: 'fixed',
            inset: '0 auto 0 0',
          }}
        >
          <Box
            sx={{
              height: '100%',
              bgcolor: '#fffdf8',
              border: '1px solid rgba(60, 57, 17, 0.12)',
              borderRadius: 2,
              p: 2,
              boxShadow: '0 22px 50px rgba(60, 57, 17, 0.1)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                <Spa />
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ lineHeight: 1 }}>
                  Spectron
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Smart monitoring
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1}>
              {routes.map((item, index) => (
                <ButtonBase
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    justifyContent: 'flex-start',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: 2,
                    color: value === index ? '#fffdf8' : 'text.secondary',
                    bgcolor: value === index ? 'primary.dark' : 'transparent',
                    '&:hover': {
                      bgcolor: value === index ? 'primary.dark' : 'rgba(108, 137, 48, 0.1)',
                    },
                    '& .MuiSvgIcon-root': {
                      color: value === index ? 'secondary.light' : 'primary.main',
                    },
                  }}
                >
                  {item.icon}
                  <Typography variant="body2" fontWeight={800}>
                    {item.label}
                  </Typography>
                </ButtonBase>
              ))}
            </Stack>

            <Box sx={{ mt: 'auto', p: 1.5, borderRadius: 2, bgcolor: '#faf0ea' }}>
              <Typography variant="caption" color="text.secondary">
                Signed in as
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Avatar
                  src={user?.avatar_url || undefined}
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: 'primary.main',
                    fontSize: 13,
                    fontWeight: 800,
                  }}
                >
                  {userInitials}
                </Avatar>
                <Typography variant="body2" noWrap fontWeight={800}>
                  {displayName}
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Box>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          ml: { md: '268px' },
          pb: { xs: 10, md: 4 },
        }}
      >
        <Box
          component="header"
          sx={{
            px: { xs: 2, md: 4 },
            pt: { xs: 2, md: 3 },
            pb: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {!isDesktop && (
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar sx={{ bgcolor: 'secondary.main', width: 38, height: 38 }}>
                <Spa />
              </Avatar>
              <Typography variant="h6">Spectron</Typography>
            </Stack>
          )}
          <Chip
            label="Live IoT workspace"
            color="secondary"
            variant="outlined"
            sx={{ ml: 'auto', bgcolor: 'rgba(255, 253, 248, 0.72)' }}
          />
        </Box>
        <Outlet />
      </Box>

      {!isDesktop && (
        <BottomNavigation
          value={value}
          onChange={handleChange}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 12,
            left: 12,
            right: 12,
            borderRadius: 2,
            border: '1px solid rgba(60, 57, 17, 0.12)',
            boxShadow: '0 18px 36px rgba(60, 57, 17, 0.18)',
            overflow: 'hidden',
            zIndex: 20,
          }}
        >
          {routes.map((item) => (
            <BottomNavigationAction key={item.path} label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      )}
    </Box>
  );
};

export default Layout;
