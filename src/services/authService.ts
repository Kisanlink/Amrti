import { 
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { auth, getRecaptchaToken } from '../config/firebase';

export interface AuthUser {
  uid: string;
  phoneNumber: string | null;
  displayName: string | null;
  isVerified: boolean;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
  id: string;
  isActive: boolean;
  isNewUser: boolean;
}

export interface PhoneAuthResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    session_info: string;
  };
  timestamp: string;
}

export interface PhoneVerifyResponse {
  success: boolean;
  message: string;
  data: {
    expires_in: string;
    id_token: string;
    message: string;
    refresh_token: string;
    user: {
      created_at: string;
      id: string;
      is_active: boolean;
      is_new_user: boolean;
      is_verified: boolean;
      name: string;
      phone_number: string;
      uid: string;
    };
  };
  timestamp: string;
}

export class AuthService {
  private static currentUser: FirebaseUser | null = null;
  private static readonly AUTO_FILL_PROFILE_KEY = 'autoFillProfileCalled';

  /**
   * Call auto-fill profile API only once per user
   */
  private static async callAutoFillProfile(): Promise<void> {
    try {
      // Check if we've already called this API for this user
      const hasCalledAutoFill = localStorage.getItem(this.AUTO_FILL_PROFILE_KEY);
      if (hasCalledAutoFill) {
        return; // Already called, skip
      }

      // TODO: Implement auto-fill profile API when available
      console.log('Auto-fill profile API not yet implemented');
      
      // Mark as called to prevent future calls
      localStorage.setItem(this.AUTO_FILL_PROFILE_KEY, 'true');
      
    } catch (error) {
      console.error('Failed to call auto-fill profile API:', error);
      // Don't throw error to avoid breaking the login flow
    }
  }

