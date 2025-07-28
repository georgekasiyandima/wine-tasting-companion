import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  LocalBar as WineIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  List as ListIcon,
  Analytics as AnalyticsIcon,
  Group as GroupIcon,
  AutoAwesome as DiscoveryIcon,
  Storage as StorageIcon,
  Bolt as BoltIcon,
  Search as SearchIcon,
  Inventory as InventoryIcon,
  Mic as MicIcon,
  Flag as FlagIcon,
  WineBar as WineBarIcon,
  TrendingUp as TrendingIcon,
  Explore as ExploreIcon,
  Storage as CellarIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Wine, WineAnalytics } from '@/types';
import { WineService } from '@/api/firebase';
import { useApp } from '@/context/AppContext';
import AIRecommendations from '@/components/common/AIRecommendations';
import WeatherWidget from '@/components/common/WeatherWidget';
import AnimatedCard from '@/components/common/AnimatedCard';

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state, addNotification } = useApp();
  const [wines, setWines] = useState<Wine[]>([]);
  const [analytics, setAnalytics] = useState<WineAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const winesData = await WineService.getWines(state.user?.id);
      setWines(winesData);
      
      // Calculate analytics from wines data
      const analyticsData = calculateAnalytics(winesData);
      setAnalytics(analyticsData);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load dashboard data',
      });
      setError('Failed to load wines');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (wines: Wine[]): WineAnalytics => {
    if (wines.length === 0) {
      return {
        totalWines: 0,
        averageRating: 0,
        favoriteRegions: [],
        favoriteGrapes: [],
        ratingDistribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
        monthlyTastings: []
      };
    }

    // Calculate average rating
    const averageRating = wines.reduce((sum, wine) => sum + wine.rating, 0) / wines.length;

    // Calculate favorite regions
    const regionCounts: { [key: string]: number } = {};
    wines.forEach(wine => {
      regionCounts[wine.region] = (regionCounts[wine.region] || 0) + 1;
    });
    const favoriteRegions = Object.entries(regionCounts)
      .map(([region, count]) => ({ region, count, averageRating: 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate favorite grapes
    const grapeCounts: { [key: string]: number } = {};
    wines.forEach(wine => {
      grapeCounts[wine.grape] = (grapeCounts[wine.grape] || 0) + 1;
    });
    const favoriteGrapes = Object.entries(grapeCounts)
      .map(([grape, count]) => ({ grape, count, averageRating: 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate rating distribution
    const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    wines.forEach(wine => {
      const rating = Math.round(wine.rating) as keyof typeof ratingDistribution;
      ratingDistribution[rating]++;
    });

    // Calculate monthly tastings (last 12 months)
    const monthlyTastings = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthWines = wines.filter(wine => {
        const wineDate = new Date(wine.timestamp);
        return wineDate.getMonth() === month.getMonth() && 
               wineDate.getFullYear() === month.getFullYear();
      });
      monthlyTastings.push({
        month: monthStr,
        count: monthWines.length,
        averageRating: monthWines.length > 0 
          ? monthWines.reduce((sum, w) => sum + w.rating, 0) / monthWines.length 
          : 0
      });
    }

    return {
      totalWines: wines.length,
      averageRating,
      favoriteRegions,
      favoriteGrapes,
      ratingDistribution,
      monthlyTastings
    };
  };

  const getTopRatedWines = () => {
    return wines
      .filter(wine => wine.rating >= 4)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  };

  const getRecentWines = () => {
    return wines
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 3);
  };

  const getWineStats = () => {
    if (wines.length === 0) return { total: 0, averageRating: 0, topRegion: 'None' };
    
    const total = wines.length;
    const averageRating = wines.reduce((sum, wine) => sum + wine.rating, 0) / wines.length;
    
    const regionCounts = wines.reduce((acc, wine) => {
      acc[wine.region] = (acc[wine.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topRegion = Object.entries(regionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    return { total, averageRating: averageRating.toFixed(1), topRegion };
  };

  const stats = getWineStats();
  const topRatedWines = getTopRatedWines();
  const recentWines = getRecentWines();

  const StatCard = ({ title, value, icon, color, subtitle }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }) => (
    <Card sx={{ height: '100%' }}>
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
    </Card>
  );

  const QuickActionCard = ({ title, description, icon, color, onClick }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    onClick: () => void;
  }) => (
    <Card 
      sx={{ 
        height: '100%', 
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ color, mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {state.user?.displayName || 'Wine Enthusiast'}! 🍷
      </Typography>
      
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WineBarIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.total}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Wines
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <StarIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.averageRating}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Avg Rating
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{stats.topRegion}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Top Region
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CellarIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{wines.filter(w => w.inCellar).length}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    In Cellar
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {/* Quick Actions */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        fullWidth
                        onClick={() => navigate('/wine/add')}
                      >
                        Add Wine
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        startIcon={<ExploreIcon />}
                        fullWidth
                        onClick={() => navigate('/wine-discovery')}
                      >
                        Discover
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        startIcon={<CellarIcon />}
                        fullWidth
                        onClick={() => navigate('/wine-cellar')}
                      >
                        Wine Cellar
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        startIcon={<WineIcon />}
                        fullWidth
                        onClick={() => navigate('/tasting-sessions')}
                      >
                        Tasting Session
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Button
                        variant="outlined"
                        startIcon={<FlagIcon />}
                        fullWidth
                        onClick={() => navigate('/south-africa-wine')}
                      >
                        South Africa Wine
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Wines */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Additions
                  </Typography>
                  {recentWines.length > 0 ? (
                    <List>
                      {recentWines.map((wine, index) => (
                        <React.Fragment key={wine.id}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar>
                                <WineIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={wine.name}
                              secondary={`${wine.grape} • ${wine.region} • ${wine.vintage}`}
                            />
                            <Box display="flex" alignItems="center">
                              <StarIcon sx={{ color: 'gold', fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2">{wine.rating}</Typography>
                            </Box>
                          </ListItem>
                          {index < recentWines.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No wines added yet. Start by adding your first wine!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            {/* Weather Widget */}
            <Grid item xs={12}>
              <WeatherWidget />
            </Grid>

            {/* Top Rated Wines */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top Rated Wines
                  </Typography>
                  {topRatedWines.length > 0 ? (
                    <List>
                      {topRatedWines.map((wine, index) => (
                        <React.Fragment key={wine.id}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <StarIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={wine.name}
                              secondary={`${wine.grape} • ${wine.region}`}
                            />
                            <Chip
                              label={`${wine.rating}/5`}
                              size="small"
                              color="primary"
                            />
                          </ListItem>
                          {index < topRatedWines.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No highly rated wines yet. Keep tasting and rating!
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
} 