import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  useTheme,
  Tab,
  Tabs,
} from '@mui/material';
import {
  School as SchoolIcon,
  Quiz as QuizIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  WineBar as WineIcon,
  Restaurant as RestaurantIcon,
  Flag as FlagIcon,
} from '@mui/icons-material';
import { useApp } from '@/context/AppContext';
import AnimatedCard from '@/components/common/AnimatedCard';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'simulation' | 'microlearning';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  region: string;
  completed: boolean;
  score?: number;
  totalQuestions?: number;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  region: string;
  category: 'wine-knowledge' | 'pairing' | 'service' | 'upselling';
}

interface Simulation {
  id: string;
  title: string;
  scenario: string;
  guestProfile: string;
  wineOptions: string[];
  correctResponse: string;
  tips: string[];
}

interface TrainingProgress {
  totalModules: number;
  completedModules: number;
  averageScore: number;
  currentStreak: number;
  totalTimeSpent: number;
  certifications: string[];
}

const mockTrainingModules: TrainingModule[] = [
  {
    id: 'italian-wines-101',
    title: 'Italian Wine Regions Masterclass',
    description: 'Learn about Piedmont, Tuscany, Veneto, and other famous Italian wine regions',
    type: 'quiz',
    difficulty: 'beginner',
    duration: 15,
    region: 'Italy',
    completed: false,
  },
  {
    id: 'barolo-recommendation',
    title: 'Barolo Recommendation Simulation',
    description: 'Practice recommending Barolo to skeptical guests',
    type: 'simulation',
    difficulty: 'intermediate',
    duration: 10,
    region: 'Italy',
    completed: false,
  },
  {
    id: 'wine-pairing-basics',
    title: 'Wine & Food Pairing Fundamentals',
    description: 'Master the art of pairing wines with various cuisines',
    type: 'quiz',
    difficulty: 'beginner',
    duration: 20,
    region: 'Global',
    completed: false,
  },
  {
    id: 'upselling-techniques',
    title: 'Premium Wine Upselling',
    description: 'Learn techniques to suggest premium wines to guests',
    type: 'microlearning',
    difficulty: 'advanced',
    duration: 12,
    region: 'Global',
    completed: false,
  },
  {
    id: 'south-african-wines',
    title: 'South African Wine Discovery',
    description: 'Explore Stellenbosch, Franschhoek, and other SA regions',
    type: 'quiz',
    difficulty: 'intermediate',
    duration: 18,
    region: 'South Africa',
    completed: false,
  },
];

const mockQuizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Which Italian region is famous for Barolo wine?',
    options: ['Tuscany', 'Piedmont', 'Veneto', 'Sicily'],
    correctAnswer: 1,
    explanation: 'Barolo is produced in the Piedmont region, specifically in the Langhe area.',
    region: 'Italy',
    category: 'wine-knowledge',
  },
  {
    id: 'q2',
    question: 'What is the best food pairing for Chianti Classico?',
    options: ['Fish', 'Pasta with tomato sauce', 'Chicken', 'Dessert'],
    correctAnswer: 1,
    explanation: 'Chianti Classico pairs excellently with pasta dishes, especially those with tomato-based sauces.',
    region: 'Italy',
    category: 'pairing',
  },
  {
    id: 'q3',
    question: 'A guest asks for a "smooth red wine under $50". What would you recommend?',
    options: ['Barolo', 'Chianti Classico', 'Pinot Noir', 'Cabernet Sauvignon'],
    correctAnswer: 2,
    explanation: 'Pinot Noir is generally smoother and more approachable than the other options.',
    region: 'Global',
    category: 'service',
  },
];

const mockSimulations: Simulation[] = [
  {
    id: 'sim1',
    title: 'Barolo Recommendation Challenge',
    scenario: 'A guest says "I don\'t like Italian wines, they\'re too heavy."',
    guestProfile: 'Business traveler, prefers lighter wines, budget-conscious',
    wineOptions: ['Barolo', 'Chianti Classico', 'Pinot Noir', 'Prosecco'],
    correctResponse: 'I understand your concern about heavy wines. Barolo can be quite full-bodied, but I\'d love to suggest a lighter Italian option like a Chianti Classico, which is more approachable and pairs beautifully with our pasta dishes.',
    tips: [
      'Acknowledge the guest\'s concern',
      'Offer alternatives within their preference',
      'Connect to food pairing',
      'Be confident but not pushy',
    ],
  },
];

