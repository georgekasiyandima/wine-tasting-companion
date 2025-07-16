import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  Mic,
  Delete
} from '@mui/icons-material';

interface VoiceNote {
  id: string;
  url: string;
  timestamp: number;
  duration?: number;
  title?: string;
}

interface VoiceNotesDisplayProps {
  voiceNotes: VoiceNote[];
  onDelete?: (noteId: string) => void;
  title?: string;
}

const VoiceNotesDisplay: React.FC<VoiceNotesDisplayProps> = ({
  voiceNotes,
  onDelete,
  title = "Voice Notes"
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = (note: VoiceNote) => {
    if (playingId === note.id) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setPlayingId(null);
    } else {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Play new audio
      if (audioRef.current) {
        audioRef.current.src = note.url;
        audioRef.current.play();
        setPlayingId(note.id);
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlayingId(null);
  };

  const handleAudioEnded = () => {
    setPlayingId(null);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  if (voiceNotes.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title} ({voiceNotes.length})
      </Typography>
      
      <List>
        {voiceNotes.map((note) => (
          <ListItem key={note.id} divider>
            <ListItemIcon>
              <Mic color="primary" />
            </ListItemIcon>
            <ListItemText
              primary={note.title || `Voice Note ${formatDate(note.timestamp)}`}
              secondary={formatDate(note.timestamp)}
            />
            <ListItemSecondaryAction>
              <Box display="flex" gap={1}>
                <IconButton
                  onClick={() => handlePlay(note)}
                  color="primary"
                  size="small"
                >
                  {playingId === note.id ? <Pause /> : <PlayArrow />}
                </IconButton>
                <IconButton
                  onClick={handleStop}
                  color="secondary"
                  size="small"
                >
                  <Stop />
                </IconButton>
                {onDelete && (
                  <IconButton
                    onClick={() => onDelete(note.id)}
                    color="error"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        style={{ display: 'none' }}
      />
    </Paper>
  );
};

export default VoiceNotesDisplay; 