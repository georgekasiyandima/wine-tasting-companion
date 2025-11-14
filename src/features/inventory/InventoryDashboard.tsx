
     interface SortConfig {
       key: keyof CellarWine;
       direction: 'asc' | 'desc';
     }

  const [cellars, setCellars] = useState<WineCellar[]>([]);
  const [wines, setWines] = useState<CellarWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);


    try {
      setLoading(true);
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


       const handleEditWine = (wine: CellarWine) => {
         console.log('Editing wine:', wine);
         // Implement edit logic (e.g., open a modal)
       };

         const handleDeleteWine = async (cellarId: string, wineId: string) => {
    if (!user?.id) return;
    try {
          </Button>
        </Box>
      ) : cellars.length === 0 ? (
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

