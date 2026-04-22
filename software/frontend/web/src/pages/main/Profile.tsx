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
  Stack,
  Chip,
} from '@mui/material';
import { Logout, Workspaces } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="secondary" fontWeight={800}>
          Account
        </Typography>
        <Typography variant="h4">Profile</Typography>
      </Box>

      <Card sx={{ mt: 2 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.dark', fontSize: 30 }}>
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5">{user?.email}</Typography>
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
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {user.accounts.map((account) => (
                  <Chip
                    key={account.id}
                    icon={<Workspaces />}
                    label={`${account.name} (${account.role})`}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
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
