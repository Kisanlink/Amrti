import { store } from '../store';
import { 
  initializeAuth, 
  loginWithPhone, 
  verifyPhoneCode, 
  googleSignIn, 
  logout, 
  refreshAuthState,
  setUser,
  setToken,
  clearAuth
} from '../store/slices/authSlice';
import { migrateGuestCart } from '../store/slices/cartSlice';
import AuthService from './authService';

// Redux-aware AuthService wrapper
export class ReduxAuthService {
  /**
   * Initialize authentication with Redux integration
   */
  static async initialize() {
    try {
      // Initialize the original AuthService
      await AuthService.initialize();
      
      // Dispatch Redux action
      const result = await store.dispatch(initializeAuth());
      
      // Set up auth state listeners
      this.setupAuthListeners();
      
      return result;
    } catch (error) {
      console.error('Redux AuthService initialization failed:', error);
      throw error;
    }
  }

  /**
   * Login with phone number using Redux
   */
  static async loginWithPhone(phoneNumber: string) {
    try {
      const result = await store.dispatch(loginWithPhone(phoneNumber));
      return result.payload;
    } catch (error) {
      console.error('Redux phone login failed:', error);
      throw error;
    }
  }

  /**
   * Verify phone code using Redux
   */
  static async verifyPhoneCode(phoneNumber: string, code: string, sessionInfo: string) {
    try {
      const result = await store.dispatch(verifyPhoneCode({ phoneNumber, code, sessionInfo }));
      
      // Migrate guest cart after successful login
      if (result.payload) {
        store.dispatch(migrateGuestCart());
      }
      
      return result.payload;
    } catch (error) {
      console.error('Redux phone verification failed:', error);
      throw error;
    }
  }

  /**
   * Google sign in using Redux
   */
  static async googleSignIn() {
    try {
      const result = await store.dispatch(googleSignIn());
      
      // Migrate guest cart after successful login
      if (result.payload) {
        store.dispatch(migrateGuestCart());
      }
      
      return result.payload;
    } catch (error) {
      console.error('Redux Google sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Logout using Redux
   */
  static async logout() {
    try {
      await store.dispatch(logout());
    } catch (error) {
      console.error('Redux logout failed:', error);
      throw error;
    }
  }

  /**
   * Refresh auth state using Redux
   */
  static async refreshAuthState() {
    try {
      const result = await store.dispatch(refreshAuthState());
      return result.payload;
    } catch (error) {
      console.error('Redux refresh auth state failed:', error);
      throw error;
    }
  }

  /**
   * Get current user from Redux store
   */
  static getCurrentUser() {
    const state = store.getState();
    return state.auth.user;
  }

  /**
   * Get auth token from Redux store
   */
  static getAuthToken() {
    const state = store.getState();
    return state.auth.token;
  }

  /**
   * Check if user is authenticated from Redux store
   */
  static isAuthenticated() {
    const state = store.getState();
    return state.auth.isAuthenticated;
  }

  /**
   * Get auth loading state from Redux store
   */
  static isLoading() {
    const state = store.getState();
    return state.auth.isLoading;
  }

  /**
   * Get auth error from Redux store
   */
  static getError() {
    const state = store.getState();
    return state.auth.error;
  }

  /**
   * Clear auth error
   */
  static clearError() {
    store.dispatch({ type: 'auth/clearError' });
  }

  /**
   * Set up auth state listeners
   */
  private static setupAuthListeners() {
    // Listen for auth state changes from the original AuthService
    window.addEventListener('userLoggedIn', (event: any) => {
      const user = event.detail;
      if (user) {
        store.dispatch(setUser(user));
        // Get and set token
        AuthService.getIdToken().then(token => {
          if (token) {
            store.dispatch(setToken(token));
          }
        });
      }
    });

    window.addEventListener('userLoggedOut', () => {
      store.dispatch(clearAuth());
    });
  }

  /**
   * Update user profile using Redux
   */
  static async updateProfile(updates: { displayName?: string; photoURL?: string }) {
    try {
      await AuthService.updateProfile(updates);
      
      // Update Redux store
      const user = AuthService.getCurrentUser();
      if (user) {
        store.dispatch(setUser(user));
      }
      
      return user;
    } catch (error) {
      console.error('Redux update profile failed:', error);
      throw error;
    }
  }

  /**
   * Check if phone is verified
   */
  static isPhoneVerified() {
    return AuthService.isPhoneVerified();
  }

  /**
   * Get user phone number
   */
  static getUserPhoneNumber() {
    return AuthService.getUserPhoneNumber();
  }

  /**
   * Get user name
   */
  static getUserName() {
    return AuthService.getUserName();
  }

  /**
   * Get user ID
   */
  static getUserId() {
    return AuthService.getUserId();
  }

  /**
   * Get ID token for API calls
   */
  static async getIdToken() {
    return AuthService.getIdToken();
  }

  /**
   * Debug auth state
   */
  static debugAuthState() {
    const state = store.getState();
    console.log('Redux Auth State:', state.auth);
    AuthService.debugAuthState();
  }
}

export default ReduxAuthService;
