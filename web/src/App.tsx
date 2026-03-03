import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Controllers from './pages/main/Controllers';
import ControllerDashboard from './pages/main/ControllerDashboard';
import SensorConfig from './pages/main/SensorConfig';
import Monitoring from './pages/main/Monitoring';
import Alerts from './pages/main/Alerts';
import Profile from './pages/main/Profile';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ee',
    },
    secondary: {
      main: '#03dac4',
    },
  },
});

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/signin" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/controllers" replace />} />
        <Route path="controllers" element={<Controllers />} />
        <Route path="controllers/:id" element={<ControllerDashboard />} />
        <Route path="sensors/:id/config" element={<SensorConfig />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
