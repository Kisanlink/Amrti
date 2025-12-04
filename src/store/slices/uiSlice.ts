import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

export interface Modal {
  id: string;
  type: string;
  isOpen: boolean;
  data?: any;
}

export interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  
  // Modal states
  modals: Modal[];
  
  // Notifications
  notifications: Notification[];
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;
  
  // Theme and appearance
  theme: 'light' | 'dark';
  language: string;
  
  // Mobile state
  isMobile: boolean;
  isTablet: boolean;
  
  // Cart popup
  cartPopupOpen: boolean;
  
  // Search state
  searchOpen: boolean;
  
  // Error states
  globalError: string | null;
}

// Initial state
const initialState: UIState = {
  sidebarOpen: false,
  modals: [],
  notifications: [],
  globalLoading: false,
  loadingMessage: null,
  theme: 'light',
  language: 'en',
  isMobile: false,
  isTablet: false,
  cartPopupOpen: false,
  searchOpen: false,
  globalError: null,
};

// UI slice
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    
    // Modal actions
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      const existingModal = state.modals.find(modal => modal.type === action.payload.type);
      if (existingModal) {
        existingModal.isOpen = true;
        existingModal.data = action.payload.data;
      } else {
        state.modals.push({
          id: `${action.payload.type}_${Date.now()}`,
          type: action.payload.type,
          isOpen: true,
          data: action.payload.data,
        });
      }
    },
    closeModal: (state, action: PayloadAction<string>) => {
      const modal = state.modals.find(modal => modal.id === action.payload);
      if (modal) {
        modal.isOpen = false;
      }
    },
    closeModalByType: (state, action: PayloadAction<string>) => {
      const modal = state.modals.find(modal => modal.type === action.payload);
      if (modal) {
        modal.isOpen = false;
      }
    },
    clearAllModals: (state) => {
      state.modals = [];
    },
    
    // Notification actions
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },
    
    // Loading actions
    setGlobalLoading: (state, action: PayloadAction<{ loading: boolean; message?: string }>) => {
      state.globalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || null;
    },
    
    // Theme actions
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // Language actions
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    
    // Device detection
    setDeviceType: (state, action: PayloadAction<{ isMobile: boolean; isTablet: boolean }>) => {
      state.isMobile = action.payload.isMobile;
      state.isTablet = action.payload.isTablet;
    },
    
    // Cart popup actions
    setCartPopupOpen: (state, action: PayloadAction<boolean>) => {
      state.cartPopupOpen = action.payload;
    },
    toggleCartPopup: (state) => {
      state.cartPopupOpen = !state.cartPopupOpen;
    },
    
    // Search actions
    setSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.searchOpen = action.payload;
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen;
    },
    
    // Error actions
    setGlobalError: (state, action: PayloadAction<string | null>) => {
      state.globalError = action.payload;
    },
    clearGlobalError: (state) => {
      state.globalError = null;
    },
    
    // Reset UI state
    resetUI: (state) => {
      state.sidebarOpen = false;
      state.modals = [];
      state.notifications = [];
      state.globalLoading = false;
      state.loadingMessage = null;
      state.cartPopupOpen = false;
      state.searchOpen = false;
      state.globalError = null;
    },
  },
});

export const {
  // Sidebar
  toggleSidebar,
  setSidebarOpen,
  
  // Modals
  openModal,
  closeModal,
  closeModalByType,
  clearAllModals,
  
  // Notifications
  addNotification,
  removeNotification,
  clearAllNotifications,
  
  // Loading
  setGlobalLoading,
  
  // Theme
  setTheme,
  toggleTheme,
  
  // Language
  setLanguage,
  
  // Device
  setDeviceType,
  
  // Cart popup
  setCartPopupOpen,
  toggleCartPopup,
  
  // Search
  setSearchOpen,
  toggleSearch,
  
  // Error
  setGlobalError,
  clearGlobalError,
  
  // Reset
  resetUI,
} = uiSlice.actions;

export default uiSlice.reducer;




