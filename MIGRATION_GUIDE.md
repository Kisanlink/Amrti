# Redux + React Query Migration Guide

This guide explains how to migrate the existing codebase to use Redux Toolkit and React Query (TanStack Query) for state management and data fetching.

## 🏗️ Architecture Overview

### Redux Toolkit
- **State Management**: Global application state
- **Slices**: Modular state management (auth, cart, products, ui)
- **Async Thunks**: Handle async operations with Redux
- **DevTools**: Time-travel debugging and state inspection

### React Query
- **Data Fetching**: Server state management and caching
- **Mutations**: Optimistic updates and error handling
- **Background Refetching**: Automatic data synchronization
- **DevTools**: Query cache inspection and debugging

## 📁 New File Structure

```
src/
├── store/
│   ├── index.ts                 # Store configuration
│   └── slices/
│       ├── authSlice.ts         # Authentication state
│       ├── cartSlice.ts         # Cart state (guest + authenticated)
│       ├── productsSlice.ts     # Products state
│       └── uiSlice.ts           # UI state (modals, notifications, etc.)
├── hooks/
│   └── queries/
│       ├── useAuth.ts           # Auth-related queries and mutations
│       ├── useCart.ts           # Cart-related queries and mutations
│       └── useProducts.ts       # Product-related queries and mutations
├── lib/
│   └── queryClient.ts           # React Query configuration
└── services/
    ├── reduxAuthService.ts      # Redux-aware AuthService wrapper
    └── reduxCartService.ts      # Redux-aware CartService wrapper
```

## 🔄 Migration Steps

### 1. Replace Service Calls with Redux + React Query

#### Before (Old Service Pattern):
```typescript
// Old way
import AuthService from '../services/authService';

const handleLogin = async () => {
  try {
    const user = await AuthService.loginWithPhone(phoneNumber);
    // Manual state management
  } catch (error) {
    // Manual error handling
  }
};
```

#### After (Redux + React Query):
```typescript
// New way
import { useAppDispatch } from '../store';
import { usePhoneLogin } from '../hooks/queries/useAuth';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const phoneLoginMutation = usePhoneLogin();
  
  const handleLogin = async () => {
    try {
      await phoneLoginMutation.mutateAsync(phoneNumber);
      // State automatically managed by Redux
    } catch (error) {
      // Error automatically handled by React Query
    }
  };
};
```

### 2. Replace Context with Redux Selectors

#### Before (Context Pattern):
```typescript
// Old way
import { useApp } from '../context/AppContext';

const MyComponent = () => {
  const { state, dispatch } = useApp();
  const cartItems = state.cart;
  const user = state.user;
};
```

#### After (Redux Selectors):
```typescript
// New way
import { useAppSelector } from '../store';

const MyComponent = () => {
  const cartItems = useAppSelector(state => state.cart.items);
  const user = useAppSelector(state => state.auth.user);
  const isLoading = useAppSelector(state => state.cart.isLoading);
};
```

### 3. Replace Manual API Calls with React Query Hooks

#### Before (Manual API Calls):
```typescript
// Old way
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetchProducts();
}, []);
```

#### After (React Query Hooks):
```typescript
// New way
import { useProducts } from '../hooks/queries/useProducts';

const MyComponent = () => {
  const { data: products, isLoading, error } = useProducts(1);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* Render products */}</div>;
};
```

## 🎯 Key Benefits

### 1. **Automatic State Management**
- No more manual state updates
- Redux handles all state changes automatically
- Time-travel debugging with Redux DevTools

### 2. **Intelligent Caching**
- React Query caches API responses automatically
- Background refetching keeps data fresh
- Optimistic updates for better UX

### 3. **Error Handling**
- Centralized error handling
- Automatic retry logic
- User-friendly error messages

### 4. **Performance Optimization**
- Prevents unnecessary re-renders
- Intelligent query invalidation
- Background synchronization

### 5. **Developer Experience**
- Redux DevTools for state inspection
- React Query DevTools for cache management
- TypeScript support throughout

## 🔧 Usage Examples

### Authentication
```typescript
import { useCurrentUser, useIsAuthenticated, useLogout } from '../hooks/queries/useAuth';

const AuthComponent = () => {
  const { data: user, isLoading } = useCurrentUser();
  const { data: isAuthenticated } = useIsAuthenticated();
  const logoutMutation = useLogout();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.displayName}!</p>
          <button onClick={() => logoutMutation.mutate()}>
            Logout
          </button>
        </div>
      ) : (
        <div>Please login</div>
      )}
    </div>
  );
};
```

### Cart Management
```typescript
import { useCart, useAddToCart, useRemoveFromCart } from '../hooks/queries/useCart';
import { useAppSelector } from '../store';

const CartComponent = () => {
  const { data: cart, isLoading } = useCart();
  const addToCartMutation = useAddToCart();
  const removeFromCartMutation = useRemoveFromCart();
  const cartState = useAppSelector(state => state.cart);
  
  const handleAddToCart = (productId: string) => {
    addToCartMutation.mutate({ productId, quantity: 1 });
  };
  
  const handleRemoveFromCart = (productId: string) => {
    removeFromCartMutation.mutate(productId);
  };
  
  return (
    <div>
      <h2>Cart ({cartState.totalItems})</h2>
      {isLoading ? (
        <div>Loading cart...</div>
      ) : (
        <div>
          {cart?.items.map(item => (
            <div key={item.product_id}>
              <span>{item.product?.name}</span>
              <span>Qty: {item.quantity}</span>
              <button onClick={() => handleRemoveFromCart(item.product_id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### Product Management
```typescript
import { useProducts, useProduct } from '../hooks/queries/useProducts';

const ProductsComponent = () => {
  const { data: products, isLoading, error } = useProducts(1);
  
  if (isLoading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {products?.data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

const ProductDetailComponent = ({ productId }: { productId: string }) => {
  const { data: product, isLoading } = useProduct(productId);
  
  if (isLoading) return <div>Loading product...</div>;
  
  return <div>{/* Render product details */}</div>;
};
```

## 🚀 Migration Checklist

- [x] Install Redux Toolkit and React Query
- [x] Create Redux store with slices
- [x] Configure React Query client
- [x] Create query hooks for all API calls
- [x] Create Redux-aware service wrappers
- [x] Update main.tsx with providers
- [x] Create example component
- [ ] Update existing components to use Redux selectors
- [ ] Update existing components to use React Query hooks
- [ ] Remove old context providers
- [ ] Test all functionality
- [ ] Update documentation

## 🐛 Common Issues and Solutions

### 1. **State Not Updating**
- Ensure you're using `useAppSelector` instead of direct state access
- Check if the action is properly dispatched
- Verify the reducer is handling the action correctly

### 2. **Queries Not Refetching**
- Check if the query key is correct
- Ensure the component is mounted
- Verify the query is enabled

### 3. **Mutations Not Working**
- Check if the mutation function is correct
- Ensure error handling is in place
- Verify the onSuccess callback is working

### 4. **TypeScript Errors**
- Ensure all types are properly imported
- Check if the store types are correctly defined
- Verify the query hook return types

## 📚 Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)

## 🔄 Backward Compatibility

The migration maintains backward compatibility by:
- Keeping original services intact
- Creating Redux-aware wrappers
- Gradual migration approach
- No breaking changes to existing APIs

This ensures a smooth transition without disrupting existing functionality.



