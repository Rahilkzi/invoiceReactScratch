import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  styled,
  Tooltip,
  TablePagination,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Grid,
  MenuItem,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { format } from 'date-fns';
import { generateInvoicePDF } from '../utils/pdfGenerator';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  },
  transition: 'background-color 0.2s',
}));

const SavedInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    vehicleType: 'all',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [invoices, searchTerm, filters]);

  const loadInvoices = () => {
    try {
      const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
      const sortedInvoices = savedInvoices.sort((a, b) => 
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );
      setInvoices(sortedInvoices);
      setFilteredInvoices(sortedInvoices);

      if (sortedInvoices.length === 0) {
        setSnackbar({
          open: true,
          message: 'No invoices found',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setSnackbar({
        open: true,
        message: 'Error loading invoices',
        severity: 'error'
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...invoices];

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.vehicleRegistration?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(invoice => 
        new Date(invoice.date) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(invoice => 
        new Date(invoice.date) <= new Date(filters.dateTo)
      );
    }

    // Amount range filter
    if (filters.minAmount) {
      filtered = filtered.filter(invoice => 
        calculateTotal(invoice) >= parseFloat(filters.minAmount)
      );
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(invoice => 
        calculateTotal(invoice) <= parseFloat(filters.maxAmount)
      );
    }

    // Vehicle type filter
    if (filters.vehicleType !== 'all') {
      filtered = filtered.filter(invoice => 
        invoice.vehicleNumber === filters.vehicleType
      );
    }

    setFilteredInvoices(filtered);
    setPage(0);
  };

  // const handleViewInvoice = (invoice) => {
  //   localStorage.setItem('previewInvoice', JSON.stringify(invoice));
  //   navigate('/preview');
  // };

  const handleEditInvoice = (invoice) => {
    // Store the invoice data for editing
    localStorage.setItem('editInvoice', JSON.stringify(invoice));
    navigate('/create-invoice');
  };

  const handleDeleteInvoice = (invoiceNumber) => {
    try {
      const updatedInvoices = invoices.filter(inv => inv.invoiceNumber !== invoiceNumber);
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      setInvoices(updatedInvoices);
      setSnackbar({
        open: true,
        message: 'Invoice deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      setSnackbar({
        open: true,
        message: 'Error deleting invoice',
        severity: 'error'
      });
    }
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      const companySettings = JSON.parse(localStorage.getItem('companySettings') || '{}');
      const doc = generateInvoicePDF(invoice, companySettings);
      doc.save(`Invoice-${invoice.invoiceNumber}.pdf`);
      
      setSnackbar({
        open: true,
        message: 'Invoice downloaded successfully',
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const calculateTotal = (invoice) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discountAmount = (subtotal * (invoice.discount || 0)) / 100;
    return subtotal - discountAmount;
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      vehicleType: 'all',
    });
  };

  // Get unique vehicle makes for filter dropdown
  const vehicleTypes = ['all', ...new Set(invoices.map(invoice => invoice.vehicleNumber).filter(Boolean))];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
        Saved Invoices
      </Typography>

      {/* Search and Filters */}
      <StyledPaper sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer, invoice number, or vehicle"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                type="date"
                label="From Date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="date"
                label="To Date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="number"
                label="Min Amount"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
              />
              <TextField
                type="number"
                label="Max Amount"
                value={filters.maxAmount}
                onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
              />
              <TextField
                select
                label="Vehicle Type"
                value={filters.vehicleType}
                onChange={(e) => setFilters({ ...filters, vehicleType: e.target.value })}
                sx={{ minWidth: 120 }}
              >
                {vehicleTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </Box>
          </Grid>
        </Grid>
      </StyledPaper>

      <StyledPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer Name</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                (rowsPerPage > 0
                  ? filteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  : filteredInvoices
                ).map((invoice) => (
                  <StyledTableRow key={invoice.invoiceNumber}>
                    <TableCell>{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell>
                      {invoice.vehicleNumber || 'N/A'}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(calculateTotal(invoice))}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="View Invoice">
                         
                        </Tooltip>
                        <Tooltip title="Edit Invoice">
                          <IconButton 
                            color="info"
                            onClick={() => handleEditInvoice(invoice)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton 
                            color="secondary"
                            onClick={() => handleDownloadPDF(invoice)}
                          >
                            <FileDownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Invoice">
                          <IconButton 
                            color="error"
                            onClick={() => handleDeleteInvoice(invoice.invoiceNumber)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </StyledTableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      No invoices found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </StyledPaper>

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

export default SavedInvoices;
