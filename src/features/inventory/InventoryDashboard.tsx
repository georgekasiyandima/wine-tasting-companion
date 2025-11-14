import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { cellarService } from '@/api/firebase';
import { WineCellar, CellarWine } from '@/types';
import WeatherWidget from '@/components/common/WeatherWidget';
import { useApp } from '@/context/AppContext';

interface SortConfig {
  key: keyof CellarWine;
  direction: 'asc' | 'desc';
}

const InventoryDashboard: React.FC = () => {
  const { state: { user } } = useApp();
  const [cellars, setCellars] = useState<WineCellar[]>([]);
  const [wines, setWines] = useState<CellarWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const loadInventory = useCallback(async () => {
    if (!user?.id) {
      console.error('No user ID available');
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Loading inventory for user:', user.id);
      const userCellars = await cellarService.getCellars(user.id);
      console.log('Fetched cellars:', userCellars);

      let allWines: CellarWine[] = [];
      for (const cellar of userCellars) {
        const cellarWines = await cellarService.getCellarWines(cellar.id);
        allWines = [...allWines, ...cellarWines];
      }
      console.log('Fetched wines:', allWines);

      setCellars(userCellars);
      setWines(allWines);
    } catch (error) {
      console.error('Error loading inventory:', error);
      setError(error instanceof Error ? error.message : 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleSort = (key: keyof CellarWine) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sortedWines = [...wines].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setWines(sortedWines);
  };

  const handleEditWine = (wine: CellarWine) => {
    console.log('Editing wine:', wine);
    // Implement edit logic (e.g., open a modal)
  };

  const handleDeleteWine = async (cellarId: string, wineId: string) => {
    if (!user?.id) return;
    try {
      await cellarService.removeWineFromCellar(wineId);
      setWines(wines.filter(wine => wine.id !== wineId));
      loadInventory(); // Reload to refresh the list
    } catch (error) {
      console.error('Error deleting wine:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete wine');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Wine Inventory Dashboard
      </Typography>

      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
          <Typography>{error}</Typography>
        </Box>
      )}

      <WeatherWidget />

      {cellars.length === 0 ? (
        <Typography>No cellars found. Create a cellar to start managing your wines.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('name')}>
                    Name
                    {sortConfig?.key === 'name' && (
                      <Box sx={{ ml: 1 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('region')}>
                    Region
                    {sortConfig?.key === 'region' && (
                      <Box sx={{ ml: 1 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('vintage')}>
                    Vintage
                    {sortConfig?.key === 'vintage' && (
                      <Box sx={{ ml: 1 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('quantity')}>
                    Quantity
                    {sortConfig?.key === 'quantity' && (
                      <Box sx={{ ml: 1 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</Box>
                    )}
                  </Box>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {wines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography>No wines found in your cellars.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                wines.map((wine) => (
                  <TableRow key={wine.id}>
                    <TableCell>{wine.name}</TableCell>
                    <TableCell>{wine.region}</TableCell>
                    <TableCell>{wine.vintage}</TableCell>
                    <TableCell>{wine.quantity}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditWine(wine)} size="small">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteWine(wine.cellarId, wine.id)} size="small">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default InventoryDashboard;
