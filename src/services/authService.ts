import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
}

export class AuthService {
  private static currentUser: FirebaseUser | null = null;

  /**
   * Initialize Firebase authentication
   */
  static initialize(): void {
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      
      if (user) {
        // User is signed in
        localStorage.setItem('user', JSON.stringify(this.firebaseUserToAuthUser(user)));
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
      } else {
        // User is signed out
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
      }
    });
  }

  /**
   * User registration with Firebase
   */
  static async signup(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthUser> {
    try {
      if (!userData.name || !userData.email || !userData.password) {
        throw new Error('Name, email, and password are required');
      }

      if (userData.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      if (!this.isValidEmail(userData.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Create user with Firebase
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );

      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: userData.name
        });
      }

      // Get updated user
      const updatedUser = auth.currentUser;
      if (!updatedUser) {
        throw new Error('Failed to create user');
      }

      const authUser = this.firebaseUserToAuthUser(updatedUser);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(authUser));
      
      // Store auth token
      try {
        const token = await updatedUser.getIdToken();
        if (token) {
          localStorage.setItem('authToken', token);
        }
      } catch (error) {
        console.warn('Failed to store auth token:', error);
      }
      
      // Create backend profile (this will happen automatically when they first access profile)
      try {
        const { default: ProfileService } = await import('./profileService');
        await ProfileService.autoFillProfile();
      } catch (profileError) {
        console.warn('Failed to create backend profile:', profileError);
        // Don't fail signup if profile creation fails
      }
      
      return authUser;
    } catch (error) {
      console.error('Signup failed:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * User login with Firebase
   */
  static async login(credentials: {
  email: string;
    password: string;
  }): Promise<AuthUser> {
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error('Email and password are required');
      }

      if (!this.isValidEmail(credentials.email)) {
        throw new Error('Please enter a valid email address');
      }

      // Sign in with Firebase
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );

      const authUser = this.firebaseUserToAuthUser(userCredential.user);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(authUser));
      
      // Store auth token
      try {
        const token = await userCredential.user.getIdToken();
        if (token) {
          localStorage.setItem('authToken', token);
        }
      } catch (error) {
        console.warn('Failed to store auth token:', error);
      }
      
      return authUser;
    } catch (error) {
      console.error('Login failed:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Google OAuth login with Firebase
   */
  static async googleSignIn(): Promise<AuthUser> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential: UserCredential = await signInWithPopup(auth, provider);
      
      const authUser = this.firebaseUserToAuthUser(userCredential.user);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(authUser));
      
      // Store auth token
      try {
        const token = await userCredential.user.getIdToken();
        if (token) {
          localStorage.setItem('authToken', token);
        }
      } catch (error) {
        console.warn('Failed to store auth token:', error);
      }
      
      return authUser;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
      
      // Clear all stored data
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('cart');
      localStorage.removeItem('favorites');
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local data even if Firebase logout fails
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('cart');
      localStorage.removeItem('favorites');
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): AuthUser | null {
    try {
      // First try to get from Firebase
      if (this.currentUser) {
        return this.firebaseUserToAuthUser(this.currentUser);
      }
      
      // Fallback to stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // If we have a stored user but no Firebase user, 
        // it means the page was refreshed and Firebase needs to re-authenticate
        if (user && user.uid) {
          return user;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    // Check Firebase current user first
    if (this.currentUser !== null) {
      return true;
    }
    
    // Fallback to stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user && user.uid;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return false;
      }
    }
    
    return false;
  }

  /**
   * Get Firebase ID token for API calls
   */
  static async getIdToken(): Promise<string | null> {
    try {
      if (this.currentUser) {
        const token = await this.currentUser.getIdToken();
        // Store the token in localStorage for API calls
        if (token) {
          localStorage.setItem('authToken', token);
        }
        return token;
      }
      
      // Fallback to stored token
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        return storedToken;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting ID token:', error);
  return null;
    }
  }

  /**
   * Get stored user data
   */
  static getStoredUser(): AuthUser | null {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  }

  /**
   * Check if user has verified email
   */
  static isEmailVerified(): boolean {
    try {
      if (this.currentUser) {
        return this.currentUser.emailVerified;
      }
      
      const storedUser = this.getStoredUser();
      return storedUser?.emailVerified || false;
    } catch (error) {
      console.error('Error checking email verification:', error);
      return false;
    }
  }

  /**
   * Get user's email
   */
  static getUserEmail(): string {
    try {
      if (this.currentUser) {
        return this.currentUser.email || '';
      }
      
      const storedUser = this.getStoredUser();
      return storedUser?.email || '';
    } catch (error) {
      console.error('Error getting user email:', error);
      return '';
    }
  }

  /**
   * Get user's name
   */
  static getUserName(): string {
    try {
      if (this.currentUser) {
        return this.currentUser.displayName || '';
      }
      
      const storedUser = this.getStoredUser();
      return storedUser?.displayName || '';
    } catch (error) {
      console.error('Error getting user name:', error);
      return '';
    }
  }

  /**
   * Get user's ID
   */
  static getUserId(): string {
    try {
      if (this.currentUser) {
        return this.currentUser.uid;
      }
      
      const storedUser = this.getStoredUser();
      return storedUser?.uid || '';
    } catch (error) {
      console.error('Error getting user ID:', error);
      return '';
    }
  }

  /**
   * Check if user is active
   */
  static isUserActive(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Send email verification
   */
  static async sendEmailVerification(): Promise<void> {
    try {
      if (this.currentUser) {
        await sendEmailVerification(this.currentUser);
      } else {
        throw new Error('No authenticated user');
      }
    } catch (error) {
      console.error('Error sending email verification:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    try {
      if (this.currentUser) {
        await updateProfile(this.currentUser, updates);
        
        // Update stored user data
        const updatedUser = this.firebaseUserToAuthUser(this.currentUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        throw new Error('No authenticated user');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Convert Firebase user to AuthUser
   */
  private static firebaseUserToAuthUser(firebaseUser: FirebaseUser): AuthUser {
    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      emailVerified: firebaseUser.emailVerified,
      photoURL: firebaseUser.photoURL,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
      lastLoginAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString()
    };
  }

  /**
   * Validate email format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle Firebase authentication errors
   */
  private static handleFirebaseError(error: any): Error {
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return new Error('No account found with this email address');
        case 'auth/wrong-password':
          return new Error('Incorrect password');
        case 'auth/email-already-in-use':
          return new Error('An account with this email already exists');
        case 'auth/weak-password':
          return new Error('Password is too weak. Use at least 8 characters');
        case 'auth/invalid-email':
          return new Error('Invalid email address');
        case 'auth/too-many-requests':
          return new Error('Too many failed attempts. Please try again later');
        case 'auth/user-disabled':
          return new Error('This account has been disabled');
        case 'auth/operation-not-allowed':
          return new Error('This operation is not allowed');
        case 'auth/network-request-failed':
          return new Error('Network error. Please check your connection');
        default:
          return new Error(error.message || 'Authentication failed');
      }
    }
    return new Error(error.message || 'Authentication failed');
  }

  /**
   * Set up authentication listeners
   */
  static setupListeners(): void {
    // Listen for storage changes (e.g., when token is updated in another tab)
    window.addEventListener('storage', (event) => {
      if (event.key === 'user') {
        // Refresh authentication state
        this.refreshAuthState();
      }
    });

    // Listen for beforeunload to clean up
    window.addEventListener('beforeunload', () => {
      // Clean up any temporary data
      sessionStorage.clear();
    });
  }

  /**
   * Refresh authentication state
   */
  private static async refreshAuthState(): Promise<void> {
    try {
      // Check if we have a stored user but no Firebase user
      const storedUser = localStorage.getItem('user');
      if (storedUser && !this.currentUser) {
        try {
          const user = JSON.parse(storedUser);
          if (user && user.uid) {
            // Try to get a fresh token
            const token = await this.getIdToken();
            if (token) {
              console.log('Auth token refreshed successfully');
            }
          }
        } catch (error) {
          console.error('Error refreshing auth state:', error);
        }
      }
    } catch (error) {
      console.error('Error refreshing auth state:', error);
    }
  }
}

export default AuthService; 