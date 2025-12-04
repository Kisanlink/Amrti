/**
 * API Configuration
 * 
 * This file centralizes all API configuration including base URL.
 * The base URL is read from environment variables.
 * 
 * Required environment variable: VITE_API_URL
 * 
 * Create a .env file in the root directory with:
 * VITE_API_URL=http://localhost:8082
 * 
 * For production, set:
 * VITE_API_URL=https://api.amrti.com
 */

// Get API base URL from environment variable
const envApiUrl = import.meta.env.VITE_API_URL;

// Validate that environment variable is set
if (!envApiUrl) {
  const errorMessage = 
    'VITE_API_URL environment variable is not set.\n' +
    'Please create a .env file in the root directory with:\n' +
    'VITE_API_URL=http://localhost:8082\n\n' +
    'For production, use your production API URL.';
  
  console.error(errorMessage);
  
  // In production, throw an error to prevent the app from running with wrong config
  if (import.meta.env.PROD) {
    throw new Error(errorMessage);
  }
  
  // In development, show warning but allow fallback
  console.warn(
    '⚠️  VITE_API_URL not set. Using fallback for development only.\n' +
    'Please set VITE_API_URL in your .env file to avoid this warning.'
  );
}

// Export API base URL
// In production, envApiUrl must be set (error thrown above if not)
// In development, fallback to localhost:8082 if not set (with warning)
export const API_BASE_URL: string = envApiUrl || (
  import.meta.env.PROD 
    ? (() => {
        throw new Error(
          'VITE_API_URL environment variable is required in production. ' +
          'Please set it in your environment configuration.'
        );
      })()
    : 'http://localhost:8082'
);

export const API_VERSION = 'v1';

// Full API base path
export const API_BASE_PATH = `${API_BASE_URL}/api/${API_VERSION}`;

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/api/${API_VERSION}/${cleanEndpoint}`;
};

