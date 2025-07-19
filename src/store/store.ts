import { configureStore } from "@reduxjs/toolkit";
import fetchLogs from "./slice/homePageLogs";
import fetchLocation from "./slice/locationSlice";
import fetchUsersList from "./slice/usersListSlice";
import fetchAnimalsList from "./slice/animalListSlice";
import fetchCamera from "./slice/cameraSlice";
import fetchGallery from "./slice/gallerySlice";
import ticketReducer from "./slice/ticketSlice";
import presetRedcuer from "./slice/presetSlice";

export const store = configureStore({
  reducer: {
    logs: fetchLogs,
    locations: fetchLocation,
    usersList: fetchUsersList,
    animalsList: fetchAnimalsList,
    cameras: fetchCamera,
    gallerys: fetchGallery,
    tickets: ticketReducer,
    presets: presetRedcuer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
