import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Paper,
  Divider,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  WineBar as WineIcon,
  Thermostat as ThermostatIcon,
  Grass as GrassIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  Flag as FlagIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { SOUTH_AFRICA_REGIONS } from '@/constants';
import AnimatedCard from '@/components/common/AnimatedCard';

export default function SouthAfricaWinePage() {
  const theme = useTheme();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const RegionCard = ({ region }: { region: typeof SOUTH_AFRICA_REGIONS[0] }) => (
    <AnimatedCard>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={region.image}
          alt={region.name}
          sx={{ 
            objectFit: 'cover',
            background: 'linear-gradient(45deg, #8B0000 30%, #D4AF37 90%)'
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 2 }}>
            {region.name}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {region.description}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Chip 
              icon={<ThermostatIcon />} 
              label={region.climate} 
              size="small" 
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip 
              icon={<GrassIcon />} 
              label={region.soil} 
              size="small" 
              sx={{ mr: 1, mb: 1 }}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Signature Varieties:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {region.specialties.map((variety) => (
              <Chip 
                key={variety} 
                label={variety} 
                size="small" 
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>

          <Typography variant="caption" color="text.secondary">
            <CalendarIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            Best Time: {region.bestTime}
          </Typography>
        </CardContent>
      </Card>
    </AnimatedCard>
  );

  const HistorySection = () => (
    <AnimatedCard>
      <Paper sx={{ p: 4, background: 'linear-gradient(135deg, #8B0000 0%, #D4AF37 100%)', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HistoryIcon sx={{ fontSize: 40, mr: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            South African Wine History
          </Typography>
        </Box>
        
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          A Legacy Since 1659
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
          South Africa's wine industry began when Jan van Riebeeck planted the first vines in the Cape of Good Hope. 
          The industry flourished under Dutch and British rule, with French Huguenot refugees bringing their winemaking 
          expertise in the late 17th century.
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              🍇 Key Milestones
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <StarIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="1659: First vines planted at the Cape" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StarIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="1688: French Huguenots arrive" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StarIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="1925: Pinotage grape created" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <StarIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="1994: End of apartheid, global market access" />
              </ListItem>
            </List>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
              🌍 Global Impact
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
              Today, South Africa is the 8th largest wine producer globally, known for:
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <TrendingUpIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Sustainable winemaking practices" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TrendingUpIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Old vine preservation" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TrendingUpIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="Innovative wine styles" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <TrendingUpIcon sx={{ color: 'white' }} />
                </ListItemIcon>
                <ListItemText primary="World-class Chenin Blanc" />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </AnimatedCard>
  );

  const ClimateSection = () => (
    <AnimatedCard>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            <ThermostatIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Climate & Terroir
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Mediterranean Climate
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                South Africa's wine regions benefit from a Mediterranean climate with:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Cool ocean breezes from the Atlantic and Indian Oceans" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Mountain ranges creating diverse microclimates" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Long, dry summers perfect for grape ripening" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Moderate rainfall during winter months" />
                </ListItem>
              </List>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Soil Diversity
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                The varied geology creates unique terroirs:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <GrassIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Granite soils in Stellenbosch and Paarl" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GrassIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Sandstone in cooler regions like Elgin" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GrassIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Clay and shale in Swartland" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <GrassIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Alluvial soils in river valleys" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </AnimatedCard>
  );

  const GrapeVarietiesSection = () => (
    <AnimatedCard>
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
            <WineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Signature Grape Varieties
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Chenin Blanc
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                South Africa's most planted grape, producing everything from crisp dry whites to luscious dessert wines.
              </Typography>
              <Chip label="Versatile" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="High acidity" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Stone fruit" size="small" />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Pinotage
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                South Africa's signature red grape, a cross between Pinot Noir and Cinsault, creating bold, spicy wines.
              </Typography>
              <Chip label="Bold" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Spicy" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Dark fruit" size="small" />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                Cabernet Sauvignon
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Thrives in Stellenbosch and Paarl, producing structured wines with black fruit and herbal notes.
              </Typography>
              <Chip label="Structured" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Black fruit" size="small" sx={{ mr: 1, mb: 1 }} />
              <Chip label="Herbal" size="small" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </AnimatedCard>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <FlagIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
          <Typography variant="h2" component="h1" sx={{ fontWeight: 700 }}>
            South African Wine Regions
          </Typography>
        </Box>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Discover the rich heritage and diverse terroirs of South Africa's world-class wine regions, 
          from the historic Cape to the innovative Swartland
        </Typography>
      </Box>

      {/* History Section */}
      <Box sx={{ mb: 6 }}>
        <HistorySection />
      </Box>

      {/* Climate Section */}
      <Box sx={{ mb: 6 }}>
        <ClimateSection />
      </Box>

      {/* Grape Varieties */}
      <Box sx={{ mb: 6 }}>
        <GrapeVarietiesSection />
      </Box>

      {/* Wine Regions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
          <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Explore Wine Regions
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
          Each region offers unique characteristics and signature wine styles
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {SOUTH_AFRICA_REGIONS.map((region) => (
          <Grid item xs={12} sm={6} md={4} key={region.name}>
            <RegionCard region={region} />
          </Grid>
        ))}
      </Grid>

      {/* Visiting Information */}
      <Box sx={{ mt: 8 }}>
        <AnimatedCard>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                🍷 Planning Your Visit
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Best Time to Visit
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    The Cape wine regions are beautiful year-round, but consider:
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="February - April: Harvest season, vibrant atmosphere"
                        secondary="Witness the magic of grape picking and winemaking"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="September - November: Spring, new growth"
                        secondary="Beautiful landscapes with budding vines"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="December - January: Summer, outdoor tastings"
                        secondary="Perfect weather for vineyard tours and picnics"
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Travel Tips
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <StarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Book wine tastings in advance, especially during peak season" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <StarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Consider hiring a driver or joining a wine tour" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <StarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Many estates offer excellent restaurants and accommodation" />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <StarIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Don't miss the Cape Winelands' stunning mountain scenery" />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </AnimatedCard>
      </Box>
    </Container>
  );
} 