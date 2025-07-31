
     import React, { useState, useEffect, useCallback } from 'react';
     import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, CircularProgress } from '@mui/material';
     import { Edit, Delete } from '@mui/icons-material';
     import { cleanCellarService } from '@/api/firebase';
     import { WineCellar, CellarWine } from '@/types';
     import WeatherWidget from '@/components/common/WeatherWidget';
     import { useApp } from '@/contexts/AppContext';

     interface SortConfig {
       key: keyof CellarWine;
       direction: 'asc' | 'desc';
     }

     const InventoryDashboard: React.FC = () => {
       const { state: { user } } = useApp();
       const [cellars, setCellars] = useState<WineCellar[]>([]);
       const [wines, setWines] = useState<CellarWine[]>([]);
       const [loading, setLoading] = useState(true);
       const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

       const loadInventory = useCallback(async () => {
         if (!user?.id) {
           console.error('No user ID available');
           setLoading(false);
           return;
         }

         try {
           setLoading(true);
           console.log('Loading inventory for user:', user.id);
           const userCellars = await cleanCellarService.getCellars(user.id);
           console.log('Fetched cellars:', userCellars);

           let allWines: CellarWine[] = [];
           for (const cellar of userCellars) {
             const cellarWines = await cleanCellarService.getCellarWines(user.id, cellar.id);
             allWines = [...allWines, ...cellarWines];
           }
           console.log('Fetched wines:', allWines);

           setCellars(userCellars);
           setWines(allWines);
         } catch (error) {
           console.error('Error loading inventory:', error);
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
           if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
           if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
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
           await cleanCellarService.deleteWine(user.id, cellarId, wineId);
           setWines(wines.filter(wine => wine.id !== wineId));
         } catch (error) {
           console.error('Error deleting wine:', error);
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

           <WeatherWidget />

           {cellars.length === 0 ? (
             <Typography>No cellars found. Create a cellar to start managing your wines.</Typography>
           ) : (
             <TableContainer component={Paper}>
               <Table>
                 <TableHead>
                   <TableRow>
                     <TableCell>
                       <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => handleSort('name')}>
                         Name
                         {sortConfig?.key === 'name' && (
                           <Box sx={{ padding: 1 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</Box>
                         )}
                       </Box>
                     </TableCell>
                     <TableCell>
                       <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => handleSort('region')}>
                         Region
                         {sortConfig?.key === 'region' && (
                           <Box sx={{ padding: 1 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</Box>
                         )}
                       </Box>
                     </TableCell>
                     <TableCell>
                       <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => handleSort('vintage')}>
                         Vintage
                         {sortConfig?.key === 'vintage' && (
                           <Box sx={{ padding: 1 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</Box>
                         )}
                       </Box>
                     </TableCell>
                     <TableCell>
                       <Box sx={{ display: 'flex', alignItems: 'center' }} onClick={() => handleSort('quantity')}>
                         Quantity
                         {sortConfig?.key === 'quantity' && (
                           <Box sx={{ padding: 1 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</Box>
                         )}
                       </Box>
                     </TableCell>
                     <TableCell>Actions</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {wines.map((wine) => (
                     <TableRow key={wine.id}>
                       <TableCell>{wine.name}</TableCell>
                       <TableCell>{wine.region}</TableCell>
                       <TableCell>{wine.vintage}</TableCell>
                       <TableCell>{wine.quantity}</TableCell>
                       <TableCell>
                         <IconButton onClick={() => handleEditWine(wine)}>
                           <Edit />
                         </IconButton>
                         <IconButton onClick={() => handleDeleteWine(wine.cellarId, wine.id)}>
                           <Delete />
                         </IconButton>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             </TableContainer>
           )}
         </Box>
       );
     };

     export default InventoryDashboard;