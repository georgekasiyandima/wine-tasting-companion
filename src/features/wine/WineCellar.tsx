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
import { cellarService } from '@/services/firebase';
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
      const userCellars = await cellarService.getCellars(state.user!.id);
      setCellars(userCellars);
      
      if (userCellars.length > 0 && !selectedCellar) {
        setSelectedCellar(userCellars[0]);
      }
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load cellars',
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
      const cellarId = await cellarService.createCellar({
        ...cellarData,
        userId: state.user!.id
      });
      
      addNotification({
        type: 'success',
        message: 'Cellar created successfully',
      });
      
      setCellarDialogOpen(false);
      loadCellars();
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to create cellar',
      });
    }
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
            onClick={() => setCellarDialogOpen(true)}
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
                      setCellarDialogOpen(true);
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
              onClick={() => setCellarDialogOpen(true)}
            >
              Create Your First Cellar
            </Button>
          </CardContent>
        </AnimatedCard>
      )}

      {/* Add/Edit Cellar Dialog */}
      <Dialog open={cellarDialogOpen} onClose={() => setCellarDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCellar ? 'Edit Cellar' : 'Create New Cellar'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Cellar Name"
              defaultValue={editingCellar?.name || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              defaultValue={editingCellar?.description || ''}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Location"
              defaultValue={editingCellar?.location || ''}
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Temperature (°C)"
                  type="number"
                  defaultValue={editingCellar?.temperature || 14}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Humidity (%)"
                  type="number"
                  defaultValue={editingCellar?.humidity || 70}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Capacity (bottles)"
              type="number"
              defaultValue={editingCellar?.capacity || 100}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCellarDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setCellarDialogOpen(false)}>
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