import React, { useEffect, useMemo, useState } from 'react';
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
  Grid,
  TextField,
  Alert,
  IconButton,
  InputAdornment,
  Collapse,
} from '@mui/material';
import {
  Logout,
  PhotoCamera,
  Save,
  LockReset,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword, updateProfile } from '../../services/authService';

const getApiMessage = (error: any, fallback: string) => {
  const responseData = error?.response?.data;
  return typeof responseData === 'string' ? responseData : responseData?.message || fallback;
};

const getInitials = (name?: string) => {
  const source = (name || 'Spectron User').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
};

const isStrongEnough = (password: string) => {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
};

const Profile: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setAvatarUrl(user?.avatar_url || '');
  }, [user]);

  useEffect(() => {
    if (!profileMessage && !profileError && !passwordMessage && !passwordError) {
      return;
    }

    const timer = window.setTimeout(() => {
      setProfileMessage('');
      setProfileError('');
      setPasswordMessage('');
      setPasswordError('');
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [profileMessage, profileError, passwordMessage, passwordError]);

  const savedName = user?.name?.trim() || '';
  const savedPhone = user?.phone?.trim() || '';
  const profileDisplayName = savedName || 'Spectron User';
  const initials = useMemo(() => getInitials(savedName), [savedName]);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const saveAvatar = async (nextAvatarUrl: string) => {
    setAvatarSaving(true);
    setProfileMessage('');
    setProfileError('');

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatar_url: nextAvatarUrl,
      });
      await refreshUser();
      setProfileMessage(nextAvatarUrl ? 'Profile picture updated successfully.' : 'Profile picture removed.');
    } catch (error: any) {
      setProfileError(getApiMessage(error, 'Failed to update profile picture.'));
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileMessage('');
    setProfileError('');

    if (!file.type.startsWith('image/')) {
      setProfileError('Please upload an image file.');
      return;
    }

    if (file.size > 1024 * 1024) {
      setProfileError('Avatar image must be under 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const nextAvatarUrl = typeof reader.result === 'string' ? reader.result : '';
      setAvatarUrl(nextAvatarUrl);
      if (nextAvatarUrl) {
        saveAvatar(nextAvatarUrl);
      }
    };
    reader.onerror = () => {
      setProfileError('Could not read the selected image.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    saveAvatar('');
  };

  const handleSaveProfile = async () => {
    setProfileMessage('');
    setProfileError('');
    setProfileSaving(true);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl,
      });
      await refreshUser();
      setProfileMessage('Profile details updated successfully.');
    } catch (error: any) {
      setProfileError(getApiMessage(error, 'Failed to update profile.'));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage('');
    setPasswordError('');

    if (!currentPassword) {
      setPasswordError('Enter your current password.');
      return;
    }

    if (!isStrongEnough(newPassword)) {
      setPasswordError('New password must be at least 8 characters and include a letter and a number.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated successfully.');
    } catch (error: any) {
      setPasswordError(getApiMessage(error, 'Failed to update password.'));
    } finally {
      setPasswordSaving(false);
    }
  };

  const passwordAdornment = (
    visible: boolean,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    showLabel: string,
    hideLabel: string
  ) => (
    <InputAdornment position="end">
      <IconButton
        aria-label={visible ? hideLabel : showLabel}
        onClick={() => setVisible((current) => !current)}
        onMouseDown={(event) => event.preventDefault()}
        edge="end"
      >
        {visible ? <Visibility /> : <VisibilityOff />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="overline" color="secondary" fontWeight={800}>
          Account
        </Typography>
        <Typography variant="h4">Profile</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your profile details, avatar, and password.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack alignItems="center" textAlign="center" spacing={2}>
                <Avatar
                  src={avatarUrl || undefined}
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.dark',
                    fontSize: 38,
                    fontWeight: 800,
                    border: '6px solid #faf0ea',
                    boxShadow: '0 16px 34px rgba(60, 57, 17, 0.16)',
                  }}
                >
                  {initials}
                </Avatar>
                <Box>
                  <Typography variant="h5">{profileDisplayName}</Typography>
                  {savedName && user?.email && (
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  )}
                  {savedPhone && (
                    <Typography variant="body2" color="text.secondary">
                      {savedPhone}
                    </Typography>
                  )}
                </Box>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  disabled={avatarSaving || profileSaving}
                >
                  {avatarSaving ? 'Saving Picture...' : 'Upload Picture'}
                  <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
                </Button>
                {avatarUrl && (
                  <Button
                    size="small"
                    color="secondary"
                    onClick={handleRemoveAvatar}
                    disabled={avatarSaving || profileSaving}
                  >
                    Remove Picture
                  </Button>
                )}
              </Stack>

              <Button
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ mt: 4 }}
                fullWidth
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={7}>
          <Stack spacing={2.5}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h5">Edit Profile Details</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  Update the personal details shown across your Spectron workspace.
                </Typography>

                <Collapse in={Boolean(profileMessage || profileError)} timeout={300} unmountOnExit>
                  <Alert severity={profileError ? 'error' : 'success'} sx={{ mb: 2 }}>
                    {profileError || profileMessage}
                  </Alert>
                </Collapse>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      placeholder="Your full name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      disabled={profileSaving}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      placeholder="+94 77 123 4567"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      disabled={profileSaving}
                    />
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  sx={{ mt: 2.5 }}
                >
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                <Typography variant="h5">Update Password</Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                  Use at least 8 characters with a letter and a number.
                </Typography>

                <Collapse in={Boolean(passwordMessage || passwordError)} timeout={300} unmountOnExit>
                  <Alert severity={passwordError ? 'error' : 'success'} sx={{ mb: 2 }}>
                    {passwordError || passwordMessage}
                  </Alert>
                </Collapse>

                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    disabled={passwordSaving}
                    InputProps={{
                      endAdornment: passwordAdornment(
                        showCurrentPassword,
                        setShowCurrentPassword,
                        'Show current password',
                        'Hide current password'
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    disabled={passwordSaving}
                    InputProps={{
                      endAdornment: passwordAdornment(
                        showNewPassword,
                        setShowNewPassword,
                        'Show new password',
                        'Hide new password'
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    disabled={passwordSaving}
                    InputProps={{
                      endAdornment: passwordAdornment(
                        showConfirmPassword,
                        setShowConfirmPassword,
                        'Show confirm password',
                        'Hide confirm password'
                      ),
                    }}
                  />
                </Stack>

                <Button
                  variant="contained"
                  startIcon={<LockReset />}
                  onClick={handleChangePassword}
                  disabled={passwordSaving}
                  sx={{ mt: 2.5 }}
                >
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
