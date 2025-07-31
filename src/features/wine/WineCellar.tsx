import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Storage as StorageIcon,
  Analytics as AnalyticsIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WineBar as WineIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { WineCellar, CellarWine, CellarAnalytics, CellarRecommendation } from '@/types';
import { cellarService } from '@/api/firebase';
import { useApp } from '@/context/AppContext';
import AnimatedCard from '@/components/common/AnimatedCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cellar-tabpanel-${index}`}
      aria-labelledby={`cellar-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function WineCellarPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state, addNotification } = useApp();
  
  const [cellars, setCellars] = useState<WineCellar[]>([]);
  const [selectedCellar, setSelectedCellar] = useState<WineCellar | null>(null);
  const [cellarWines, setCellarWines] = useState<CellarWine[]>([]);
  const [analytics, setAnalytics] = useState<CellarAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<CellarRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [cellarDialogOpen, setCellarDialogOpen] = useState(false);
  const [wineDialogOpen, setWineDialogOpen] = useState(false);
  const [editingCellar, setEditingCellar] = useState<WineCellar | null>(null);
  const [editingWine, setEditingWine] = useState<CellarWine | null>(null);
  
  // Form states for cellar creation
  const [cellarFormData, setCellarFormData] = useState({
    name: '',
    description: '',
    location: '',
    temperature: 14,
    humidity: 70,
    capacity: 100
  });

  useEffect(() => {
    if (state.user?.id) {
      loadCellars();
    }
  }, [state.user?.id]);

  useEffect(() => {
    if (selectedCellar) {
      loadCellarData(selectedCellar.id);
    }
  }, [selectedCellar]);

  const loadCellars = async () => {
    try {
      setLoading(true);
      console.log('Loading cellars for user:', state.user?.id);
      
      if (!state.user?.id) {
        console.error('No user ID available for loading cellars');
        return;
      }
      
      const userCellars = await cellarService.getCellars(state.user.id);
      console.log('Loaded cellars:', userCellars);
      setCellars(userCellars);
      
      if (userCellars.length > 0 && !selectedCellar) {
        setSelectedCellar(userCellars[0]);
      }
    } catch (error) {
      console.error('Error loading cellars:', error);
      addNotification({
        type: 'error',
        message: `Failed to load cellars: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCellarData = async (cellarId: string) => {
    try {
      const [wines, analyticsData] = await Promise.all([
        cellarService.getCellarWines(cellarId),
        cellarService.getCellarAnalytics(cellarId)
      ]);
      
      setCellarWines(wines);
      setAnalytics(analyticsData);
      generateRecommendations(wines, analyticsData);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load cellar data',
      });
    }
  };

  const generateRecommendations = (wines: CellarWine[], analytics: CellarAnalytics) => {
    const recs: CellarRecommendation[] = [];

    // Overdue wines
    analytics.overdueWines.forEach(wine => {
      recs.push({
        type: 'drink',
        wine,
        message: `${wine.name} is overdue for drinking`,
        priority: 'high',
        action: 'Consider drinking soon to avoid spoilage'
      });
    });

    // Ready to drink
    analytics.readyToDrink.slice(0, 3).forEach(wine => {
      recs.push({
        type: 'drink',
        wine,
        message: `${wine.name} is ready to drink`,
        priority: 'medium',
        action: 'Perfect time to enjoy this wine'
      });
    });

    // Aging wines that need attention
    analytics.agingWines.slice(0, 2).forEach(wine => {
      recs.push({
        type: 'aging',
        wine,
        message: `${wine.name} is still aging`,
        priority: 'low',
        action: 'Continue storing under proper conditions'
      });
    });

    setRecommendations(recs);
  };

  const handleCreateCellar = async (cellarData: Omit<WineCellar, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('Creating cellar with data:', cellarData);
      console.log('User ID:', state.user?.id);
      
      if (!state.user?.id) {
        throw new Error('User not authenticated');
      }
      
      const cellarId = await cellarService.createCellar({
        ...cellarData,
        userId: state.user.id
      });
      
      console.log('Cellar created successfully with ID:', cellarId);
      
      addNotification({
        type: 'success',
        message: 'Cellar created successfully',
      });
      
      setCellarDialogOpen(false);
      setEditingCellar(null);
      resetCellarForm();
      await loadCellars();
    } catch (error) {
      console.error('Error creating cellar:', error);
      addNotification({
        type: 'error',
        message: `Failed to create cellar: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const resetCellarForm = () => {
    setCellarFormData({
      name: '',
      description: '',
      location: '',
      temperature: 14,
      humidity: 70,
      capacity: 100
    });
  };

  const handleCellarFormSubmit = async () => {
    console.log('=== CELLAR FORM SUBMIT START ===');
    console.log('Form submit triggered with data:', cellarFormData);
    console.log('User state:', state.user);
    console.log('Editing cellar:', editingCellar);
    
    try {
      // Validation
      if (!cellarFormData.name.trim()) {
        console.log('Validation failed: No cellar name');
        addNotification({
          type: 'error',
          message: 'Please enter a cellar name',
        });
        return;
      }
      
      if (!cellarFormData.location.trim()) {
        console.log('Validation failed: No cellar location');
        addNotification({
          type: 'error',
          message: 'Please enter a cellar location',
        });
        return;
      }

      if (!state.user?.id) {
        console.log('Validation failed: No user ID');
        addNotification({
          type: 'error',
          message: 'User not authenticated. Please log in.',
        });
        return;
      }

      console.log('Validation passed, proceeding with cellar operation...');

      if (editingCellar) {
        console.log('Updating existing cellar:', editingCellar.id);
        await handleUpdateCellar(editingCellar.id, cellarFormData);
      } else {
        console.log('Creating new cellar');
        await handleCreateCellar(cellarFormData);
      }
      
      console.log('=== CELLAR FORM SUBMIT SUCCESS ===');
    } catch (error) {
      console.error('=== CELLAR FORM SUBMIT ERROR ===', error);
      addNotification({
        type: 'error',
        message: `Form submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  const handleUpdateCellar = async (cellarId: string, updates: Partial<WineCellar>) => {
    try {
      await cellarService.updateCellar(cellarId, updates);
      
      addNotification({
        type: 'success',
        message: 'Cellar updated successfully',
      });
      
      setCellarDialogOpen(false);
      setEditingCellar(null);
      resetCellarForm();
      loadCellars();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to update cellar',
      });
    }
  };

  const openCellarDialog = (cellar?: WineCellar) => {
    if (cellar) {
      setEditingCellar(cellar);
      setCellarFormData({
        name: cellar.name,
        description: cellar.description || '',
        location: cellar.location,
        temperature: cellar.temperature,
        humidity: cellar.humidity,
        capacity: cellar.capacity
      });
    } else {
      setEditingCellar(null);
      resetCellarForm();
    }
    setCellarDialogOpen(true);
  };

  const handleAddWine = async (wineData: Omit<CellarWine, 'id' | 'timestamp'>) => {
    try {
      await cellarService.addWineToCellar({
        ...wineData,
        userId: state.user!.id
      });
      
      addNotification({
        type: 'success',
        message: 'Wine added to cellar successfully',
      });
      
      setWineDialogOpen(false);
      if (selectedCellar) {
        loadCellarData(selectedCellar.id);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to add wine to cellar',
      });
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <AnimatedCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700, color }}>
              {value}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.8 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </AnimatedCard>
  );

  const RecommendationCard = ({ recommendation }: { recommendation: CellarRecommendation }) => {
    const getIcon = () => {
      switch (recommendation.type) {
        case 'drink': return <CheckCircleIcon />;
        case 'aging': return <ScheduleIcon />;
        case 'purchase': return <AddIcon />;
        case 'move': return <TrendingUpIcon />;
        default: return <WineIcon />;
      }
    };

    const getColor = () => {
      switch (recommendation.priority) {
        case 'high': return theme.palette.error.main;
        case 'medium': return theme.palette.warning.main;
        case 'low': return theme.palette.success.main;
        default: return theme.palette.primary.main;
      }
    };

    return (
      <AnimatedCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Box sx={{ color: getColor() }}>
              {getIcon()}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {recommendation.message}
              </Typography>
              {recommendation.action && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {recommendation.action}
                </Typography>
              )}
              <Chip 
                label={recommendation.priority} 
                size="small" 
                color={recommendation.priority === 'high' ? 'error' : recommendation.priority === 'medium' ? 'warning' : 'success'}
              />
            </Box>
          </Box>
        </CardContent>
      </AnimatedCard>
    );
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700, mb: 2 }}>
          Wine Cellar Management 🍷
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your wine collection, track aging, and get intelligent recommendations
        </Typography>
      </Box>

      {/* Cellar Selection */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Your Cellars
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openCellarDialog()}
          >
            Add Cellar
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {cellars.map((cellar) => (
            <Chip
              key={cellar.id}
              label={cellar.name}
              onClick={() => setSelectedCellar(cellar)}
              color={selectedCellar?.id === cellar.id ? 'primary' : 'default'}
              variant={selectedCellar?.id === cellar.id ? 'filled' : 'outlined'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      {selectedCellar ? (
        <>
          {/* Cellar Overview */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
              {selectedCellar.name}
            </Typography>
            
            {analytics && (
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Wines"
                    value={analytics.totalWines}
                    icon={<WineIcon />}
                    color={theme.palette.primary.main}
                    subtitle="bottles in cellar"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Total Value"
                    value={`$${analytics.totalValue.toLocaleString()}`}
                    icon={<TrendingUpIcon />}
                    color={theme.palette.secondary.main}
                    subtitle="estimated value"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Average Age"
                    value={`${analytics.averageAge.toFixed(1)}y`}
                    icon={<ScheduleIcon />}
                    color={theme.palette.success.main}
                    subtitle="years in cellar"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Ready to Drink"
                    value={analytics.readyToDrink.length}
                    icon={<CheckCircleIcon />}
                    color={theme.palette.warning.main}
                    subtitle="wines ready now"
                  />
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab label="Inventory" icon={<InventoryIcon />} iconPosition="start" />
              <Tab label="Analytics" icon={<AnalyticsIcon />} iconPosition="start" />
              <Tab label="Recommendations" icon={<TrendingUpIcon />} iconPosition="start" />
              <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Wine Inventory
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setWineDialogOpen(true)}
              >
                Add Wine
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              {cellarWines.map((wine) => (
                <Grid item xs={12} sm={6} md={4} key={wine.id}>
                  <AnimatedCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {wine.name}
                        </Typography>
                        <Box>
                          <IconButton size="small">
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {wine.grape} • {wine.region} • {wine.vintage}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip label={`Qty: ${wine.quantity}`} size="small" />
                        <Chip label={`$${wine.purchasePrice}`} size="small" color="primary" />
                        <Chip label={wine.storageLocation} size="small" variant="outlined" />
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary">
                        Purchased: {new Date(wine.purchaseDate).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </AnimatedCard>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Cellar Analytics
            </Typography>
            
            {analytics && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <AnimatedCard>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Wines by Region
                      </Typography>
                      {analytics.winesByRegion.map((region) => (
                        <Box key={region.region} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{region.region}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {region.count} bottles (${region.value.toLocaleString()})
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </AnimatedCard>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <AnimatedCard>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Wines by Grape
                      </Typography>
                      {analytics.winesByGrape.map((grape) => (
                        <Box key={grape.grape} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">{grape.grape}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {grape.count} bottles (${grape.value.toLocaleString()})
                          </Typography>
                        </Box>
                      ))}
                    </CardContent>
                  </AnimatedCard>
                </Grid>
              </Grid>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Smart Recommendations
            </Typography>
            
            <Grid container spacing={3}>
              {recommendations.map((recommendation, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <RecommendationCard recommendation={recommendation} />
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Cellar Settings
            </Typography>
            
            <AnimatedCard>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {selectedCellar.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedCellar.description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip label={`Location: ${selectedCellar.location}`} />
                  <Chip label={`Temperature: ${selectedCellar.temperature}°C`} />
                  <Chip label={`Humidity: ${selectedCellar.humidity}%`} />
                  <Chip label={`Capacity: ${selectedCellar.capacity} bottles`} />
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setEditingCellar(selectedCellar);
                      openCellarDialog();
                    }}
                    sx={{ mr: 2 }}
                  >
                    Edit Cellar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                  >
                    Delete Cellar
                  </Button>
                </Box>
              </CardContent>
            </AnimatedCard>
          </TabPanel>
        </>
      ) : (
        <AnimatedCard>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <StorageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              No Cellars Found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first wine cellar to start managing your collection
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => openCellarDialog()}
            >
              Create Your First Cellar
            </Button>
          </CardContent>
        </AnimatedCard>
      )}

      {/* Add/Edit Cellar Dialog */}
      <Dialog open={cellarDialogOpen} onClose={() => {
        setCellarDialogOpen(false);
        setEditingCellar(null);
        resetCellarForm();
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCellar ? 'Edit Cellar' : 'Create New Cellar'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Cellar Name"
              value={cellarFormData.name}
              onChange={(e) => setCellarFormData({ ...cellarFormData, name: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={cellarFormData.description}
              onChange={(e) => setCellarFormData({ ...cellarFormData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              value={cellarFormData.location}
              onChange={(e) => setCellarFormData({ ...cellarFormData, location: e.target.value })}
              sx={{ mb: 2 }}
              required
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Temperature (°C)"
                  type="number"
                  value={cellarFormData.temperature}
                  onChange={(e) => setCellarFormData({ ...cellarFormData, temperature: Number(e.target.value) })}
                  inputProps={{ min: 0, max: 30 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Humidity (%)"
                  type="number"
                  value={cellarFormData.humidity}
                  onChange={(e) => setCellarFormData({ ...cellarFormData, humidity: Number(e.target.value) })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Capacity (bottles)"
              type="number"
              value={cellarFormData.capacity}
              onChange={(e) => setCellarFormData({ ...cellarFormData, capacity: Number(e.target.value) })}
              sx={{ mt: 2 }}
              inputProps={{ min: 1 }}
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setCellarDialogOpen(false);
            setEditingCellar(null);
            resetCellarForm();
          }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={(e) => {
              console.log('Create button clicked!', e);
              e.preventDefault();
              handleCellarFormSubmit();
            }}
            disabled={!cellarFormData.name.trim() || !cellarFormData.location.trim()}
          >
            {editingCellar ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Wine Dialog */}
      <Dialog open={wineDialogOpen} onClose={() => setWineDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Wine to Cellar</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Wine Name" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Grape Variety" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Region" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Vintage" type="number" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Quantity" type="number" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Purchase Price ($)" type="number" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Storage Location" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Aging Potential (years)" type="number" />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Notes" multiline rows={3} />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWineDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setWineDialogOpen(false)}>
            Add Wine
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 