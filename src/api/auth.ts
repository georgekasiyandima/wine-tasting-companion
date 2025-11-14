import { User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Demo login for development/testing
export const demoLogin = async (): Promise<{ user: User; token: string }> => {
  const response: AuthResponse = await apiRequest('/auth/demo-login', {
    method: 'POST',
  });
  
  // Store token in localStorage
  localStorage.setItem('authToken', response.data.token);
  
  return response.data;
};

// Logout (clear token)
export const logout = (): void => {
  localStorage.removeItem('authToken');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};

// Get stored token
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
}; 