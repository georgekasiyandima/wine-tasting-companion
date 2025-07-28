import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Rating,
  useTheme,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Stack,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Autocomplete,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  WineBar as WineIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  AutoAwesome as DiscoveryIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  AttachMoney as PriceIcon,
  CalendarToday as VintageIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Favorite as FavoriteIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { Wine } from '@/types';
import { WineService } from '@/api/firebase';
import { useApp } from '@/context/AppContext';
import { RATING_LABELS, POPULAR_REGIONS, POPULAR_GRAPES } from '@/constants';

type SortOption = 'name' | 'rating' | 'price' | 'vintage' | 'dateAdded';
type SortDirection = 'asc' | 'desc';

export default function WineList() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { state, addNotification } = useApp();
  const [wines, setWines] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and basic filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterGrape, setFilterGrape] = useState('');
  const [filterRating, setFilterRating] = useState('');
  
  // Advanced filters
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [vintageRange, setVintageRange] = useState<[number, number]>([1900, new Date().getFullYear()]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>('dateAdded');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadWines();
  }, []);

  const loadWines = async () => {
    try {
      setLoading(true);
      console.log('Loading wines for user:', state.user?.id);
      const wineList = await WineService.getWines(state.user?.id);
      console.log('Loaded wines:', wineList);
      setWines(wineList);
    } catch (error) {
      console.error('Error loading wines:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load wines: ' + (error instanceof Error ? error.message : 'Unknown error'),
      });
      setWines([]); // Set empty array instead of leaving undefined
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this wine?')) {
      try {
        await WineService.deleteWine(id, state.user?.id);
        addNotification({
          type: 'success',
          message: 'Wine deleted successfully',
        });
        loadWines();
      } catch (error) {
        addNotification({
          type: 'error',
          message: 'Failed to delete wine',
        });
      }
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

  // Enhanced filtering with advanced options
  const filteredWines = useMemo(() => {
    return wines.filter(wine => {
      // Basic search
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        wine.name.toLowerCase().includes(searchLower) ||
        wine.grape.toLowerCase().includes(searchLower) ||
        wine.region.toLowerCase().includes(searchLower) ||
        wine.winery?.toLowerCase().includes(searchLower) ||
        wine.notes?.toLowerCase().includes(searchLower);
      
      // Basic filters
      const matchesRegion = !filterRegion || wine.region === filterRegion;
      const matchesGrape = !filterGrape || wine.grape === filterGrape;
      const matchesRating = !filterRating || wine.rating.toString() === filterRating;
      
      // Advanced filters
      const matchesPrice = wine.price !== undefined && 
        wine.price >= priceRange[0] && wine.price <= priceRange[1];
      const matchesVintage = wine.vintage >= vintageRange[0] && wine.vintage <= vintageRange[1];
      
      return matchesSearch && matchesRegion && matchesGrape && matchesRating && 
             matchesPrice && matchesVintage;
    });
  }, [wines, searchTerm, filterRegion, filterGrape, filterRating, priceRange, vintageRange]);

  // Sorting
  const sortedWines = useMemo(() => {
    return [...filteredWines].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'vintage':
          aValue = a.vintage;
          bValue = b.vintage;
          break;
        case 'dateAdded':
        default:
          aValue = a.timestamp;
          bValue = b.timestamp;
          break;
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredWines, sortBy, sortDirection]);

  // Statistics
  const stats = useMemo(() => {
    const totalWines = wines.length;
    const filteredCount = filteredWines.length;
    const avgRating = wines.length > 0 ? wines.reduce((sum, wine) => sum + wine.rating, 0) / wines.length : 0;
    const totalValue = wines.reduce((sum, wine) => sum + (wine.price || 0), 0);
    const favoritesCount = wines.filter(wine => wine.favorite).length;
    
    return {
      totalWines,
      filteredCount,
      avgRating,
      totalValue,
      favoritesCount,
    };
  }, [wines, filteredWines]);

  const clearFilters = () => {
    setSearchTerm('');
    setFilterRegion('');
    setFilterGrape('');
    setFilterRating('');
    setPriceRange([0, 1000]);
    setVintageRange([1900, new Date().getFullYear()]);
  };

  const handleSort = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
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

  const renderWineCard = (wine: Wine, showSimilar = false) => (
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
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(wine.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Wine Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
            <WineIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.grape} • {params.row.region}
              {params.row.winery && ` • ${params.row.winery}`}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'vintage',
      headerName: 'Vintage',
      width: 100,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color="secondary"
        />
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 150,
      align: 'center',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Rating value={params.value} size="small" readOnly />
          <Chip
            label={RATING_LABELS[params.value as keyof typeof RATING_LABELS]}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      align: 'right',
      renderCell: (params) => (
        params.value ? (
          <Chip
            label={`$${params.value}`}
            size="small"
            color="success"
            variant="outlined"
            icon={<PriceIcon />}
          />
        ) : '-'
      ),
    },
    {
      field: 'timestamp',
      headerName: 'Date Added',
      width: 150,
      renderCell: (params) => (
        <Typography variant="caption">
          {new Date(params.value).toLocaleDateString()}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ViewIcon />}
          label="View"
          onClick={() => navigate(`/wine/${params.id}`)}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => navigate(`/wine/edit/${params.id}`)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.id as string)}
        />,
      ],
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Wine Collection
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and explore your wine collection
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/wine/add')}
        >
          Add Wine
        </Button>
      </Box>

      {/* Statistics Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Collection Overview
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">
                {stats.totalWines}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Wines
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">
                {stats.filteredCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Showing
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">
                {stats.avgRating.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Rating
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h4" color="primary">
                ${stats.totalValue.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Value
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Paper>

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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  label="Region"
                >
                  <MenuItem value="">All Regions</MenuItem>
                  {uniqueRegions.map(region => (
                    <MenuItem key={region} value={region}>{region}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Grape</InputLabel>
                <Select
                  value={filterGrape}
                  onChange={(e) => setFilterGrape(e.target.value)}
                  label="Grape"
                >
                  <MenuItem value="">All Grapes</MenuItem>
                  {uniqueGrapes.map(grape => (
                    <MenuItem key={grape} value={grape}>{grape}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  <Typography gutterBottom>Price Range: ${priceRange[0]} - ${priceRange[1]}</Typography>
                  <Slider
                    value={priceRange}
                    onChange={(_, newValue) => setPriceRange(newValue as [number, number])}
                    valueLabelDisplay="auto"
                    min={0}
                    max={1000}
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
                  <FormControl fullWidth>
                    <InputLabel>Rating</InputLabel>
                    <Select
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value)}
                      label="Rating"
                    >
                      <MenuItem value="">All Ratings</MenuItem>
                      <MenuItem value="5">5 Stars</MenuItem>
                      <MenuItem value="4">4+ Stars</MenuItem>
                      <MenuItem value="3">3+ Stars</MenuItem>
                      <MenuItem value="2">2+ Stars</MenuItem>
                      <MenuItem value="1">1+ Stars</MenuItem>
                    </Select>
                  </FormControl>
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

      {/* Sorting and View Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1">Sort by:</Typography>
            <ToggleButtonGroup
              value={sortBy}
              exclusive
              onChange={(_, value) => value && handleSort(value)}
              size="small"
            >
              <ToggleButton value="name">Name</ToggleButton>
              <ToggleButton value="rating">Rating</ToggleButton>
              <ToggleButton value="price">Price</ToggleButton>
              <ToggleButton value="vintage">Vintage</ToggleButton>
              <ToggleButton value="dateAdded">Date Added</ToggleButton>
            </ToggleButtonGroup>
            <IconButton
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              size="small"
            >
              {sortDirection === 'asc' ? <TrendingUp /> : <TrendingDownIcon />}
            </IconButton>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1">View:</Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, value) => value && setViewMode(value)}
              size="small"
            >
              <ToggleButton value="list">List</ToggleButton>
              <ToggleButton value="grid">Grid</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>

      {/* Wine List/Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={200} />
          ))}
        </Box>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {sortedWines.map(wine => (
            <Grid item xs={12} sm={6} md={4} key={wine.id}>
              {renderWineCard(wine, true)}
            </Grid>
          ))}
          {sortedWines.length === 0 && (
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
      ) : (
        <Paper>
          <DataGrid
            rows={sortedWines}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
            autoHeight
            sx={{ border: 'none' }}
          />
        </Paper>
      )}
    </Box>
  );
} 