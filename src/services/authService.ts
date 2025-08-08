export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Mock user data for demonstration
const mockUsers = [
  {
    id: '1',
    username: 'demo_user',
    fullName: 'Demo User',
    email: 'demo@example.com',
    mobileNumber: '+91 9876543210',
    createdAt: '2024-01-01T00:00:00.000Z'
  }
];

// Get user from localStorage
export const getCurrentUser = (): User | null => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch (err) {
      console.error('Error loading user from localStorage:', err);
    }
  }
  return null;
};

// Save user to localStorage
const saveUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Login function
export const login = async (username: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock authentication logic
  const user = mockUsers.find(u => u.username === username);
  
  if (!user) {
    throw new Error('Invalid username or password');
  }
  
  // In a real app, you would verify the password here
  if (password !== 'password') {
    throw new Error('Invalid username or password');
  }
  
  saveUser(user);
  return user;
};

// Signup function
export const signup = async (userData: {
  username: string;
  fullName: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
}): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Validate password confirmation
  if (userData.password !== userData.confirmPassword) {
    throw new Error('Passwords do not match');
  }
  
  // Check if username already exists
  const existingUser = mockUsers.find(u => u.username === userData.username);
  if (existingUser) {
    throw new Error('Username already exists');
  }
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    username: userData.username,
    fullName: userData.fullName,
    email: `${userData.username}@example.com`, // Mock email
    mobileNumber: userData.mobileNumber,
    createdAt: new Date().toISOString()
  };
  
  // Add to mock users (in real app, this would be saved to database)
  mockUsers.push(newUser);
  
  saveUser(newUser);
  return newUser;
};

// Logout function
export const logout = (): void => {
  saveUser(null);
};

// Forgot password function
export const forgotPassword = async (email: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock implementation - in real app, this would send a reset email
  const user = mockUsers.find(u => u.email === email);
  if (!user) {
    throw new Error('Email not found');
  }
  
  // In a real app, you would send a password reset email here
  console.log(`Password reset email sent to ${email}`);
};

// Reset password function
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock implementation - in real app, this would verify the token and update password
  console.log(`Password reset with token: ${token}`);
}; 