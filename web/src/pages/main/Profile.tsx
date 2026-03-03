import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h5" gutterBottom>
        Profile
      </Typography>

      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ width: 64, height: 64 }}>
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{user?.email}</Typography>
              {user?.phone && (
                <Typography variant="body2" color="text.secondary">
                  {user.phone}
                </Typography>
              )}
            </Box>
          </Box>

          {user?.accounts && user.accounts.length > 0 && (
            <Box mt={2}>
              <Typography variant="subtitle1" gutterBottom>
                Accounts
              </Typography>
              {user.accounts.map((account) => (
                <Typography key={account.id} variant="body2">
                  {account.name} ({account.role})
                </Typography>
              ))}
            </Box>
          )}

          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            sx={{ mt: 3 }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
