import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the state
interface UsersListState {
  usersList: any[];
  loadingUsersList: boolean;
  errorUsersList: string | null;
}

// Define the initial state with the correct type
const initialState: UsersListState = {
  usersList: [],
  loadingUsersList: false,
  errorUsersList: null,
};

// API Base URL (Make sure you set this in your .env file)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Async Thunk to Fetch Data
export const fetchUsersList = createAsyncThunk(
    'usersList/fetchusersList',
    async () => {
      const response = await fetch(`${API_BASE_URL}/Memebers/GetAll`); // Use backticks for string interpolation
      if (!response.ok) {
        throw new Error('Failed to fetch usersList');
      }
      
      const data = await response.json(); // Await the JSON response

      return data; // Return the fetched data
    }
  );
  

// Create the Redux Slice
const usersListSlice = createSlice({
  name: 'usersList',
  initialState, // Use the defined initialState
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsersList.pending, (state) => {
        state.loadingUsersList = true;
        state.errorUsersList = null;
      })
      .addCase(fetchUsersList.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loadingUsersList = false;
        state.usersList = action.payload;
      })
      .addCase(fetchUsersList.rejected, (state, action) => {
        state.loadingUsersList = false;
        state.errorUsersList = action.error.message ?? 'An error occurred'; // Ensure a string is assigned
      });
  },
});

export default usersListSlice.reducer;
