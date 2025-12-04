import { 
  updateProfile,
  User as FirebaseUser,
  UserCredential
} from 'firebase/auth';
import { getAuth, getFirebase, getRecaptchaToken, initializeRecaptcha, clearRecaptcha, initializeFirebase } from '../config/firebase';

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

  /**
   * Initialize Firebase authentication
   */
  static async initialize(): Promise<void> {
    try {
      // Initialize Firebase first
      await initializeFirebase();
      
      // Listen to auth state changes
      const auth = await getAuth();
      auth.onAuthStateChanged((user: any) => {
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
    } catch (error) {
      console.error('AuthService initialization failed:', error);
    }
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

      // Initialize reCAPTCHA first
      console.log('Initializing reCAPTCHA...');
      
      // Check if the recaptcha container exists
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        throw new Error('reCAPTCHA container not found. Please ensure the form is properly rendered.');
      }
      
      try {
        await initializeRecaptcha();
        console.log('reCAPTCHA initialized successfully');
      } catch (initError: any) {
        console.error('reCAPTCHA initialization error:', initError);
        throw new Error(initError.message || 'Failed to initialize reCAPTCHA. Please refresh the page.');
      }
      
      // Wait a moment for reCAPTCHA to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get reCAPTCHA token
      console.log('Getting reCAPTCHA token...');
      let recaptchaToken: string;
      try {
        recaptchaToken = await getRecaptchaToken();
        console.log('reCAPTCHA token obtained successfully');
      } catch (tokenError: any) {
        console.error('reCAPTCHA token error:', tokenError);
        clearRecaptcha(); // Reset verifier
        throw new Error(tokenError.message || 'Failed to get reCAPTCHA token. Please try again.');
      }

      // Import API config dynamically to avoid circular dependencies
      const { buildApiUrl } = await import('../config/apiConfig');
      const requestBody = {
        phone_number: phoneNumber,
        recaptcha_token: recaptchaToken
      };
      
      console.log('Sending phone code request:', requestBody);
      
      const response = await fetch(buildApiUrl('/auth/phone/send-code'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
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

      // Import API config dynamically to avoid circular dependencies
      const { buildApiUrl } = await import('../config/apiConfig');
      const response = await fetch(buildApiUrl('/auth/phone/verify-code'), {
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
      
      // Migrate guest cart to user account BEFORE dispatching login event
      // This ensures the cart is migrated before any components react to the login
      try {
        const { CartService } = await import('./cartService');
        const migratedCart = await CartService.migrateGuestCart();
        console.log('Cart migration completed before login event:', migratedCart);
      } catch (error) {
        console.error('Failed to migrate guest cart:', error);
        // Don't throw error as this shouldn't block the login process
      }
      
      // Dispatch login event to notify other components AFTER cart migration
      console.log('Dispatching userLoggedIn event with user:', authUser);
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: authUser }));
      
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
      const auth = await getAuth();
      const firebase = await getFirebase();
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      
      const authUser = this.firebaseUserToAuthUser(result.user);
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(authUser));
      
      // Store auth token
      try {
        const token = await result.user.getIdToken();
        if (token) {
          localStorage.setItem('authToken', token);
        }
      } catch (error) {
        console.warn('Failed to store auth token:', error);
      }
      
      // Migrate guest cart to user account BEFORE dispatching login event
      // This ensures the cart is migrated before any components react to the login
      try {
        const { CartService } = await import('./cartService');
        const migratedCart = await CartService.migrateGuestCart();
        console.log('Cart migration completed before login event:', migratedCart);
      } catch (error) {
        console.error('Failed to migrate guest cart:', error);
        // Don't throw error as this shouldn't block the login process
      }
      
      // Dispatch login event AFTER cart migration
      window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: authUser }));
      
      return authUser;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw this.handleFirebaseError(error);
    }
  }

  /**
   * Admin login with email and password
   */
  static async adminLogin(email: string, password: string): Promise<AuthUser> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Import API config dynamically to avoid circular dependencies
      const { API_BASE_URL } = await import('../config/apiConfig');
      const requestBody = {
        email,
        password
      };

      console.log('Sending admin login request:', { email });

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to login';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      let data: any;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse success response:', parseError);
        throw new Error('Failed to parse server response');
      }

      console.log('Admin login response:', data);

      // Extract token and user data from response based on actual API structure
      const token = data.data?.tokens?.id_token || data.data?.token || data.token || data.data?.id_token;
      const userData = data.data?.user || data.user;
      const userRole = userData?.role || '';

      if (!token) {
        throw new Error('No authentication token received from server');
      }

      if (!userData) {
        throw new Error('No user data received from server');
      }

      // Store token
      localStorage.setItem('authToken', token);
      
      // Store refresh token if available
      const refreshToken = data.data?.tokens?.refresh_token || data.data?.refresh_token;
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Create AuthUser object from response
      const authUser: AuthUser = {
        uid: userData.uid || userData.id || 'admin',
        phoneNumber: userData.phone_number || null,
        displayName: userData.name || userData.displayName || email.split('@')[0],
        isVerified: userData.is_verified !== false || userData.email_verified !== false,
        photoURL: userData.photo_url || userData.photoURL || null,
        createdAt: userData.created_at ? new Date(userData.created_at).toISOString() : new Date().toISOString(),
        lastLoginAt: userData.last_login ? new Date(userData.last_login).toISOString() : new Date().toISOString(),
        id: userData.id || userData.uid || 'admin',
        isActive: userData.is_active !== false,
        isNewUser: userData.is_new_user || false,
      };

      // Store user data with role
      const userWithRole = {
        ...authUser,
        role: userRole,
        email: userData.email || email,
        name: userData.name || userData.displayName || authUser.displayName || null, // Store name field separately
      };
      localStorage.setItem('user', JSON.stringify(userWithRole));
      localStorage.setItem('userRole', userRole); // Store role separately for easy access
      
      this.currentUser = authUser as any;

      // Migrate guest cart to user account BEFORE dispatching login event (only for non-admin users)
      // This ensures the cart is migrated before any components react to the login
      if (userRole !== 'Admin') {
        try {
          const { CartService } = await import('./cartService');
          const migratedCart = await CartService.migrateGuestCart();
          console.log('Cart migration completed before login event:', migratedCart);
        } catch (error) {
          console.error('Failed to migrate guest cart:', error);
          // Don't throw error as this shouldn't block the login process
        }
      }

      // Dispatch login event with role information AFTER cart migration
      window.dispatchEvent(new CustomEvent('userLoggedIn', { 
        detail: { ...authUser, role: userRole } 
      }));

      // Return auth user with role
      return { ...authUser, role: userRole } as any;
    } catch (error) {
      console.error('Admin login failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      // Import API config dynamically to avoid circular dependencies
      const { buildApiUrl } = await import('../config/apiConfig');
      
      // Try to get a valid Firebase ID token for logout
      // First try to get from Firebase if user is signed in
      let token: string | null = null;
      try {
        if (this.currentUser && typeof this.currentUser.getIdToken === 'function') {
          token = await this.currentUser.getIdToken();
        } else {
          // Fallback to stored token, but only if it looks like a Firebase ID token
          const storedToken = localStorage.getItem('authToken');
          // Firebase ID tokens are JWT with 3 segments (header.payload.signature)
          if (storedToken && storedToken.split('.').length === 3) {
            token = storedToken;
          }
        }
      } catch (tokenError) {
        console.warn('Could not get valid token for logout:', tokenError);
        // Continue with logout even without token
      }
      
      // Call the logout API endpoint only if we have a valid token
      if (token) {
        try {
          const response = await fetch(buildApiUrl('/auth/logout'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.warn('Logout API call failed, but continuing with local logout:', errorData);
          }
        } catch (apiError) {
          console.warn('Logout API call error, but continuing with local logout:', apiError);
          // Continue with local logout even if API call fails
        }
      } else {
        console.warn('No valid token available for logout API call, proceeding with local logout only');
      }

      // Firebase signout (this might fail if user wasn't signed in via Firebase)
      try {
        const auth = await getAuth();
        await auth.signOut();
      } catch (firebaseError) {
        console.warn('Firebase signout failed (user might not be signed in via Firebase):', firebaseError);
        // Continue with logout even if Firebase signout fails
      }
      
      // Clear all stored data
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('cart');
      localStorage.removeItem('favorites');
      
      // Reset current user
      this.currentUser = null;
      
      // Dispatch logout event with counter reset
      window.dispatchEvent(new CustomEvent('userLoggedOut', { 
        detail: { resetCounters: true } 
      }));
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local data even if API call or Firebase logout fails
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('cart');
      localStorage.removeItem('favorites');
      this.currentUser = null;
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
      // Don't throw error - logout should always succeed locally
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
    
    // Import API config dynamically to avoid circular dependencies
    const { buildApiUrl } = await import('../config/apiConfig');
    // Test API call
    try {
      const response = await fetch(buildApiUrl('/favorites'), {
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
        const auth = await getAuth();
        await auth.currentUser.updateProfile(updates);
        
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