export default function TrainingCenter() {
  const theme = useTheme();
  const { state, addNotification } = useApp();
  
  const [modules, setModules] = useState<TrainingModule[]>(mockTrainingModules);
  const [progress, setProgress] = useState<TrainingProgress>({
    totalModules: mockTrainingModules.length,
    completedModules: 0,
    averageScore: 0,
    currentStreak: 0,
    totalTimeSpent: 0,
    certifications: [],
  });
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDialog, setQuizDialog] = useState(false);
  const [simulationDialog, setSimulationDialog] = useState(false);
  const [currentSimulation, setCurrentSimulation] = useState<Simulation | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    calculateProgress();
  }, [modules]);

  const calculateProgress = () => {
    const completed = modules.filter(m => m.completed).length;
    const averageScore = modules
      .filter(m => m.score !== undefined)
      .reduce((sum, m) => sum + (m.score || 0), 0) / completed || 0;

    setProgress({
      totalModules: modules.length,
      completedModules: completed,
      averageScore,
      currentStreak: 3, // Mock data
      totalTimeSpent: 120, // Mock data in minutes
      certifications: completed > 3 ? ['Italian Wine Specialist', 'Wine Service Professional'] : [],
    });
  };

  const startQuiz = (module: TrainingModule) => {
    setSelectedModule(module);
    setCurrentQuiz(mockQuizQuestions.filter(q => q.region === module.region || module.region === 'Global'));
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setQuizDialog(true);
  };

  const startSimulation = (module: TrainingModule) => {
    setSelectedModule(module);
    setCurrentSimulation(mockSimulations[0]); // Mock - would filter by module
    setSimulationDialog(true);
  };

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleQuizNext = () => {
    if (selectedAnswer === null) return;

    // Check if answer is correct
    if (selectedAnswer === currentQuiz[currentQuestion].correctAnswer) {
      setQuizScore(quizScore + 1);
    }

    if (currentQuestion < currentQuiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz completed
      const finalScore = selectedAnswer === currentQuiz[currentQuestion].correctAnswer ? quizScore + 1 : quizScore;
      const percentage = (finalScore / currentQuiz.length) * 100;
      
      // Update module
      const updatedModules = modules.map(m => 
        m.id === selectedModule?.id 
          ? { ...m, completed: true, score: percentage, totalQuestions: currentQuiz.length }
          : m
      );
      setModules(updatedModules);

      addNotification({
        type: 'success',
        message: `Quiz completed! Score: ${finalScore}/${currentQuiz.length} (${percentage.toFixed(1)}%)`,
      });

      setQuizDialog(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <QuizIcon />;
      case 'simulation': return <PsychologyIcon />;
      case 'microlearning': return <SchoolIcon />;
      default: return <SchoolIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Wine Training Center
        </Typography>
        <Chip 
          label={`${progress.completedModules}/${progress.totalModules} Completed`}
          color="primary"
          icon={<CheckIcon />}
        />
      </Box>

      {/* Progress Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Completion Rate
                  </Typography>
                  <Typography variant="h4">
                    {((progress.completedModules / progress.totalModules) * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(progress.completedModules / progress.totalModules) * 100}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Average Score
                  </Typography>
                  <Typography variant="h4">
                    {progress.averageScore.toFixed(0)}%
                  </Typography>
                </Box>
                <StarIcon color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Current Streak
                  </Typography>
                  <Typography variant="h4">
                    {progress.currentStreak} days
                  </Typography>
                </Box>
                <TrophyIcon color="success" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <AnimatedCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Time Spent
                  </Typography>
                  <Typography variant="h4">
                    {Math.floor(progress.totalTimeSpent / 60)}h {progress.totalTimeSpent % 60}m
                  </Typography>
                </Box>
                <TimerIcon color="info" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>

      {/* Certifications */}
      {progress.certifications.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              🏆 Your Certifications
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {progress.certifications.map((cert, index) => (
                <Chip
                  key={index}
                  label={cert}
                  color="success"
                  icon={<TrophyIcon />}
                  variant="outlined"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Training Modules */}
      <Card>
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
              <Tab label="All Modules" />
              <Tab label="Italian Wines" />
              <Tab label="South African Wines" />
              <Tab label="Service Skills" />
            </Tabs>
          </Box>

          <Grid container spacing={3}>
            {modules
              .filter(module => {
                if (activeTab === 0) return true;
                if (activeTab === 1) return module.region === 'Italy';
                if (activeTab === 2) return module.region === 'South Africa';
                if (activeTab === 3) return module.type === 'simulation' || module.title.includes('Service');
                return true;
              })
              .map((module) => (
                <Grid item xs={12} md={6} lg={4} key={module.id}>
                  <AnimatedCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                          {getModuleIcon(module.type)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {module.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            {module.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <Chip 
                              label={module.difficulty} 
                              color={getDifficultyColor(module.difficulty) as any}
                              size="small"
                            />
                            <Chip 
                              label={`${module.duration} min`} 
                              variant="outlined" 
                              size="small"
                              icon={<TimerIcon />}
                            />
                            <Chip 
                              label={module.region} 
                              variant="outlined" 
                              size="small"
                              icon={<FlagIcon />}
                            />
                          </Box>
                        </Box>
                      </Box>

                      {module.completed && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Completed! Score: {module.score?.toFixed(0)}%
                        </Alert>
                      )}

                      <Button
                        variant={module.completed ? "outlined" : "contained"}
                        fullWidth
                        startIcon={module.completed ? <CheckIcon /> : <PlayIcon />}
                        onClick={() => {
                          if (module.type === 'quiz') {
                            startQuiz(module);
                          } else if (module.type === 'simulation') {
                            startSimulation(module);
                          }
                        }}
                        disabled={module.completed}
                      >
                        {module.completed ? 'Completed' : 'Start Module'}
                      </Button>
                    </CardContent>
                  </AnimatedCard>
                </Grid>
              ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Quiz Dialog */}
      <Dialog open={quizDialog} onClose={() => setQuizDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedModule?.title} - Question {currentQuestion + 1} of {currentQuiz.length}
        </DialogTitle>
        <DialogContent>
          {currentQuiz.length > 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                {currentQuiz[currentQuestion].question}
              </Typography>
              
              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={selectedAnswer}
                  onChange={(e) => setSelectedAnswer(Number(e.target.value))}
                >
                  {currentQuiz[currentQuestion].options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={index}
                      control={<Radio />}
                      label={option}
                      sx={{ mb: 1 }}
                    />
                  ))}
                </RadioGroup>
              </FormControl>

              {selectedAnswer !== null && (
                <Alert severity={selectedAnswer === currentQuiz[currentQuestion].correctAnswer ? 'success' : 'error'} sx={{ mt: 2 }}>
                  {currentQuiz[currentQuestion].explanation}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuizDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleQuizNext}
            disabled={selectedAnswer === null}
          >
            {currentQuestion < currentQuiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Simulation Dialog */}
      <Dialog open={simulationDialog} onClose={() => setSimulationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{currentSimulation?.title}</DialogTitle>
        <DialogContent>
          {currentSimulation && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Scenario
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {currentSimulation.scenario}
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Guest Profile
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {currentSimulation.guestProfile}
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Recommended Response
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="body1">
                  {currentSimulation.correctResponse}
                </Typography>
              </Paper>

              <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                Key Tips
              </Typography>
              <List>
                {currentSimulation.tips.map((tip, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 24, height: 24 }}>
                        <CheckIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSimulationDialog(false)}>Close</Button>
          <Button 
            variant="contained"
            onClick={() => {
              // Mark simulation as completed
              const updatedModules = modules.map(m => 
                m.id === selectedModule?.id ? { ...m, completed: true } : m
              );
              setModules(updatedModules);
              setSimulationDialog(false);
              addNotification({
                type: 'success',
                message: 'Simulation completed successfully!',
              });
            }}
          >
            Complete Simulation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 