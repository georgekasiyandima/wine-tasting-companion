import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Slider,
  Tooltip,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  LocalBar as WineIcon,
  CalendarToday,
  Visibility,
  Share,
  PictureAsPdf,
  Mic,
  AutoAwesome as AIIcon,
} from '@mui/icons-material';
import { Wine, TastingSession } from '@/types';
import { TastingSessionService } from '@/services/firebase';
import { useApp } from '@/context/AppContext';
import { aiService } from '@/services/ai';
import VoiceTranscription from './VoiceTranscription';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tasting-note-tabpanel-${index}`}
      aria-labelledby={`tasting-note-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const TastingSessions: React.FC = () => {
  const { state } = useApp();
  const userId = state.user?.id;
  const [sessions, setSessions] = useState<TastingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [openNewSession, setOpenNewSession] = useState(false);
  const [openTastingNote, setOpenTastingNote] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TastingSession | null>(null);
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [voiceTranscriptionText, setVoiceTranscriptionText] = useState('');
  const [voiceInsights, setVoiceInsights] = useState<any>(null);
  const [newSession, setNewSession] = useState({
    title: '',
    location: '',
    participants: '',
    notes: ''
  });
  const [tastingNote, setTastingNote] = useState({
    rating: 0,
    appearance: {
      color: '',
      clarity: '',
      intensity: ''
    },
    nose: {
      intensity: '',
      aromas: '',
      development: ''
    },
    palate: {
      sweetness: 5,
      acidity: 5,
      tannin: 5,
      body: 5,
      flavor: '',
      finish: 5
    },
    conclusions: {
      quality: 0,
      readiness: 0,
      value: 0,
      notes: ''
    }
  });

  // Mock wines for selection (in real app, fetch from WineService)
  const mockWines: Wine[] = [
    {
      id: '1',
      name: 'Château Margaux',
      vintage: '2015',
      region: 'Bordeaux, France',
      grape: 'Cabernet Sauvignon',
      price: 1500,
      rating: 4.8,
      imageUrl: '',
      barcode: '123456789',
      timestamp: Date.now(),
      tasting: {
        appearance: { clarity: 'Clear', intensity: 'Medium', colour: 'Ruby' },
        nose: { condition: 'Clean', intensity: 'Medium+' },
        aromaFlavour: {
          primary: {
            floral: '', greenFruit: '', citrusFruit: '', stoneFruit: '', tropicalFruit: '', redFruit: '', blackFruit: 'Blackcurrant', herbaceous: '', herbal: '', spice: '', fruitRipeness: '', other: ''
          },
          secondary: { yeast: '', malolactic: '', oak: 'Vanilla' },
          tertiary: { redWine: '', whiteWine: '', oxidised: '' }
        },
        palate: { sweetness: 'Dry', acidity: 'High', tannin: 'High', alcohol: 'High', body: 'Full', flavourIntensity: 'Pronounced', finish: 'Long' },
        conclusions: { quality: 'Outstanding', readiness: 'Can drink now, but has potential for ageing' },
        notes: 'Classic Bordeaux structure and depth.'
      }
    },
    {
      id: '2',
      name: 'Barolo Riserva',
      vintage: '2016',
      region: 'Piedmont, Italy',
      grape: 'Nebbiolo',
      price: 120,
      rating: 4.5,
      imageUrl: '',
      barcode: '987654321',
      timestamp: Date.now(),
      tasting: {
        appearance: { clarity: 'Clear', intensity: 'Pale', colour: 'Garnet' },
        nose: { condition: 'Clean', intensity: 'Pronounced' },
        aromaFlavour: {
          primary: {
            floral: 'Rose', greenFruit: '', citrusFruit: '', stoneFruit: '', tropicalFruit: '', redFruit: 'Cherry', blackFruit: '', herbaceous: '', herbal: '', spice: 'Tar', fruitRipeness: '', other: ''
          },
          secondary: { yeast: '', malolactic: '', oak: 'Oak' },
          tertiary: { redWine: 'Earth', whiteWine: '', oxidised: '' }
        },
        palate: { sweetness: 'Dry', acidity: 'High', tannin: 'High', alcohol: 'High', body: 'Medium+', flavourIntensity: 'Pronounced', finish: 'Long' },
        conclusions: { quality: 'Excellent', readiness: 'Can drink now, but has potential for ageing' },
        notes: 'Classic Barolo with floral and earthy notes.'
      }
    }
  ];

  // Fetch sessions from Firestore
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    TastingSessionService.getSessions(userId)
      .then((sessions) => {
        setSessions(sessions);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleCreateSession = async () => {
    if (!userId) return;
    const session: Omit<TastingSession, 'id'> = {
      name: newSession.title,
      date: Date.now(),
      wines: [],
      participants: newSession.participants.split(',').map(p => p.trim()).filter(p => p),
      notes: newSession.notes,
      userId
    };
    setLoading(true);
    await TastingSessionService.createSession(session, userId);
    setNewSession({ title: '', location: '', participants: '', notes: '' });
    setOpenNewSession(false);
    // Refetch sessions
    const sessions = await TastingSessionService.getSessions(userId);
    setSessions(sessions);
    setLoading(false);
  };

  const handleAddTastingNote = () => {
    if (!selectedWine || !selectedSession) return;

    const updatedSessions = sessions.map(session =>
      session.id === selectedSession.id
        ? { ...session, wines: [...session.wines, selectedWine] }
        : session
    );
    
    setSessions(updatedSessions);
    setTastingNote({
      rating: 0,
      appearance: { color: '', clarity: '', intensity: '' },
      nose: { intensity: '', aromas: '', development: '' },
      palate: { sweetness: 5, acidity: 5, tannin: 5, body: 5, flavor: '', finish: 5 },
      conclusions: { quality: 0, readiness: 0, value: 0, notes: '' }
    });
    setOpenTastingNote(false);
    setSelectedWine(null);
    setSelectedSession(null);
    setVoiceTranscriptionText('');
    setVoiceInsights(null);
    setTabValue(0);
  };

  const handleAISuggestions = async () => {
    if (!selectedWine) return;
    
    setAiLoading(true);
    try {
      const suggestions = await aiService.generateTastingNotes(selectedWine);
      setTastingNote(prev => ({
        ...prev,
        conclusions: {
          ...prev.conclusions,
          notes: suggestions
        }
      }));
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleVoiceTranscriptionComplete = (text: string, insights: any) => {
    setVoiceTranscriptionText(text);
    setVoiceInsights(insights);
    
    // Auto-fill tasting notes based on voice insights
    if (insights && insights.length > 0) {
      const updatedTastingNote = { ...tastingNote };
      
      insights.forEach((insight: any) => {
        if (insight.type === 'tasting_note') {
          updatedTastingNote.conclusions.notes = text;
        }
        if (insight.type === 'rating') {
          // Extract rating from voice (e.g., "amazing" = 5, "good" = 4, etc.)
          const ratingMap: { [key: string]: number } = {
            'amazing': 5, 'excellent': 5, 'outstanding': 5,
            'very good': 4, 'good': 4, 'nice': 4,
            'average': 3, 'okay': 3, 'decent': 3,
            'poor': 2, 'bad': 2, 'terrible': 1
          };
          
          const lowerText = text.toLowerCase();
          for (const [word, rating] of Object.entries(ratingMap)) {
            if (lowerText.includes(word)) {
              updatedTastingNote.rating = rating;
              break;
            }
          }
        }
      });
      
      setTastingNote(updatedTastingNote);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExportSession = (session: TastingSession) => {
    const content = `
Tasting Session: ${session.name}
Date: ${new Date(session.date).toLocaleDateString()}
Participants: ${session.participants.join(', ')}

Wines Tasted:
${session.wines.map(wine => `- ${wine.name} (${wine.vintage}) - ${wine.region}`).join('\n')}

Notes: ${session.notes}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.name.replace(/\s+/g, '_')}_tasting_session.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareSession = (session: TastingSession) => {
    const content = `
Check out this wine tasting session: ${session.name}
Wines: ${session.wines.map(w => w.name).join(', ')}
Date: ${new Date(session.date).toLocaleDateString()}
    `;
    
    if (navigator.share) {
      navigator.share({
        title: session.name,
        text: content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(content);
      // Show notification
    }
  };

  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Tasting Sessions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewSession(true)}
          sx={{
            background: 'linear-gradient(45deg, #8B0000 30%, #D4AF37 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #660000 30%, #B8860B 90%)',
            }
          }}
        >
          New Session
        </Button>
      </Box>

      {sessions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <WineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2 }}>
              No Tasting Sessions Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create your first tasting session to start recording your wine experiences
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewSession(true)}
            >
              Create First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {sessions.map((session) => (
            <Grid item xs={12} md={6} lg={4} key={session.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {session.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedSession(session);
                            setOpenTastingNote(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Export">
                        <IconButton
                          size="small"
                          onClick={() => handleExportSession(session)}
                        >
                          <PictureAsPdf />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Share">
                        <IconButton
                          size="small"
                          onClick={() => handleShareSession(session)}
                        >
                          <Share />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(session.date)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Wines ({session.wines.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {session.wines.slice(0, 3).map((wine, index) => (
                        <Chip
                          key={index}
                          label={wine.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {session.wines.length > 3 && (
                        <Chip
                          label={`+${session.wines.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                  
                  {session.participants.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Participants
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {session.participants.map((participant, index) => (
                          <Chip
                            key={index}
                            label={participant}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {session.notes && (
                    <Typography variant="body2" color="text.secondary">
                      {session.notes}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* New Session Dialog */}
      <Dialog open={openNewSession} onClose={() => setOpenNewSession(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Tasting Session</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Session Title"
            value={newSession.title}
            onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Location"
            value={newSession.location}
            onChange={(e) => setNewSession({ ...newSession, location: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Participants (comma-separated)"
            value={newSession.participants}
            onChange={(e) => setNewSession({ ...newSession, participants: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={newSession.notes}
            onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewSession(false)}>Cancel</Button>
          <Button onClick={handleCreateSession} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Tasting Note Dialog */}
      <Dialog 
        open={openTastingNote} 
        onClose={() => setOpenTastingNote(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={600}>
              Add Tasting Note
            </Typography>
            <Button
              startIcon={<AIIcon />}
              onClick={handleAISuggestions}
              disabled={aiLoading || !selectedWine}
              size="small"
            >
              {aiLoading ? 'Generating...' : 'AI Suggestions'}
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Manual Entry" icon={<WineIcon />} iconPosition="start" />
              <Tab label="Voice Notes" icon={<Mic />} iconPosition="start" />
              <Tab label="AI Analysis" icon={<AIIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Wine Selection
                </Typography>
                <TextField
                  select
                  fullWidth
                  label="Select Wine"
                  value={selectedWine?.id || ''}
                  onChange={(e) => {
                    const wine = mockWines.find(w => w.id === e.target.value);
                    setSelectedWine(wine || null);
                  }}
                  sx={{ mb: 2 }}
                >
                  {mockWines.map((wine) => (
                    <option key={wine.id} value={wine.id}>
                      {wine.name} ({wine.vintage}) - {wine.region}
                    </option>
                  ))}
                </TextField>

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Rating
                </Typography>
                <Rating
                  value={tastingNote.rating}
                  onChange={(_, value) => setTastingNote({ ...tastingNote, rating: value || 0 })}
                  size="large"
                  sx={{ mb: 2 }}
                />

                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Appearance
                </Typography>
                <TextField
                  fullWidth
                  label="Color"
                  value={tastingNote.appearance.color}
                  onChange={(e) => setTastingNote({
                    ...tastingNote,
                    appearance: { ...tastingNote.appearance, color: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Clarity"
                  value={tastingNote.appearance.clarity}
                  onChange={(e) => setTastingNote({
                    ...tastingNote,
                    appearance: { ...tastingNote.appearance, clarity: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Intensity"
                  value={tastingNote.appearance.intensity}
                  onChange={(e) => setTastingNote({
                    ...tastingNote,
                    appearance: { ...tastingNote.appearance, intensity: e.target.value }
                  })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Nose
                </Typography>
                <TextField
                  fullWidth
                  label="Intensity"
                  value={tastingNote.nose.intensity}
                  onChange={(e) => setTastingNote({
                    ...tastingNote,
                    nose: { ...tastingNote.nose, intensity: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Aromas"
                  multiline
                  rows={3}
                  value={tastingNote.nose.aromas}
                  onChange={(e) => setTastingNote({
                    ...tastingNote,
                    nose: { ...tastingNote.nose, aromas: e.target.value }
                  })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Development"
                  value={tastingNote.nose.development}
                  onChange={(e) => setTastingNote({
                    ...tastingNote,
                    nose: { ...tastingNote.nose, development: e.target.value }
                  })}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Palate
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Sweetness</Typography>
                    <Slider
                      value={tastingNote.palate.sweetness}
                      onChange={(_, value) => setTastingNote({
                        ...tastingNote,
                        palate: { ...tastingNote.palate, sweetness: value as number }
                      })}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Acidity</Typography>
                    <Slider
                      value={tastingNote.palate.acidity}
                      onChange={(_, value) => setTastingNote({
                        ...tastingNote,
                        palate: { ...tastingNote.palate, acidity: value as number }
                      })}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Tannin</Typography>
                    <Slider
                      value={tastingNote.palate.tannin}
                      onChange={(_, value) => setTastingNote({
                        ...tastingNote,
                        palate: { ...tastingNote.palate, tannin: value as number }
                      })}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">Body</Typography>
                    <Slider
                      value={tastingNote.palate.body}
                      onChange={(_, value) => setTastingNote({
                        ...tastingNote,
                        palate: { ...tastingNote.palate, body: value as number }
                      })}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Flavor Notes"
                  multiline
                  rows={3}
                  value={tastingNote.palate.flavor}
                  onChange={(e) => setTastingNote({
                    ...tastingNote,
                    palate: { ...tastingNote.palate, flavor: e.target.value }
                  })}
                  sx={{ mt: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Conclusions
                </Typography>
                <TextField
                  fullWidth
                  label="Tasting Notes"
                  multiline
                  rows={4}
                  value={tastingNote.conclusions.notes}
                  onChange={(e) => setTastingNote({
                    ...tastingNote,
                    conclusions: { ...tastingNote.conclusions, notes: e.target.value }
                  })}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <VoiceTranscription
              onTranscriptionComplete={handleVoiceTranscriptionComplete}
              initialText={voiceTranscriptionText}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AIIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                AI-Powered Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Use the "AI Suggestions" button above to generate intelligent tasting notes based on the selected wine.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AIIcon />}
                onClick={handleAISuggestions}
                disabled={aiLoading || !selectedWine}
                sx={{
                  background: 'linear-gradient(45deg, #8B0000 30%, #D4AF37 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #660000 30%, #B8860B 90%)',
                  }
                }}
              >
                {aiLoading ? 'Generating AI Analysis...' : 'Generate AI Analysis'}
              </Button>
            </Box>
          </TabPanel>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setOpenTastingNote(false)}>Cancel</Button>
          <Button onClick={handleAddTastingNote} variant="contained" disabled={!selectedWine}>
            Add Tasting Note
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TastingSessions; 