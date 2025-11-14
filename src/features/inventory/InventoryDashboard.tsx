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
  Stack,
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
  //Eco as EcoIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  QrCodeScanner as ScannerIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { CellarWine, WineCellar } from '@/types';
import { cellarService } from '@/api/firebase';
import { POPULAR_GRAPES, MIN_STOCK_THRESHOLD, EXPIRY_THRESHOLD_DAYS } from '@/constants';
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
    if (!state.user?.id) {
      addNotification({
        type: 'error',
        message: 'No user ID found. Please log in.',
      });
      navigate('/auth');
      return;
    }
    loadInventory();
  }, [state.user?.id, navigate, addNotification]);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const userCellars = await cellarService.getCellars(state.user?.id || '');
      setCellars(userCellars);

      if (userCellars.length > 0) {
        setSelectedCellar(userCellars[0].id);
        const cellarWines = await cellarService.getCellarWines(userCellars[0].id);
        setInventory(cellarWines);
        updateInventoryStatsAndAlerts(cellarWines);
      } else {
        addNotification({
          type: 'info',
          message: 'No cellars found. Please create a cellar.',
        });
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      addNotification({
        type: 'error',
        message: `Failed to load inventory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInventoryStatsAndAlerts = (wines: CellarWine[]) => {
    let totalWines = 0;
    let totalValue = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;
    let sustainableWines = 0;
    let expiringWines = 0;
    const newAlerts: StockAlert[] = [];

    wines.forEach((wine) => {
      totalWines += wine.quantity;
      totalValue += wine.purchasePrice * wine.quantity;
      if (wine.quantity <= MIN_STOCK_THRESHOLD) lowStockItems++;
      if (wine.quantity === 0) outOfStockItems++;
      if (
        wine.name.toLowerCase().includes('organic') ||
        wine.name.toLowerCase().includes('biodynamic') ||
        wine.region.toLowerCase().includes('organic')
      ) {
        sustainableWines++;
      }
      if (wine.drinkByDate && wine.drinkByDate < Date.now() + EXPIRY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000) {
        expiringWines++;
      }

      if (wine.quantity === 0) {
        newAlerts.push({
          id: wine.id || '',
          wineName: wine.name,
          currentStock: wine.quantity,
          minStock: MIN_STOCK_THRESHOLD,
          type: 'out',
          priority: 'high',
        });
      } else if (wine.quantity <= MIN_STOCK_THRESHOLD) {
        newAlerts.push({
          id: wine.id || '',
          wineName: wine.name,
          currentStock: wine.quantity,
          minStock: MIN_STOCK_THRESHOLD,
          type: 'low',
          priority: 'medium',
        });
      }
      if (wine.drinkByDate && wine.drinkByDate < Date.now() + EXPIRY_THRESHOLD_DAYS * 24 * 60 * 60 * 1000) {
        newAlerts.push({
          id: wine.id || '',
          wineName: wine.name,
          currentStock: wine.quantity,
          minStock: MIN_STOCK_THRESHOLD,
          type: 'expiring',
          priority: 'high',
        });
      }
    });

    setStats({
      totalWines,
      totalValue,
      lowStockItems,
      outOfStockItems,
      sustainableWines,
      expiringWines,
    });
    setAlerts(newAlerts);
  };

  const handleCellarChange = async (cellarId: string) => {
    setSelectedCellar(cellarId);
    try {
      const cellarWines = await cellarService.getCellarWines(cellarId);
      setInventory(cellarWines);
      updateInventoryStatsAndAlerts(cellarWines);
    } catch (error) {
      console.error('Error loading cellar wines:', error);
      addNotification({
        type: 'error',
        message: `Failed to load cellar wines: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' | 'success' => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'info';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'out':
        return <WarningIcon color="error" />;
      case 'low':
        return <TrendingDownIcon color="warning" />;
      case 'expiring':
        return <WarningIcon color="error" />;
      default:
        return <WarningIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading inventory...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Wine Inventory Management
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
                  severity={getPriorityColor(alert.priority)}
                  icon={getAlertIcon(alert.type)}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => navigate(`/wine/${alert.id}`)}
                    >
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
                  <Typography variant="h4">{stats.totalWines}</Typography>
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
                  <Typography variant="h4">${stats.totalValue.toLocaleString()}</Typography>
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
                        color={wine.quantity <= MIN_STOCK_THRESHOLD ? 'warning.main' : 'textPrimary'}
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
                        {wine.quantity <= MIN_STOCK_THRESHOLD && wine.quantity > 0 && (
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
                          <IconButton size="small" onClick={() => navigate(`/wine/${wine.id}`)}>
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`/wine/edit/${wine.id}`)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              // Add delete logic here
                              addNotification({
                                type: 'success',
                                message: `${wine.name} deleted from inventory`,
                              });
                            }}
                          >
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
            Add a new wine to your inventory with sustainability tracking.
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Wine Name" fullWidth required />
            <TextField label="Region" fullWidth required />
            <TextField label="Vintage" type="number" fullWidth required />
            <TextField label="Quantity" type="number" fullWidth required />
            <TextField label="Purchase Price" type="number" fullWidth required />
            <FormControl fullWidth>
              <InputLabel>Grape Variety</InputLabel>
              <Select label="Grape Variety">
                {POPULAR_GRAPES.map((grape) => (
                  <MenuItem key={grape} value={grape}>
                    {grape}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddWineDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              // Add logic to submit form and add wine to cellar
              addNotification({
                type: 'success',
                message: 'Wine added to inventory',
              });
              setAddWineDialog(false);
            }}
          >
            Add Wine
          </Button>
        </DialogActions>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      {barcodeScannerOpen && (
        <BarcodeScanner
          onWineDetected={(wineData) => {
            console.log('Wine detected:', wineData);
            addNotification({
              type: 'success',
              message: `${wineData.name} added to inventory via barcode scan!`,
            });
            setBarcodeScannerOpen(false);
            loadInventory();
          }}
          onClose={() => setBarcodeScannerOpen(false)}
        />
      )}

      {/* Sustainability Tracker Dialog */}
      {showSustainability && (
        <Dialog open={showSustainability} onClose={() => setShowSustainability(false)} maxWidth="lg" fullWidth>
          <DialogTitle>
            <Typography variant="h6">Sustainability Tracker</Typography>
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
            <Typography variant="h6">Drink Window Notifications</Typography>
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