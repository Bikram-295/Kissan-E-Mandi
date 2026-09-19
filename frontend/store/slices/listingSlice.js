import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  listings: [],
  selectedCity: null,
  loading: false,
};

export const listingSlice = createSlice({
  name: 'listings',
  initialState,
  reducers: {
    setListings: (state, action) => {
      state.listings = action.payload || [];
    },
    addListing: (state, action) => {
      state.listings.unshift(action.payload);
    },
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload;
    },
  },
});

export const { setListings, addListing, setSelectedCity } = listingSlice.actions;
export const selectAllListings = (state) => state.listings.listings;
export default listingSlice.reducer;
