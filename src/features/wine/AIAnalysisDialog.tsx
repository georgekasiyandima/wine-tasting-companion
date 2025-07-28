import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Rating,
  Grid,
  ListItemIcon
} from '@mui/material';
import {
  Close as CloseIcon,
  Restaurant as RestaurantIcon,
  WineBar as WineBarIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  AutoAwesome as AutoAwesomeIcon,
  AttachMoney as AttachMoneyIcon,
  Recommend as RecommendIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { Wine } from '@/types';
import { aiService, AIWineAnalysis, AIRecommendation } from '@/api/ai';

interface AIAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  wine: Wine;
  userWines?: Wine[];
}

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
      id={`ai-analysis-tabpanel-${index}`}
      aria-labelledby={`ai-analysis-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const AIAnalysisDialog: React.FC<AIAnalysisDialogProps> = ({
  open,
  onClose,
  wine,
  userWines = [],
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIWineAnalysis | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && wine) {
      generateAnalysis();
    }
  }, [open, wine]);

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Generate comprehensive wine analysis
      const wineAnalysis = await aiService.analyzeWine(wine);
      setAnalysis(wineAnalysis);

      // Generate personalized recommendations
      const userPreferences = {
        regions: [...new Set(userWines.map(w => w.region))],
        grapes: [...new Set(userWines.map(w => w.grape))],
        averageRating: userWines.length > 0 
          ? userWines.reduce((sum, w) => sum + w.rating, 0) / userWines.length 
          : 0
      };
      
      const wineRecommendations = await aiService.getPersonalizedRecommendations(
        userWines, 
        userPreferences
      );
      setRecommendations(wineRecommendations);
    } catch (err) {
      setError('Failed to generate AI analysis. Please try again.');
      console.error('AI Analysis Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'similar': return 'primary';
      case 'upgrade': return 'secondary';
      case 'discovery': return 'success';
      case 'value': return 'warning';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'similar': return <WineBarIcon />;
      case 'upgrade': return <TrendingUpIcon />;
      case 'discovery': return <AutoAwesomeIcon />;
      case 'value': return <AttachMoneyIcon />;
      default: return <RecommendIcon />;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              AI Wine Analysis
            </Typography>
          </Box>
          <Button onClick={onClose} startIcon={<CloseIcon />} color="inherit">
            Close
          </Button>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          {wine.name} • {wine.grape} • {wine.region}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Analyzing your wine...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Our AI sommelier is examining the details
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={generateAnalysis}>
              Try Again
            </Button>
          </Box>
        ) : (
          <Box>
            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange}>
                <Tab label="Analysis" icon={<WineBarIcon />} iconPosition="start" />
                <Tab label="Food Pairings" icon={<RestaurantIcon />} iconPosition="start" />
                <Tab label="Recommendations" icon={<RecommendIcon />} iconPosition="start" />
                <Tab label="Insights" icon={<LightbulbIcon />} iconPosition="start" />
              </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ px: 3, py: 2 }}>
              {/* Analysis Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Tasting Notes
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {analysis?.tastingNotes}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Serving Recommendations
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <AccessTimeIcon color="primary" />
                          <Typography variant="body2">
                            {analysis?.servingRecommendations}
                          </Typography>
                        </Box>
                        
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Aging Potential
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {analysis?.agingPotential}
                        </Typography>
                        
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Price Range
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon color="primary" />
                          <Typography variant="body2">
                            {analysis?.priceRange}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Food Pairings Tab */}
              <TabPanel value={tabValue} index={1}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      Perfect Food Pairings
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      These dishes will complement your wine beautifully
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {analysis?.foodPairings.map((pairing, index) => (
                        <Chip
                          key={index}
                          label={pairing}
                          color="primary"
                          variant="outlined"
                          icon={<RestaurantIcon />}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* Recommendations Tab */}
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Personalized Recommendations
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Based on your wine collection and preferences
                </Typography>
                
                <Grid container spacing={2}>
                  {recommendations.map((rec, index) => (
                    <Grid item xs={12} key={index}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" fontWeight={600}>
                              {rec.wineName}
                            </Typography>
                            <Chip
                              label={rec.category}
                              color={getCategoryColor(rec.category)}
                              icon={getCategoryIcon(rec.category)}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {rec.reason}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating value={rec.confidence * 5} readOnly size="small" />
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(rec.confidence * 100)}% match
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </TabPanel>

              {/* Insights Tab */}
              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Expert Insights
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                          {analysis?.expertInsights}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Similar Wines to Try
                        </Typography>
                        <List dense>
                          {analysis?.similarWines.map((similarWine, index) => (
                            <ListItem key={index}>
                              <ListItemIcon>
                                <WineBarIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={similarWine} />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          onClick={generateAnalysis}
          disabled={loading}
        >
          Refresh Analysis
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIAnalysisDialog; 