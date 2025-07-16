import React from 'react';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  WineBar as WineBarIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', value: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Cellar', value: '/wine-cellar', icon: <StorageIcon /> },
    { label: 'Add', value: '/wine/add', icon: <AddIcon /> },
    { label: 'Collection', value: '/wines', icon: <WineBarIcon /> },
    { label: 'Profile', value: '/profile', icon: <PersonIcon /> },
  ];

  const currentNavValue = navItems.find(item => location.pathname.startsWith(item.value))?.value;

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }} 
      elevation={3}
    >
      <MuiBottomNavigation
        showLabels
        value={currentNavValue}
        onChange={(event, newValue) => {
          navigate(newValue);
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction 
            key={item.label}
            label={item.label} 
            value={item.value} 
            icon={item.icon}
          />
        ))}
      </MuiBottomNavigation>
    </Paper>
  );
};

export default BottomNavBar; 