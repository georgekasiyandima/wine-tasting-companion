import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Paper,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  Water as WaterIcon,
  Forest as ForestIcon,
  Recycling as RecyclingIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useApp } from '@/context/AppContext';
import AnimatedCard from '@/components/common/AnimatedCard';

interface SustainabilityMetrics {
  totalWines: number;
  sustainableWines: number;
  organicWines: number;
  biodynamicWines: number;
  carbonFootprint: number; // kg CO2
  waterSaved: number; // liters
  pesticidesAvoided: number; // kg
  certifications: string[];
  unGoalsProgress: UNGoalProgress[];
}

interface UNGoalProgress {
  goal: string;
  target: number;
  current: number;
  percentage: number;
  description: string;
  icon: React.ReactNode;
}

interface SustainabilityReport {
  period: string;
  metrics: SustainabilityMetrics;
  recommendations: string[];
  achievements: string[];
}

const UN_GOALS = [
  {
    goal: 'Climate Action (SDG 13)',
    target: 100,
    current: 75,
    description: 'Reduce carbon footprint through sustainable wine choices',
    icon: <TrendingDownIcon />,
  },
  {
    goal: 'Clean Water (SDG 6)',
    target: 100,
    current: 85,
    description: 'Support water conservation through organic farming',
    icon: <WaterIcon />,
  },
  {
    goal: 'Life on Land (SDG 15)',
    target: 100,
    current: 90,
    description: 'Protect biodiversity through sustainable agriculture',
    icon: <ForestIcon />,
  },
  {
    goal: 'Responsible Consumption (SDG 12)',
    target: 100,
    current: 80,
    description: 'Promote sustainable production and consumption',
    icon: <RecyclingIcon />,
  },
];

export default function SustainabilityTracker() {
  const theme = useTheme();
  const { addNotification } = useApp();
  
  const [metrics, setMetrics] = useState<SustainabilityMetrics>({
    totalWines: 150,
    sustainableWines: 45,
    organicWines: 30,
    biodynamicWines: 15,
    carbonFootprint: 1250, // kg CO2
    waterSaved: 45000, // liters
    pesticidesAvoided: 12.5, // kg
    certifications: ['Organic Certified', 'Biodynamic Certified', 'Fair Trade'],
    unGoalsProgress: UN_GOALS.map(goal => ({
      ...goal,
      percentage: (goal.current / goal.target) * 100,
    })),
  });
  
  const [showDetails, setShowDetails] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<UNGoalProgress | null>(null);

  const getSustainabilityPercentage = () => {
    return (metrics.sustainableWines / metrics.totalWines) * 100;
  };

  const getCarbonFootprintReduction = () => {
    // Calculate reduction compared to conventional wines
    const conventionalFootprint = metrics.totalWines * 15; // kg CO2 per bottle
    const currentFootprint = metrics.carbonFootprint;
    return ((conventionalFootprint - currentFootprint) / conventionalFootprint) * 100;
  };

  const getGoalColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  const getAchievementBadges = () => {
    const badges = [];
    if (getSustainabilityPercentage() >= 30) {
      badges.push({ name: 'Sustainability Pioneer', color: 'success' });
    }
    if (metrics.organicWines >= 20) {
      badges.push({ name: 'Organic Advocate', color: 'primary' });
    }
    if (getCarbonFootprintReduction() >= 20) {
      badges.push({ name: 'Climate Champion', color: 'secondary' });
    }
    return badges;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          🌱 Sustainability Tracker
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ViewIcon />}
          onClick={() => setShowDetails(true)}
        >
          View Details
        </Button>
      </Box>

      {/* Sustainability Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Sustainable Wines
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {getSustainabilityPercentage().toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {metrics.sustainableWines} of {metrics.totalWines} wines
                  </Typography>
                </Box>
                <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={getSustainabilityPercentage()}
                color="success"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Carbon Reduction
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {getCarbonFootprintReduction().toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {metrics.carbonFootprint} kg CO2 total
                  </Typography>
                </Box>
                <TrendingDownIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Water Saved
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {Math.round(metrics.waterSaved / 1000)}k L
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Through organic farming
                  </Typography>
                </Box>
                <WaterIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Pesticides Avoided
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {metrics.pesticidesAvoided} kg
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Through sustainable choices
                  </Typography>
                </Box>
                <ForestIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>

      {/* UN 2050 Goals Progress */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrophyIcon color="primary" />
            UN Sustainable Development Goals Progress
          </Typography>
          
          <Grid container spacing={3}>
            {metrics.unGoalsProgress.map((goal, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper sx={{ p: 2, border: `2px solid ${theme.palette[getGoalColor(goal.percentage) as any].main}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {goal.icon}
                      <Typography variant="h6">
                        {goal.goal}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${goal.percentage.toFixed(0)}%`}
                      color={getGoalColor(goal.percentage) as any}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {goal.description}
                  </Typography>
                  
                  <LinearProgress
                    variant="determinate"
                    value={goal.percentage}
                    color={getGoalColor(goal.percentage) as any}
                    sx={{ mb: 1 }}
                  />
                  
                  <Typography variant="caption" color="textSecondary">
                    {goal.current} of {goal.target} targets achieved
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            🏆 Sustainability Achievements
          </Typography>
          
          <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
            {getAchievementBadges().map((badge, index) => (
              <Chip
                key={index}
                label={badge.name}
                color={badge.color as any}
                icon={<TrophyIcon />}
                variant="outlined"
              />
            ))}
          </Stack>

          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Your wine collection is leading the way in sustainable procurement! 
              You've saved {Math.round(metrics.waterSaved / 1000)}k liters of water and 
              reduced carbon footprint by {getCarbonFootprintReduction().toFixed(1)}%.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            📜 Sustainability Certifications
          </Typography>
          
          <Grid container spacing={2}>
            {metrics.certifications.map((cert, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="body1" fontWeight="bold">
                    {cert}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Certified sustainable
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Detailed Report Dialog */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Detailed Sustainability Report
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Comprehensive analysis of your wine collection's sustainability impact and progress toward UN 2050 goals.
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Sustainable Wine Procurement"
                secondary={`${metrics.sustainableWines} out of ${metrics.totalWines} wines are sustainably sourced`}
              />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <TrendingDownIcon color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Carbon Footprint Reduction"
                secondary={`${getCarbonFootprintReduction().toFixed(1)}% reduction compared to conventional wines`}
              />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <WaterIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Water Conservation"
                secondary={`${Math.round(metrics.waterSaved / 1000)}k liters of water saved through organic farming`}
              />
            </ListItem>
            
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <ForestIcon color="warning" />
              </ListItemIcon>
              <ListItemText
                primary="Pesticide Avoidance"
                secondary={`${metrics.pesticidesAvoided} kg of pesticides avoided through sustainable choices`}
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Next Steps:</strong> Consider increasing organic wine procurement to 40% 
              to achieve Climate Action SDG 13 targets.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>Close</Button>
          <Button variant="contained" color="primary">
            Export Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 