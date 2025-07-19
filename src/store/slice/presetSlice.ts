import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Area {
  name: string;
  polygon: string;
  id: string;
  cameraId: string;
}

export interface PresetData {
  id: string;
  name: string;
  CameraName: string;
  cameraId: string;
  areaId: string;
  AreaName: string;
  duration: number;
  pan: number;
  tilt: number;
  zoom: number;
}

export interface Preset {
  PresetName: string;
  CameraName: string;
  CameraId: string;
  AreaId: string;
  AreaName: string;
  Duration: number;
}

const initialState = {
  presets: [],
  areas: [],
  isLoading: false,
  success: false,
  error: "",
};

export const getPresets = createAsyncThunk("presets/getPresets", async () => {

      try {
  const response = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/Preset/GetPreset`
  );
      return response.data;
    } catch (error) {
console.error("Error from API")
    }
});

export const getAreasById = createAsyncThunk(
  "Area/GetAreaById",
  async (cameraId: string) => {
    const response = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/Area/GetAreaById?CameraId=${cameraId}`
    );

    if (response.data) {
      return response.data;
    } else {
      console.error("failed to fetch Presets");
    }
  }
);

export const addArea = createAsyncThunk(
  "presets/addArea",
  async (data: Area, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/Area/PostAreas`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addPreset = createAsyncThunk(
  "presets/addPreset",
  async (data: Preset, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/Preset/PostPreset`,
        data
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create the Redux Slice
const presetSlice = createSlice({
  name: "Preset",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPresets.pending, (state) => {
        state.isLoading = true;
        state.presets = [];
      })
      .addCase(getPresets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.presets = action.payload;
        state.success = true;
      })

      .addCase(getPresets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
        state.presets = [];
      });

    builder
      .addCase(getAreasById.pending, (state) => {
        state.isLoading = true;
        state.success = false;
        state.error = "";
        state.areas = [];
      })
      .addCase(getAreasById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.areas = action.payload;
      })

      .addCase(getAreasById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.success = false;
        state.areas = [];
      });
  },
});

export default presetSlice.reducer;
