import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  CssBaseline,
  Container,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  WineBar as WineBarIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Mic as MicIcon,
  Home as HomeIcon,
  Info as InfoIcon,
  ContactSupport as ContactSupportIcon,
  AutoAwesome as DiscoveryIcon,
  Storage as StorageIcon,
  Flag as FlagIcon,
  Inventory as InventoryIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { AuthService } from '@/api/firebase';
import { PROFILE_IMAGES } from '@/constants';
import { Link } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAuthenticated = !!state.user;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await AuthService.signOut();
      setAnchorEl(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleThemeToggle = () => {
    dispatch({ 
      type: 'SET_THEME', 
      payload: { 
        ...state.theme, 
        mode: state.theme.mode === 'light' ? 'dark' : 'light' 
      } 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5',
      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
      '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800',
      '#ff5722', '#795548', '#9e9e9e', '#607d8b'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const getAvatarImage = () => {
    // Use the custom profile image from public folder
    return PROFILE_IMAGES.DEFAULT_AVATAR;
  };

  const navigationItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'About', icon: <InfoIcon />, path: '/about' },
    { text: 'Contact', icon: <ContactSupportIcon />, path: '/contact' },
  ];

  const authenticatedItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Wine Collection', icon: <WineBarIcon />, path: '/wines' },
    { text: 'Wine Discovery', icon: <DiscoveryIcon />, path: '/wine-discovery' },
    { text: 'Wine Cellar', icon: <StorageIcon />, path: '/wine-cellar' },
    { text: 'Add Wine', icon: <AddIcon />, path: '/wine/add' },
    { text: 'Tasting Sessions', icon: <MicIcon />, path: '/tasting-sessions' },
    { text: 'Analytics', icon: <AssessmentIcon />, path: '/analytics' },
    { text: 'South Africa Wine', icon: <FlagIcon />, path: '/south-africa-wine' },
    { text: 'Wine Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Staff Training', icon: <SchoolIcon />, path: '/training' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  const drawer = (
    <Box>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" color="primary" fontWeight={700}>
          Wine Tasting Companion
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Portfolio Project
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      {isAuthenticated && (
        <>
          <Divider />
          <List>
            {authenticatedItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setMobileOpen(false);
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {location.pathname === '/' && 'Wine Tasting Companion'}
            {location.pathname === '/about' && 'About'}
            {location.pathname === '/contact' && 'Contact'}
            {location.pathname === '/auth' && 'Authentication'}
            {location.pathname === '/dashboard' && 'Dashboard'}
            {location.pathname === '/wines' && 'Wine Collection'}
            {location.pathname === '/wine-discovery' && 'Wine Discovery'}
            {location.pathname === '/wine-cellar' && 'Wine Cellar'}
            {location.pathname === '/wine/add' && 'Add Wine'}
            {location.pathname.startsWith('/wine/edit/') && 'Edit Wine'}
            {location.pathname.startsWith('/wine/') && !location.pathname.startsWith('/wine/edit/') && !location.pathname.includes('/wine-cellar') && !location.pathname.includes('/wine-discovery') && 'Wine Details'}
            {location.pathname === '/tasting-sessions' && 'Tasting Sessions'}
            {location.pathname === '/analytics' && 'Analytics'}
            {location.pathname === '/profile' && 'Profile'}
            {location.pathname === '/south-africa-wine' && 'South Africa Wine Regions'}
            {location.pathname === '/inventory' && 'Wine Inventory'}
            {location.pathname === '/training' && 'Staff Training Center'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit" onClick={handleThemeToggle}>
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {isAuthenticated ? (
              <>
                <Chip
                  label={state.user?.displayName || 'User'}
                  size="small"
                  sx={{ 
                    mr: 1,
                    bgcolor: getAvatarColor(state.user?.displayName || 'User'),
                    color: 'white',
                    fontWeight: 600
                  }}
                />
                <IconButton
                  onClick={handleProfileMenuOpen}
                  sx={{ p: 0 }}
                >
                  <Avatar
                    src={getAvatarImage()}
                    alt={state.user?.displayName || 'User'}
                    sx={{
                      width: 32,
                      height: 32,
                    }}
                  >
                    {getInitials(state.user?.displayName || 'User')}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <MenuItem onClick={() => { navigate('/profile'); handleProfileMenuClose(); }}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="primary"
                variant="contained"
                onClick={() => navigate('/auth')}
                sx={{ ml: 1 }}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          pb: isAuthenticated && isMobile ? '72px' : 3,
        }}
      >
        <Toolbar />
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>
      {isAuthenticated && isMobile && <BottomNavBar />}
    </Box>
  );
};

export default Layout; 