import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Theme, Notification, User, UserPreferences } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { demoLogin, isAuthenticated, getToken, logout as authLogout } from '@/api/auth';

// State interface
interface AppState {
  theme: Theme;
  user: User | null;
  notifications: Notification[];
  isLoading: boolean;
  userPreferences: UserPreferences | null;
}

// Action types
type AppAction =
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER_PREFERENCES'; payload: UserPreferences }
  | { type: 'CLEAR_NOTIFICATIONS' };

// Initial state
const initialState: AppState = {
  theme: {
    mode: 'light',
    primaryColor: '#8B0000',
    secondaryColor: '#D4AF37',
  },
  user: null,
  notifications: [],
  isLoading: false,
  userPreferences: null,
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload],
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER_PREFERENCES':
      return { ...state, userPreferences: action.payload };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };
    default:
      return state;
  }
}

// Context interface
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  toggleTheme: () => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  login: () => Promise<void>;
  logout: () => void;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme) as Theme;
        if (theme.mode && theme.primaryColor && theme.secondaryColor) {
          dispatch({ type: 'SET_THEME', payload: theme });
        }
      } catch (error) {
        console.error('Error loading theme from localStorage:', error);
        addNotification({
          type: 'error',
          message: 'Failed to load theme preferences',
        });
      }
    }
  }, []); // Note: addNotification removed from deps as it's memoized below

  // Save theme to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(state.theme));
    } catch (error) {
      console.error('Error saving theme to localStorage:', error);
      addNotification({
        type: 'error',
        message: 'Failed to save theme preferences',
      });
    }
  }, [state.theme]);

<<<<<<< HEAD
  // Memoize addNotification to ensure stable reference
  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
=======
  // Check for existing authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          // User is already authenticated, we can fetch their profile
          // For now, we'll use a demo user since we don't have profile endpoint yet
          const demoUser: User = {
            id: 'demo-user-123',
            email: 'demo@winecompanion.com',
            displayName: 'Demo User',
            createdAt: Date.now()
          };
          dispatch({ type: 'SET_USER', payload: demoUser });
        } else {
          // Auto-login with demo user for development
          try {
            const { user } = await demoLogin();
            dispatch({ type: 'SET_USER', payload: user });
          } catch (error) {
            console.error('Demo login failed:', error);
            dispatch({ type: 'SET_USER', payload: null });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        dispatch({ type: 'SET_USER', payload: null });
      }
    };

    checkAuth();
  }, []);

  // Helper functions
  const addNotification = (notification: Omit<Notification, 'id'>) => {
>>>>>>> 360e5f7593b872db021e642b4b663c55e0cd8fab
    const id = Date.now().toString();
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000,
    };

    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });

    if (newNotification.duration !== 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
      }, newNotification.duration);
    }
  }, [dispatch]);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userProfile = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: Date.now(),
          };
          dispatch({ type: 'SET_USER', payload: userProfile });
        } else {
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        addNotification({
          type: 'error',
          message: `Failed to load user profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    });
    return () => {
      unsubscribe();
      dispatch({ type: 'SET_LOADING', payload: false });
    };
  }, [addNotification, dispatch]);

  // Helper functions
  const removeNotification = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  }, [dispatch]);

  const toggleTheme = useCallback(() => {
    const newTheme: Theme = {
      ...state.theme,
      mode: state.theme.mode === 'light' ? 'dark' : 'light',
    };
    dispatch({ type: 'SET_THEME', payload: newTheme });
  }, [state.theme]);

  const updateUserPreferences = useCallback((preferences: Partial<UserPreferences>) => {
    const updatedPreferences = {
      ...state.userPreferences,
      ...preferences,
    } as UserPreferences;

    dispatch({ type: 'SET_USER_PREFERENCES', payload: updatedPreferences });

    try {
      localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
      addNotification({
        type: 'error',
        message: 'Failed to save user preferences',
      });
    }
  }, [state.userPreferences, addNotification]);

  const login = async () => {
    try {
      const { user } = await demoLogin();
      dispatch({ type: 'SET_USER', payload: user });
      addNotification({
        type: 'success',
        message: 'Successfully logged in!'
      });
    } catch (error) {
      console.error('Login failed:', error);
      addNotification({
        type: 'error',
        message: 'Login failed. Please try again.'
      });
    }
  };

  const logout = () => {
    authLogout();
    dispatch({ type: 'SET_USER', payload: null });
    addNotification({
      type: 'info',
      message: 'Successfully logged out!'
    });
  };

  const value: AppContextType = {
    state,
    dispatch,
    addNotification,
    removeNotification,
    toggleTheme,
    updateUserPreferences,
<<<<<<< HEAD
=======
    login,
    logout
>>>>>>> 360e5f7593b872db021e642b4b663c55e0cd8fab
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}