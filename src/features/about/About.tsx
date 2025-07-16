import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Download,
  Code,
  Brush,
  Storage,
  Security,
  Speed,
  Star,
  Work,
  School,
  Email,
  LinkedIn,
  GitHub,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import AnimatedCard from '@/components/common/AnimatedCard';
import { PROFILE_IMAGE } from '@/constants';

const About: React.FC = () => {
  const theme = useTheme();

  const skills = [
    { category: 'Frontend', items: ['React', 'TypeScript', 'Material UI', 'Tailwind CSS', 'Next.js'] },
    { category: 'Backend', items: ['Node.js', 'Express', 'Firebase', 'MongoDB', 'PostgreSQL'] },
    { category: 'Tools & Others', items: ['Git', 'Docker', 'AWS', 'CI/CD', 'Jest', 'Figma'] },
  ];

  const projectHighlights = [
    {
      title: 'Wine Tasting Companion',
      description: 'A full-stack web application for wine enthusiasts to catalog, rate, and track their wine tasting experiences.',
      features: ['AI-powered tasting notes', 'Barcode scanning', 'Voice notes', 'Analytics dashboard', 'Social features'],
      tech: ['React', 'TypeScript', 'Firebase', 'Material UI', 'AI Integration'],
      link: 'https://github.com/georgekasiyandima/wine-tasting-companion',
    },
    {
      title: 'Career Solutions Web App',
      description: 'A modern, full-stack web application for job posting and career solutions, built with React and Node.js/Express.',
      features: ['Real-time job management', 'User authentication', 'Booking system', 'Performance-optimized components'],
      tech: ['React', 'Node.js', 'Express', 'JWT', 'Docker'],
      link: 'https://github.com/georgekasiyandima/career-solutions-project',
    },
    {
      title: 'SAZ Web App',
      description: 'A web application for the Sommelier Association of Zimbabwe (SAZ) to manage member information, events, and resources.',
      features: ['Member registration', 'Event management', 'Resource sharing', 'Admin dashboard'],
      tech: ['React', 'Node.js', 'Express', 'MongoDB', 'Material UI'],
      link: 'https://github.com/georgekasiyandima/saz-web-app25',
    },
  ];

  const testimonials = [
    {
      name: 'Esraa Qandeel',
      role: 'Senior Frontend Engineer',
      company: 'Microsoft',
      content: 'George is the most dedicated student l have ever met. His perseverance is unparalleled; he never gives up and willing to focus on a problem for hours until it is solved.George is consistent, a skilled problem solver, and an adept web developer. His tenacity and commitment are truly commendable. I highly recommend George for any team looking for a dependable and talented developer.',
      avatar: 'EQ',
    },
    {
      name: 'Jacob Plumb',
      role: 'Software Engineer',
      company: 'Amazon',
      content: 'Working with George was a pleasure. He understands business requirements quickly and translates them into elegant technical solutions.',
      avatar: 'JP',
    },
    {
      name: 'Jessica Williams',
      role: 'Full Stack Developer',
      company: 'BloomTech',
      content: 'George has a great eye for user experience and always considers the end-user perspective in his development work.',
      avatar: 'JW',
    },
  ];

  const experience = [
    {
      title: 'Full Stack Developer - Mentor',
      company: 'Code The Dream',
      period: 'June 2025 - Present',
      description: 'Mentor students and guide them in writing clean code for their projects.',
    },
  ];

  const education = [
    {
      programme: 'Full Stack Web Development',
      school: 'BloomTech Institute of Technology San Fransisco',
      period: '2022 - 2024',
      description: 'Specialized in Software Engineering with focus on web development and database systems.',
    },
  ];

  const handleResumeDownload = () => {
    // In a real app, this would download an actual PDF
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'George_Kasiyandima_Resume.pdf';
    link.click();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Box textAlign="center" sx={{ mb: 8 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Avatar
              src={PROFILE_IMAGE}
              sx={{
                width: 120,
                height: 120,
                mx: 'auto',
                mb: 3,
                bgcolor: theme.palette.primary.main,
                fontSize: '2rem',
              }}
            >
              GK
            </Avatar>
          </motion.div>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            George Kasiyandima
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
            Full Stack Developer & Wine Enthusiast
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto', mb: 4 }}>
            I'm a passionate developer with a love for building beautiful, intelligent, and user-focused web applications. 
            With expertise in modern web technologies and a keen eye for design, I create solutions that not only work flawlessly 
            but also provide exceptional user experiences.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={handleResumeDownload}
                size="large"
              >
                Download Resume
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outlined"
                startIcon={<Email />}
                href="mailto:kasiyageorge86@duck.com"
                size="large"
              >
                Contact Me
              </Button>
            </motion.div>
          </Box>
        </Box>
      </motion.div>

      {/* Skills Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
            Technical Skills
          </Typography>
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {skills.map((skillGroup, index) => (
              <Grid item xs={12} md={4} key={skillGroup.category}>
                <AnimatedCard
                  delay={index * 0.1}
                  direction="up"
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {skillGroup.category}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {skillGroup.items.map((skill) => (
                        <Chip
                          key={skill}
                          label={skill}
                          variant="outlined"
                          size="small"
                          color="primary"
                        />
                      ))}
                    </Box>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Project Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
            Project Highlights
          </Typography>
          <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
            {projectHighlights.map((project, index) => (
              <Grid item xs={12} md={4} key={project.title}>
                <AnimatedCard
                  delay={index * 0.1}
                  direction="up"
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {project.tech.map((tech) => (
                        <Chip key={tech} label={tech} variant="outlined" size="small" />
                      ))}
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant="text"
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      endIcon={<GitHub />}
                    >
                      View on GitHub
                    </Button>
                  </Box>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Experience & Education */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Experience
            </Typography>
            {experience.map((exp, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {exp.title}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {exp.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {exp.period}
                  </Typography>
                  <Typography variant="body2">
                    {exp.description}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Education
            </Typography>
            {education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Paper sx={{ p: 3, mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    {edu.programme}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {edu.school}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {edu.period}
                  </Typography>
                  <Typography variant="body2">
                    {edu.description}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Grid>
        </Grid>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" fontWeight={600} gutterBottom textAlign="center">
            What People Say
          </Typography>
          <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <AnimatedCard
                  delay={index * 0.1}
                  direction="up"
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2, bgcolor: theme.palette.secondary.main }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Typography>
                  </CardContent>
                </AnimatedCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <Box textAlign="center">
          <Typography variant="h4" fontWeight={600} gutterBottom>
            Let's Connect
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            I'm always open to discussing new opportunities, interesting projects, or just having a chat about technology and wine!
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="contained"
                startIcon={<Email />}
                href="mailto:kasiyageorge86@duck.com"
              >
                Email Me
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outlined"
                startIcon={<LinkedIn />}
                href="https://www.linkedin.com/in/georgekasiyandima/"
                target="_blank"
                rel="noopener"
              >
                LinkedIn
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="outlined"
                startIcon={<GitHub />}
                href="https://github.com/georgekasiyandima"
                target="_blank"
                rel="noopener"
              >
                GitHub
              </Button>
            </motion.div>
          </Box>
        </Box>
      </motion.div>
    </Container>
  );
};

export default About; 