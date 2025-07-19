import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Define interface for KPI Log response
interface KPILog {
  total: string;
  detection: string;
  crossing: string;
}

export const fetchLiveLogs = createAsyncThunk(
  "cameras/fetchLiveLogs",
  async () => {
    const response = await fetch(`${API_BASE_URL}/Log/GetLiveLog`);
    if (!response.ok) {
      throw new Error("Failed to fetch live logs");
    }
    const data = await response.json();
    return data;
  }
);

export const fetchKPILog = createAsyncThunk(
  "items/fetchKPILog",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Log/GetKPILog`);
      if (!response.ok) {
        throw new Error("Failed to fetch KPI log");
      }
      const data: KPILog = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// Slice definition
const itemsSlice = createSlice({
  name: "items",
  initialState: {
    liveLogs: [] as any[],
    kpiLog: null as KPILog | null,
    status: "idle",
    loadingLiveLogs: false,
    loadingKPILog: false,
    error: null as string | null,
    errorLiveLogs: null as string | null,
    errorKPILog: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLiveLogs.pending, (state) => {
        state.loadingLiveLogs = true;
        state.errorLiveLogs = null;
      })
      .addCase(fetchLiveLogs.fulfilled, (state, action) => {
        state.loadingLiveLogs = false;
        state.liveLogs = action.payload;
      })
      .addCase(fetchLiveLogs.rejected, (state, action) => {
        state.loadingLiveLogs = false;
        state.errorLiveLogs = action.error.message ?? "An error occurred";
      })
      .addCase(fetchKPILog.pending, (state) => {
        state.loadingKPILog = true;
        state.errorKPILog = null;
      })
      .addCase(fetchKPILog.fulfilled, (state, action) => {
        state.loadingKPILog = false;
        state.kpiLog = action.payload;
      })
      .addCase(fetchKPILog.rejected, (state, action) => {
        state.loadingKPILog = false;
        state.errorKPILog = action.error.message ?? "An error occurred";
      });
  },
});

// Export the reducer
export default itemsSlice.reducer;
