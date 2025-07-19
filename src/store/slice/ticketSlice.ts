import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// Define Message Interface
interface Message {
  ticketId: string;
  messageText: string;
  timestamp: string;
}

// Define the shape of the state
export interface TicketStructer {
  id: string;
  title: string;
  ticketId: string;
  camera: string;
  animal: string;
  area: string;
  memberId: string;
  type: string;
  fileURL: string | null;
  createdDate: string;
  status: string;
}

// Define the shape of the state
interface Ticketstate {
  tickets: TicketStructer[] | null;
  loadingTicket: boolean;
  errorTicket: string | null;
  messages: Message[];
  loadingMessages: boolean;
  errorMessage: string | null;
  success: boolean;
}

interface TicketData {
  Title: string;
  AnimalId: string;
  AreaId: string;
  MemberId: string;
  CameraId: string;
  Type: string;
  Remark: string;
  File: File;
}

// Define the initial state with the correct type
const initialState: Ticketstate = {
  tickets: [],
  loadingTicket: false,
  errorTicket: null,
  messages: [],
  loadingMessages: true,
  errorMessage: null,
  success: true,
};

// API Base URL (Make sure you set this in your .env file)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Async Thunk to Fetch Data
export const fetchTicket = createAsyncThunk("tickets/fetchTicket", async () => {
  const response = await fetch(`${API_BASE_URL}/Ticket/GetAllTickets`);
  if (!response.ok) {
    throw new Error("Failed to fetch locations");
  }

  const data = await response.json();
  return data; // Return the fetched data
});

export const sendMessage = createAsyncThunk(
  "tickets/sendMessage",
  async (messageData: FormData, { rejectWithValue }) => {
    // ✅ Correct type usage
    try {
      const response = await fetch(`${API_BASE_URL}/Ticket/AddMessage`, {
        method: "POST",
        body: messageData, // ✅ Send FormData directly
      });

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      return { messages: data.value };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// **Async Thunk to Add a New Ticket**
export const addTicketToAPI = createAsyncThunk(
  "tickets/addTicket",
  async (ticketData: FormData, { rejectWithValue }) => {
    try {
      // const response = await axios.post(
        // `${API_BASE_URL}/Ticket/AddTicket`,
        // ticketData
      // );
      const response = await fetch(`${API_BASE_URL}/Ticket/AddTicket`, {
        method: "POST",
        body: ticketData, // Send FormData directly
      });

       if (!response.ok) throw new Error("Failed to add ticket");

      return response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// **Async Thunk to Add a New Ticket**
export const changeTicketStatus = createAsyncThunk(
  "tickets/changeTicketStatus",
  async (
    {
      newStatus,
      ticketId,
      MemberId,
    }: { newStatus: string; ticketId: string; MemberId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Ticket/PostStatus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Ensure correct content type
          Accept: "application/json",
        },
        body: JSON.stringify({
          Status: newStatus,
          Id: ticketId,
          MemberId: MemberId,
        }), // Send FormData directly
      });

      if (!response.ok) throw new Error("Failed to add ticket");
      return { newStatus, ticketId, MemberId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// **API Call: Fetch Messages for a Ticket**
export const fetchMessages = createAsyncThunk(
  "tickets/fetchMessages",
  async (ticketId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/Ticket/GetAllMessages?Id=${ticketId}`
    );
    if (!response.ok) throw new Error("Failed to fetch messages");

    return { ticketId, messages: await response.json() };
  }
);

// Create the Redux Slice
const ticketSlice = createSlice({
  name: "Ticket",
  initialState, // Use the defined initialState
  reducers: {
    clearSuccess: (state) => {
      state.success = false; // Reset success state after closing modal
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTicket.pending, (state) => {
        state.loadingTicket = true;
        state.errorTicket = null;
      })
      .addCase(
        fetchTicket.fulfilled,
        (state, action: PayloadAction<TicketStructer[]>) => {
          state.loadingTicket = false;
          state.tickets = action.payload;
        }
      )
      .addCase(fetchTicket.rejected, (state, action) => {
        state.loadingTicket = false;
        state.errorTicket = action.error.message ?? "An error occurred"; // Ensure a string is assigned
      })
      .addCase(changeTicketStatus.pending, (state) => {
        state.loadingTicket = true;
        state.errorTicket = null;
      })
      .addCase(
        changeTicketStatus.fulfilled,
        (
          state,
          action: PayloadAction<{
            newStatus: string;
            ticketId: string;
            MemberId: string;
          }>
        ) => {
          state.loadingTicket = false;

          // Check if state.tickets is null or undefined before updating
          if (!state.tickets) return;

          // Find the ticket by ID and update its status safely
          const ticketIndex = state.tickets.findIndex(
            (ticket) => ticket.id === action.payload.ticketId
          );
          if (ticketIndex !== -1) {
            // Ensure status exists before updating
            if (state.tickets[ticketIndex]) {
              state.tickets[ticketIndex] = {
                ...state.tickets[ticketIndex],
                status: action.payload.newStatus, // Update safely
                memberId: action.payload.MemberId,
              };
            }
          }
        }
      )
      .addCase(changeTicketStatus.rejected, (state, action) => {
        state.loadingTicket = false;
        state.errorTicket = action.error.message ?? "An error occurred"; // Ensure a string is assigned
      })
      .addCase(addTicketToAPI.pending, (state) => {
        state.loadingTicket = true;
        state.success = false;
      })
      .addCase(
        addTicketToAPI.fulfilled,
        (state, action: PayloadAction<{ value: any }>) => {
          state.loadingTicket = false;
          state.success = true;
          state.tickets = action.payload.value;
        }
      )
      .addCase(addTicketToAPI.rejected, (state, action) => {
        state.loadingTicket = false;
        state.errorTicket = action.payload as string;
      })
      .addCase(fetchMessages.pending, (state) => {
        state.loadingMessages = true;
        state.errorMessage = null;
      })
      .addCase(
        fetchMessages.fulfilled,
        (
          state,
          action: PayloadAction<{
            ticketId: number | string;
            messages: Message[];
          }>
        ) => {
          state.loadingMessages = false;
          state.messages = action.payload.messages; // Ensure this matches the state
        }
      )
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.errorMessage = action.error.message ?? "Failed to load messages";
      })
      .addCase(
        sendMessage.fulfilled,
        (state, action: PayloadAction<{ messages: Message[] }>) => {
          state.messages = action.payload.messages; // `action.payload` is now a valid message object
        }
      )
      .addCase(sendMessage.rejected, (state, action) => {
        state.errorMessage = action.error.message ?? "Error sending message"; // Use errorMessage
      });
  },
});

export const { clearSuccess } = ticketSlice.actions;
export default ticketSlice.reducer;
