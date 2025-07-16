import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Rating,
  Divider,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  WineBar as WineIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as PriceIcon,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { Wine } from '@/types';
import { WineService } from '@/services/firebase';
import { useApp } from '@/context/AppContext';
import { RATING_LABELS } from '@/constants';
import AIAnalysisDialog from './AIAnalysisDialog';

export default function WineDetail() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state, addNotification } = useApp();
  const [wine, setWine] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [userWines, setUserWines] = useState<Wine[]>([]);

  useEffect(() => {
    if (id) {
      loadWine();
      loadUserWines();
    }
  }, [id]);

  const loadWine = async () => {
    try {
      setLoading(true);
      const wineData = await WineService.getWine(id || '', state.user?.id);
      setWine(wineData);
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to load wine details',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserWines = async () => {
    try {
      const wines = await WineService.getWines(state.user?.id);
      setUserWines(wines);
    } catch (error) {
      console.error('Failed to load user wines for AI analysis:', error);
    }
  };

  const handleDelete = async () => {
    if (!wine || !window.confirm('Are you sure you want to delete this wine?')) {
      return;
    }

    try {
      await WineService.deleteWine(wine.id!, state.user?.id);
      addNotification({
        type: 'success',
        message: 'Wine deleted successfully',
      });
      navigate('/wines');
    } catch (error) {
      addNotification({
        type: 'error',
        message: 'Failed to delete wine',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!wine) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Wine not found
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/wines')}
          sx={{ mt: 2 }}
        >
          Back to Wines
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/wines')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, flexGrow: 1 }}>
          {wine.name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<AIIcon />}
            onClick={() => setAiDialogOpen(true)}
            sx={{ 
              background: 'linear-gradient(45deg, #8B0000 30%, #D4AF37 90%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #660000 30%, #B8860B 90%)',
              }
            }}
          >
            AI Analysis
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/wine/edit/${wine.id}`)}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Wine Image and Basic Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              {wine.imageUrl ? (
                <img
                  src={wine.imageUrl}
                  alt={wine.name}
                  style={{
                    width: '100%',
                    height: 300,
                    objectFit: 'cover',
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 200,
                    height: 200,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: theme.palette.primary.main,
                    fontSize: 64,
                  }}
                >
                  <WineIcon fontSize="large" />
                </Avatar>
              )}

              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                {wine.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Rating value={wine.rating} size="large" readOnly />
                <Chip
                  label={RATING_LABELS[wine.rating as keyof typeof RATING_LABELS]}
                  color="primary"
                  sx={{ ml: 1 }}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <LocationIcon color="action" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Region
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {wine.region}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <WineIcon color="action" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Grape
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {wine.grape}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CalendarIcon color="action" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Vintage
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {wine.vintage}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <PriceIcon color="action" sx={{ mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Price
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      {wine.price ? `$${wine.price}` : 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Tasting Notes */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Tasting Notes
              </Typography>

              <Grid container spacing={3}>
                {/* Appearance */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    👁️ Appearance
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Clarity:</strong> {wine.tasting.appearance.clarity || 'Not specified'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Intensity:</strong> {wine.tasting.appearance.intensity || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Colour:</strong> {wine.tasting.appearance.colour || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Nose */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    👃 Nose
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Condition:</strong> {wine.tasting.nose.condition || 'Not specified'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Intensity:</strong> {wine.tasting.nose.intensity || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>

                {/* Palate */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    👅 Palate
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(wine.tasting.palate).map(([key, value]) => (
                      <Grid item xs={6} sm={4} md={3} key={key}>
                        <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {value || 'N/A'}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Conclusions */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    ✅ Conclusions
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography variant="body2">
                      <strong>Quality:</strong> {wine.tasting.conclusions.quality || 'Not specified'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* AI Analysis Dialog */}
      <AIAnalysisDialog
        open={aiDialogOpen}
        onClose={() => setAiDialogOpen(false)}
        wine={wine}
        userWines={userWines}
      />
    </Box>
  );
} 