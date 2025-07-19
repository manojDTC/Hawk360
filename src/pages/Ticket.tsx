import React, { useState, useEffect } from "react";
import {
  Grid,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  MenuItem,
  Select,
  Stack,
  Modal,
  Button,
  TextField,
  SelectChangeEvent,
  IconButton,
  Badge,
} from "@mui/material";
import enterArrow from "../assets/images/enterArrow.svg";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./../store/store"; // Import types
import { fetchLocations } from "./../store/slice/locationSlice";
import { fetchUsersList } from "./../store/slice/usersListSlice";
import { fetchAnimals } from "./../store/slice/animalListSlice";
import {
  fetchTicket,
  fetchMessages,
  TicketStructer,
  sendMessage,
  addTicketToAPI,
  changeTicketStatus,
} from "./../store/slice/ticketSlice";
import CloseIcon from "@mui/icons-material/Close";
import { fetchCameras } from "../store/slice/cameraSlice";
import { Backdrop, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";

//import moment from "moment";
const fileUrl = process.env.REACT_APP_API_BASE_URL;

const Ticket = () => {
  const { locations } = useSelector((state: RootState) => state.locations);
  const { usersList } = useSelector((state: RootState) => state.usersList);
  const { animalsList } = useSelector((state: RootState) => state.animalsList);
  const { tickets, loadingTicket, success } = useSelector(
    (state: RootState) => state.tickets
  );
  const { messages, loadingMessages } = useSelector(
    (state: RootState) => state.tickets
  );
  const { cameras } = useSelector((state: RootState) => state.cameras);
  const dispatch = useDispatch<AppDispatch>();
  // Modal state
  const [open, setOpen] = useState(false);

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
  const [selectedTicket, setSelectedTicket] = useState<TicketStructer | null>(
    null
  );
  const [selectedAssignee, setSelectedAssignee] = useState<string | "Unknown">(
    selectedTicket?.memberId || "Unknown"
  );
  const [selectedStatus, setSelectedStatus] = useState<string | "Unknown">(
    selectedTicket?.status || "Unknown"
  );

  // Open & Close Modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const changeStatus = (event: SelectChangeEvent<string>) => {
    const newStatus = event.target.value;
    if (!selectedTicket?.id) {
      toast.error("No ticket selected!");
      return;
    }
    dispatch(
      changeTicketStatus({
        newStatus,
        ticketId: selectedTicket.id,
        MemberId: selectedTicket.memberId,
      })
    )
      .unwrap()
      .then(() => {
        setSelectedStatus(newStatus);
        toast.success("Ticket status updated successfully!");
      })
      .catch((error) => toast.error("Error updating ticket: "));
  };

  const changeAssignee = (event: SelectChangeEvent<string>) => {
    const MemberId = event.target.value;
    if (!selectedTicket?.id) {
      toast.error("No ticket selected!");
      return;
    }
    dispatch(
      changeTicketStatus({
        newStatus: selectedTicket.status,
        ticketId: selectedTicket.id,
        MemberId: MemberId,
      })
    )
      .unwrap()
      .then(() => {
        setSelectedAssignee(MemberId);
        toast.success("Ticket assignee has been updated successfully.");
      })
      .catch((error) => toast.error("Error updating ticket: "));
  };

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
          dispatch(fetchMessages(tickets[0].id));
          setSelectedTicket(tickets[0]); // Update when tickets are loaded
          setSelectedAssignee(tickets[0].memberId);
          setSelectedStatus(tickets[0].status);
        }
      })
      .catch((error) => {
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
    setOpen(false);
    //console.log("FormData Entries:", Array.from(formData.entries()));

    const data = {
      Title: newTicket.Title,
      AnimalId: newTicket.AnimalId,
      AreaId: newTicket.AreaId,
      MemberId: newTicket.MemberId,
      CameraId: newTicket.CameraId,
      Type: newTicket.Type,
      Remark: newTicket.Remark
    }

    dispatch(addTicketToAPI(formData))
      .unwrap()
      .then((response) => {
        const ticketData = response.value;
        if (Array.isArray(ticketData) && ticketData.length > 0) {
          setTicketLength(ticketData.length);
          dispatch(fetchMessages(ticketData[0].id));
          setSelectedTicket(ticketData[0]);
          setSelectedAssignee(ticketData[0].memberId);
          setSelectedStatus(ticketData[0].status);
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
        } else {
          console.warn("No tickets returned");
        }
      })
      .catch((error) => {
        toast.error("Error fetching tickets:", error);
      });
  };

  //console.log(ticketLength);
  //  console.log(tickets);
  const getTickerMessage = (ticket: TicketStructer) => {
    dispatch(fetchMessages(ticket.id));
    setSelectedTicket(ticket);
    setSelectedAssignee(ticket.memberId);
    setSelectedStatus(ticket.status);
    //console.log(ticket);
  };

  useEffect(() => {
    const fromPage = localStorage.getItem("fromPage");
    if (fromPage === "homepage") {
      localStorage.removeItem("fromPage"); // Remove to prevent repeated calls

      const rawData = localStorage.getItem("ticketData");
      // Ensure rawData is not null before parsing
      setStoredData(rawData ? JSON.parse(rawData) : null);
      console.log(storedData);
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

  const handleDefaultMessages = (message: string) => {
    if (!message.trim()) return;
    const phoneNumber =
      usersList.find((user) => user.id === selectedTicket?.memberId)
        ?.phoneNumber || "Not Found";

    const formData = new FormData();
    formData.append("ticketId", (selectedTicket?.id ?? 0).toString()); // Convert to string
    formData.append("Message", message);
    formData.append("Number", phoneNumber);

    dispatch(sendMessage(formData)) // ✅ Correct usage
      .unwrap()
      .then(() => {
        toast.success("Message sent successfully!");
        setNewMessage(""); // Clear input field after success
      })
      .catch(() => toast.error("Failed to send message"));
  };
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

    dispatch(sendMessage(formData)) // ✅ Correct usage
      .unwrap()
      .then(() => {
        toast.success("Message sent successfully!");
        setNewMessage(""); // Clear input field after success
      })
      .catch(() => toast.error("Failed to send message"));
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
  return (
    <>
      <Box
        sx={{
          flexGrow: 1,
          p: 2,
          marginLeft: "48px",
          position: "relative",
          top: "48px",
          background: "#000",
        }}
      >
        <Grid container>
          <Grid
            item
            xs={12}
            sm={3}
          >
            <Card
              sx={{
                height: "100%",
                overflowY: "auto",
                backgroundColor: "#222D3A",
              }}
            >
              <Typography
                component="h2"
                sx={{
                  background: "#65C565",
                  color: "#FFF",
                  fontSize: "23px",
                  padding: "10px",
                }}
              >
                Tickets
                <button
                  style={{
                    background: "#FFF",
                    color: "#3ca008",
                    marginLeft: "10px",
                    float: "right",
                    height: "36px",
                    borderRadius: "5px",
                    border: "#3ca008 solid",
                    cursor: "pointer",
                  }}
                  onClick={handleOpen}
                >
                  Create Ticket
                </button>
              </Typography>

              <List
                sx={{
                  color: "#FFF",
                  backgroundColor: "#222D3A",
                  paddingTop: "0",
                  maxHeight: "calc(100vh - 150px)", //
                  overflowY: "auto", //
                }}
              >
                {(tickets ?? []).map((ticket, index) => (
                  <ListItem
                    key={ticket.ticketId}
                    component="div"
                    onClick={() => {
                      getTickerMessage(ticket);
                    }}
                    sx={{
                      backgroundColor:
                        ticket.ticketId === selectedTicket?.ticketId
                          ? "#65C5652B"
                          : "#222D3A",
                      "&:hover": { backgroundColor: "#65C5652B" },
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      padding: "10px",
                    }}
                  >
                    {/* Left: User Image */}
                    <Avatar
                      src={`${fileUrl}${ticket.fileURL}`} // Avoids passing empty string
                      alt="User"
                      sx={{
                        width: 50,
                        height: 50,
                        marginRight: 2,
                        borderRadius: "5px",
                        backgroundColor: "#ccc", // Background color for text avatar
                        fontSize: "20px", // Adjust font size
                        fontWeight: "bold", // Make text bold
                      }}
                    />

                    {/* Middle: Ticket Info */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ color: "#FFF" }}>
                        {ticket.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#AAA" }}>
                        Ticket ID: #{String(ticket.ticketId).padStart(3, "0")}{" "}
                        <br /> Location: {ticket.area}
                      </Typography>
                    </Box>

                    {/* Right: Update Time */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px", // Adds spacing between date and badge
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#777",
                          minWidth: "80px",
                          textAlign: "right",
                        }}
                      >
                        {getRelativeTime(ticket.createdDate)}
                      </Typography>
                      <Badge
                        sx={{
                          "& .MuiBadge-badge": {
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor:
                              ticket.status === "Closed"
                                ? "#0F60FF"
                                : "#FF5151",
                          },
                        }}
                        badgeContent=""
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Card>
          </Grid>

          {/* Right Panel: Ticket Details */}
          <Grid
            item
            xs={12}
            sm={9}
            sx={{ backgroundColor: "#222D3A", borderLeft: " solid 4px #000" }}
          >
            {!loadingTicket && ticketLength === 0 ? (
              <Typography
                variant="h5"
                sx={{
                  minHeight: "calc(100vh - 85px)",
                  color: "#FFF",
                  alignContent: "center",
                  justifyContent: "center",
                  textAlign: "center",
                }}
              >
                Tickets are not available. Use the 'Create Ticket' button to
                create a new ticket.
              </Typography>
            ) : (
              <Card
                sx={{
                  backgroundColor: "#222D3A",
                  color: "#FFF",
                  padding: "0",
                  paddingBottom: "1px",
                }}
              >
                <CardContent sx={{ padding: "0" }}>
                  {/* Header */}
                  <Grid
                    container
                    alignItems="center"
                    sx={{
                      background:
                        "linear-gradient(to right,rgb(118, 117, 117),rgb(76, 117, 92))",
                      padding: "10px 0 0 0",
                    }}
                  >
                    {/* Left: User Avatar + Ticket ID & Type */}
                    <Grid
                      item
                      xs={3}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Avatar
                        src={`${fileUrl}${selectedTicket?.fileURL}`} // Avoids passing empty string
                        alt="User"
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: "5px",
                          marginRight: 2,
                          marginLeft: "8px",
                        }}
                      >
                        {!selectedTicket?.fileURL && "A"}{" "}
                        {/* Display 'A' if no image */}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="#FFF">
                          <Typography>
                            Ticket ID: #
                            {String(selectedTicket?.ticketId).padStart(3, "0")}
                          </Typography>
                        </Typography>
                        <Typography variant="body2" color="#FFF">
                          {selectedTicket?.title}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid
                      item
                      xs={4}
                      container
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Stack spacing={1} alignItems="center">
                        <Typography variant="h5" fontWeight="bold">
                          {selectedTicket?.animal} | {selectedTicket?.area}
                        </Typography>
                        <Typography variant="body2" color="#AAA">
                          {selectedTicket?.createdDate
                            ? formatToIndianDate(selectedTicket.createdDate)
                            : "No Date Available"}
                        </Typography>
                      </Stack>
                    </Grid>

                    {/* Right: Status Dropdown & Assign To Dropdown */}
                    <Grid
                      item
                      xs={5}
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                      }}
                    >
                      {/* Ticket Status */}
                      <Select
                        value={selectedStatus}
                        onChange={changeStatus}
                        disabled={selectedStatus === "Closed"}
                        sx={{
                          backgroundColor:
                            selectedStatus === "Closed" ? "#0F60FF" : "#FF5151",
                          color: "#FFF",
                          minWidth: "150px",
                          height: "40px",
                        }}
                      >
                        <MenuItem value="Open">Open</MenuItem>
                        <MenuItem value="Closed">Closed</MenuItem>
                      </Select>
                      <Typography
                        variant="body2"
                        sx={{
                          verticalAlign: "middle",
                          alignContent: "center",
                          justifyContent: "center",
                        }}
                      >
                        Assigned to
                      </Typography>
                      {/* Assign To */}
                      <Select
                        disabled={selectedStatus === "Closed"}
                        value={selectedAssignee}
                        onChange={changeAssignee}
                        sx={{
                          background: "#FFF",
                          color: "#444",
                          minWidth: "150px",
                          height: "40px",
                          marginRight: "8px",
                        }}
                      >
                        {usersList.map((selectedUser) => (
                          <MenuItem
                            key={selectedUser.id}
                            value={selectedUser.id}
                          >
                            {selectedUser.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </Grid>
                  </Grid>
                  <Box
                    sx={{
                      height: `calc(100vh - ${selectedStatus === "Closed" ? 198 : 320
                        }px)`,
                      overflow: "auto",
                      margin: "20px 0 0 0",
                    }}
                  >
                    {loadingMessages ? (
                      <Typography
                        variant="h5"
                        sx={{
                          minHeight: "-webkit-fill-available",
                          color: "#FFF",
                          alignContent: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        Loading messages
                      </Typography>
                    ) : messages.length === 0 ? (
                      <Typography
                        variant="h5"
                        sx={{
                          minHeight: "-webkit-fill-available",
                          color: "#FFF",
                          alignContent: "center",
                          justifyContent: "center",
                          textAlign: "center",
                        }}
                      >
                        Messages not found. Use standard short messages or enter
                        your message in the input box and press the Enter button
                        or key.
                      </Typography>
                    ) : (
                      messages.map((msg, index) => (
                        <Grid
                          container
                          key={index}
                          sx={{
                            marginBottom: 2,
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Box
                            sx={{
                              minWidth: "90%",
                              maxWidth: "90%",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "anchor-center",
                                margin: "8px 8px",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Typography>Command Centre</Typography>
                              <Avatar
                                sx={{
                                  width: 40,
                                  height: 40,
                                  margin: "0 8px 0 0",
                                  backgroundColor: "#0F60FF", // Green background
                                  color: "white", // White text
                                  fontSize: "20px", // Bigger text
                                  fontWeight: "bold", // Bold text
                                  marginLeft: "8px",
                                }}
                              >
                                C {/* Hardcoded "C" */}
                              </Avatar>
                            </Box>
                            <Box
                              sx={{
                                color: "#FFF",
                                padding: "8px 12px",
                                borderRadius: "12px",
                                boxShadow: 1,
                                marginTop: "8px",
                              }}
                            >
                              <Typography variant="body1">
                                {msg.messageText}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  display: "block",
                                  textAlign: "right",
                                }}
                              >
                                {msg.timestamp}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))
                    )}
                  </Box>
                  {selectedStatus !== "Closed" ? (
                    <>
                      <List
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          padding: 0,
                        }}
                      >
                        {[
                          "Update status",
                          "Send live location",
                          "Send photos/vidoes",
                          "Ok",
                          "Good job",
                        ].map((suggestion) => (
                          <ListItem
                            key={suggestion}
                            sx={{
                              width: "auto",
                              background: "#65C565",
                              color: "#FFF",
                              margin: "8px",
                              borderRadius: "5px",
                              cursor: "pointer", // Make it clickable
                            }}
                            onClick={() => handleDefaultMessages(suggestion)}
                          >
                            <ListItemText primary={suggestion} />
                          </ListItem>
                        ))}
                      </List>

                      <form style={styles.form} onSubmit={handleMessageSubmit}>
                        <input
                          type="text"
                          placeholder="Type your message..."
                          style={styles.input}
                          value={newMessage} // Controlled component
                          onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" style={styles.button}>
                          <img
                            src={enterArrow}
                            alt="Enter Key Icon"
                            style={styles.icon}
                          />
                          Enter
                        </button>
                      </form>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Box>
      {/* Create Ticket Modal */}
      {!success && (
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)", // 50% opacity
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
          open={!success} // Show overlay when loading
        >
          <Stack alignItems="center">
            <CircularProgress color="inherit" />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Creating new ticket, please wait...
            </Typography>
          </Stack>
        </Backdrop>
      )}
      <Modal
        open={open}
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
    </>
  );
};
const styles: { [key: string]: React.CSSProperties } = {
  form: {
    margin: "0 8px",
    display: "flex",
    //width: "90%",
    padding: "9px 10px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "none",
    fontSize: "16px",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    backgroundColor: "#65C565",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "8px",
  },
  icon: {
    marginRight: "8px",
  },
};

export default Ticket;
