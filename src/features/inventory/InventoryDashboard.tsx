import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  Button,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Badge,
  Stack,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Eco as EcoIcon,
  LocalShipping as ShippingIcon,
  Storage as StorageIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  QrCodeScanner as ScannerIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CellarWine, WineCellar } from '@/types';
import { cellarService } from '@/api/firebase';
import AnimatedCard from '@/components/common/AnimatedCard';
import BarcodeScanner from './BarcodeScanner';
import SustainabilityTracker from './SustainabilityTracker';
import DrinkWindowNotifications from './DrinkWindowNotifications';

interface InventoryStats {
  totalWines: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  sustainableWines: number;
  expiringWines: number;
}

interface StockAlert {
  id: string;
  wineName: string;
  currentStock: number;
  minStock: number;
  type: 'low' | 'out' | 'expiring';
  priority: 'low' | 'medium' | 'high';
}

export default function InventoryDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state, addNotification } = useApp();
  
  const [cellars, setCellars] = useState<WineCellar[]>([]);
  const [inventory, setInventory] = useState<CellarWine[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalWines: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    sustainableWines: 0,
    expiringWines: 0,
  });
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCellar, setSelectedCellar] = useState<string>('');
  const [addWineDialog, setAddWineDialog] = useState(false);
  const [barcodeScannerOpen, setBarcodeScannerOpen] = useState(false);
  const [showSustainability, setShowSustainability] = useState(false);
  const [showDrinkWindow, setShowDrinkWindow] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [state.user?.id]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      
      // Load cellars
      const userCellars = await cellarService.getCellars(state.user?.id || '');
      setCellars(userCellars);
      
      if (userCellars.length > 0) {
        setSelectedCellar(userCellars[0].id);
        
        // Load inventory for first cellar
        const cellarWines = await cellarService.getCellarWines(userCellars[0].id);
        setInventory(cellarWines);
        
        // Calculate stats
        calculateStats(cellarWines);
        generateAlerts(cellarWines);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load inventory',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (wines: CellarWine[]) => {
    const totalWines = wines.reduce((sum, wine) => sum + wine.quantity, 0);
    const totalValue = wines.reduce((sum, wine) => sum + (wine.purchasePrice * wine.quantity), 0);
    const lowStockItems = wines.filter(wine => wine.quantity <= 5).length;
    const outOfStockItems = wines.filter(wine => wine.quantity === 0).length;
    const sustainableWines = wines.filter(wine => 
      wine.name.toLowerCase().includes('organic') || 
      wine.name.toLowerCase().includes('biodynamic') ||
      wine.region.toLowerCase().includes('organic')
    ).length;
    const expiringWines = wines.filter(wine => 
      wine.drinkByDate && wine.drinkByDate < Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
    ).length;

    setStats({
      totalWines,
      totalValue,
      lowStockItems,
      outOfStockItems,
      sustainableWines,
      expiringWines,
    });
  };

  const generateAlerts = (wines: CellarWine[]) => {
    const newAlerts: StockAlert[] = [];
    
    wines.forEach(wine => {
      if (wine.quantity === 0) {
        newAlerts.push({
          id: wine.id || '',
          wineName: wine.name,
          currentStock: wine.quantity,
          minStock: 5,
          type: 'out',
          priority: 'high',
        });
      } else if (wine.quantity <= 5) {
        newAlerts.push({
          id: wine.id || '',
          wineName: wine.name,
          currentStock: wine.quantity,
          minStock: 5,
          type: 'low',
          priority: 'medium',
        });
      }
      
      if (wine.drinkByDate && wine.drinkByDate < Date.now() + (30 * 24 * 60 * 60 * 1000)) {
        newAlerts.push({
          id: wine.id || '',
          wineName: wine.name,
          currentStock: wine.quantity,
          minStock: 5,
          type: 'expiring',
          priority: 'high',
        });
      }
    });
    
    setAlerts(newAlerts);
  };

  const handleCellarChange = async (cellarId: string) => {
    setSelectedCellar(cellarId);
    try {
      const cellarWines = await cellarService.getCellarWines(cellarId);
      setInventory(cellarWines);
      calculateStats(cellarWines);
      generateAlerts(cellarWines);
    } catch (error) {
      console.error('Error loading cellar wines:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'out': return <WarningIcon color="error" />;
      case 'low': return <TrendingDownIcon color="warning" />;
      case 'expiring': return <WarningIcon color="error" />;
      default: return <WarningIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading inventory...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Cruise Ship Wine Inventory
        </Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddWineDialog(true)}
            sx={{ mr: 1 }}
          >
            Add Wine
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ScannerIcon />}
            onClick={() => setBarcodeScannerOpen(true)}
            sx={{ mr: 1 }}
          >
            Scan Barcode
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadInventory}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            color="success"
            startIcon={<EcoIcon />}
            onClick={() => setShowSustainability(true)}
            sx={{ mr: 1 }}
          >
            Sustainability
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<TimerIcon />}
            onClick={() => setShowDrinkWindow(true)}
          >
            Drink Window
          </Button>
        </Box>
      </Box>

      {/* Cellar Selector */}
      {cellars.length > 0 && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Cellar</InputLabel>
          <Select
            value={selectedCellar}
            onChange={(e) => handleCellarChange(e.target.value)}
            label="Select Cellar"
          >
            {cellars.map((cellar) => (
              <MenuItem key={cellar.id} value={cellar.id}>
                {cellar.name} - {cellar.location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Stock Alerts ({alerts.length})
          </Typography>
          <Grid container spacing={2}>
            {alerts.slice(0, 6).map((alert) => (
              <Grid item xs={12} md={6} lg={4} key={alert.id}>
                <Alert
                  severity={getPriorityColor(alert.priority) as any}
                  icon={getAlertIcon(alert.type)}
                  action={
                    <Button color="inherit" size="small">
                      View
                    </Button>
                  }
                >
                  <Typography variant="body2">
                    {alert.wineName} - {alert.currentStock} bottles remaining
                  </Typography>
                </Alert>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Wines
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalWines}
                  </Typography>
                </Box>
                <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Value
                  </Typography>
                  <Typography variant="h4">
                    ${stats.totalValue.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Low Stock
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.lowStockItems}
                  </Typography>
                </Box>
                <TrendingDownIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Sustainable
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.sustainableWines}
                  </Typography>
                </Box>
                <EcoIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>

      {/* Inventory Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Current Inventory
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Wine Name</TableCell>
                  <TableCell>Region</TableCell>
                  <TableCell>Vintage</TableCell>
                  <TableCell align="right">Stock</TableCell>
                  <TableCell align="right">Value</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((wine) => (
                  <TableRow key={wine.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {wine.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {wine.grape}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{wine.region}</TableCell>
                    <TableCell>{wine.vintage}</TableCell>
                    <TableCell align="right">
                      <Typography
                        color={wine.quantity <= 5 ? 'warning.main' : 'textPrimary'}
                        fontWeight="bold"
                      >
                        {wine.quantity}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      ${(wine.purchasePrice * wine.quantity).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        {wine.quantity === 0 && (
                          <Chip label="Out of Stock" color="error" size="small" />
                        )}
                        {wine.quantity <= 5 && wine.quantity > 0 && (
                          <Chip label="Low Stock" color="warning" size="small" />
                        )}
                        {wine.name.toLowerCase().includes('organic') && (
                          <Chip label="Sustainable" color="success" size="small" icon={<EcoIcon />} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Wine Dialog */}
      <Dialog open={addWineDialog} onClose={() => setAddWineDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Wine to Inventory</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Add a new wine to your cruise ship inventory with sustainability tracking.
          </Typography>
          {/* Add wine form will go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddWineDialog(false)}>Cancel</Button>
          <Button variant="contained">Add Wine</Button>
        </DialogActions>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      {barcodeScannerOpen && (
        <BarcodeScanner
          onWineDetected={(wineData) => {
            console.log('Wine detected:', wineData);
            // Here you would add the wine to inventory
            addNotification({
              type: 'success',
              message: `${wineData.name} added to inventory via barcode scan!`,
            });
            setBarcodeScannerOpen(false);
            loadInventory(); // Refresh the inventory
          }}
          onClose={() => setBarcodeScannerOpen(false)}
        />
      )}

      {/* Sustainability Tracker Dialog */}
      {showSustainability && (
        <Dialog open={showSustainability} onClose={() => setShowSustainability(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Typography variant="h6">
              Cruise Ship Sustainability Tracker
            </Typography>
          </DialogTitle>
          <DialogContent>
            <SustainabilityTracker />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSustainability(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Drink Window Notifications Dialog */}
      {showDrinkWindow && (
        <Dialog open={showDrinkWindow} onClose={() => setShowDrinkWindow(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Typography variant="h6">
              Drink Window Notifications
            </Typography>
          </DialogTitle>
          <DialogContent>
            <DrinkWindowNotifications />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDrinkWindow(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
} 