import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from './slices/transactionSlice';
import mspReducer from './slices/mspSlice';
import listingReducer from './slices/listingSlice';

export const store = configureStore({
  reducer: {
    transactions: transactionReducer,
    msp: mspReducer,
    listings: listingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
