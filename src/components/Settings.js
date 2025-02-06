import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  IconButton,
  styled,
  Snackbar,
  Alert,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,

} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptIcon from '@mui/icons-material/Receipt';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImagePreview = styled(Box)(({ theme }) => ({
  width: '200px',
  height: '200px',
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: theme.spacing(2),
  position: 'relative',
  '& img': {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
}));

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    logo: '',
    qrCode: '',
    termsAndConditions: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('companySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 500000) {
        setSnackbar({
          open: true,
          message: 'File size should be less than 500KB',
          severity: 'error',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings((prev) => ({
          ...prev,
          [type]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (type) => {
    setSettings((prev) => ({
      ...prev,
      [type]: '',
    }));
  };

  const handleSave = () => {
    localStorage.setItem('companySettings', JSON.stringify(settings));
    setSnackbar({
      open: true,
      message: 'Settings saved successfully!',
      severity: 'success',
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTogglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChangePassword = (e) => {
    e.preventDefault();

    const storedCredentials = JSON.parse(localStorage.getItem('userCredentials')) || {
      username: 'admin',
      password: 'admin123',
    };

    if (passwordForm.currentPassword !== storedCredentials.password) {
      setSnackbar({
        open: true,
        message: 'Current password is incorrect',
        severity: 'error',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({
        open: true,
        message: 'New passwords do not match',
        severity: 'error',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSnackbar({
        open: true,
        message: 'New password must be at least 6 characters long',
        severity: 'error',
      });
      return;
    }

    localStorage.setItem('userCredentials', JSON.stringify({
      ...storedCredentials,
      password: passwordForm.newPassword,
    }));

    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setSnackbar({
      open: true,
      message: 'Password changed successfully!',
      severity: 'success',
    });
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 3 }}>
      {/* Navigation Buttons */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DashboardIcon />}
          onClick={() => navigate('/dashboard')}
          sx={{ minWidth: '200px' }}
        >
          Go to Dashboard
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<ReceiptIcon />}
          onClick={() => navigate('/create-invoice')}
          sx={{ minWidth: '200px' }}
        >
          Create Invoice
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
        Company Settings
      </Typography>

      <StyledPaper>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          Company Information
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Company Name"
              name="companyName"
              value={settings.companyName}
              onChange={handleInputChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              name="address"
              value={settings.address}
              onChange={handleInputChange}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              value={settings.phone}
              onChange={handleInputChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={settings.email}
              onChange={handleInputChange}
              type="email"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Website"
              name="website"
              value={settings.website}
              onChange={handleInputChange}
            />
          </Grid>
     
        </Grid>
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          Company Logo & QR Code
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
            >
              Upload Logo
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'logo')}
              />
            </Button>
            {settings.logo && (
              <ImagePreview>
                <img src={settings.logo} alt="Company Logo" />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                  }}
                  onClick={() => handleDeleteImage('logo')}
                >
                  <DeleteIcon />
                </IconButton>
              </ImagePreview>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
            >
              Upload QR Code
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'qrCode')}
              />
            </Button>
            {settings.qrCode && (
              <ImagePreview>
                <img src={settings.qrCode} alt="QR Code" />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                  }}
                  onClick={() => handleDeleteImage('qrCode')}
                >
                  <DeleteIcon />
                </IconButton>
              </ImagePreview>
            )}
          </Grid>
        </Grid>
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          Terms and Conditions
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          name="termsAndConditions"
          value={settings.termsAndConditions}
          onChange={handleInputChange}
          placeholder="Enter your company's terms and conditions"
        />
      </StyledPaper>

      <StyledPaper>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          Change Password
        </Typography>
        <form onSubmit={handleChangePassword}>
          <FormControl sx={{ width: '100%', marginBottom: 2 }}>
            <InputLabel htmlFor="current-password">Current Password</InputLabel>
            <OutlinedInput
              id="current-password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              name="currentPassword"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('current')}
                    edge="end"
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Current Password"
            />
          </FormControl>
          <FormControl sx={{ width: '100%', marginBottom: 2 }}>
            <InputLabel htmlFor="new-password">New Password</InputLabel>
            <OutlinedInput
              id="new-password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              name="newPassword"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('new')}
                    edge="end"
                  >
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="New Password"
            />
          </FormControl>
          <FormControl sx={{ width: '100%', marginBottom: 2 }}>
            <InputLabel htmlFor="confirm-password">Confirm New Password</InputLabel>
            <OutlinedInput
              id="confirm-password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              name="confirmPassword"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('confirm')}
                    edge="end"
                  >
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Confirm New Password"
            />
          </FormControl>
          <Button type="submit" variant="contained" color="primary">
            Change Password
          </Button>
        </form>
      </StyledPaper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" onClick={handleSave} size="large">
          Save Settings
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
