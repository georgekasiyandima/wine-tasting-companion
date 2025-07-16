import { initializeApp } from 'firebase/app';
import { 
  getDatabase, 
  ref as dbRef, 
  push, 
  onValue, 
  remove, 
  update, 
  query, 
  orderByChild, 
  limitToLast,
  DataSnapshot
} from 'firebase/database';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';
import { Wine, TastingSession, User, WineCellar, CellarWine, CellarAnalytics } from '@/types';
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Check if we're in demo mode
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

if (isDemoMode) {
  console.log('🚀 Running in DEMO MODE - Firebase features will be simulated');
}

const firebaseConfig = {
  apiKey: "AIzaSyC85ZnB1Zgudtjs_4jljn9X321U8fUAzhs",
  authDomain: "winetastingcompanion.firebaseapp.com",
  projectId: "winetastingcompanion",
  storageBucket: "winetastingcompanion.firebasestorage.app",
  messagingSenderId: "854067954121",
  appId: "1:854067954121:web:93bc2608e81399158be818",
  measurementId: "G-KRR9TJ2YF5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);
const firestore = getFirestore();

// Database references
export const dbRefs = {
  wines: () => dbRef(database, 'wines'),
  wine: (id: string) => dbRef(database, `wines/${id}`),
  userWines: (userId: string) => dbRef(database, `users/${userId}/wines`),
  userWine: (userId: string, wineId: string) => dbRef(database, `users/${userId}/wines/${wineId}`),
  tastingSessions: () => dbRef(database, 'tastingSessions'),
  tastingSession: (id: string) => dbRef(database, `tastingSessions/${id}`),
  userTastingSessions: (userId: string) => dbRef(database, `users/${userId}/tastingSessions`),
  users: () => dbRef(database, 'users'),
  user: (userId: string) => dbRef(database, `users/${userId}`)
};

// Wine Service
export class WineService {
  static async addWine(wine: Omit<Wine, 'id'>, userId?: string): Promise<string> {
    if (isDemoMode) {
      // Demo mode: simulate adding wine
      const wineId = `demo-wine-${Date.now()}`;
      console.log('Demo mode: Wine added successfully', { wineId, wine });
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return wineId;
    }

    try {
      const wineData = {
        ...wine,
        timestamp: Date.now(),
        userId: userId || 'anonymous'
      };
      
      const wineRef = userId ? dbRefs.userWines(userId) : dbRefs.wines();
      const snapshot = await push(wineRef, wineData);
      return snapshot.key || '';
    } catch (error) {
      console.error('Error adding wine:', error);
      throw new Error('Failed to add wine');
    }
  }

  static async updateWine(wineId: string, wine: Partial<Wine>, userId?: string): Promise<void> {
    try {
      const wineRef = userId ? dbRefs.userWine(userId, wineId) : dbRefs.wine(wineId);
      await update(wineRef, { ...wine, lastUpdated: Date.now() });
    } catch (error) {
      console.error('Error updating wine:', error);
      throw new Error('Failed to update wine');
    }
  }

  static async deleteWine(wineId: string, userId?: string): Promise<void> {
    try {
      const wineRef = userId ? dbRefs.userWine(userId, wineId) : dbRefs.wine(wineId);
      await remove(wineRef);
    } catch (error) {
      console.error('Error deleting wine:', error);
      throw new Error('Failed to delete wine');
    }
  }

  static async getWines(userId?: string, limit?: number): Promise<Wine[]> {
    if (isDemoMode) {
      // Demo mode: return mock wines data
      const mockWines: Wine[] = [
        {
          id: 'demo-wine-1',
          name: 'Château Margaux 2015',
          grape: 'Cabernet Sauvignon',
          region: 'Bordeaux, France',
          vintage: 2015,
          rating: 4.8,
          price: 850,
          imageUrl: 'https://via.placeholder.com/300x400/8B0000/FFFFFF?text=Château+Margaux',
          winery: 'Château Margaux',
          notes: 'Exceptional vintage with complex aromas of black fruits, tobacco, and cedar.',
          timestamp: Date.now() - 86400000, // 1 day ago
          tasting: {
            appearance: 'Deep ruby red with purple hues',
            nose: 'Black cherry, plum, tobacco, cedar, vanilla',
            palate: 'Full-bodied with silky tannins, black fruits, spice',
            finish: 'Long and complex with lingering dark chocolate notes',
            overall: 'Outstanding wine with great aging potential'
          },
          userId: userId || 'demo-user-id',
          inCellar: true,
          createdAt: Date.now() - 86400000
        },
        {
          id: 'demo-wine-2',
          name: 'Opus One 2018',
          grape: 'Cabernet Sauvignon',
          region: 'Napa Valley, California',
          vintage: 2018,
          rating: 4.6,
          price: 450,
          imageUrl: 'https://via.placeholder.com/300x400/4B0082/FFFFFF?text=Opus+One',
          winery: 'Opus One Winery',
          notes: 'Elegant and balanced with notes of dark berries and oak.',
          timestamp: Date.now() - 172800000, // 2 days ago
          tasting: {
            appearance: 'Deep garnet with ruby edges',
            nose: 'Blackberry, cassis, vanilla, oak, mint',
            palate: 'Medium to full-bodied, smooth tannins, dark fruits',
            finish: 'Medium length with hints of chocolate and spice',
            overall: 'Excellent wine with good structure and balance'
          },
          userId: userId || 'demo-user-id',
          inCellar: false,
          createdAt: Date.now() - 172800000
        },
        {
          id: 'demo-wine-3',
          name: 'Sassicaia 2017',
          grape: 'Cabernet Sauvignon',
          region: 'Tuscany, Italy',
          vintage: 2017,
          rating: 4.7,
          price: 350,
          imageUrl: 'https://via.placeholder.com/300x400/DC143C/FFFFFF?text=Sassicaia',
          winery: 'Tenuta San Guido',
          notes: 'Classic Italian Super Tuscan with power and elegance.',
          timestamp: Date.now() - 259200000, // 3 days ago
          tasting: {
            appearance: 'Deep ruby red with violet reflections',
            nose: 'Black cherry, plum, leather, tobacco, herbs',
            palate: 'Full-bodied, firm tannins, dark fruits, earth',
            finish: 'Long and structured with mineral notes',
            overall: 'Powerful wine with great aging potential'
          },
          userId: userId || 'demo-user-id',
          inCellar: true,
          createdAt: Date.now() - 259200000
        }
      ];
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Apply limit if specified
      const limitedWines = limit ? mockWines.slice(0, limit) : mockWines;
      return limitedWines.sort((a, b) => b.timestamp - a.timestamp);
    }

    return new Promise((resolve, reject) => {
      try {
        const winesRef = userId ? dbRefs.userWines(userId) : dbRefs.wines();
        const winesQuery = limit ? query(winesRef, orderByChild('timestamp'), limitToLast(limit)) : winesRef;
        
        onValue(winesQuery, (snapshot: DataSnapshot) => {
          const wines: Wine[] = [];
          snapshot.forEach((childSnapshot) => {
            wines.push({
              id: childSnapshot.key || '',
              ...childSnapshot.val()
            });
          });
          resolve(wines.sort((a, b) => b.timestamp - a.timestamp));
        }, (error) => {
          console.error('Error fetching wines:', error);
          reject(new Error('Failed to fetch wines'));
        });
      } catch (error) {
        console.error('Error setting up wines listener:', error);
        reject(new Error('Failed to set up wines listener'));
      }
    });
  }

  static async getWine(wineId: string, userId?: string): Promise<Wine | null> {
    if (isDemoMode) {
      // Demo mode: return mock wine data
      const mockWines: Wine[] = [
        {
          id: 'demo-wine-1',
          name: 'Château Margaux 2015',
          grape: 'Cabernet Sauvignon',
          region: 'Bordeaux, France',
          vintage: 2015,
          rating: 4.8,
          price: 850,
          imageUrl: 'https://via.placeholder.com/300x400/8B0000/FFFFFF?text=Château+Margaux',
          winery: 'Château Margaux',
          notes: 'Exceptional vintage with complex aromas of black fruits, tobacco, and cedar.',
          timestamp: Date.now() - 86400000,
          tasting: {
            appearance: 'Deep ruby red with purple hues',
            nose: 'Black cherry, plum, tobacco, cedar, vanilla',
            palate: 'Full-bodied with silky tannins, black fruits, spice',
            finish: 'Long and complex with lingering dark chocolate notes',
            overall: 'Outstanding wine with great aging potential'
          },
          userId: userId || 'demo-user-id',
          inCellar: true,
          createdAt: Date.now() - 86400000
        }
      ];
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Find the wine by ID
      const wine = mockWines.find(w => w.id === wineId);
      return wine || null;
    }

    return new Promise((resolve, reject) => {
      try {
        const wineRef = userId ? dbRefs.userWine(userId, wineId) : dbRefs.wine(wineId);
        
        onValue(wineRef, (snapshot: DataSnapshot) => {
          if (snapshot.exists()) {
            resolve({
              id: snapshot.key || '',
              ...snapshot.val()
            });
          } else {
            resolve(null);
          }
        }, (error) => {
          console.error('Error fetching wine:', error);
          reject(new Error('Failed to fetch wine'));
        });
      } catch (error) {
        console.error('Error setting up wine listener:', error);
        reject(new Error('Failed to set up wine listener'));
      }
    });
  }

  static async clearAllWines(userId?: string): Promise<void> {
    try {
      const winesRef = userId ? dbRefs.userWines(userId) : dbRefs.wines();
      await remove(winesRef);
    } catch (error) {
      console.error('Error clearing wines:', error);
      throw new Error('Failed to clear wines');
    }
  }
}

// Tasting Session Service
export class TastingSessionService {
  static async createSession(session: Omit<TastingSession, 'id'>, userId: string): Promise<string> {
    if (isDemoMode) {
      // Demo mode: simulate creating session
      const sessionId = `demo-session-${Date.now()}`;
      console.log('Demo mode: Tasting session created successfully', { sessionId, session });
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return sessionId;
    }

    try {
      const sessionData = {
        ...session,
        timestamp: Date.now(),
        userId
      };
      
      const sessionRef = dbRefs.tastingSessions();
      const snapshot = await push(sessionRef, sessionData);
      return snapshot.key || '';
    } catch (error) {
      console.error('Error creating tasting session:', error);
      throw new Error('Failed to create tasting session');
    }
  }

  static async updateSession(sessionId: string, session: Partial<TastingSession>): Promise<void> {
    try {
      const sessionRef = dbRefs.tastingSession(sessionId);
      await update(sessionRef, { ...session, lastUpdated: Date.now() });
    } catch (error) {
      console.error('Error updating tasting session:', error);
      throw new Error('Failed to update tasting session');
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessionRef = dbRefs.tastingSession(sessionId);
      await remove(sessionRef);
    } catch (error) {
      console.error('Error deleting tasting session:', error);
      throw new Error('Failed to delete tasting session');
    }
  }

  static async getSessions(userId: string): Promise<TastingSession[]> {
    if (isDemoMode) {
      // Demo mode: return mock tasting sessions data
      const mockSessions: TastingSession[] = [
        {
          id: 'demo-session-1',
          title: 'Bordeaux Tasting',
          date: Date.now() - 86400000, // 1 day ago
          location: 'Wine Bar Downtown',
          participants: ['John', 'Sarah', 'Mike'],
          wines: ['demo-wine-1', 'demo-wine-2'],
          notes: 'Excellent tasting session with great wines and company.',
          rating: 4.5,
          userId: userId,
          timestamp: Date.now() - 86400000
        },
        {
          id: 'demo-session-2',
          title: 'Italian Wine Night',
          date: Date.now() - 172800000, // 2 days ago
          location: 'Home Tasting Room',
          participants: ['Emma', 'David'],
          wines: ['demo-wine-3'],
          notes: 'Delicious Italian wines with homemade pasta.',
          rating: 4.8,
          userId: userId,
          timestamp: Date.now() - 172800000
        }
      ];
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 400));
      return mockSessions.sort((a, b) => b.date - a.date);
    }

    return new Promise((resolve, reject) => {
      try {
        const sessionsRef = dbRefs.userTastingSessions(userId);
        const sessionsQuery = query(sessionsRef, orderByChild('date'));
        
        onValue(sessionsQuery, (snapshot: DataSnapshot) => {
          const sessions: TastingSession[] = [];
          snapshot.forEach((childSnapshot) => {
            sessions.push({
              id: childSnapshot.key || '',
              ...childSnapshot.val()
            });
          });
          resolve(sessions.sort((a, b) => b.date - a.date));
        }, (error) => {
          console.error('Error fetching tasting sessions:', error);
          reject(new Error('Failed to fetch tasting sessions'));
        });
      } catch (error) {
        console.error('Error setting up sessions listener:', error);
        reject(new Error('Failed to set up sessions listener'));
      }
    });
  }
}

