import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Mic,
  MicOff,
  PlayArrow,
  Stop,
  AutoAwesome,
  ContentCopy,
  Check,
  Psychology,
  WineBar,
  Restaurant,
} from '@mui/icons-material';
import { aiService } from '@/api/ai';

interface VoiceTranscriptionProps {
  onTranscriptionComplete?: (text: string, insights: any) => void;
  initialText?: string;
}

interface TranscriptionInsight {
  type: 'tasting_note' | 'rating' | 'food_pairing' | 'region' | 'grape';
  content: string;
  confidence: number;
}

const VoiceTranscription: React.FC<VoiceTranscriptionProps> = ({
  onTranscriptionComplete,
  initialText = '',
}) => {
  const theme = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState(initialText);
  const [insights, setInsights] = useState<TranscriptionInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInsights, setShowInsights] = useState(false);
  const [copied, setCopied] = useState(false);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Failed to access microphone. Please check permissions.');
      console.error('Recording error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setLoading(true);
    setError(null);

    try {
      // Use AI service to transcribe audio
      const transcribedText = await aiService.transcribeVoiceNote(audioBlob);
      setTranscription(transcribedText);

      // Generate insights from the transcription
      const wineInsights = await generateInsightsFromText(transcribedText);
      setInsights(wineInsights);

      if (onTranscriptionComplete) {
        onTranscriptionComplete(transcribedText, wineInsights);
      }
    } catch (err) {
      setError('Failed to transcribe audio. Please try again.');
      console.error('Transcription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateInsightsFromText = async (text: string): Promise<TranscriptionInsight[]> => {
    // This would use the AI service to analyze the transcribed text
    // For now, we'll create mock insights based on common wine tasting terms
    
    const mockInsights: TranscriptionInsight[] = [];
    
    const wineTerms = {
      tasting_note: ['fruity', 'oaky', 'tannic', 'smooth', 'bold', 'light', 'complex', 'simple'],
      rating: ['amazing', 'excellent', 'good', 'average', 'poor', 'terrible'],
      food_pairing: ['beef', 'chicken', 'fish', 'cheese', 'pasta', 'chocolate'],
      region: ['napa', 'bordeaux', 'tuscany', 'rioja', 'barossa'],
      grape: ['cabernet', 'merlot', 'pinot', 'chardonnay', 'sauvignon']
    };

    const lowerText = text.toLowerCase();
    
    // Check for tasting notes
    wineTerms.tasting_note.forEach(term => {
      if (lowerText.includes(term)) {
        mockInsights.push({
          type: 'tasting_note',
          content: `Detected tasting note: "${term}"`,
          confidence: 0.8
        });
      }
    });

    // Check for ratings
    wineTerms.rating.forEach(term => {
      if (lowerText.includes(term)) {
        mockInsights.push({
          type: 'rating',
          content: `Detected rating: "${term}"`,
          confidence: 0.7
        });
      }
    });

    // Check for food pairings
    wineTerms.food_pairing.forEach(term => {
      if (lowerText.includes(term)) {
        mockInsights.push({
          type: 'food_pairing',
          content: `Suggested food pairing: "${term}"`,
          confidence: 0.6
        });
      }
    });

    // Check for regions
    wineTerms.region.forEach(term => {
      if (lowerText.includes(term)) {
        mockInsights.push({
          type: 'region',
          content: `Mentioned region: "${term}"`,
          confidence: 0.9
        });
      }
    });

    // Check for grapes
    wineTerms.grape.forEach(term => {
      if (lowerText.includes(term)) {
        mockInsights.push({
          type: 'grape',
          content: `Mentioned grape: "${term}"`,
          confidence: 0.9
        });
      }
    });

    return mockInsights;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tasting_note': return <Psychology />;
      case 'rating': return <AutoAwesome />;
      case 'food_pairing': return <Restaurant />;
      case 'region': return <WineBar />;
      case 'grape': return <WineBar />;
      default: return <AutoAwesome />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'success';
      case 'negative': return 'error';
      case 'neutral': return 'info';
      case 'suggestion': return 'warning';
      default: return 'default';
    }
  };

  const getInsightThemeColor = (type: string) => {
    switch (type) {
      case 'positive': return theme.palette.success.main;
      case 'negative': return theme.palette.error.main;
      case 'neutral': return theme.palette.info.main;
      case 'suggestion': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Voice Tasting Notes
        </Typography>

        {/* Recording Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {!isRecording ? (
            <Button
              variant="contained"
              startIcon={<Mic />}
              onClick={startRecording}
              disabled={loading}
              sx={{
                background: 'linear-gradient(45deg, #8B0000 30%, #D4AF37 90%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(45deg, #660000 30%, #B8860B 90%)',
                }
              }}
            >
              Start Recording
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<MicOff />}
              onClick={stopRecording}
            >
              Stop Recording
            </Button>
          )}

          {audioBlob && (
            <>
              <Button
                variant="outlined"
                startIcon={isPlaying ? <Stop /> : <PlayArrow />}
                onClick={playRecording}
                disabled={isRecording}
              >
                {isPlaying ? 'Stop' : 'Play'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<AutoAwesome />}
                onClick={transcribeAudio}
                disabled={loading || isRecording}
              >
                Transcribe
              </Button>
            </>
          )}
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Transcribing and analyzing your voice note...
            </Typography>
          </Box>
        )}

        {/* Transcription Text */}
        {transcription && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Transcription
              </Typography>
              <Button
                startIcon={copied ? <Check /> : <ContentCopy />}
                onClick={copyToClipboard}
                size="small"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={transcription}
              onChange={(e) => setTranscription(e.target.value)}
              variant="outlined"
              placeholder="Your voice note will appear here..."
            />
          </Box>
        )}

        {/* AI Insights */}
        {insights.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                AI Insights
              </Typography>
              <Button
                startIcon={<AutoAwesome />}
                onClick={() => setShowInsights(true)}
                size="small"
              >
                View Details
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {insights.slice(0, 3).map((insight, index) => (
                <Chip
                  key={index}
                  label={insight.content}
                  color={getInsightColor(insight.type)}
                  icon={getInsightIcon(insight.type)}
                  size="small"
                />
              ))}
              {insights.length > 3 && (
                <Chip
                  label={`+${insights.length - 3} more`}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Insights Dialog */}
        <Dialog
          open={showInsights}
          onClose={() => setShowInsights(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome color="primary" />
              <Typography variant="h6" fontWeight={600}>
                AI Analysis Results
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <List>
              {insights.map((insight, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon>
                      <Box
                        sx={{
                          color: getInsightThemeColor(insight.type),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: `${getInsightThemeColor(insight.type)}15`,
                        }}
                      >
                        {getInsightIcon(insight.type)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" fontWeight={600}>
                            {insight.content}
                          </Typography>
                          <Chip
                            label={insight.type.replace('_', ' ')}
                            color={getInsightColor(insight.type)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Confidence:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {[...Array(5)].map((_, i) => (
                              <Box
                                key={i}
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: i < Math.round(insight.confidence * 5) 
                                    ? getInsightThemeColor(insight.type)
                                    : theme.palette.grey[300],
                                }}
                              />
                            ))}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {Math.round(insight.confidence * 100)}%
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < insights.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowInsights(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default VoiceTranscription; 