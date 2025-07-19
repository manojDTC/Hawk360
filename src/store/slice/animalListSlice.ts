import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the state
interface AnimalListState {
  animalsList: any[];
  loadingAnimalsList: boolean;
  errorAnimalsList: string | null;
}

// Define the initial state with the correct type
const initialState: AnimalListState = {
    animalsList: [],
  loadingAnimalsList: false,
  errorAnimalsList: null,
};

// API Base URL (Make sure you set this in your .env file)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Async Thunk to Fetch Data
export const fetchAnimals = createAsyncThunk(
    'animalsList/fetchAnimals',
    async () => {
      const response = await fetch(`${API_BASE_URL}/Animal/GetAll`); // Use backticks for string interpolation
      if (!response.ok) {
        throw new Error('Failed to fetch animalsList');
      }
      
      const data = await response.json(); // Await the JSON response

      return data; // Return the fetched data
    }
  );
  

// Create the Redux Slice
const animalsListSlice = createSlice({
  name: 'animalsList',
  initialState, // Use the defined initialState
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnimals.pending, (state) => {
        state.loadingAnimalsList = true;
        state.errorAnimalsList = null;
      })
      .addCase(fetchAnimals.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loadingAnimalsList = false;
        state.animalsList = action.payload;
      })
      .addCase(fetchAnimals.rejected, (state, action) => {
        state.loadingAnimalsList = false;
        state.errorAnimalsList = action.error.message ?? 'An error occurred'; // Ensure a string is assigned
      });
  },
});

export default animalsListSlice.reducer;
