import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  transactions: [],
  activeDeal: null,
  wsConnected: false,
  lastUpdated: null,
};

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action) => {
      state.transactions = action.payload || [];
      state.lastUpdated = new Date().toISOString();
    },
    updateTransactionStatus: (state, action) => {
      const { id, status, stage_number, progress_percentage } = action.payload;
      const index = state.transactions.findIndex((t) => t.id === id);
      if (index !== -1) {
        state.transactions[index] = {
          ...state.transactions[index],
          ...action.payload,
          status: status || state.transactions[index].status,
        };
      }
      state.lastUpdated = new Date().toISOString();
    },
    addTransaction: (state, action) => {
      const exists = state.transactions.some((t) => t.id === action.payload.id);
      if (!exists) {
        state.transactions.unshift(action.payload);
      }
      state.lastUpdated = new Date().toISOString();
    },
    setWsConnected: (state, action) => {
      state.wsConnected = action.payload;
    },
    setActiveDeal: (state, action) => {
      state.activeDeal = action.payload;
    },
  },
});

export const {
  setTransactions,
  updateTransactionStatus,
  addTransaction,
  setWsConnected,
  setActiveDeal,
} = transactionSlice.actions;

export const selectAllTransactions = (state) => state.transactions.transactions;
export const selectWsConnected = (state) => state.transactions.wsConnected;
export const selectActiveDeal = (state) => state.transactions.activeDeal;

export default transactionSlice.reducer;
