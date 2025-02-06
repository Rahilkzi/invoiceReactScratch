import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  styled,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const PreviewContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
}));

const InvoiceForm = () => {
  const navigate = useNavigate();
  const [companyDetails, setCompanyDetails] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    vehicleNumber: '',
    items: [{ service: '', quantity: 1, price: 0 }],
    discount: 0,
    notes: '',
    createdAt: new Date().toISOString()
  });

  useEffect(() => {
    // Load company settings
    const settings = JSON.parse(localStorage.getItem('companySettings') || '{}');
    setCompanyDetails(settings);

    // Check if we're editing an existing invoice
    const editInvoice = localStorage.getItem('editInvoice');
    if (editInvoice) {
      const parsedInvoice = JSON.parse(editInvoice);
      setInvoiceData(parsedInvoice);
      localStorage.removeItem('editInvoice'); // Clear the edit data
    } else {
      // Generate new invoice number for new invoices
      generateInvoiceNumber();
    }
  }, []);

  const generateInvoiceNumber = () => {
    try {
      const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      let newNumber = 1;

      if (savedInvoices.length > 0) {
        // Find the highest invoice number
        const numbers = savedInvoices
          .map(inv => parseInt(inv.invoiceNumber.split('-')[1]) || 0);
        newNumber = Math.max(...numbers) + 1;
      }

      const invoiceNumber = `INV-${String(newNumber).padStart(3, '0')}`;

      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: invoiceNumber
      }));
    } catch (error) {
      console.error('Error generating invoice number:', error);
      // Fallback invoice number
      const fallbackNumber = `INV-${String(Date.now()).slice(-3)}`;
      setInvoiceData(prev => ({
        ...prev,
        invoiceNumber: fallbackNumber
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setInvoiceData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { service: '', quantity: 1, price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (invoiceData.items.length > 1) {
      const newItems = invoiceData.items.filter((_, i) => i !== index);
      setInvoiceData(prev => ({
        ...prev,
        items: newItems
      }));
    }
  };

  const validateForm = () => {
    if (!invoiceData.customerName) {
      setSnackbar({
        open: true,
        message: 'Please enter customer name',
        severity: 'error'
      });
      return false;
    }

    if (invoiceData.items.some(item => !item.service)) {
      setSnackbar({
        open: true,
        message: 'Please fill in all service items',
        severity: 'error'
      });
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');

      // Check if we're editing an existing invoice
      const existingIndex = savedInvoices.findIndex(inv => inv.invoiceNumber === invoiceData.invoiceNumber);

      if (existingIndex !== -1) {
        // Update existing invoice
        savedInvoices[existingIndex] = {
          ...invoiceData,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem('invoices', JSON.stringify(savedInvoices));
        
        setSnackbar({
          open: true,
          message: 'Invoice updated successfully',
          severity: 'success'
        });
        
        // Redirect to saved invoices after successful edit
        navigate('/saved-invoices');
      } else {
        // Add new invoice
        savedInvoices.unshift(invoiceData);
        localStorage.setItem('invoices', JSON.stringify(savedInvoices));

        setSnackbar({
          open: true,
          message: 'Invoice saved successfully',
          severity: 'success'
        });

        // Clear form for new invoice
        setInvoiceData({
          invoiceNumber: '',
          date: new Date().toISOString().split('T')[0],
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          customerAddress: '',
          vehicleNumber: '',
          items: [{ service: '', quantity: 1, price: 0 }],
          discount: 0,
          notes: '',
          createdAt: new Date().toISOString()
        });
        generateInvoiceNumber();
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      setSnackbar({
        open: true,
        message: 'Error saving invoice',
        severity: 'error'
      });
    }
  };

  const handleSaveAndDownload = async () => {
    if (!validateForm()) return;

    try {
      await handleSave();
      const doc = generateInvoicePDF(invoiceData, companyDetails);
      doc.save(`Invoice-${invoiceData.invoiceNumber}.pdf`);

      setSnackbar({
        open: true,
        message: 'Invoice saved and downloaded successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnackbar({
        open: true,
        message: 'Error generating PDF',
        severity: 'error'
      });
    }
  };

  const handlePreview = () => {
    if (!validateForm()) return;

    // Get company settings for preview
    const settings = JSON.parse(localStorage.getItem('companySettings') || '{}');

    // Create preview data
    const previewData = {
      ...invoiceData,
      companyDetails: settings,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('previewInvoice', JSON.stringify(previewData));
    navigate('/preview');
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce(
      (sum, item) => sum + (item.quantity * item.price),
      0
    );
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = (subtotal * invoiceData.discount) / 100;
    return subtotal - discountAmount;
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="xlg">
      {/* Navigation Buttons */}
      <Paper elevation={3} sx={{ p: 2, mb: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/dashboard')}
            size="large"
          >
            Dashboard
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ListAltIcon />}
            onClick={() => navigate('/saved-invoices')}
            size="large"
          >
            View All Invoices
          </Button>
        </Box>
      </Paper>

      {/* Form Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box component={Paper} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Customer Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Invoice Number"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={handleInputChange}
                  required
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  name="date"
                  value={invoiceData.date}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  name="customerName"
                  value={invoiceData.customerName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Email"
                  name="customerEmail"
                  value={invoiceData.customerEmail}
                  onChange={handleInputChange}
                  type="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Customer Phone"
                  name="customerPhone"
                  value={invoiceData.customerPhone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={invoiceData.vehicleNumber}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Customer Address"
                  name="customerAddress"
                  value={invoiceData.customerAddress}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>

            <Typography variant="h5" gutterBottom sx={{ mt: 4, color: 'primary.main', fontWeight: 600 }}>
              Service Items
            </Typography>
            {invoiceData.items.map((item, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Service"
                    value={item.service}
                    onChange={(e) => handleItemChange(index, 'service', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={1}>
                  <IconButton
                    color="error"
                    onClick={() => removeItem(index)}
                    disabled={invoiceData.items.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addItem}
              variant="outlined"
              sx={{ mt: 2 }}
            >
              Add Item
            </Button>

            <Typography variant="h5" gutterBottom sx={{ mt: 4, color: 'primary.main', fontWeight: 600 }}>
              Additional Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Discount (%)"
                  type="number"
                  name="discount"
                  value={invoiceData.discount}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={invoiceData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Preview Section */}
        <Grid item xs={12} md={5}>
          <PreviewContainer>
            <Box sx={{ p: 2 }}>
              {/* Company Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                
                <Box>
                  {companyDetails?.logo && (
                    <img
                      src={companyDetails.logo}
                      alt="Company Logo"
                      style={{ maxWidth: '120px', height: 'auto', marginBottom: '10px' }}
                    />
                  )}

                  
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {companyDetails?.companyName || 'Company Name'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {companyDetails?.address || 'Company Address'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {companyDetails?.phone || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {companyDetails?.email || 'N/A'}
                  </Typography>
                </Box>
                <Box>
          
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Invoice #:</strong> {invoiceData.invoiceNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Date:</strong> {invoiceData.date}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Customer Details */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={9}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Bill To:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {invoiceData.customerName || 'Customer Name'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoiceData.customerAddress || 'Customer Address'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Phone: {invoiceData.customerPhone || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {invoiceData.customerEmail || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vehicle Number: {invoiceData.vehicleNumber || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item md={3}>
                {companyDetails && companyDetails.qrCode && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', pt: 1 }}>
                  <img
                    src={companyDetails.qrCode}
                    alt="Payment QR Code"
                    style={{ width: '150px', height: '150px' }}
                  />
                </Box>
              )}
                </Grid>
              </Grid>

              {/* Service Items */}
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Service Details:
              </Typography>
              <Box sx={{ mb: 3, maxHeight: '200px', overflowY: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoiceData.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.service || 'N/A'}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                        <TableCell align="right">₹{(item.quantity * item.price).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              {/* Totals */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1, mb: 3 }}>
                <Typography variant="body2">
                  Subtotal: <strong>₹{calculateSubtotal().toFixed(2)}</strong>
                </Typography>
                {invoiceData.discount > 0 && (
                  <Typography variant="body2" color="error">
                    Discount ({invoiceData.discount}%): -₹{((calculateSubtotal() * invoiceData.discount) / 100).toFixed(2)}
                  </Typography>
                )}
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Total Amount: ₹{calculateTotal().toFixed(2)}
                </Typography>
              </Box>

              {/* Notes */}
              {invoiceData.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Notes:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoiceData.notes}
                  </Typography>
                </Box>
              )}

              {/* Terms and Conditions */}
              {companyDetails?.termsAndConditions && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Terms & Conditions:
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {companyDetails.termsAndConditions}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                mt: 2,
                p: 3,
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'background.default'
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                size="large"
                fullWidth
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  boxShadow: 2
                }}
              >
                Save Invoice
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<FileDownloadIcon />}
                onClick={handleSaveAndDownload}
                size="large"
                fullWidth
              >
                Download PDF
              </Button>
              <Button
                variant="text"
                color="error"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear the form? All unsaved changes will be lost.')) {
                    setInvoiceData({
                      invoiceNumber: '',
                      date: new Date().toISOString().split('T')[0],
                      customerName: '',
                      customerEmail: '',
                      customerPhone: '',
                      customerAddress: '',
                      vehicleNumber: '',
                      items: [{ service: '', quantity: 1, price: 0 }],
                      discount: 0,
                      notes: '',
                      createdAt: new Date().toISOString()
                    });
                    generateInvoiceNumber();
                  }
                }}
                size="medium"
              >
                Clear Form
              </Button>
            </Box>
          </PreviewContainer>
        </Grid>
      </Grid>

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
    </Container>
  );
};

export default InvoiceForm;
