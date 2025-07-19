import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define types for Preset
interface Preset {
  id: string;
  name: string;
  cameraId: string;
  duration: number;
  pan: number;
  tilt: number;
  zoom: number;
  areaId: string;
}

// Define the shape of the state
interface CameraState {
  cameras: any[];
  presets: Preset[]; // Use the Preset interface
  loadingCamera: boolean;
  loadingPTZ: boolean;
  loadingStream: boolean;
  loadingPresets: boolean;
  errorCamera: string | null;
  errorPTZ: string | null;
  errorStream: string | null;
  errorPresets: string | null;
  streamLinks: {
    raw: string;
    processed: string;
  };
}

// Define the initial state with the correct type
const initialState: CameraState = {
  cameras: [],
  presets: [],
  loadingCamera: false,
  loadingPTZ: false,
  loadingStream: false,
  loadingPresets: false,
  errorCamera: null,
  errorPTZ: null,
  errorStream: null,
  errorPresets: null,
  streamLinks: {
    raw: "",
    processed: "",
  },
};

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const CAMERA_API_BASE_URL = process.env.REACT_APP_CAMERA_CONTROL_API_BASE_URL;
const STREAM_API_BASE_URL = process.env.REACT_APP_STREAM_API_BASE_URL;

// Async Thunk to Fetch Data
export const fetchCameras = createAsyncThunk(
  "cameras/fetchCameras",
  async () => {
    const response = await fetch(`${API_BASE_URL}/camera/GetAll`);
    if (!response.ok) {
      throw new Error("Failed to fetch cameras");
    }
    return await response.json();
  }
);

export const fetchPresets = createAsyncThunk(
  "cameras/fetchPresets",
  async () => {
    const response = await fetch(`${API_BASE_URL}/Preset/GetPreset`);
    if (!response.ok) {
      throw new Error("Failed to fetch cameras");
    }
    return await response.json();
  }
);

export const setCameraMode = createAsyncThunk(
  "cameras/setCameraMode",
  async (
    { mode, preset, cameraIdTemp }: { mode: string; preset: string; cameraIdTemp: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${CAMERA_API_BASE_URL}/SetMode?mode=${mode}&preset=${preset}&cameraId=${cameraIdTemp}`
      );
      if (!response.data) {
        throw new Error("Failed to set camera mode");
      }
      return await response.data;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const changePTZPosition = createAsyncThunk(
  "cameras/changePTZPosition",
  async ( { key, cameraIdTemp }: { key: string; cameraIdTemp: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${CAMERA_API_BASE_URL}/ptz_multi?keys=${key}&cameraId=${cameraIdTemp}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to change PTZ position");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

export const resetCameraPosition = createAsyncThunk(
  "cameras/resetCameraPosition",
  async (cameraId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${CAMERA_API_BASE_URL}/GoToHome?cameraId=${cameraId}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to reset PTZ position");
      }
      return await response.json();
    } catch (error) {
      return "error";
    }
  }
);

export const fetchStreamLinks = createAsyncThunk(
  "cameras/fetchStreamLinks",
  async (cameraId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${CAMERA_API_BASE_URL}/GetStreamLinks?cameraId=${cameraId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stream links");
      }
      const data = await response.json();
      return {
        raw: data.raw,
        processed: data.processed,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  }
);

// Create the Redux Slice
const cameraSlice = createSlice({
  name: "cameras",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCameras.pending, (state) => {
        state.loadingCamera = true;
        state.errorCamera = null;
      })
      .addCase(
        fetchCameras.fulfilled,
        (state, action: PayloadAction<any[]>) => {
          state.loadingCamera = false;
          state.cameras = action.payload;
        }
      )
      .addCase(fetchCameras.rejected, (state, action) => {
        state.loadingCamera = false;
        state.errorCamera = action.error.message ?? "An error occurred";
      })
      .addCase(fetchPresets.pending, (state) => {
        state.loadingPresets = true;
        state.errorPresets = null;
        state.presets = []; // Clear previous presets when loading new ones
      })
      .addCase(
        fetchPresets.fulfilled,
        (state, action: PayloadAction<Preset[]>) => {
          state.loadingPresets = false;
          state.presets = action.payload;
        }
      )
      .addCase(fetchPresets.rejected, (state, action) => {
        state.loadingPresets = false;
        state.errorPresets = action.error.message ?? "An error occurred";
      })
      .addCase(changePTZPosition.pending, (state) => {
        state.loadingPTZ = true;
        state.errorPTZ = null;
      })
      .addCase(changePTZPosition.fulfilled, (state) => {
        state.loadingPTZ = false;
      })
      .addCase(changePTZPosition.rejected, (state, action) => {
        state.loadingPTZ = false;
        state.errorPTZ = action.error.message ?? "An error occurred";
      })
      .addCase(resetCameraPosition.pending, (state) => {
        state.loadingPTZ = true;
        state.errorPTZ = null;
      })
      .addCase(resetCameraPosition.fulfilled, (state) => {
        state.loadingPTZ = false;
      })
      .addCase(resetCameraPosition.rejected, (state, action) => {
        state.loadingPTZ = false;
        state.errorPTZ = action.error.message ?? "An error occurred";
      })
      .addCase(fetchStreamLinks.pending, (state) => {
        state.loadingStream = true;
        state.errorStream = null;
      })
      .addCase(
        fetchStreamLinks.fulfilled,
        (
          state,
          action: PayloadAction<{ raw: string; processed: string }>
        ) => {
          state.loadingStream = false;
          state.streamLinks = {
            raw: action.payload.raw,
            processed: action.payload.processed,
          };
        }
      )
      .addCase(fetchStreamLinks.rejected, (state, action) => {
        state.loadingStream = false;
        state.errorStream = action.error.message ?? "An error occurred";
      });
  },
});

export default cameraSlice.reducer;