import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Mic,
  Stop,
  PlayArrow,
  Pause,
  Delete,
  CloudUpload
} from '@mui/icons-material';
import { uploadVoiceNote } from '@/services/firebase';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioUrl: string) => void;
  userId: string;
  sessionId?: string;
  wineId?: string;
  disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  userId,
  sessionId,
  wineId,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions.');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const deleteRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setUploadedUrl(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const uploadRecording = async () => {
    if (!audioBlob || !userId) return;

    setUploading(true);
    setError(null);

    try {
      const fileName = `voice_notes/${userId}/${sessionId || 'general'}/${wineId || 'session'}_${Date.now()}.wav`;
      const url = await uploadVoiceNote(audioBlob, fileName);
      setUploadedUrl(url);
      onRecordingComplete?.(url);
    } catch (err) {
      setError('Failed to upload voice note. Please try again.');
      console.error('Error uploading voice note:', err);
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Voice Notes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {uploadedUrl && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Voice note uploaded successfully!
        </Alert>
      )}

      <Box display="flex" alignItems="center" gap={2} mb={2}>
        {!isRecording && !audioBlob && (
          <Button
            variant="contained"
            startIcon={<Mic />}
            onClick={startRecording}
            disabled={disabled}
            color="primary"
          >
            Start Recording
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              variant="contained"
              startIcon={<Stop />}
              onClick={stopRecording}
              color="error"
            >
              Stop Recording
            </Button>
            <Typography variant="body2" color="text.secondary">
              Recording: {formatTime(recordingTime)}
            </Typography>
            <LinearProgress sx={{ flexGrow: 1 }} />
          </>
        )}

        {audioBlob && !isRecording && (
          <>
            <IconButton
              onClick={isPlaying ? pauseRecording : playRecording}
              color="primary"
              size="large"
            >
              {isPlaying ? <Pause /> : <PlayArrow />}
            </IconButton>
            <Typography variant="body2" color="text.secondary">
              {formatTime(recordingTime)}
            </Typography>
            <IconButton
              onClick={deleteRecording}
              color="error"
              size="small"
            >
              <Delete />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
              onClick={uploadRecording}
              disabled={uploading || !!uploadedUrl}
              size="small"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </>
        )}
      </Box>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={handleAudioEnded}
          style={{ display: 'none' }}
        />
      )}

      {uploadedUrl && (
        <Box>
          <Chip
            label="Voice Note Available"
            color="success"
            variant="outlined"
            icon={<Mic />}
          />
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Voice note has been saved and can be accessed later.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default VoiceRecorder; 