import { WineCellar, CellarWine } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
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

// Legacy compatibility service (to replace cleanCellarService)
export const cleanCellarService = {
  getCellars: async (userId: string): Promise<WineCellar[]> => {
    const response = await apiRequest('/cellars');
    return response.data;
  },

  getCellarWines: async (userId: string, cellarId: string): Promise<CellarWine[]> => {
    const response = await apiRequest(`/cellars/${cellarId}/wines`);
    return response.data;
  },

  addWine: async (userId: string, cellarId: string, wine: Omit<CellarWine, 'id'>): Promise<string> => {
    const response = await apiRequest(`/cellars/${cellarId}/wines`, {
      method: 'POST',
      body: JSON.stringify(wine),
    });
    return response.data.id;
  },

  updateWine: async (userId: string, cellarId: string, wine: CellarWine): Promise<void> => {
    const { id, cellarId: _, userId: __, ...wineData } = wine;
    await apiRequest(`/cellars/${cellarId}/wines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(wineData),
    });
  },

  deleteWine: async (userId: string, cellarId: string, wineId: string): Promise<void> => {
    await apiRequest(`/cellars/${cellarId}/wines/${wineId}`, {
      method: 'DELETE',
    });
  },
};

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}; 