// Authentication Service
export class AuthService {
  static async signIn(email: string, password: string): Promise<FirebaseUser> {
    if (isDemoMode) {
      // Demo mode: simulate successful sign in
      const demoUser = {
        uid: 'demo-user-id',
        email: email,
        displayName: email.split('@')[0],
        photoURL: null,
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: 'demo-token',
        tenantId: null,
        delete: () => Promise.resolve(),
        getIdToken: () => Promise.resolve('demo-token'),
        getIdTokenResult: () => Promise.resolve({} as any),
        reload: () => Promise.resolve(),
        toJSON: () => ({}),
        phoneNumber: null,
        providerId: 'password'
      } as FirebaseUser;
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return demoUser;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error('Failed to sign in');
    }
  }

  static async signInWithGoogle(): Promise<FirebaseUser> {
    if (isDemoMode) {
      // Demo mode: simulate successful Google sign in
      const demoUser = {
        uid: 'demo-google-user-id',
        email: 'demo@example.com',
        displayName: 'Demo User',
        photoURL: 'https://via.placeholder.com/150',
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: 'demo-google-token',
        tenantId: null,
        delete: () => Promise.resolve(),
        getIdToken: () => Promise.resolve('demo-google-token'),
        getIdTokenResult: () => Promise.resolve({} as any),
        reload: () => Promise.resolve(),
        toJSON: () => ({}),
        phoneNumber: null,
        providerId: 'google.com'
      } as FirebaseUser;
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return demoUser;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      // Create or update user profile in database
      const userData: User = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        createdAt: Date.now()
      };
      
      await update(dbRefs.user(user.uid), userData);
      return user;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Provide specific error messages for common issues
      if (error.code === 'auth/configuration-not-found') {
        throw new Error('Google Sign-In is not configured in Firebase. Please enable it in your Firebase Console under Authentication > Sign-in method > Google.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for Google Sign-In. Please add localhost to authorized domains in Firebase Console.');
      } else {
        throw new Error(`Failed to sign in with Google: ${error.message}`);
      }
    }
  }

  static async signUp(email: string, password: string, displayName: string): Promise<FirebaseUser> {
    if (isDemoMode) {
      // Demo mode: simulate successful sign up
      const demoUser = {
        uid: `demo-user-${Date.now()}`,
        email: email,
        displayName: displayName,
        photoURL: null,
        emailVerified: false,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: 'demo-signup-token',
        tenantId: null,
        delete: () => Promise.resolve(),
        getIdToken: () => Promise.resolve('demo-signup-token'),
        getIdTokenResult: () => Promise.resolve({} as any),
        reload: () => Promise.resolve(),
        toJSON: () => ({}),
        phoneNumber: null,
        providerId: 'password'
      } as FirebaseUser;
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return demoUser;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create user profile in database
      const userData: User = {
        id: user.uid,
        email: user.email || '',
        displayName,
        createdAt: Date.now()
      };
      
      await update(dbRefs.user(user.uid), userData);
      return user;
    } catch (error: any) {
      console.error('Error signing up:', error);
      
      // Provide specific error messages for common issues
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address.');
      } else if (error.code === 'auth/configuration-not-found') {
        throw new Error('Firebase Authentication is not properly configured. Please check your Firebase project settings.');
      } else {
        throw new Error(`Failed to sign up: ${error.message}`);
      }
    }
  }

  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out');
    }
  }

  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }
}

