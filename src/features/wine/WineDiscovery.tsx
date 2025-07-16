import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Rating,
  Button,
  useTheme,
  Paper,
  Stack,
  Divider,
  IconButton,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Badge,
  TextField,
  Autocomplete,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Alert,
  Skeleton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  WineBar as WineIcon,
  TrendingUp as TrendingIcon,
  AutoAwesome as DiscoveryIcon,
  Star as StarIcon,
  AttachMoney as PriceIcon,
  CalendarToday as VintageIcon,
  LocationOn as RegionIcon,
  LocalOffer as GrapeIcon,
  Add as AddIcon,
  Favorite as FavoriteIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Lightbulb as InsightIcon,
  EmojiEvents as AwardIcon,
  Explore as ExploreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  TrendingDown as TrendingDownIcon,
  Psychology as AIIcon,
  Recommend as RecommendIcon,
  Compare as CompareIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Wine } from '@/types';
import { WineService } from '@/services/firebase';
import { useApp } from '@/context/AppContext';
import { RATING_LABELS, POPULAR_REGIONS, POPULAR_GRAPES, PRICE_RANGES } from '@/constants';
import WeatherWidget from '@/components/common/WeatherWidget';

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
      id={`discovery-tabpanel-${index}`}
      aria-labelledby={`discovery-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

export default function WineDiscovery() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state, addNotification } = useApp();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  
  // Advanced search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedGrapes, setSelectedGrapes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [vintageRange, setVintageRange] = useState<[number, number]>([1900, new Date().getFullYear()]);
  const [minRating, setMinRating] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showOnlyValueWines, setShowOnlyValueWines] = useState(false);
  
  // AI Recommendations
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<Wine[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadWines();
  }, []);

  const loadWines = async () => {
    try {
      setLoading(true);
      const wineList = await WineService.getWines(state.user?.id);
      setWines(wineList);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load wines',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for autocomplete
  const uniqueRegions = useMemo(() => {
    const regions = [...new Set(wines.map(wine => wine.region))].sort();
    return regions;
  }, [wines]);

  const uniqueGrapes = useMemo(() => {
    const grapes = [...new Set(wines.map(wine => wine.grape))].sort();
    return grapes;
  }, [wines]);

  // Advanced filtering
  const filteredWines = useMemo(() => {
    return wines.filter(wine => {
      // Search term
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        wine.name.toLowerCase().includes(searchLower) ||
        wine.grape.toLowerCase().includes(searchLower) ||
        wine.region.toLowerCase().includes(searchLower) ||
        wine.winery?.toLowerCase().includes(searchLower) ||
        wine.notes?.toLowerCase().includes(searchLower);
      
      // Region filter
      const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(wine.region);
      
      // Grape filter
      const matchesGrape = selectedGrapes.length === 0 || selectedGrapes.includes(wine.grape);
      
      // Price filter
      const matchesPrice = wine.price !== undefined && 
        wine.price >= priceRange[0] && wine.price <= priceRange[1];
      
      // Vintage filter
      const matchesVintage = wine.vintage >= vintageRange[0] && wine.vintage <= vintageRange[1];
      
      // Rating filter
      const matchesRating = wine.rating >= minRating;
      
      // Favorites filter
      const matchesFavorites = !showOnlyFavorites || wine.favorite;
      
      // Value wines filter (high rating, reasonable price)
      const matchesValue = !showOnlyValueWines || 
        (wine.price && wine.price < 50 && wine.rating >= 4);
      
      return matchesSearch && matchesRegion && matchesGrape && matchesPrice && 
             matchesVintage && matchesRating && matchesFavorites && matchesValue;
    });
  }, [wines, searchTerm, selectedRegions, selectedGrapes, priceRange, vintageRange, minRating, showOnlyFavorites, showOnlyValueWines]);

  // Discovery insights and recommendations
  const insights = useMemo(() => {
    if (wines.length === 0) return null;

    const totalWines = wines.length;
    const avgRating = wines.reduce((sum, wine) => sum + wine.rating, 0) / totalWines;
    const totalValue = wines.reduce((sum, wine) => sum + (wine.price || 0), 0);
    const avgPrice = totalValue / totalWines;

    // Most common regions
    const regionCounts = wines.reduce((acc, wine) => {
      acc[wine.region] = (acc[wine.region] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topRegions = Object.entries(regionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Most common grapes
    const grapeCounts = wines.reduce((acc, wine) => {
      acc[wine.grape] = (acc[wine.grape] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topGrapes = Object.entries(grapeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Top rated wines
    const topRated = wines
      .filter(wine => wine.rating >= 4)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // Value wines (high rating, reasonable price)
    const valueWines = wines
      .filter(wine => wine.price && wine.price < 50 && wine.rating >= 3)
      .sort((a, b) => (b.rating / (b.price || 1)) - (a.rating / (a.price || 1)))
      .slice(0, 5);

    // Recent additions
    const recentWines = wines
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    // Trending wines (recently added with high ratings)
    const trendingWines = wines
      .filter(wine => {
        const daysSinceAdded = (Date.now() - new Date(wine.timestamp).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceAdded <= 30 && wine.rating >= 4;
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // Underrated gems (high rating but not expensive)
    const underratedGems = wines
      .filter(wine => wine.price && wine.price < 30 && wine.rating >= 4)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // Price analysis
    const priceAnalysis = {
      under20: wines.filter(w => w.price && w.price < 20).length,
      under50: wines.filter(w => w.price && w.price < 50).length,
      under100: wines.filter(w => w.price && w.price < 100).length,
      over100: wines.filter(w => w.price && w.price >= 100).length,
    };

    return {
      totalWines,
      avgRating,
      totalValue,
      avgPrice,
      topRegions,
      topGrapes,
      topRated,
      valueWines,
      recentWines,
      trendingWines,
      underratedGems,
      priceAnalysis,
    };
  }, [wines]);

  // AI-powered recommendations
  const generateAIRecommendations = async () => {
    setAiLoading(true);
    try {
      // Simulate AI recommendations based on user preferences
      const userPreferences = {
        favoriteRegions: insights?.topRegions.slice(0, 3).map(([region]) => region) || [],
        favoriteGrapes: insights?.topGrapes.slice(0, 3).map(([grape]) => grape) || [],
        preferredPriceRange: insights?.avgPrice || 50,
        preferredRating: insights?.avgRating || 3.5,
      };

      // Generate recommendations based on preferences
      const recommendations = wines
        .filter(wine => 
          userPreferences.favoriteRegions.includes(wine.region) ||
          userPreferences.favoriteGrapes.includes(wine.grape)
        )
        .filter(wine => 
          wine.price && 
          wine.price >= userPreferences.preferredPriceRange * 0.7 &&
          wine.price <= userPreferences.preferredPriceRange * 1.3
        )
        .filter(wine => wine.rating >= userPreferences.preferredRating)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);

      setAiRecommendations(recommendations);
      setShowAIDialog(true);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to generate AI recommendations',
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Similar wine suggestions
  const getSimilarWines = (wine: Wine) => {
    return wines
      .filter(w => w.id !== wine.id)
      .filter(w => 
        w.region === wine.region || 
        w.grape === wine.grape ||
        (w.price && wine.price && Math.abs(w.price - wine.price) < 10)
      )
      .sort((a, b) => {
        let score = 0;
        if (a.region === wine.region) score += 3;
        if (a.grape === wine.grape) score += 2;
        if (a.price && wine.price && Math.abs(a.price - wine.price) < 10) score += 1;
        return score;
      })
      .slice(0, 3);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRegions([]);
    setSelectedGrapes([]);
    setPriceRange([0, 500]);
    setVintageRange([1900, new Date().getFullYear()]);
    setMinRating(0);
    setShowOnlyFavorites(false);
    setShowOnlyValueWines(false);
  };

  const renderWineCard = (wine: Wine, showActions = true, showSimilar = false) => (
    <Card key={wine.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
            <WineIcon />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              {wine.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {wine.grape} • {wine.region}
              {wine.winery && ` • ${wine.winery}`}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Rating value={wine.rating} size="small" readOnly />
              <Chip
                label={RATING_LABELS[wine.rating as keyof typeof RATING_LABELS]}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`${wine.vintage}`}
                size="small"
                variant="outlined"
                color="secondary"
              />
              {wine.price && (
                <Chip
                  label={`$${wine.price}`}
                  size="small"
                  variant="outlined"
                  color="success"
                  icon={<PriceIcon />}
                />
              )}
              {wine.favorite && (
                <Chip
                  label="Favorite"
                  size="small"
                  color="error"
                  icon={<FavoriteIcon />}
                />
              )}
            </Stack>
          </Box>
        </Box>
        
        {showSimilar && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Similar wines:
            </Typography>
            <Stack direction="row" spacing={1}>
              {getSimilarWines(wine).map(similarWine => (
                <Chip
                  key={similarWine.id}
                  label={similarWine.name}
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/wines/${similarWine.id}`)}
                  sx={{ cursor: 'pointer' }}
                />
              ))}
            </Stack>
          </Box>
        )}
        
        {showActions && (
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button
              size="small"
              startIcon={<ViewIcon />}
              onClick={() => navigate(`/wines/${wine.id}`)}
            >
              View
            </Button>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/wines/${wine.id}/edit`)}
            >
              Edit
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  if (wines.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <DiscoveryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Start Your Wine Journey
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Add your first wine to unlock personalized recommendations and insights!
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => navigate('/wine/add')}
        >
          Add Your First Wine
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Wine Discovery
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Discover new wines and get personalized recommendations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AIIcon />}
          onClick={generateAIRecommendations}
          disabled={aiLoading}
        >
          {aiLoading ? 'Generating...' : 'AI Recommendations'}
        </Button>
      </Box>

      {/* Advanced Search and Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <SearchIcon color="primary" />
          <Typography variant="h6">Search & Filters</Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<FilterIcon />}
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced
          </Button>
          <Button
            startIcon={<ClearIcon />}
            onClick={clearFilters}
            variant="outlined"
          >
            Clear All
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search wines by name, grape, region, winery..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyFavorites}
                    onChange={(e) => setShowOnlyFavorites(e.target.checked)}
                  />
                }
                label="Favorites Only"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={showOnlyValueWines}
                    onChange={(e) => setShowOnlyValueWines(e.target.checked)}
                  />
                }
                label="Value Wines"
              />
            </Box>
          </Grid>
        </Grid>

        {showAdvancedFilters && (
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">Advanced Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={uniqueRegions}
                    value={selectedRegions}
                    onChange={(_, newValue) => setSelectedRegions(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Regions" placeholder="Select regions" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    multiple
                    options={uniqueGrapes}
                    value={selectedGrapes}
                    onChange={(_, newValue) => setSelectedGrapes(newValue)}
                    renderInput={(params) => (
                      <TextField {...params} label="Grape Varieties" placeholder="Select grapes" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Price Range: ${priceRange[0]} - ${priceRange[1]}</Typography>
                  <Slider
                    value={priceRange}
                    onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
                    valueLabelDisplay="auto"
                    min={0}
                    max={500}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Vintage Range: {vintageRange[0]} - {vintageRange[1]}</Typography>
                  <Slider
                    value={vintageRange}
                    onChange={(_, newValue) => setVintageRange(newValue as [number, number])}
                    valueLabelDisplay="auto"
                    min={1900}
                    max={new Date().getFullYear()}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Minimum Rating: {minRating}</Typography>
                  <Slider
                    value={minRating}
                    onChange={(_, newValue) => setMinRating(newValue as number)}
                    valueLabelDisplay="auto"
                    min={0}
                    max={5}
                    step={0.5}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        )}

        {filteredWines.length !== wines.length && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Showing {filteredWines.length} of {wines.length} wines
          </Alert>
        )}
      </Paper>

      {/* Weather Widget */}
      <Box sx={{ mb: 3 }}>
        <WeatherWidget />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={200} />
          ))}
        </Box>
      ) : (
        <>
          {/* Insights Overview */}
          {insights && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Collection Insights
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {insights.totalWines}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Wines
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      {insights.avgRating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Rating
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      ${insights.avgPrice.toFixed(0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Price
                    </Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" color="primary">
                      ${insights.totalValue.toFixed(0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Value
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Discovery Tabs */}
          <Paper sx={{ width: '100%' }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="All Wines" />
              <Tab label="Top Rated" />
              <Tab label="Value Wines" />
              <Tab label="Recent Additions" />
              <Tab label="Trending" />
              <Tab label="Underrated Gems" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                {filteredWines.map(wine => (
                  <Grid item xs={12} sm={6} md={4} key={wine.id}>
                    {renderWineCard(wine, true, true)}
                  </Grid>
                ))}
                {filteredWines.length === 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No wines found matching your criteria
                      </Typography>
                      <Button onClick={clearFilters} sx={{ mt: 2 }}>
                        Clear Filters
                      </Button>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                {insights?.topRated.map(wine => (
                  <Grid item xs={12} sm={6} md={4} key={wine.id}>
                    {renderWineCard(wine, true, true)}
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Grid container spacing={3}>
                {insights?.valueWines.map(wine => (
                  <Grid item xs={12} sm={6} md={4} key={wine.id}>
                    {renderWineCard(wine, true, true)}
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <Grid container spacing={3}>
                {insights?.recentWines.map(wine => (
                  <Grid item xs={12} sm={6} md={4} key={wine.id}>
                    {renderWineCard(wine, true, true)}
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
              <Grid container spacing={3}>
                {insights?.trendingWines.map(wine => (
                  <Grid item xs={12} sm={6} md={4} key={wine.id}>
                    {renderWineCard(wine, true, true)}
                  </Grid>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
              <Grid container spacing={3}>
                {insights?.underratedGems.map(wine => (
                  <Grid item xs={12} sm={6} md={4} key={wine.id}>
                    {renderWineCard(wine, true, true)}
                  </Grid>
                ))}
              </Grid>
            </TabPanel>
          </Paper>
        </>
      )}

      {/* AI Recommendations Dialog */}
      <Dialog
        open={showAIDialog}
        onClose={() => setShowAIDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon color="primary" />
            AI-Powered Recommendations
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Based on your preferences and collection, here are some wines you might enjoy:
          </Typography>
          <Grid container spacing={2}>
            {aiRecommendations.map(wine => (
              <Grid item xs={12} sm={6} key={wine.id}>
                {renderWineCard(wine, false, false)}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAIDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add wine"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/wine/add')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
} 