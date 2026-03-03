import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Box,
} from '@mui/material';
import {
  Chip as ChipIcon,
  Dashboard,
  Notifications,
  AccountCircle,
} from '@mui/icons-material';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/controllers')) setValue(0);
    else if (path.startsWith('/monitoring')) setValue(1);
    else if (path.startsWith('/alerts')) setValue(2);
    else if (path.startsWith('/profile')) setValue(3);
  }, [location]);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    const routes = ['/controllers', '/monitoring', '/alerts', '/profile'];
    navigate(routes[newValue]);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Spectron
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1, pb: 7 }}>
        <Outlet />
      </Box>

      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      >
        <BottomNavigationAction label="Controllers" icon={<ChipIcon />} />
        <BottomNavigationAction label="Monitoring" icon={<Dashboard />} />
        <BottomNavigationAction label="Alerts" icon={<Notifications />} />
        <BottomNavigationAction label="Profile" icon={<AccountCircle />} />
      </BottomNavigation>
    </Box>
  );
};

export default Layout;
