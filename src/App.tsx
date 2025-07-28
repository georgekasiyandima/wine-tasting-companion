import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Toaster } from 'react-hot-toast';

// Context
import { AppProvider, useApp } from '@/context/AppContext';

// Components
import Layout from '@/components/layout/Layout';
import NotificationSystem from '@/components/common/NotificationSystem';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import PWAInstallPrompt from '@/components/common/PWAInstallPrompt';

// Pages
import Dashboard from '@/pages/Dashboard';
import WineForm from '@/pages/WineForm';
import WineList from '@/pages/WineList';
import WineDetail from '@/pages/WineDetail';
import WineDiscovery from '@/pages/WineDiscovery';
import WineCellar from '@/pages/WineCellar';
import TastingSessions from '@/pages/TastingSessions';
import Analytics from '@/pages/Analytics';
import Profile from '@/pages/Profile';
import Auth from '@/pages/Auth';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import SouthAfricaWine from "./pages/SouthAfricaWine";
import InventoryDashboard from "./features/inventory/InventoryDashboard";
import TrainingCenter from "./features/training/TrainingCenter";
import CruiseWeatherDashboard from "./features/weather/CruiseWeatherDashboard";

// Theme configuration
const createAppTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#8B0000',
      light: '#B22222',
      dark: '#660000',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#D4AF37',
      light: '#F4E4BC',
      dark: '#B8860B',
      contrastText: '#000000',
    },
    background: {
      default: mode === 'light' ? '#FFF8DC' : '#1A1A1A',
      paper: mode === 'light' ? '#FFFFFF' : '#2D2D2D',
    },
    text: {
      primary: mode === 'light' ? '#2F2F2F' : '#FFFFFF',
      secondary: mode === 'light' ? '#666666' : '#CCCCCC',
    },
  },
  typography: {
    fontFamily: '"Playfair Display", "Times New Roman", serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
    h5: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 2px 12px rgba(0,0,0,0.08)' 
            : '0 2px 12px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

function AppContent() {
  const { state } = useApp();
  const theme = createAppTheme(state.theme.mode);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Router>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/wine/add" element={
                  <ProtectedRoute>
                    <WineForm />
                  </ProtectedRoute>
                } />
                <Route path="/wine/edit/:id" element={
                  <ProtectedRoute>
                    <WineForm />
                  </ProtectedRoute>
                } />
                <Route path="/wines" element={
                  <ProtectedRoute>
                    <WineList />
                  </ProtectedRoute>
                } />
                <Route path="/wine/:id" element={
                  <ProtectedRoute>
                    <WineDetail />
                  </ProtectedRoute>
                } />
                <Route path="/wine-discovery" element={
                  <ProtectedRoute>
                    <WineDiscovery />
                  </ProtectedRoute>
                } />
                <Route path="/wine-cellar" element={
                  <ProtectedRoute>
                    <WineCellar />
                  </ProtectedRoute>
                } />
                <Route path="/tasting-sessions" element={
                  <ProtectedRoute>
                    <TastingSessions />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/south-africa-wine" element={
                  <ProtectedRoute>
                    <SouthAfricaWine />
                  </ProtectedRoute>
                } />
                <Route path="/inventory" element={
                  <ProtectedRoute>
                    <InventoryDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/training" element={
                  <ProtectedRoute>
                    <TrainingCenter />
                  </ProtectedRoute>
                } />
                <Route path="/weather" element={
                  <ProtectedRoute>
                    <CruiseWeatherDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          </Router>
          
          {/* Notification System */}
          <NotificationSystem />
          
          {/* PWA Install Prompt */}
          <PWAInstallPrompt />
          
          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.divider}`,
              },
            }}
          />
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App; 