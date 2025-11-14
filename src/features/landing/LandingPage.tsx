import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Link as MuiLink
} from '@mui/material';
import WineBarIcon from '@mui/icons-material/WineBar';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import MicIcon from '@mui/icons-material/Mic';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedCard from '@/components/common/AnimatedCard';
import { PROFILE_IMAGE } from '@/constants';

const features = [
  {
    icon: <AutoAwesomeIcon color="primary" fontSize="large" />, 
    title: 'AI Tasting Notes', 
    desc: 'Get intelligent, context-aware tasting note suggestions for every wine.'
  },
  {
    icon: <CameraAltIcon color="primary" fontSize="large" />, 
    title: 'Barcode Scanning', 
    desc: 'Scan wine barcodes to auto-fill details and speed up logging.'
  },
  {
    icon: <AnalyticsIcon color="primary" fontSize="large" />, 
    title: 'Analytics Dashboard', 
    desc: 'Visualize your wine journey with beautiful charts and stats.'
  },
  {
    icon: <MicIcon color="primary" fontSize="large" />, 
    title: 'Voice Notes', 
    desc: 'Record and attach voice notes to your tastings for richer memories.'
  },
  {
    icon: <EmojiEventsIcon color="primary" fontSize="large" />, 
    title: 'Food Pairings', 
    desc: 'Get AI-powered food pairing suggestions for every wine.'
  }
];

const LandingPage: React.FC = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{
        minHeight: { xs: 400, md: 500 },
        background: 'linear-gradient(120deg, #8B0000 0%, #D4AF37 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        textAlign: 'center',
        py: 8,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            zIndex: 0
          }}
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 0.9, 1]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
          style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%',
            zIndex: 0
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ zIndex: 1 }}
        >
          <WineBarIcon sx={{ fontSize: 64, mb: 2, color: 'white' }} />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ zIndex: 1 }}
        >
          <Typography variant="h2" fontWeight={700} gutterBottom>
            Wine Tasting Companion
          </Typography>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{ zIndex: 1 }}
        >
          <Typography variant="h5" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            The modern, intelligent, and beautiful way to record, analyze, and relive your wine journey.
          </Typography>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ zIndex: 1 }}
        >
          <Button
            component={Link}
            to="/auth"
            variant="contained"
            size="large"
            sx={{ 
              bgcolor: 'white', 
              color: '#8B0000', 
              fontWeight: 600, 
              px: 4, 
              py: 1.5, 
              boxShadow: 2, 
              '&:hover': { bgcolor: '#f5f5f5' } 
            }}
          >
            Get Started
          </Button>
        </motion.div>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
            Why You'll Love It
          </Typography>
        </motion.div>
        
        <Grid container spacing={4} justifyContent="center" sx={{ mt: 2 }}>
          {features.map((feature, idx) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <AnimatedCard
                delay={idx * 0.1}
                direction="up"
                sx={{ 
                  height: '100%', 
                  borderRadius: 3, 
                  textAlign: 'center', 
                  py: 3,
                  cursor: 'pointer'
                }}
              >
                <CardContent>
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {feature.desc}
                  </Typography>
                </CardContent>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About/Portfolio Section */}
      <Box sx={{ bgcolor: '#f9f6f2', py: 8 }}>
        <Container>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Box display="flex" flexDirection="column" alignItems="center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar
                      src={PROFILE_IMAGE}
                      alt="George Kasiyandima"
                      sx={{ width: 120, height: 120, mb: 2, border: '4px solid #8B0000' }}
                    />
                  </motion.div>
                  <Typography variant="h6" fontWeight={700}>
                    George Kasiyandima
                  </Typography>
                  <Chip label="Full Stack Developer" color="primary" sx={{ mt: 1 }} />
                  <Chip label="Wine Enthusiast - WSET LEVEL 2" color="secondary" sx={{ mt: 1 }} />
                  <MuiLink 
                    href="https://www.linkedin.com/in/georgekasiyandima/" 
                    target="_blank" 
                    rel="noopener" 
                    underline="hover" 
                    sx={{ mt: 1 }}
                  >
                    LinkedIn
                  </MuiLink>
                </Box>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={8}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  About This Project
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Wine Tasting Companion is a portfolio project built to showcase modern web development best practices, advanced React patterns, and seamless integration of AI and cloud services. It's designed for wine lovers and tech enthusiasts alike.
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Explore the features, try the app, and feel free to connect with me for collaboration or opportunities!
                </Typography>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    component={Link}
                    to="/about"
                    variant="outlined"
                    sx={{ mt: 3, fontWeight: 600 }}
                  >
                    Learn More
                  </Button>
                </motion.div>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#8B0000', color: 'white', py: 4, mt: 8 }}>
        <Container>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="body2">
                &copy; {new Date().getFullYear()} George Kasiyandima. All rights reserved.
              </Typography>
            </Grid>
            <Grid item>
              <MuiLink href="mailto:george.kasiyandima@gmail.com" color="inherit" underline="hover" sx={{ mx: 2 }}>
                Contact
              </MuiLink>
              <MuiLink href="https://github.com/georgekasiyandima" color="inherit" underline="hover" sx={{ mx: 2 }}>
                GitHub
              </MuiLink>
              <MuiLink href="/about" color="inherit" underline="hover" sx={{ mx: 2 }}>
                About
              </MuiLink>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 