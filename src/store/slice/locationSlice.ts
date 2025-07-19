import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the state
interface LocationState {
  locations: any[];
  loading: boolean;
  error: string | null;
}

// Define the initial state with the correct type
const initialState: LocationState = {
  locations: [],
  loading: false,
  error: null,
};

// API Base URL (Make sure you set this in your .env file)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Async Thunk to Fetch Data
export const fetchLocations = createAsyncThunk(
    'locations/fetchLocations',
    async () => {
      const response = await fetch(`${API_BASE_URL}/Area/GetArea`); // Use backticks for string interpolation
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const data = await response.json(); // Await the JSON response

  
      return data; // Return the fetched data
    }
  );
  

// Create the Redux Slice
const locationSlice = createSlice({
  name: 'locations',
  initialState, // Use the defined initialState
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocations.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.locations = action.payload;
      })
      .addCase(fetchLocations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'An error occurred'; // Ensure a string is assigned
      });
  },
});

export default locationSlice.reducer;