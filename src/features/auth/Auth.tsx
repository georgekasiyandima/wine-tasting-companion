import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  WineBar as WineIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Google as GoogleIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useApp } from '@/context/AppContext';
import { AuthService } from '@/api/firebase';

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
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

interface SignUpForm {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignInForm {
  email: string;
  password: string;
}

export default function Auth() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { addNotification } = useApp();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  const [passwordResetSent, setPasswordResetSent] = useState(false);

  const signUpForm = useForm<SignUpForm>({
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const signInForm = useForm<SignInForm>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    signUpForm.reset();
    signInForm.reset();
    setShowPasswordReset(false);
    setPasswordResetEmail('');
    setPasswordResetSent(false);
  };

  const handleSignUp = async (data: SignUpForm) => {
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await AuthService.signUp(data.email, data.password, data.displayName);
      addNotification({
        type: 'success',
        message: 'Account created successfully! Welcome to Wine Tasting Companion.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign up error:', error);
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (data: SignInForm) => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signIn(data.email, data.password);
      addNotification({
        type: 'success',
        message: 'Welcome back!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signInWithGoogle();
      addNotification({
        type: 'success',
        message: 'Successfully signed in with Google!',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetEmail) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await AuthService.resetPassword(passwordResetEmail);
      setPasswordResetSent(true);
      addNotification({
        type: 'success',
        message: 'Password reset email sent! Please check your inbox.',
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 450,
          width: '100%',
          boxShadow: theme.shadows[10],
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                bgcolor: theme.palette.primary.main,
                fontSize: 40,
              }}
            >
              <WineIcon fontSize="large" />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
              Wine Tasting Companion
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Your personal wine journey starts here
            </Typography>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                },
              }}
            >
              <Tab label="Sign In" />
              <Tab label="Sign Up" />
            </Tabs>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                error.includes('configuration-not-found') || 
                error.includes('not configured') ||
                error.includes('unauthorized-domain') ? (
                  <Button 
                    color="inherit" 
                    size="small"
                    onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
                  >
                    Setup Firebase
                  </Button>
                ) : null
              }
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                {error}
              </Typography>
              {(error.includes('configuration-not-found') || 
                error.includes('not configured') ||
                error.includes('unauthorized-domain')) && (
                <Typography variant="caption" color="inherit">
                  💡 Need help? Check the FIREBASE_SETUP.md file in your project for detailed setup instructions.
                </Typography>
              )}
            </Alert>
          )}

          {/* Sign In Tab */}
          <TabPanel value={tabValue} index={0}>
            {showPasswordReset ? (
              passwordResetSent ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <EmailIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Check Your Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    We've sent a password reset link to <strong>{passwordResetEmail}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Please check your inbox and click the link to reset your password.
                  </Typography>
                  <Button
                    onClick={() => {
                      setShowPasswordReset(false);
                      setPasswordResetSent(false);
                      setPasswordResetEmail('');
                    }}
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    sx={{ textTransform: 'none' }}
                  >
                    Back to Sign In
                  </Button>
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                    <IconButton
                      onClick={() => {
                        setShowPasswordReset(false);
                        setPasswordResetEmail('');
                        setError(null);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Reset Password
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Enter your email address and we'll send you a link to reset your password.
                  </Typography>
                  <form onSubmit={handlePasswordReset}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={passwordResetEmail}
                      onChange={(e) => setPasswordResetEmail(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 3 }}
                      required
                      autoFocus
                    />
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading || !passwordResetEmail}
                      sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Send Reset Link'}
                    </Button>
                  </form>
                </>
              )
            ) : (
              <form onSubmit={signInForm.handleSubmit(handleSignIn)}>
                <Controller
                  name="email"
                  control={signInForm.control}
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 3 }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={signInForm.control}
                  rules={{
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={togglePasswordVisibility}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ mb: 1 }}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                  <Button
                    onClick={() => {
                      setError(null);
                      setPasswordResetSent(false);
                      setPasswordResetEmail(signInForm.getValues('email') || '');
                      setShowPasswordReset(true);
                    }}
                    sx={{ textTransform: 'none', fontSize: '0.875rem' }}
                    size="small"
                  >
                    Forgot Password?
                  </Button>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !signInForm.formState.isValid}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
              </form>
            )}
          </TabPanel>

          {/* Sign Up Tab */}
          <TabPanel value={tabValue} index={1}>
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)}>
              <Controller
                name="displayName"
                control={signUpForm.control}
                rules={{
                  required: 'Display name is required',
                  minLength: {
                    value: 2,
                    message: 'Display name must be at least 2 characters',
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Display Name"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Controller
                name="email"
                control={signUpForm.control}
                rules={{
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Controller
                name="password"
                control={signUpForm.control}
                rules={{
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={togglePasswordVisibility}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Controller
                name="confirmPassword"
                control={signUpForm.control}
                rules={{
                  required: 'Please confirm your password',
                  validate: (value) =>
                    value === signUpForm.watch('password') || 'Passwords do not match',
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={toggleConfirmPasswordVisibility}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ mb: 3 }}
                  />
                )}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !signUpForm.formState.isValid}
                sx={{
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </form>
          </TabPanel>

          {/* Social Login */}
          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderColor: 'divider',
                color: 'text.primary',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'action.hover',
                },
              }}
            >
              Continue with Google
            </Button>
          </Box>

          {/* Footer */}
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              or
            </Typography>
          </Divider>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {tabValue === 0 ? "Don't have an account? " : "Already have an account? "}
              <Button
                onClick={() => setTabValue(tabValue === 0 ? 1 : 0)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {tabValue === 0 ? 'Sign Up' : 'Sign In'}
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
} 