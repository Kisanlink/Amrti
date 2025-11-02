import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CounterState {
  cartCount: number;
  wishlistCount: number;
}

const initialState: CounterState = {
  cartCount: 0,
  wishlistCount: 0,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setCartCount: (state, action: PayloadAction<number>) => {
      state.cartCount = action.payload;
    },
    incrementCartCount: (state, action: PayloadAction<number> = { payload: 1 } as PayloadAction<number>) => {
      state.cartCount += action.payload || 1;
    },
    decrementCartCount: (state, action: PayloadAction<number> = { payload: 1 } as PayloadAction<number>) => {
      state.cartCount = Math.max(0, state.cartCount - (action.payload || 1));
    },
    setWishlistCount: (state, action: PayloadAction<number>) => {
      state.wishlistCount = action.payload;
    },
    incrementWishlistCount: (state, action: PayloadAction<number> = { payload: 1 } as PayloadAction<number>) => {
      state.wishlistCount += action.payload || 1;
    },
    decrementWishlistCount: (state, action: PayloadAction<number> = { payload: 1 } as PayloadAction<number>) => {
      state.wishlistCount = Math.max(0, state.wishlistCount - (action.payload || 1));
    },
    resetCounters: (state) => {
      state.cartCount = 0;
      state.wishlistCount = 0;
    },
  },
});

export const {
  setCartCount,
  incrementCartCount,
  decrementCartCount,
  setWishlistCount,
  incrementWishlistCount,
  decrementWishlistCount,
  resetCounters,
} = counterSlice.actions;

export default counterSlice.reducer;

