import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AuthService from '../../services/authService';
import { queryKeys, handleQueryError, handleQuerySuccess } from '../../lib/queryClient';
import type { AuthUser } from '../../store/slices/authSlice';

// Get current user
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      try {
        const user = AuthService.getCurrentUser();
        return user;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });
};

// Get auth token
export const useAuthToken = () => {
  return useQuery({
    queryKey: queryKeys.auth.token,
    queryFn: async () => {
      try {
        const token = await AuthService.getIdToken();
        return token;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

// Check if user is authenticated
export const useIsAuthenticated = () => {
  return useQuery({
    queryKey: ['auth', 'isAuthenticated'],
    queryFn: async () => {
      try {
        const isAuth = AuthService.isAuthenticated();
        return isAuth;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
};

// Phone login (send code)
export const usePhoneLogin = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (phoneNumber: string) => {
      try {
        const result = await AuthService.loginWithPhone(phoneNumber);
        return result;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      handleQuerySuccess(data, 'Verification code sent successfully');
    },
    onError: (error) => {
      console.error('Phone login error:', error);
    },
  });
};

// Verify phone code
export const useVerifyPhoneCode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      phoneNumber,
      code,
      sessionInfo,
    }: {
      phoneNumber: string;
      code: string;
      sessionInfo: string;
    }) => {
      try {
        const user = await AuthService.verifyPhoneCode(phoneNumber, code, sessionInfo);
        return user;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (user) => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.token });
      queryClient.invalidateQueries({ queryKey: ['auth', 'isAuthenticated'] });
      
      // Update user cache
      queryClient.setQueryData(queryKeys.auth.user, user);
      
      handleQuerySuccess(user, 'Login successful');
    },
    onError: (error) => {
      console.error('Phone verification error:', error);
    },
  });
};

// Google sign in
export const useGoogleSignIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        const user = await AuthService.googleSignIn();
        return user;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (user) => {
      // Invalidate auth queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.token });
      queryClient.invalidateQueries({ queryKey: ['auth', 'isAuthenticated'] });
      
      // Update user cache
      queryClient.setQueryData(queryKeys.auth.user, user);
      
      handleQuerySuccess(user, 'Google sign-in successful');
    },
    onError: (error) => {
      console.error('Google sign-in error:', error);
    },
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        await AuthService.logout();
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: queryKeys.auth.user });
      queryClient.removeQueries({ queryKey: queryKeys.auth.token });
      queryClient.removeQueries({ queryKey: ['auth', 'isAuthenticated'] });
      
      // Clear cart queries (since cart is user-specific)
      queryClient.removeQueries({ queryKey: queryKeys.cart.all });
      queryClient.removeQueries({ queryKey: queryKeys.cart.items });
      queryClient.removeQueries({ queryKey: queryKeys.cart.summary });
      queryClient.removeQueries({ queryKey: queryKeys.cart.count });
      
      // Clear other user-specific queries
      queryClient.removeQueries({ queryKey: queryKeys.favorites.all });
      queryClient.removeQueries({ queryKey: queryKeys.orders.all });
      queryClient.removeQueries({ queryKey: queryKeys.profile.all });
      
      handleQuerySuccess(null, 'Logged out successfully');
    },
    onError: (error) => {
      console.error('Logout error:', error);
    },
  });
};

// Refresh auth state
export const useRefreshAuthState = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      try {
        AuthService.refreshAuthState();
        const user = AuthService.getCurrentUser();
        const token = await AuthService.getIdToken();
        return { user, token };
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (data) => {
      // Update auth caches
      queryClient.setQueryData(queryKeys.auth.user, data.user);
      queryClient.setQueryData(queryKeys.auth.token, data.token);
      queryClient.setQueryData(['auth', 'isAuthenticated'], !!data.user);
    },
    onError: (error) => {
      console.error('Refresh auth state error:', error);
    },
  });
};

// Update user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: { displayName?: string; photoURL?: string }) => {
      try {
        await AuthService.updateProfile(updates);
        const user = AuthService.getCurrentUser();
        return user;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    onSuccess: (user) => {
      // Update user cache
      queryClient.setQueryData(queryKeys.auth.user, user);
      
      handleQuerySuccess(user, 'Profile updated successfully');
    },
    onError: (error) => {
      console.error('Update profile error:', error);
    },
  });
};

// Check phone verification status
export const usePhoneVerificationStatus = () => {
  return useQuery({
    queryKey: ['auth', 'phoneVerification'],
    queryFn: async () => {
      try {
        const isVerified = AuthService.isPhoneVerified();
        return isVerified;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get user phone number
export const useUserPhoneNumber = () => {
  return useQuery({
    queryKey: ['auth', 'phoneNumber'],
    queryFn: async () => {
      try {
        const phoneNumber = AuthService.getUserPhoneNumber();
        return phoneNumber;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get user name
export const useUserName = () => {
  return useQuery({
    queryKey: ['auth', 'userName'],
    queryFn: async () => {
      try {
        const name = AuthService.getUserName();
        return name;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Get user ID
export const useUserId = () => {
  return useQuery({
    queryKey: ['auth', 'userId'],
    queryFn: async () => {
      try {
        const id = AuthService.getUserId();
        return id;
      } catch (error) {
        throw handleQueryError(error);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};