export async function uploadWineImage(file: File, userId: string): Promise<string> {
  const filePath = `users/${userId}/wines/${Date.now()}_${file.name}`;
  const imageRef = storageRef(storage, filePath);
  const uploadTask = uploadBytesResumable(imageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      null,
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export async function uploadVoiceNote(audioBlob: Blob, fileName: string): Promise<string> {
  const audioRef = storageRef(storage, fileName);
  const uploadTask = uploadBytesResumable(audioRef, audioBlob);

  return new Promise((resolve, reject) => {
    uploadTask.on('state_changed',
      null,
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

export { database, auth, storage };

// Wine Cellar Management Services
export class CellarService {
  private db = getFirestore();
  private storage = getStorage();

  // Cellar Management
  async createCellar(cellar: Omit<WineCellar, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const cellarRef = collection(this.db, 'cellars');
    const newCellar = {
      ...cellar,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(cellarRef, newCellar);
    return docRef.id;
  }

  async getCellars(userId: string): Promise<WineCellar[]> {
    const cellarRef = collection(this.db, 'cellars');
    const q = query(cellarRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WineCellar[];
  }

  async updateCellar(cellarId: string, updates: Partial<WineCellar>): Promise<void> {
    const cellarRef = doc(this.db, 'cellars', cellarId);
    await updateDoc(cellarRef, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  async deleteCellar(cellarId: string): Promise<void> {
    const cellarRef = doc(this.db, 'cellars', cellarId);
    await deleteDoc(cellarRef);
  }

  // Cellar Wine Management
  async addWineToCellar(wine: Omit<CellarWine, 'id' | 'timestamp'>): Promise<string> {
    const wineRef = collection(this.db, 'cellarWines');
    const newWine = {
      ...wine,
      timestamp: Date.now()
    };
    
    const docRef = await addDoc(wineRef, newWine);
    return docRef.id;
  }

  async getCellarWines(cellarId: string): Promise<CellarWine[]> {
    const wineRef = collection(this.db, 'cellarWines');
    const q = query(wineRef, where('cellarId', '==', cellarId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CellarWine[];
  }

  async updateCellarWine(wineId: string, updates: Partial<CellarWine>): Promise<void> {
    const wineRef = doc(this.db, 'cellarWines', wineId);
    await updateDoc(wineRef, {
      ...updates,
      timestamp: Date.now()
    });
  }

  async removeWineFromCellar(wineId: string): Promise<void> {
    const wineRef = doc(this.db, 'cellarWines', wineId);
    await deleteDoc(wineRef);
  }

  async getUserCellarWines(userId: string): Promise<CellarWine[]> {
    const wineRef = collection(this.db, 'cellarWines');
    const q = query(wineRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CellarWine[];
  }

  // Cellar Analytics
  async getCellarAnalytics(cellarId: string): Promise<CellarAnalytics> {
    const wines = await this.getCellarWines(cellarId);
    
    if (wines.length === 0) {
      return {
        totalWines: 0,
        totalValue: 0,
        averageAge: 0,
        winesByRegion: [],
        winesByGrape: [],
        agingWines: [],
        readyToDrink: [],
        overdueWines: [],
        valueByPriceRange: []
      };
    }

    const totalValue = wines.reduce((sum, wine) => sum + (wine.purchasePrice * wine.quantity), 0);
    const averageAge = wines.reduce((sum, wine) => {
      const age = (Date.now() - wine.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
      return sum + age;
    }, 0) / wines.length;

    // Group by region
    const regionMap = new Map<string, { count: number; value: number }>();
    wines.forEach(wine => {
      const existing = regionMap.get(wine.region) || { count: 0, value: 0 };
      regionMap.set(wine.region, {
        count: existing.count + wine.quantity,
        value: existing.value + (wine.purchasePrice * wine.quantity)
      });
    });

    // Group by grape
    const grapeMap = new Map<string, { count: number; value: number }>();
    wines.forEach(wine => {
      const existing = grapeMap.get(wine.grape) || { count: 0, value: 0 };
      grapeMap.set(wine.grape, {
        count: existing.count + wine.quantity,
        value: existing.value + (wine.purchasePrice * wine.quantity)
      });
    });

    // Aging wines (not ready to drink yet)
    const agingWines = wines.filter(wine => {
      const age = (Date.now() - wine.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
      return age < wine.agingPotential;
    });

    // Ready to drink
    const readyToDrink = wines.filter(wine => {
      const age = (Date.now() - wine.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
      return age >= wine.agingPotential && age <= wine.agingPotential + 2;
    });

    // Overdue wines
    const overdueWines = wines.filter(wine => {
      const age = (Date.now() - wine.purchaseDate) / (1000 * 60 * 60 * 24 * 365);
      return age > wine.agingPotential + 2;
    });

    // Value by price range
    const priceRanges = [
      { label: 'Under $50', min: 0, max: 50 },
      { label: '$50 - $100', min: 50, max: 100 },
      { label: '$100 - $200', min: 100, max: 200 },
      { label: 'Over $200', min: 200, max: Infinity }
    ];

    const valueByPriceRange = priceRanges.map(range => {
      const winesInRange = wines.filter(wine => 
        wine.purchasePrice >= range.min && wine.purchasePrice < range.max
      );
      return {
        range: range.label,
        count: winesInRange.reduce((sum, wine) => sum + wine.quantity, 0),
        value: winesInRange.reduce((sum, wine) => sum + (wine.purchasePrice * wine.quantity), 0)
      };
    });

    return {
      totalWines: wines.reduce((sum, wine) => sum + wine.quantity, 0),
      totalValue,
      averageAge,
      winesByRegion: Array.from(regionMap.entries()).map(([region, data]) => ({
        region,
        ...data
      })),
      winesByGrape: Array.from(grapeMap.entries()).map(([grape, data]) => ({
        grape,
        ...data
      })),
      agingWines,
      readyToDrink,
      overdueWines,
      valueByPriceRange
    };
  }
}

// Export cellar service instance
export const cellarService = new CellarService(); 