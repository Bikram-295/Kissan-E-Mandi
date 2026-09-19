import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { baseURL } from '../../urls';

const mspValuationURL = (baseURL ? baseURL : "https://kissan-e-mandi.onrender.com/fci/") + "msp-valuation/evaluate/";

export const calculateMSPValuation = createAsyncThunk(
  'msp/calculateValuation',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axios.post(mspValuationURL, payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

const initialState = {
  currentValuation: null,
  loading: false,
  error: null,
  history: [],
};

export const mspSlice = createSlice({
  name: 'msp',
  initialState,
  reducers: {
    clearValuation: (state) => {
      state.currentValuation = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(calculateMSPValuation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculateMSPValuation.fulfilled, (state, action) => {
        state.loading = false;
        state.currentValuation = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(calculateMSPValuation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to calculate MSP valuation';
      });
  },
});

export const { clearValuation } = mspSlice.actions;
export const selectCurrentValuation = (state) => state.msp.currentValuation;
export const selectMSPLoading = (state) => state.msp.loading;

export default mspSlice.reducer;
