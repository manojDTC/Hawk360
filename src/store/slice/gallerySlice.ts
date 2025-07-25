import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the state
interface Gallerystate {
    gallerys: any[];
  loadingGallery: boolean;
  errorGallery: string | null;
}

// Define the initial state with the correct type
const initialState: Gallerystate = {
    gallerys: [],
    loadingGallery: false,
  errorGallery: null,
};

// API Base URL (Make sure you set this in your .env file)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Async Thunk to Fetch Data
export const fetchGallery = createAsyncThunk(
    'gallerys/fetchGallery',
    async () => {
      const response = await fetch(`${API_BASE_URL}/GalleryAPI/GetGalleryImages`); // Use backticks for string interpolation
      if (!response.ok) {
        throw new Error('Failed to fetch gallery');
      }
  
      const data = await response.json(); // Await the JSON response
    //  console.log(data); // Now it will print the actual object
  
   /*  const images = [
      {
        id: 1,
        src: `${process.env.PUBLIC_URL}/animals/1.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "11-03-25 09:20:01",
      },
      {
        id: 2,
        src: `${process.env.PUBLIC_URL}/animals/2.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 1",
        location: "South Zone",
        dateTime: "11-03-25 08:55:31",
      },
      {
        id: 3,
        src: `${process.env.PUBLIC_URL}/animals/3.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 2",
        location: "West Zone",
        dateTime: "11-03-25 07:22:01",
      },
      {
        id: 4,
        src: `${process.env.PUBLIC_URL}/animals/4.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 2",
        location: "East Zone",
        dateTime: "11-03-25 06:10:01",
      },
      {
        id: 5,
        src: `${process.env.PUBLIC_URL}/animals/5.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 1",
        location: "West Zone",
        dateTime: "11-03-25 05:11:01",
      },
      {
        id: 6,
        src: `${process.env.PUBLIC_URL}/animals/6.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 3",
        location: "North Zone",
        dateTime: "11-03-25 04:13:01",
      },
      {
        id: 7,
        src: `${process.env.PUBLIC_URL}/animals/7.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 2",
        location: "West Zone",
        dateTime: "11-03-25 04:10:01",
      },
      {
        id: 8,
        src: `${process.env.PUBLIC_URL}/animals/8.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 1",
        location: "East Zone",
        dateTime: "11-03-25 02:20:01",
      },
      {
        id: 9,
        src: `${process.env.PUBLIC_URL}/animals/9.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 3",
        location: "North Zone",
        dateTime: "11-03-25 01:50:51",
      },
      {
        id: 10,
        src: `${process.env.PUBLIC_URL}/animals/10.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 1",
        location: "South Zone",
        dateTime: "11-03-25 00:10:01",
      },
      {
        id: 11,
        src: `${process.env.PUBLIC_URL}/animals/11.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 2",
        location: "East Zone",
        dateTime: "10-03-25 23:20:01",
      },
      {
        id: 12,
        src: `${process.env.PUBLIC_URL}/animals/12.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 4",
        location: "North Zone",
        dateTime: "10-03-25 22:56:01",
      },
      {
        id: 13,
        src: `${process.env.PUBLIC_URL}/animals/13.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 2",
        location: "West Zone",
        dateTime: "10-03-25 21:20:01",
      },
      {
        id: 14,
        src: `${process.env.PUBLIC_URL}/animals/14.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "10-03-25 20:20:20",
      },
      {
        id: 15,
        src: `${process.env.PUBLIC_URL}/animals/15.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 4",
        location: "West Zone",
        dateTime: "10-03-25 20:10:01",
      },
      {
        id: 16,
        src: `${process.env.PUBLIC_URL}/animals/16.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 3",
        location: "South Zone",
        dateTime: "10-03-25 19:10:01",
      },
      {
        id: 17,
        src: `${process.env.PUBLIC_URL}/animals/17.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 2",
        location: "East Zone",
        dateTime: "10-03-25 18:10:01",
      },
      {
        id: 18,
        src: `${process.env.PUBLIC_URL}/animals/18.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "10-03-25 16:21:01",
      },
      {
        id: 19,
        src: `${process.env.PUBLIC_URL}/animals/19.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 4",
        location: "West Zone",
        dateTime: "10-03-25 13:11:01",
      },
      {
        id: 20,
        src: `${process.env.PUBLIC_URL}/animals/20.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 2",
        location: "South Zone",
        dateTime: "10-03-25 11:10:01",
      },
      {
        id: 21,
        src: `${process.env.PUBLIC_URL}/animals/21.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "10-03-25 10:11:01",
      },
      {
        id: 22,
        src: `${process.env.PUBLIC_URL}/animals/22.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 3",
        location: "East Zone",
        dateTime: "10-03-25 10:01:01",
      },
      {
        id: 23,
        src: `${process.env.PUBLIC_URL}/animals/23.jpg`,
        title: "Tiger",
        category: "alert",
        camera: "Camera 2",
        location: "North Zone",
        dateTime: "10-03-25 09:11:01",
      },
      {
        id: 24,
        src: `${process.env.PUBLIC_URL}/animals/24.jpg`,
        title: "Tiger",
        category: "animal",
        camera: "Camera 1",
        location: "West Zone",
        dateTime: "10-03-25 07:18:01",
      },
      {
        id: 25,
        src: `${process.env.PUBLIC_URL}/animals/25.jpg`,
        title: "Tiger",
        category: "alert",
        camera: "Camera 1",
        location: "East Zone",
        dateTime: "10-03-25 06:21:01",
      },
      {
        id: 26,
        src: `${process.env.PUBLIC_URL}/animals/26.png`,
        title: "Tiger",
        category: "alert",
        camera: "Camera 2",
        location: "North Zone",
        dateTime: "10-03-25 04:27:01",
      },
      {
        id: 27,
        src: `${process.env.PUBLIC_URL}/animals/27.jpg`,
        title: "Tiger",
        category: "animal",
        camera: "Camera 2",
        location: "West Zone",
        dateTime: "10-03-25 02:21:01",
      },
      {
        id: 28,
        src: `${process.env.PUBLIC_URL}/animals/28.jpg`,
        title: "Tiger",
        category: "alert",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "10-03-25 02:11:01",
      },
      {
        id: 29,
        src: `${process.env.PUBLIC_URL}/animals/29.png`,
        title: "Bear",
        category: "animal",
        camera: "Camera 4",
        location: "North Zone",
        dateTime: "10-03-25 01:21:01",
      },
      {
        id: 30,
        src: `${process.env.PUBLIC_URL}/animals/30.jpg`,
        title: "Bear",
        category: "alert",
        camera: "Camera 4",
        location: "West Zone",
        dateTime: "10-03-25 00:01:01",
      },
      {
        id: 31,
        src: `${process.env.PUBLIC_URL}/animals/31.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 3",
        location: "South Zone",
        dateTime: "09-03-25 23:40:01",
      },
      {
        id: 32,
        src: `${process.env.PUBLIC_URL}/animals/32.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 3",
        location: "East Zone",
        dateTime: "09-03-25 23:33:01",
      },
      {
        id: 33,
        src: `${process.env.PUBLIC_URL}/animals/33.jpg`,
        title: "Tiger",
        category: "alert",
        camera: "Camera 1",
        location: "South Zone",
        dateTime: "09-03-25 23:22:01",
      },
      {
        id: 34,
        src: `${process.env.PUBLIC_URL}/animals/34.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "09-03-25 23:12:01",
      },
      {
        id: 35,
        src: `${process.env.PUBLIC_URL}/animals/35.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 2",
        location: "East Zone",
        dateTime: "09-03-25 22:42:01",
      },
      {
        id: 36,
        src: `${process.env.PUBLIC_URL}/animals/36.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 4",
        location: "North Zone",
        dateTime: "09-03-25 22:34:41",
      },
      {
        id: 37,
        src: `${process.env.PUBLIC_URL}/animals/37.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 1",
        location: "West Zone",
        dateTime: "09-03-25 22:14:41",
      },
      {
        id: 38,
        src: `${process.env.PUBLIC_URL}/animals/38.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 3",
        location: "West Zone",
        dateTime: "09-03-25 22:14:41",
      },
      {
        id: 39,
        src: `${process.env.PUBLIC_URL}/animals/39.jpg`,
        title: "Tiger",
        category: "alert",
        camera: "Camera 2",
        location: "East Zone",
        dateTime: "09-03-25 21:14:41",
      },
      {
        id: 40,
        src: `${process.env.PUBLIC_URL}/animals/40.jpg`,
        title: "Bear",
        category: "alert",
        camera: "Camera 1",
        location: "South Zone",
        dateTime: "09-03-25 21:14:41",
      },
      {
        id: 41,
        src: `${process.env.PUBLIC_URL}/animals/41.jpg`,
        title: "Bear",
        category: "alert",
        camera: "Camera 2",
        location: "North Zone",
        dateTime: "09-03-25 21:14:31",
      },
      {
        id: 42,
        src: `${process.env.PUBLIC_URL}/animals/42.jpg`,
        title: "Tiger",
        category: "alert",
        camera: "Camera 1",
        location: "West Zone",
        dateTime: "09-03-25 20:14:41",
      },
      {
        id: 43,
        src: `${process.env.PUBLIC_URL}/animals/43.jpg`,
        title: "Tiger",
        category: "animal",
        camera: "Camera 2",
        location: "North Zone",
        dateTime: "09-03-25 19:14:41",
      },
      {
        id: 44,
        src: `${process.env.PUBLIC_URL}/animals/44.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 1",
        location: "East Zone",
        dateTime: "09-03-25 18:14:41",
      },
      {
        id: 45,
        src: `${process.env.PUBLIC_URL}/animals/45.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 3",
        location: "North Zone",
        dateTime: "09-03-25 17:14:41",
      },
      {
        id: 46,
        src: `${process.env.PUBLIC_URL}/animals/46.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 1",
        location: "West Zone",
        dateTime: "09-03-25 16:14:41",
      },
      {
        id: 47,
        src: `${process.env.PUBLIC_URL}/animals/47.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 4",
        location: "South Zone",
        dateTime: "09-03-25 15:14:41",
      },
      {
        id: 48,
        src: `${process.env.PUBLIC_URL}/animals/48.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 4",
        location: "East Zone",
        dateTime: "09-03-25 15:14:41",
      },
      {
        id: 49,
        src: `${process.env.PUBLIC_URL}/animals/49.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 2",
        location: "North Zone",
        dateTime: "09-03-25 14:14:41",
      },
      {
        id: 50,
        src: `${process.env.PUBLIC_URL}/animals/50.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 1",
        location: "East Zone",
        dateTime: "09-03-25 13:14:41",
      },
      {
        id: 51,
        src: `${process.env.PUBLIC_URL}/animals/51.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "09-03-25 13:14:41",
      },
      {
        id: 52,
        src: `${process.env.PUBLIC_URL}/animals/52.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 2",
        location: "West Zone",
        dateTime: "09-03-25 12:14:41",
      },
      {
        id: 53,
        src: `${process.env.PUBLIC_URL}/animals/53.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 2",
        location: "North Zone",
        dateTime: "09-03-25 12:12:41",
      },
      {
        id: 54,
        src: `${process.env.PUBLIC_URL}/animals/54.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "09-03-25 10:14:41",
      },
      {
        id: 55,
        src: `${process.env.PUBLIC_URL}/animals/55.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 1",
        location: "West Zone",
        dateTime: "09-03-25 10:14:41",
      },
      {
        id: 56,
        src: `${process.env.PUBLIC_URL}/animals/56.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 3",
        location: "East Zone",
        dateTime: "09-03-25 10:14:41",
      },
      {
        id: 57,
        src: `${process.env.PUBLIC_URL}/animals/57.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 58,
        src: `${process.env.PUBLIC_URL}/animals/58.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 3",
        location: "West Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 59,
        src: `${process.env.PUBLIC_URL}/animals/59.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 1",
        location: "South Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 60,
        src: `${process.env.PUBLIC_URL}/animals/60.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 4",
        location: "North Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 61,
        src: `${process.env.PUBLIC_URL}/animals/61.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 4",
        location: "West Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 62,
        src: `${process.env.PUBLIC_URL}/animals/62.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 63,
        src: `${process.env.PUBLIC_URL}/animals/63.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 1",
        location: "East Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 64,
        src: `${process.env.PUBLIC_URL}/animals/64.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 3",
        location: "North Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 65,
        src: `${process.env.PUBLIC_URL}/animals/65.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 1",
        location: "West Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 66,
        src: `${process.env.PUBLIC_URL}/animals/66.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 2",
        location: "South Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 67,
        src: `${process.env.PUBLIC_URL}/animals/67.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 2",
        location: "East Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 68,
        src: `${process.env.PUBLIC_URL}/animals/68.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 69,
        src: `${process.env.PUBLIC_URL}/animals/69.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 3",
        location: "East Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 70,
        src: `${process.env.PUBLIC_URL}/animals/70.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 4",
        location: "North Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 71,
        src: `${process.env.PUBLIC_URL}/animals/71.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 1",
        location: "East Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 72,
        src: `${process.env.PUBLIC_URL}/animals/72.jpg`,
        title: "Bear",
        category: "alert",
        camera: "Camera 2",
        location: "South Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 73,
        src: `${process.env.PUBLIC_URL}/animals/73.jpg`,
        title: "Bear",
        category: "alert",
        camera: "Camera 1",
        location: "West Zone",
        dateTime: "26-02-25 11:20:01",
      },
      {
        id: 74,
        src: `${process.env.PUBLIC_URL}/animals/74.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 3",
        location: "North Zone",
        dateTime: "26-02-25 17:20:01",
      },
      {
        id: 75,
        src: `${process.env.PUBLIC_URL}/animals/75.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 4",
        location: "North Zone",
        dateTime: "26-02-25 16:03:01",
      },
      {
        id: 76,
        src: `${process.env.PUBLIC_URL}/animals/76.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 2",
        location: "South Zone",
        dateTime: "26-02-25 15:42:21",
      },
      {
        id: 77,
        src: `${process.env.PUBLIC_URL}/animals/77.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 1",
        location: "West Zone",
        dateTime: "26-02-25 15:25:11",
      },
      {
        id: 78,
        src: `${process.env.PUBLIC_URL}/animals/78.jpg`,
        title: "Elephant",
        category: "animal",
        camera: "Camera 3",
        location: "East Zone",
        dateTime: "26-02-25 15:13:31",
      },
      {
        id: 79,
        src: `${process.env.PUBLIC_URL}/animals/79.jpg`,
        title: "Deer",
        category: "alert",
        camera: "Camera 1",
        location: "South Zone",
        dateTime: "26-02-25 15:02:01",
      },
      {
        id: 80,
        src: `${process.env.PUBLIC_URL}/animals/80.jpg`,
        title: "Deer",
        category: "animal",
        camera: "Camera 4",
        location: "West Zone",
        dateTime: "26-02-25 14:45:51",
      },
      {
        id: 81,
        src: `${process.env.PUBLIC_URL}/animals/81.jpg`,
        title: "Tiger",
        category: "animal",
        camera: "Camera 1",
        location: "South Zone",
        dateTime: "26-02-25 14:42:01",
      },
      {
        id: 82,
        src: `${process.env.PUBLIC_URL}/animals/82.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 2",
        location: "North Zone",
        dateTime: "26-02-25 13:23:01",
      },
      {
        id: 83,
        src: `${process.env.PUBLIC_URL}/animals/83.jpg`,
        title: "Bear",
        category: "alert",
        camera: "Camera 1",
        location: "North Zone",
        dateTime: "26-02-25 12:10:31",
      },
      {
        id: 84,
        src: `${process.env.PUBLIC_URL}/animals/84.jpg`,
        title: "Bear",
        category: "animal",
        camera: "Camera 3",
        location: "West Zone",
        dateTime: "26-02-25 12:1101",
      },
      {
        id: 85,
        src: `${process.env.PUBLIC_URL}/animals/85.jpg`,
        title: "Bear",
        category: "alert",
        camera: "Camera 3",
        location: "East Zone",
        dateTime: "26-02-25 11:22:11",
      },
      {
        id: 86,
        src: `${process.env.PUBLIC_URL}/animals/86.jpg`,
        title: "Elephant",
        category: "alert",
        camera: "Camera 1",
        location: "South Zone",
        dateTime: "26-02-25 11:20:01",
      },
    ]; */
console.log(data);
      return data; // Return the fetched data
    }
  );
  

// Create the Redux Slice
const gallerySlice = createSlice({
  name: 'Gallery',
  initialState, // Use the defined initialState
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGallery.pending, (state) => {
        state.loadingGallery = true;
        state.errorGallery = null;
      })
      .addCase(fetchGallery.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loadingGallery = false;
        state.gallerys = action.payload;
      })
      .addCase(fetchGallery.rejected, (state, action) => {
        state.loadingGallery = false;
        state.errorGallery = action.error.message ?? 'An error occurred'; // Ensure a string is assigned
      });
  },
});

export default gallerySlice.reducer;
