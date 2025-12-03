/**
 * API Configuration
 * 
 * This file centralizes all API configuration including base URL.
 * The base URL is read from environment variables with a fallback to localhost for development.
 */

// Get API base URL from environment variable, with fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';
export const API_VERSION = 'v1';

// Full API base path
export const API_BASE_PATH = `${API_BASE_URL}/api/${API_VERSION}`;

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/api/${API_VERSION}/${cleanEndpoint}`;
};

