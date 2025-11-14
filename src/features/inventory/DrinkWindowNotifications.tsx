import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
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
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  useTheme,
  Paper,
  Stack,
  Badge,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  WineBar as WineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useApp } from '@/context/AppContext';
import AnimatedCard from '@/components/common/AnimatedCard';

interface DrinkWindowAlert {
  id: string;
  wineName: string;
  vintage: number;
  drinkByDate: Date;
  daysUntilExpiry: number;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'dismissed' | 'expired';
  quantity: number;
  location: string;
  estimatedValue: number;
  recommendation: string;
}

interface NotificationSettings {
  enableNotifications: boolean;
  highPriorityDays: number;
  mediumPriorityDays: number;
  lowPriorityDays: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const mockDrinkWindowAlerts: DrinkWindowAlert[] = [
  {
    id: '1',
    wineName: 'Prosecco Superiore DOCG',
    vintage: 2023,
    drinkByDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    daysUntilExpiry: 7,
    priority: 'high',
    status: 'active',
    quantity: 12,
    location: 'Deck 3 - Climate Controlled',
    estimatedValue: 300,
    recommendation: 'Serve at upcoming captain\'s dinner',
  },
  {
    id: '2',
    wineName: 'Chianti Classico Riserva',
    vintage: 2019,
    drinkByDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    daysUntilExpiry: 14,
    priority: 'medium',
    status: 'active',
    quantity: 8,
    location: 'Deck 5 - Wine Cellar',
    estimatedValue: 360,
    recommendation: 'Feature in Italian wine tasting event',
  },
  {
    id: '3',
    wineName: 'Sauvignon Blanc',
    vintage: 2022,
    drinkByDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    daysUntilExpiry: 30,
    priority: 'low',
    status: 'active',
    quantity: 15,
    location: 'Deck 2 - Storage',
    estimatedValue: 225,
    recommendation: 'Include in daily wine service',
  },
];

export default function DrinkWindowNotifications() {
  const theme = useTheme();
  const { addNotification } = useApp();
  
  const [alerts, setAlerts] = useState<DrinkWindowAlert[]>(mockDrinkWindowAlerts);
  const [settings, setSettings] = useState<NotificationSettings>({
    enableNotifications: true,
    highPriorityDays: 7,
    mediumPriorityDays: 14,
    lowPriorityDays: 30,
    emailNotifications: true,
    pushNotifications: true,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<DrinkWindowAlert | null>(null);

  useEffect(() => {
    // Simulate cron job checking for expiring wines
    const interval = setInterval(() => {
      checkForExpiringWines();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const checkForExpiringWines = () => {
    // This would be a real cron job in production
    const today = new Date();
    const expiringWines = alerts.filter(alert => {
      const daysUntilExpiry = Math.ceil((alert.drinkByDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= settings.highPriorityDays && alert.status === 'active';
    });

    if (expiringWines.length > 0) {
      addNotification({
        type: 'warning',
        message: `${expiringWines.length} wines are approaching their drink window!`,
      });
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <WarningIcon />;
      case 'medium': return <ScheduleIcon />;
      case 'low': return <TimerIcon />;
      default: return <TimerIcon />;
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: 'dismissed' } : alert
    ));
    addNotification({
      type: 'success',
      message: 'Alert dismissed successfully',
    });
  };

  const getActiveAlerts = () => alerts.filter(alert => alert.status === 'active');
  const getHighPriorityAlerts = () => getActiveAlerts().filter(alert => alert.priority === 'high');
  const getTotalValueAtRisk = () => getActiveAlerts().reduce((sum, alert) => sum + alert.estimatedValue, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          🍷 Drink Window Notifications
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<ViewIcon />}
            onClick={() => setShowSettings(true)}
            sx={{ mr: 1 }}
          >
            Settings
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={checkForExpiringWines}
          >
            Check Now
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Alerts
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {getActiveAlerts().length}
                  </Typography>
                </Box>
                <Badge badgeContent={getHighPriorityAlerts().length} color="error">
                  <NotificationIcon color="warning" sx={{ fontSize: 40 }} />
                </Badge>
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
                    High Priority
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {getHighPriorityAlerts().length}
                  </Typography>
                </Box>
                <WarningIcon color="error" sx={{ fontSize: 40 }} />
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
                    Value at Risk
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    ${getTotalValueAtRisk().toLocaleString()}
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
                    Total Bottles
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {getActiveAlerts().reduce((sum, alert) => sum + alert.quantity, 0)}
                  </Typography>
                </Box>
                <WineIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>

      {/* High Priority Alerts */}
      {getHighPriorityAlerts().length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            ⚠️ High Priority Alerts
          </Typography>
          <Typography variant="body2">
            {getHighPriorityAlerts().length} wines are expiring within {settings.highPriorityDays} days. 
            Take immediate action to prevent waste.
          </Typography>
        </Alert>
      )}

      {/* Alerts List */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Drink Window Alerts
          </Typography>

          {getActiveAlerts().length === 0 ? (
            <Alert severity="success">
              <Typography variant="body1">
                🎉 No wines are approaching their drink window! All inventory is properly managed.
              </Typography>
            </Alert>
          ) : (
            <List>
              {getActiveAlerts()
                .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
                .map((alert) => (
                  <ListItem
                    key={alert.id}
                    sx={{
                      border: `1px solid ${theme.palette[getPriorityColor(alert.priority) as any].main}`,
                      borderRadius: 2,
                      mb: 2,
                      bgcolor: `${theme.palette[getPriorityColor(alert.priority) as any].main}10`,
                    }}
                  >
                    <ListItemIcon>
                      {getPriorityIcon(alert.priority)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">
                            {alert.wineName} {alert.vintage}
                          </Typography>
                          <Chip
                            label={`${alert.daysUntilExpiry} days left`}
                            color={getPriorityColor(alert.priority) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            Location: {alert.location} • Quantity: {alert.quantity} bottles • Value: ${alert.estimatedValue}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Recommendation: {alert.recommendation}
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => setSelectedAlert(alert)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Dismiss Alert">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => dismissAlert(alert.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={!!selectedAlert} onClose={() => setSelectedAlert(null)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Wine Alert Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedAlert && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Wine Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Wine Name"
                        secondary={selectedAlert.wineName}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Vintage"
                        secondary={selectedAlert.vintage}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Location"
                        secondary={selectedAlert.location}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Quantity"
                        secondary={`${selectedAlert.quantity} bottles`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Drink Window Details
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Days Until Expiry"
                        secondary={selectedAlert.daysUntilExpiry}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Drink By Date"
                        secondary={selectedAlert.drinkByDate.toLocaleDateString()}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Priority"
                        secondary={
                          <Chip
                            label={selectedAlert.priority}
                            color={getPriorityColor(selectedAlert.priority) as any}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Estimated Value"
                        secondary={`$${selectedAlert.estimatedValue}`}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
              
              <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.50' }}>
                <Typography variant="h6" gutterBottom>
                  📋 Recommendation
                </Typography>
                <Typography variant="body1">
                  {selectedAlert.recommendation}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAlert(null)}>Close</Button>
          <Button variant="contained" color="primary">
            Take Action
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6">
            Notification Settings
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Configure drink window notification preferences for your wine inventory.
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Alert Thresholds
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="High Priority (days)"
                type="number"
                value={settings.highPriorityDays}
                onChange={(e) => setSettings({...settings, highPriorityDays: parseInt(e.target.value)})}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Medium Priority (days)"
                type="number"
                value={settings.mediumPriorityDays}
                onChange={(e) => setSettings({...settings, mediumPriorityDays: parseInt(e.target.value)})}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Low Priority (days)"
                type="number"
                value={settings.lowPriorityDays}
                onChange={(e) => setSettings({...settings, lowPriorityDays: parseInt(e.target.value)})}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettings(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setShowSettings(false)}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 