  /**
   * Initialize Firebase authentication
   */
  static initialize(): void {
    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      // Only handle Firebase auth state changes if we don't have phone auth
      const hasPhoneAuth = localStorage.getItem('user') && localStorage.getItem('authToken');
      
      if (user) {
        // User is signed in via Firebase
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(this.firebaseUserToAuthUser(user)));
        window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: user }));
      } else if (!hasPhoneAuth) {
        // User is signed out via Firebase AND we don't have phone auth
        this.currentUser = null;
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        window.dispatchEvent(new CustomEvent('userLoggedOut'));
      }
      // If user is null but we have phone auth, don't clear localStorage
    });

    // Also check for phone authentication on initialization
    this.refreshAuthState();
  }

  /**
   * Send verification code to phone number
   */
  static async sendPhoneCode(phoneNumber: string): Promise<PhoneAuthResponse> {
    try {
      if (!phoneNumber) {
        throw new Error('Phone number is required');
      }

      if (!this.isValidPhoneNumber(phoneNumber)) {
        throw new Error('Please enter a valid phone number');
      }

      // Get reCAPTCHA token
      const recaptchaToken = await getRecaptchaToken();

      const API_BASE_URL = 'http://localhost:8082';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/phone/send-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          recaptcha_token: recaptchaToken
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send verification code';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          const responseText = await response.text();
          console.error('Raw error response:', responseText);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data: PhoneAuthResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        const responseText = await response.text();
        console.error('Raw success response:', responseText);
        throw new Error('Invalid response format from server');
      }
      return data;
    } catch (error) {
      console.error('Send phone code failed:', error);
      throw error;
    }
  }

  /**
   * Verify phone number with code
   */
  static async verifyPhoneCode(phoneNumber: string, code: string, sessionInfo: string): Promise<AuthUser> {
    try {
      if (!phoneNumber || !code || !sessionInfo) {
        throw new Error('Phone number, code, and session info are required');
      }

      const API_BASE_URL = 'http://localhost:8082';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/phone/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          code: code,
          session_info: sessionInfo
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to verify code';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          const responseText = await response.text();
          console.error('Raw error response:', responseText);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data: PhoneVerifyResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        const responseText = await response.text();
        console.error('Raw success response:', responseText);
        throw new Error('Invalid response format from server');
      }
      
      // Convert API response to AuthUser
      const authUser: AuthUser = {
        uid: data.data.user.uid,
        phoneNumber: data.data.user.phone_number,
        displayName: data.data.user.name,
        isVerified: data.data.user.is_verified,
        photoURL: null,
        createdAt: data.data.user.created_at,
        lastLoginAt: new Date().toISOString(),
        id: data.data.user.id,
        isActive: data.data.user.is_active,
        isNewUser: data.data.user.is_new_user
      };
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(authUser));
      
      // Store auth token
      console.log('Storing auth token:', data.data.id_token ? 'Token present' : 'No token');
      localStorage.setItem('authToken', data.data.id_token);
      localStorage.setItem('refreshToken', data.data.refresh_token);
      
      // Verify token was stored
      const storedToken = localStorage.getItem('authToken');
      console.log('Token stored successfully:', !!storedToken);
      
      // Update current user state
      this.currentUser = {
        uid: authUser.uid,
        phoneNumber: authUser.phoneNumber,
        displayName: authUser.displayName,
        email: null, // Phone auth doesn't use email
        emailVerified: authUser.isVerified,
        photoURL: authUser.photoURL,
        metadata: {
          creationTime: authUser.createdAt,
          lastSignInTime: authUser.lastLoginAt
        }
      } as any; // Type assertion for compatibility
      
      // Dispatch login event to notify other components
      console.log('Dispatching userLoggedIn event with user:', authUser);
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: authUser }));
      
      // Call auto-fill profile API (only once)
      this.callAutoFillProfile();
      
      console.log('Phone authentication successful, user stored:', authUser);
      
      // Debug authentication state
      this.debugAuthState();
      
      return authUser;
    } catch (error) {
      console.error('Verify phone code failed:', error);
      throw error;
    }
  }

  /**
   * Complete phone authentication flow (send code + verify)
   */
  static async loginWithPhone(phoneNumber: string): Promise<{ sessionInfo: string }> {
    try {
      const response = await this.sendPhoneCode(phoneNumber);
      return { sessionInfo: response.data.session_info };
    } catch (error) {
      console.error('Phone login failed:', error);
      throw error;
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
      
      // Call auto-fill profile API (only once)
      this.callAutoFillProfile();
      
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
      // Call the logout API endpoint
      const API_BASE_URL = 'http://localhost:8082';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      // Firebase signout
      await signOut(auth);
      
      // Clear all stored data
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('cart');
      localStorage.removeItem('favorites');
      localStorage.removeItem(this.AUTO_FILL_PROFILE_KEY); // Clear auto-fill flag
      
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local data even if API call or Firebase logout fails
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('cart');
      localStorage.removeItem('favorites');
      localStorage.removeItem(this.AUTO_FILL_PROFILE_KEY); // Clear auto-fill flag
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
        console.log('Getting user from Firebase currentUser:', this.currentUser);
        return this.firebaseUserToAuthUser(this.currentUser);
      }
      
      // Fallback to stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('Getting user from localStorage:', user);
        // If we have a stored user but no Firebase user, 
        // it means the page was refreshed and Firebase needs to re-authenticate
        if (user && user.uid) {
          return user;
        }
      }
      
      console.log('No user found');
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
      console.log('User authenticated via Firebase currentUser');
      return true;
    }
    
    // Fallback to stored user data
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        const isAuth = !!(user && user.uid && storedToken);
        console.log('User authentication check via localStorage:', isAuth, 'User:', user, 'Token:', !!storedToken);
        return isAuth;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return false;
      }
    }
    
    console.log('User not authenticated - missing user data or token');
    console.log('Stored user:', !!storedUser);
    console.log('Stored token:', !!storedToken);
    return false;
  }

  /**
   * Get ID token for API calls (works for both Firebase and phone auth)
   */
  static async getIdToken(): Promise<string | null> {
    try {
      // First, try to get the stored token (works for phone auth)
      const storedToken = localStorage.getItem('authToken');
      console.log('getIdToken called - stored token available:', !!storedToken);
      if (storedToken) {
        console.log('Using stored auth token for API calls, length:', storedToken.length);
        return storedToken;
      }
      
      // Fallback to Firebase token if available
      if (this.currentUser && typeof this.currentUser.getIdToken === 'function') {
        const token = await this.currentUser.getIdToken();
        // Store the token in localStorage for API calls
        if (token) {
          localStorage.setItem('authToken', token);
        }
        return token;
      }
      
      console.log('No auth token available - checking localStorage keys:', Object.keys(localStorage));
      return null;
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  /**
   * Debug method to check authentication state
   */
  static debugAuthState(): void {
    console.log('=== AUTH DEBUG ===');
    console.log('Current user:', this.currentUser);
    console.log('Stored user:', localStorage.getItem('user'));
    console.log('Auth token:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
    console.log('Refresh token:', localStorage.getItem('refreshToken') ? 'Present' : 'Missing');
    console.log('Is authenticated:', this.isAuthenticated());
    console.log('==================');
  }

  /**
   * Force refresh authentication state from localStorage
   */
  static refreshAuthState(): void {
    console.log('=== REFRESHING AUTH STATE ===');
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('authToken');
    
    console.log('Stored user exists:', !!storedUser);
    console.log('Stored token exists:', !!storedToken);
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        console.log('Parsed user:', user);
        
        this.currentUser = {
          uid: user.uid,
          phoneNumber: user.phoneNumber,
          displayName: user.displayName,
          email: null,
          emailVerified: user.isVerified,
          photoURL: user.photoURL,
          metadata: {
            creationTime: user.createdAt,
            lastSignInTime: user.lastLoginAt
          }
        } as any;
        
        console.log('Authentication state refreshed from localStorage');
        console.log('Current user set to:', this.currentUser);
        this.debugAuthState();
      } catch (error) {
        console.error('Error refreshing auth state:', error);
      }
    } else {
      console.log('No stored user or token found, cannot refresh auth state');
    }
  }

  /**
   * Test method to verify authentication and token
   */
  static async testAuth(): Promise<void> {
    console.log('=== AUTH TEST ===');
    this.debugAuthState();
    
    const token = await this.getIdToken();
    console.log('Token available:', !!token);
    if (token) {
      console.log('Token length:', token.length);
      console.log('Token preview:', token.substring(0, 50) + '...');
    }
    
    // Test API call
    try {
      const response = await fetch('http://localhost:8082/api/v1/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('API test response status:', response.status);
    } catch (error) {
      console.error('API test failed:', error);
    }
    console.log('================');
  }

  /**
   * Test method to verify token is working
   */
  static async testToken(): Promise<void> {
    try {
      const token = await this.getIdToken();
      console.log('Test token result:', token ? 'Token available' : 'No token');
      if (token) {
        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 50) + '...');
      }
    } catch (error) {
      console.error('Token test failed:', error);
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
   * Check if user has verified phone
   */
  static isPhoneVerified(): boolean {
    try {
      const storedUser = this.getStoredUser();
      return storedUser?.isVerified || false;
    } catch (error) {
      console.error('Error checking phone verification:', error);
      return false;
    }
  }

  /**
   * Get user's phone number
   */
  static getUserPhoneNumber(): string {
    try {
      const storedUser = this.getStoredUser();
      return storedUser?.phoneNumber || '';
    } catch (error) {
      console.error('Error getting user phone number:', error);
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
   * Convert Firebase user to AuthUser (for Google OAuth)
   */
  private static firebaseUserToAuthUser(firebaseUser: FirebaseUser): AuthUser {
    return {
      uid: firebaseUser.uid,
      phoneNumber: firebaseUser.phoneNumber,
      displayName: firebaseUser.displayName,
      isVerified: firebaseUser.emailVerified, // For Google OAuth, email verification is used
      photoURL: firebaseUser.photoURL,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
      lastLoginAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
      id: firebaseUser.uid, // Use UID as ID for Google OAuth users
      isActive: true,
      isNewUser: false
    };
  }

  /**
   * Validate phone number format
   */
  private static isValidPhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation - should start with + and have 10-15 digits
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phoneNumber);
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

}

// Make test method available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testAuth = () => AuthService.testAuth();
  (window as any).debugAuth = () => AuthService.debugAuthState();
  (window as any).refreshAuth = () => AuthService.refreshAuthState();
}

export default AuthService; 