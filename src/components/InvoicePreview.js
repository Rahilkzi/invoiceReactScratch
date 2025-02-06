import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  styled,
  Grid,
  Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const PreviewPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

const InvoicePreview = () => {
  const [invoice, setInvoice] = useState(null);
  const [companySettings, setCompanySettings] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedInvoice = JSON.parse(localStorage.getItem('previewInvoice'));

    if (!savedInvoice) {
      navigate('/saved-invoices');
      return;
    }

    // Get company settings from the invoice if available, otherwise from localStorage
    const settings = savedInvoice.companyDetails || JSON.parse(localStorage.getItem('companySettings') || '{}');

    setInvoice(savedInvoice);
    setCompanySettings(settings);
  }, [navigate]);

  const handleBack = () => {
    navigate('/saved-invoices');
  };

  const handleDownloadPDF = () => {
    if (invoice && companySettings) {
      const doc = generateInvoicePDF(invoice, companySettings);
      doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
    }
  };

  const calculateSubtotal = () => {
    if (!invoice) return 0;
    return invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = (subtotal * (invoice?.tax || 0)) / 100;
    const discountAmount = (subtotal * (invoice?.discount || 0)) / 100;
    return subtotal + taxAmount - discountAmount;
  };

  if (!invoice || !companySettings) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Back to Invoices
        </Button>
        <Button
          startIcon={<FileDownloadIcon />}
          onClick={handleDownloadPDF}
          variant="contained"
          color="primary"
        >
          Download PDF
        </Button>
      </Box>

      <PreviewPaper>
        <Grid container spacing={3}>
          {/* Company Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                {companySettings.logo && (
                  <img
                    src={companySettings.logo}
                    alt="Company Logo"
                    style={{ maxHeight: '80px', marginBottom: '1rem' }}
                  />
                )}
                <Typography variant="h5" gutterBottom>
                  {companySettings.companyName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {companySettings.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Phone: {companySettings.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Email: {companySettings.email}
                </Typography>

              </Box>
              {companySettings.qrCode && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', pt: 1 }}>
                  <img
                    src={companySettings.qrCode}
                    alt="Payment QR Code"
                    style={{ width: '100px', height: '100px' }}
                  />
                </Box>
              )}
            </Box>
          </Grid>

          {/* Invoice Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3, textAlign: 'right' }}>
              <Typography variant="h6" gutterBottom>
                Invoice #{invoice.invoiceNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {new Date(invoice.date).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>

          {/* Customer Details */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Bill To:
              </Typography>
              <Typography variant="body1">{invoice.customerName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {invoice.customerAddress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Phone: {invoice.customerPhone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {invoice.customerEmail}
              </Typography>

              <Typography variant="body2"  color="text.secondary" >
                Vehicle: {invoice.vehicleNumber}
              </Typography>
            
            </Box>
          </Grid>



          {/* Service Items */}
          <Grid item xs={12}>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Service Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.serviceType}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">₹{item.price.toFixed(2)}</TableCell>
                      <TableCell align="right">
                        ₹{(item.quantity * item.price).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Totals */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Typography variant="body1">
                Subtotal: ₹{calculateSubtotal().toFixed(2)}
              </Typography>
              {invoice.tax > 0 && (
                <Typography variant="body1">
                  Tax ({invoice.tax}%): ₹{((calculateSubtotal() * invoice.tax) / 100).toFixed(2)}
                </Typography>
              )}
              {invoice.discount > 0 && (
                <Typography variant="body1">
                  Discount ({invoice.discount}%): ₹{((calculateSubtotal() * invoice.discount) / 100).toFixed(2)}
                </Typography>
              )}
              <Typography variant="h6" sx={{ mt: 1 }}>
                Total: ₹{calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </Grid>

          {/* Terms and Bank Details */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            {companySettings.termsAndConditions && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Terms and Conditions:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {companySettings.termsAndConditions}
                </Typography>
              </Box>
            )}

          </Grid>
        </Grid>
      </PreviewPaper>
    </Box>
  );
};

export default InvoicePreview;
