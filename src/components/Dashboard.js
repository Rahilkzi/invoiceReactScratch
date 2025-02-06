import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    pendingInvoices: 0
  });

  useEffect(() => {
    const loadDashboardData = () => {
      const savedInvoices = JSON.parse(localStorage.getItem('invoices')) || [];
      
      // Calculate stats
      const totalAmount = savedInvoices.reduce((sum, invoice) => {
        return sum + invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
      }, 0);

      setStats({
        totalInvoices: savedInvoices.length,
        totalAmount: totalAmount,
        pendingInvoices: savedInvoices.length // For now, considering all invoices as pending
      });
    };

    loadDashboardData();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Garage Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#2196f3',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>Total Invoices</Typography>
            <Typography variant="h3">{stats.totalInvoices}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#e91e63',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>Total Amount</Typography>
            <Typography variant="h3">₹{stats.totalAmount.toFixed(2)}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#f44336',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>Pending Invoices</Typography>
            <Typography variant="h3">{stats.pendingInvoices}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: '0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
            onClick={() => navigate('/create-invoice')}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#2196f3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <AddIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" gutterBottom>Create Invoice</Typography>
            <Button variant="contained" size="small" sx={{ mt: 1 }}>
              Go to Create Invoice
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: '0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
            onClick={() => navigate('/saved-invoices')}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#e91e63',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <ListAltIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" gutterBottom>View Invoices</Typography>
            <Button variant="contained" size="small" sx={{ mt: 1 }}>
              Go to View Invoices
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: '0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}
            onClick={() => navigate('/settings')}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: '#4caf50',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}
            >
              <SettingsIcon sx={{ color: 'white', fontSize: 30 }} />
            </Box>
            <Typography variant="h6" gutterBottom>Settings</Typography>
            <Button variant="contained" size="small" sx={{ mt: 1 }}>
              Go to Settings
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity Section */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Paper sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Welcome to your Garage Invoice Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by creating your first invoice or updating your business settings
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button variant="contained" onClick={() => navigate('/create-invoice')}>
                Create Invoice
              </Button>
              <Button variant="outlined" onClick={() => navigate('/settings')}>
                Update Settings
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
