import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Link as MuiLink,
  Grid,
  Card,
  CardContent,
  TextField,
  TextareaAutosize,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  useTheme,
  Paper,
  Divider,
} from '@mui/material';
import {
  Email,
  LinkedIn,
  GitHub,
  Phone,
  LocationOn,
  Send,
  CheckCircle,
} from '@mui/icons-material';

const Contact: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, this would send the form data to a backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Reset submitted state after 5 seconds
    setTimeout(() => setSubmitted(false), 5000);
  };

  const contactMethods = [
    {
      icon: <Email color="primary" />,
      title: 'Email',
      value: 'kasiyageorge86@duck.com',
      link: 'mailto:kasiyageorge86@duck.com',
    },
    {
      icon: <LinkedIn color="primary" />,
      title: 'LinkedIn',
      value: 'linkedin.com/in/georgekasiyandima',
      link: 'https://www.linkedin.com/in/georgekasiyandima/',
    },
    {
      icon: <GitHub color="primary" />,
      title: 'GitHub',
      value: 'github.com/georgekasiyandima',
      link: 'https://github.com/georgekasiyandima',
    },
    {
      icon: <Phone color="primary" />,
      title: 'Phone',
      value: '+27660845934',
      link: 'tel:+27660845934',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box textAlign="center" sx={{ mb: 8 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Get In Touch
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 3 }}>
          Let's discuss your next project or just say hello!
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600, mx: 'auto' }}>
          I'm always interested in new opportunities, interesting projects, and connecting with fellow developers and wine enthusiasts. 
          Feel free to reach out through any of the methods below or use the contact form.
        </Typography>
      </Box>

      <Grid container spacing={6}>
        {/* Contact Form */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Send a Message
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Fill out the form below and I'll get back to you as soon as possible.
              </Typography>

              {submitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for your message! I'll get back to you soon.
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Subject"
                      value={formData.subject}
                      onChange={handleInputChange('subject')}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange('message')}
                      required
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      sx={{ minWidth: 200 }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={5}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  Contact Information
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  You can reach me through any of these channels:
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {contactMethods.map((method) => (
                    <Box key={method.title} sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                        {method.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {method.title}
                        </Typography>
                        <MuiLink
                          href={method.link}
                          target={method.title === 'Email' ? '_self' : '_blank'}
                          rel={method.title === 'Email' ? undefined : 'noopener'}
                          sx={{ 
                            color: 'primary.main',
                            textDecoration: 'none',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {method.value}
                        </MuiLink>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Response
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  I typically respond to messages within 24 hours during business days.
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Available for freelance projects
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Open to full-time opportunities
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Happy to discuss wine recommendations
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Additional Information */}
      <Box sx={{ mt: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                What I'm Looking For
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                I'm particularly interested in:
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body2" color="text.secondary">
                  Full-stack development opportunities
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  React/TypeScript projects
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  AI/ML integration projects
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Wine industry technology solutions
                </Typography>
                <Typography component="li" variant="body2" color="text.secondary">
                  Open source contributions
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 4, height: '100%' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Location & Availability
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Based in Cape Town, CT
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                I'm available for remote work and willing to relocate for the right opportunity. 
                I can work in various time zones and am flexible with scheduling.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Availability:</strong> Open to new opportunities
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Start Date:</strong> Immediately available
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Contact; 