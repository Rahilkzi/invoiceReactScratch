import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import InvoiceForm from './components/InvoiceForm';
import SavedInvoices from './components/SavedInvoices';
import Settings from './components/Settings';
import InvoicePreview from './components/InvoicePreview';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#303030' : '#f5f5f5',
        paper: darkMode ? '#424242' : '#ffffff',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Routes>
              {/* Public Route - Login is the default route */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <>
                      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
                      <Dashboard />
                    </>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/create-invoice"
                element={
                  <ProtectedRoute>
                    <>
                      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
                      <InvoiceForm />
                    </>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/saved-invoices"
                element={
                  <ProtectedRoute>
                    <>
                      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
                      <SavedInvoices />
                    </>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <>
                      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
                      <Settings />
                    </>
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/invoice/:id"
                element={
                  <ProtectedRoute>
                    <>
                      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
                      <InvoicePreview />
                    </>
                  </ProtectedRoute>
                }
              />

              {/* Redirect all other routes to login if not authenticated */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
