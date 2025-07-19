import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
  styled,
  Box,
  Typography,
  Modal,
  SelectChangeEvent,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Animal, { AnimalLog, formatDate } from "./Logs";
import Ticket from "../Ticket";
import {
  addTicketToAPI,
  fetchMessages,
  fetchTicket,
  sendMessage,
  TicketStructer,
} from "../../store/slice/ticketSlice";
import { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { fetchLocations } from "../../store/slice/locationSlice";
import { fetchUsersList } from "../../store/slice/usersListSlice";
import { fetchAnimals } from "../../store/slice/animalListSlice";
import { fetchCameras } from "../../store/slice/cameraSlice";
import { toast } from "react-toastify";

const StyledDialogTitle = styled(DialogTitle)({
  backgroundColor: "#162232",
  color: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const CloseButton = styled(IconButton)({
  backgroundColor: "#12B28C",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#0E8C6A",
  },
});

const StyledSelect = styled(Select)({
  backgroundColor: "#F4F4F5",
});

const StyledButton = styled(Button)({
  backgroundColor: "#65C565",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#4CAF50",
  },
});

interface CustomModalProps {
  selectedAnimal: AnimalLog | null;
  openTicket: boolean;
  setOpenTicket: React.Dispatch<React.SetStateAction<boolean>>;
}

const CustomModal: React.FC<CustomModalProps> = ({
  selectedAnimal,
  openTicket,
  setOpenTicket,
}) => {
  const { locations, loading, error } = useSelector(
    (state: RootState) => state.locations
  );
  const { usersList, loadingUsersList, errorUsersList } = useSelector(
    (state: RootState) => state.usersList
  );
  const { animalsList, loadingAnimalsList, errorAnimalsList } = useSelector(
    (state: RootState) => state.animalsList
  );
  const { tickets, loadingTicket, errorTicket, success } = useSelector(
    (state: RootState) => state.tickets
  );
  const { messages, loadingMessages, errorMessage } = useSelector(
    (state: RootState) => state.tickets
  );
  const { cameras } = useSelector((state: RootState) => state.cameras);
  const dispatch = useDispatch<AppDispatch>();

  const [ticketLength, setTicketLength] = useState<number>(0);
  const [newTicket, setNewTicket] = useState({
    Title: "",
    CameraId: "",
    AnimalId: "",
    AreaId: "",
    MemberId: "",
    Type: "",
    Remark: "",
    File: null as File | null,
  });
  const [storedData, setStoredData] = useState<any>([]);

  // Open & Close Modal
  const handleOpen = () => setOpenTicket(true);
  const handleClose = () => {
    setOpenTicket(false);
    setErrors({});

  };

  const changeStatus = (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value;
  };

  const changeAssigny = (event: SelectChangeEvent<string>) => {
    const newAssigny = event.target.value;
  };
  const [selectedTicket, setSelectedTicket] = useState<TicketStructer | null>(
    null
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchUsersList());
    dispatch(fetchAnimals());
    dispatch(fetchCameras());
    dispatch(fetchTicket())
      .unwrap()
      .then((tickets) => {
        setTicketLength(tickets.length);
        if (tickets.length > 0) {
          dispatch(fetchMessages(tickets[0].ticketId));
          setSelectedTicket(tickets[0]); // Update when tickets are loaded
        }
      })
      .catch((error) => {
        //  setMessage("Failed to load tickets.");
        toast.error("Error fetching tickets:", error);
      });
  }, [dispatch]);

  const createTicket = () => {
    let newErrors: { [key: string]: string } = {};

    if (!newTicket.Title) newErrors.Title = "Title is required.";
    if (!newTicket.AnimalId) newErrors.AnimalId = "Please select an Animal.";
    if (!newTicket.AreaId) newErrors.AreaId = "Please select a Location.";
    if (!newTicket.MemberId)
      newErrors.MemberId = "Please assign the ticket to a Member.";
    if (!newTicket.CameraId) newErrors.CameraId = "Please select a Camera.";
    if (!newTicket.Type) newErrors.Type = "Please choose a Ticket Type.";
    if (!newTicket.Remark) newErrors.Remark = "Remarks cannot be empty."; // Store error for Remarks field
    // if (!newTicket.File) newErrors.File = "Please upload an image file.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Update errors state
      return;
    }

    // Reset errors if everything is valid
    setErrors({});

    // FormData processing
    const formData = new FormData();
    formData.append("Title", newTicket.Title);
    formData.append("AnimalId", newTicket.AnimalId);
    formData.append("AreaId", newTicket.AreaId);
    formData.append("MemberId", newTicket.MemberId);
    formData.append("CameraId", newTicket.CameraId);
    formData.append("Type", newTicket.Type);
    formData.append("Remark", newTicket.Remark);
     if (newTicket.File) {
       formData.append("File", newTicket.File);
     }

    // const data = {
      // Title: newTicket.Title,
      // AnimalId: newTicket.AnimalId,
      // AreaId: newTicket.AreaId,
      // MemberId: newTicket.MemberId,
      // CameraId: newTicket.CameraId,
      // Type: newTicket.Type,
      // Remark: newTicket.Remark,
    // }

    setOpenTicket(false);

    dispatch(addTicketToAPI(formData))
      .unwrap()
      .then((tickets) => {
        setTicketLength(tickets.length);
        if (tickets.length > 0) {
          dispatch(fetchMessages(tickets[0].ticketId));
          setSelectedTicket(tickets[0]); // Update when tickets are loaded
          setNewTicket({
            Title: "",
            CameraId: "",
            AnimalId: "",
            AreaId: "",
            MemberId: "",
            Type: "",
            Remark: "",
            File: null,
          });
        }
      })
      .catch((error) => {
        //  setMessage("Failed to load tickets.");
        toast.error("Error fetching tickets:", error);
      });
  };

  const getTickerMessage = (ticket: TicketStructer) => {
    dispatch(fetchMessages(ticket.ticketId));
    setSelectedTicket(ticket);
  };

  useEffect(() => {
    const fromPage = localStorage.getItem("fromPage");
    if (fromPage === "homepage") {
      localStorage.removeItem("fromPage"); // Remove to prevent repeated calls

      const rawData = localStorage.getItem("ticketData");
      // Ensure rawData is not null before parsing
      setStoredData(rawData ? JSON.parse(rawData) : null);
    }
  }, []);

  // Handle Input Changes
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = event.target;

    // Handle file input separately
    if (type === "file") {
      const file = (event.target as HTMLInputElement).files?.[0];

      if (file) {
        setNewTicket((prevState) => ({
          ...prevState,
          File: file, // Correctly set file object
        }));

        setErrors((prevErrors) => ({
          ...prevErrors,
          File: "", // Clear error when file is selected
        }));
      }
    } else {
      setNewTicket((prevState) => ({
        ...prevState,
        [name]: value,
      }));

      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: "", // Clear error when user enters valid input
      }));
    }
  };

  const [newMessage, setNewMessage] = useState("");

  const handleMessageSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const phoneNumber =
      usersList.find((user) => user.id === selectedTicket?.memberId)
        ?.phoneNumber || "Not Found";

    const formData = new FormData();
    formData.append("ticketId", (selectedTicket?.id ?? 0).toString()); // Convert to string
    formData.append("Message", newMessage);
    formData.append("Number", phoneNumber);

    dispatch(sendMessage(formData));
    setNewMessage(""); // Clear input field
  };

  const getRelativeTime = (dateString: string): string => {
    const parsedDate = new Date(dateString); // Directly parse the ISO date
    if (isNaN(parsedDate.getTime())) return "Invalid date"; // Handle invalid dates

    const now = new Date();
    const diffInMs = now.getTime() - parsedDate.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 14) return "A week ago";
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;

    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  const formatToIndianDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid dates

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12; // Convert 0 to 12-hour format

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds} ${ampm}`;
  };

  const formatTimestamp = (isoString: any) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <Modal
      open={openTicket}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleClose();
        }
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          bgcolor: "white",
          boxShadow: 24,
          //  p: 4,
          borderRadius: "10px",
          overflow: "scroll",
          maxHeight: "98%",
          "&::-webkit-scrollbar": {
            width: 0,
            height: 0,
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <Box
          sx={{
            padding: "20px 20px",
            background: "#162232",
            color: "#FFF",
            display: "flex",
            justifyContent: "space-between",
            position: "sticky",
            top: "0",
            zIndex: "1",
          }}
        >
          <Typography variant="h6">Create a Ticket</Typography>
          <IconButton
            onClick={handleClose}
            sx={{ color: "#FFF", background: "#12B28C", borderRadius: "5px" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            cursor: "pointer",
            paddingTop: "20px",
            paddingLeft: "20px",
            marginTop: "2px",
          }}
        >
          <Box sx={{ position: "relative", display: "inline-block" }}>
            <img
              src={`${process.env.REACT_APP_API_BASE_URL}/GalleryAPI/Download?path=/${selectedAnimal?.folder}`} // Assuming folder contains the image path
              alt=""
              style={{
                flex: "0 0 34%",
                width: "150px",
                height: "120px",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "0px", // Positioned at the bottom
                right: "0px", // Positioned at the right
                width: "0",
                height: "0",
                borderLeft: "20px solid transparent",
                borderTop: "20px solid transparent",
                borderBottom:
                  selectedAnimal?.alert?.toLowerCase() == "no helmet"
                    ? // selectedAnimal?.alert?.toLocaleLowerCase() == "no helmet"
                    "20px solid #FF3627"
                    : "20px solid #6FD195",
                // borderBottom: "20px solid #FF3627", // Creates downward arrow
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: "16px" }}>
              {selectedAnimal?.alert} | {selectedAnimal?.area}
            </Typography>
            <Typography sx={{ fontSize: "13px" }}>
              {selectedAnimal?.camera} |{" "}
              {selectedAnimal?.date
                ? formatTimestamp(selectedAnimal.date)
                : null}
            </Typography>
            <Box sx={{ display: "flex", gap: "15px", marginTop: "10px" }}>
              <Button
                sx={{
                  backgroundColor: "#7646F554",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  color: "#000",
                  textTransform: "capitalize",
                }}
              >
                <span
                  style={{
                    height: "10px",
                    width: "10px",
                    borderRadius: "50%",
                    backgroundColor:
                      selectedAnimal &&
                        typeof selectedAnimal === "object" &&
                        selectedAnimal?.color
                        ? selectedAnimal.color
                        : "transparent", // Default fallback color

                    marginRight: "3px",
                  }}
                ></span>
                {selectedAnimal?.animal}
              </Button>
              <Button
                sx={{
                  backgroundColor:
                    // selectedAnimal?.alert == "Village Crossing" ||
                    selectedAnimal?.alert?.toLowerCase() == "no helmet"
                      ? "red"
                      : "#6FD195",
                  borderRadius: "6px",
                  padding: "6px 10px",
                  color: "#000",
                  textTransform: "capitalize",
                }}
              >
                {selectedAnimal?.alert?.toLowerCase() == "no helmet"
                  ? // selectedAnimal?.alert == "Checkpost Crossing"
                  "Alert"
                  : "Log"}
              </Button>
            </Box>
          </Box>
        </Box>
        <Box sx={{ padding: "20px" }}>
          <Grid container spacing={2}>
            {/* Left Side */}
            <Grid item xs={12} md={12}>
              <TextField
                fullWidth
                name="Title"
                label="Title"
                margin="normal"
                value={newTicket.Title}
                onChange={handleChange}
                error={!!errors.Title} // Show error styling if there's an error
                helperText={errors.Title} // Display validation message if any
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ paddingTop: "2px !important" }}>
              <TextField
                fullWidth
                select
                name="AnimalId"
                label="Animal"
                margin="normal"
                value={newTicket.AnimalId}
                onChange={handleChange}
                error={!!errors.AnimalId} // Show error styling if there's an error
                helperText={errors.AnimalId} // Display validation message if any
              >
                <MenuItem value="" disabled>
                  <em>Select a Animal</em>
                </MenuItem>
                {animalsList.map((animal) => (
                  <MenuItem key={animal.id} value={animal.id}>
                    {animal.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                name="AreaId"
                margin="normal"
                label="Select a Location"
                value={newTicket.AreaId}
                onChange={handleChange}
                error={!!errors.AreaId} // Show error styling if there's an error
                helperText={errors.AreaId} // Display validation message if any
              >
                <MenuItem value="" disabled>
                  <em>Select a Location</em>
                </MenuItem>
                {locations.map((location) => (
                  <MenuItem key={location.id} value={location.id}>
                    {location.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                name="MemberId" // Match the state key exactly
                label="Assigned To"
                margin="normal"
                value={newTicket.MemberId} // Ensure this stores the user ID
                onChange={handleChange}
                error={!!errors.MemberId} // Show error styling if there's an error
                helperText={errors.MemberId} // Display validation message if any
              >
                {usersList.map((selectedUser) => (
                  <MenuItem key={selectedUser.id} value={selectedUser.id}>
                    {selectedUser.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Right Side */}
            <Grid item xs={12} md={6} sx={{ paddingTop: "0px !important" }}>
              <TextField
                fullWidth
                type="file"
                name="File"
                margin="normal"
                inputProps={{ accept: "image/*" }}
                onChange={handleChange}
                error={!!errors.File} // Show error styling if there's an error
                helperText={errors.File} // Display validation message if any
              />
              <TextField
                select
                fullWidth
                name="CameraId"
                label="Select Camera"
                margin="normal"
                value={newTicket.CameraId}
                onChange={handleChange}
                error={!!errors.CameraId} // Show error styling if there's an error
                helperText={errors.CameraId} // Display validation message if any
              >
                {cameras.map((camera) => (
                  <MenuItem key={camera.id} value={camera.id}>
                    {camera.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                name="Type"
                label="Type"
                margin="normal"
                value={newTicket.Type}
                onChange={handleChange}
                error={!!errors.Type} // Show error styling if there's an error
                helperText={errors.Type} // Display validation message if any
              >
                <MenuItem value="log">Log</MenuItem>
                <MenuItem value="alert">Alert</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={12} sx={{ paddingTop: "2px !important" }}>
              <TextField
                margin="normal"
                name="Remark"
                label="Remarks"
                multiline
                rows={3}
                fullWidth
                value={newTicket.Remark}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.Remark} // Show error styling if there's an error
                helperText={errors.Remark} // Display validation message if any
              />
            </Grid>
            <Grid item xs={12} md={12}>
              {/* Submit Button */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ background: "#65C565" }}
                  onClick={createTicket}
                >
                  Create Ticket
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Modal>
  );
};

export default CustomModal;
