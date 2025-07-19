import React, { useState, useEffect, useRef } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { PauseRounded } from "@mui/icons-material";
import playButton from "../../assets/images/playButton.png";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store"; // Import types
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchUsersList } from "../../store/slice/usersListSlice";
import CustomModal from "./LogModal";
import { fetchLiveLogs } from "../../store/slice/homePageLogs";

export interface Animal {
  id: string;
  folder: string;
  alert: string;
  timeName: string;
  areaName: string;
  animalName: string;
  cameraName: string;
  color: string;
}

type Item = {
  id: string;
  name: string;
};

export interface AnimalLog {
  id: string;
  folder: string;
  animal: string;
  area: string;
  camera: string;
  date: string;
  alert?: string;
  color?: string;
}

type AlertsFilter = {
  [category: string]: Item[];
};

// Sample data
const alertsFilter: AlertsFilter = {
  camera: [
    { id: "CAM1", name: "Camera 1" },
    { id: "CAM2", name: "Camera 2" },
  ],
  animal: [
    { id: "ANM1", name: "Tiger" },
    { id: "ANM2", name: "Elephant" },
    { id: "ANM3", name: "Deer" },
    { id: "ANM4", name: "Bear" },
  ],
  area: [
    { id: "AREA1", name: "Village" },
    { id: "AREA2", name: "North Zone" },
    { id: "AREA3", name: "Checkpost" },
    { id: "AREA4", name: "East Zone" },
    { id: "AREA5", name: "West Zone" },
  ],
};

export const formatDate = (date: Date) => {
  return `${String(date.getDate()).padStart(2, "0")}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${date.getFullYear()}`;
};

const getDateOptions = () => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 7);

  const lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);

  return [
    { id: formatDate(today), name: "Today" },
    { id: formatDate(yesterday), name: "Yesterday" },
    { id: formatDate(lastWeek), name: "One Week Ago" },
    { id: formatDate(lastMonth), name: "One Month Ago" },
    { id: "custom", name: "Custom" }, // Add custom option
  ];
};

interface LogsProps {
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
}

const Logs: React.FC<LogsProps> = ({ isPlaying, setIsPlaying }) => {
  const [openLogModal, setOpenLogModal] = React.useState(false);

  const [date, setDate] = useState(formatDate(new Date()));
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const dateOptions = getDateOptions();
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalLog | null>(null);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  );
  const [animals, setAnimals] = useState<AnimalLog[]>([]);
  const [openTicket, setOpenTicket] = useState<boolean>(false);

  const { liveLogs } = useSelector((state: RootState) => state.logs);

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      event.stopPropagation(); // Prevents the Select from closing
      setExpandedAccordion(isExpanded ? panel : false);
    };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedItems, setSelectedItems] = useState<{
    [key: string]: boolean;
  }>({});
  const parseDate = (dateString: string | undefined) => {
    if (!dateString) return new Date("1970-01-01"); // Default fallback date to prevent errors

    const parts = dateString.split(" "); // Ensure space separator exists
    if (parts.length < 2) return new Date("1970-01-01"); // Fallback for incorrect format

    const [day, month, year] = parts[0].split("-");
    const [hour, minute, second] = parts[1].split(":");

    if (!day || !month || !year || !hour || !minute || !second) {
      console.warn("Invalid date format:", dateString);
      return new Date("1970-01-01"); // Return default date if parsing fails
    }

    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  };

  useEffect(() => {
    if (!openTicket) {
      setSelectedAnimal(null);
    }
  }, [openTicket]);

  useEffect(() => {
    setAnimals(liveLogs);
  }, [liveLogs]);

  useEffect(() => {
    if (selectedItems || date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of the day

      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const lastWeek = new Date(today);
      lastWeek.setDate(today.getDate() - 7);

      const lastMonth = new Date(today);
      lastMonth.setMonth(today.getMonth() - 1);

      const filteredAnimals = animals.filter((animal) => {
        if (!animal.date) return false; // Skip invalid dates

        const animalDate = parseDate(animal.date); // Convert to Date object
        animalDate.setHours(0, 0, 0, 0); // Reset time for proper comparison

        let dateCondition = false;

        if (date === formatDate(today)) {
          // Today
          dateCondition = animalDate.getTime() === today.getTime();
        } else if (date === formatDate(yesterday)) {
          // Yesterday
          dateCondition = animalDate.getTime() === yesterday.getTime();
        } else if (date === formatDate(lastWeek)) {
          // Last Week
          dateCondition =
            animalDate.getTime() >= lastWeek.getTime() &&
            animalDate.getTime() <= today.getTime();
        } else if (date === formatDate(lastMonth)) {
          // Last Month
          dateCondition =
            animalDate.getTime() >= lastMonth.getTime() &&
            animalDate.getTime() <= today.getTime();
        } else if (date === "custom" && startDate && endDate) {
          // Custom Date Range
          dateCondition =
            animalDate.getTime() >= startDate.getTime() &&
            animalDate.getTime() <= endDate.getTime();
        }

        return (
          (selectedItems[animal.camera] ||
            selectedItems[animal.animal] ||
            selectedItems[animal.area]) &&
          dateCondition
        );
      });

      const enrichAnimalData = (animal: any) => {
        const camera = alertsFilter.camera.find(
          (cam) => cam.id === animal.camera
        );
        const animalDetail = alertsFilter.animal.find(
          (a) => a.id === animal.animal
        );
        const team = alertsFilter.team.find((t) => t.id === animal.team);
        const member = alertsFilter.member.find((m) => m.id === animal.member);
        const area = alertsFilter.area.find((a) => a.id === animal.area);

        return {
          ...animal,
          cameraName: camera ? camera.name : "Unknown Camera",
          timeName: animal.date,
          animalName: animalDetail ? animalDetail.name : "Unknown Animal",
          teamName: team ? team.name : "Unknown Team",
          memberName: member ? member.name : "Unknown Member",
          areaName: area ? area.name : "Unknown Area",
        };
      };
    }
  }, [selectedItems, date, startDate, endDate]);

  // Handle checkbox changes
  const handleChanges = (id: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    const updatedSelectedItems = { ...selectedItems };
    alertsFilter.camera.forEach((item) => {
      updatedSelectedItems[item.id] = true;
    });
    setSelectedItems(updatedSelectedItems);
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!containerRef.current) return;

    const canvas = await html2canvas(containerRef.current, {
      scale: 2, // Higher scale for better resolution
      useCORS: true,
    });

    canvas.toBlob((blob) => {
      if (blob)
        saveAs(
          blob,
          `${selectedAnimal?.camera}_${
            selectedAnimal?.date
          }.${selectedAnimal?.folder.split(".").pop()}`
        );
    });
  };

  const handleOpenLogModal = (id: any) => {
    setSelectedAnimal(id); // Store clicked animal data
    setOpenLogModal(true);
  };

  const handleCloseLogModal = () => {
    setOpenLogModal(false);
    setSelectedAnimal(null);
  };

  const handleTogglePausePlay = () => {
    setIsPlaying((prevState: boolean) => !prevState);
  };

  const dispatch = useDispatch<AppDispatch>();

  const selectedValues = Object.keys(selectedItems).filter(
    (key) => selectedItems[key]
  );

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start a new interval if `isPlaying` is false
    if (!isPlaying) {
      intervalRef.current = setInterval(() => {
        dispatch(fetchLiveLogs());
      }, 5000);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    dispatch(fetchUsersList());
  }, [dispatch]);

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
    <Box>
      <Box
        sx={{
          background: "#222D3A",
          borderRadius: "4px",
          marginTop: "8px",
          padding: "10px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              sx={{
                color: "#ffffff",
                fontSize: "16px",
                display: "flex",
                gap: "10px",
              }}
            >
              Logs
              <span>
                {isPlaying ? (
                  <img
                    onClick={handleTogglePausePlay}
                    src={playButton}
                    alt=""
                    style={{ height: "20px", cursor: "pointer" }}
                  ></img>
                ) : (
                  <PauseRounded
                    onClick={handleTogglePausePlay}
                    sx={{ height: "20px", cursor: "pointer" }}
                  />
                )}
              </span>
            </Typography>
          </Box>
          <Box>
            <Box sx={{ display: "flex", gap: "5px" }}>
              <FormControl sx={{ m: 1, minWidth: 150 }} size="small">
                <InputLabel id="multi-select-label" sx={{ color: "#ffffff" }}>
                  Select Categories
                </InputLabel>
                <Select
                  labelId="multi-select-label"
                  id="multi-select"
                  multiple
                  value={selectedValues} // Set value as selected items
                  onChange={() => {}} // Not needed, handled separately
                  renderValue={(selected) => {
                    if (!selected || selected.length === 0)
                      return "Select Items"; // Placeholder
                    return selected
                      .map((id) => {
                        const category = Object.keys(alertsFilter).find((key) =>
                          alertsFilter[key].some((item) => item.id === id)
                        );
                        if (category) {
                          const item = alertsFilter[category].find(
                            (item) => item.id === id
                          );
                          return item ? item.name : id;
                        }
                        return id;
                      })
                      .join(", ");
                  }}
                  sx={{
                    width: "200px",
                    height: "38px",
                    background: "#162232",
                    border: "none",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .MuiSelect-select": {
                      fontSize: "14px",
                      color: "#ffffff",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    },
                    "& .MuiSelect-icon": { color: "#ffffff" },
                  }}
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      onMouseDown: (e: any) => e.stopPropagation(), // Prevents dropdown closing
                      sx: {
                        maxHeight: 250,
                        overflowY: "auto",
                        background: "#162232",
                      },
                    },
                  }}
                >
                  {Object.entries(alertsFilter).map(([category, items]) => (
                    <Accordion
                      key={category}
                      expanded={expandedAccordion === category}
                      onChange={handleAccordionChange(category)}
                      sx={{ background: "#162232", color: "#ffffff" }}
                    >
                      <AccordionSummary
                        expandIcon={
                          <ExpandMoreIcon sx={{ color: "#ffffff" }} />
                        }
                        onClick={(e) => e.stopPropagation()} // Prevents closing
                      >
                        <Typography>{category.toUpperCase()}</Typography>
                      </AccordionSummary>
                      <AccordionDetails onClick={(e) => e.stopPropagation()}>
                        {items.map((item) => (
                          <MenuItem
                            key={item.id}
                            value={item.id}
                            onClick={() => handleChanges(item.id)}
                            sx={{
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "#ffffff",
                            }}
                          >
                            <Checkbox
                              checked={!!selectedItems[item.id]}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleChanges(item.id);
                              }}
                              name={item.id}
                            />
                            {item.name}
                          </MenuItem>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                <InputLabel
                  id="demo-select-small-label"
                  sx={{ color: "#ffffff" }}
                >
                  Select Time
                </InputLabel>
                <Select
                  id="date-select"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  sx={{
                    height: "38px",
                    background: "#162232",
                    border: "none",
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "& .MuiSelect-select": {
                      fontSize: "14px",
                      color: "#ffffff",
                    },
                    "& .MuiSelect-icon": { color: "#ffffff" },
                  }}
                  MenuProps={{
                    disableAutoFocusItem: true,
                    PaperProps: {
                      sx: {
                        background: "#162232",
                        color: "#ffffff",
                        maxHeight: 250,
                        overflowY: "auto",
                      },
                    },
                  }}
                >
                  {dateOptions.map((option) => (
                    <MenuItem
                      key={option.id}
                      value={option.id}
                      sx={{
                        background: "#162232",
                        color: "#ffffff",
                        "&:hover": { background: "#1d2a3a" },
                      }}
                    >
                      {option.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <br />
            </Box>
          </Box>
        </Box>
        <Box>
          {date === "custom" && (
            <Box
              sx={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
                justifyContent: "flex-end", // Moves items to the right
              }}
            >
              <TextField
                label="Start Date"
                type="date"
                value={startDate ? startDate.toISOString().split("T")[0] : ""}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                InputLabelProps={{
                  shrink: true,
                  style: { color: "#ffffff" },
                }}
                sx={{
                  background: "#162232",
                  "& .MuiInputBase-input": {
                    color: "#ffffff",
                    "&::-webkit-calendar-picker-indicator": {
                      filter: "invert(1)", // Makes the default icon white
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ffffff" },
                    "&:hover fieldset": { borderColor: "#ffffff" },
                    "&.Mui-focused fieldset": { borderColor: "#ffffff" },
                  },
                }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate ? endDate.toISOString().split("T")[0] : ""}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                InputLabelProps={{
                  shrink: true,
                  style: { color: "#ffffff" },
                }}
                sx={{
                  background: "#162232",
                  "& .MuiInputBase-input": {
                    color: "#ffffff",
                    "&::-webkit-calendar-picker-indicator": {
                      filter: "invert(1)", // Makes the default icon white
                    },
                  },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#ffffff" },
                    "&:hover fieldset": { borderColor: "#ffffff" },
                    "&.Mui-focused fieldset": { borderColor: "#ffffff" },
                  },
                }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ overflow: "scroll", height: "calc(100vh - 223px)" }}>
          {animals.length &&
            animals.map((animal: any, index: number) => (
              <Box
                key={animal.id}
                sx={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  cursor: "pointer",
                  padding: "6px",
                  "&:hover": {
                    background: "#00000080",
                  },
                  animation: index === 0 ? "fadeIn 1s ease-in-out" : "none", // Apply fade-in animation to the first item
                }}
                onClick={() => {
                  handleOpenLogModal(animal);
                }}
              >
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL}/GalleryAPI/Download?path=/${animal.folder}`} // Assuming folder contains the image path
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
                        // animal.alert == "Village Crossing" ||
                        animal.alert?.toLowerCase() == "no helmet"
                          ? "20px solid #FF3627"
                          : "20px solid #6FD195",
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: "16px", color: "#ffffff" }}>
                    {animal.alert} | {animal.area}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: "#ffffff" }}>
                    {animal.camera} | {formatTimestamp(animal.date)}
                  </Typography>
                  <Box sx={{ display: "flex", gap: "15px", marginTop: "10px" }}>
                    <Button
                      sx={{
                        backgroundColor: "#7646F554",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        color: "white",
                        textTransform: "capitalize",
                      }}
                    >
                      <span
                        style={{
                          height: "10px",
                          width: "10px",
                          borderRadius: "50%",
                          backgroundColor: animal.color, // Use animal's color
                          marginRight: "3px",
                        }}
                      ></span>
                      {animal.animal}
                    </Button>
                    <Button
                      sx={{
                        backgroundColor:
                          // animal.alert == "Village Crossing" ||
                          animal.alert?.toLowerCase() === "no helmet"
                            ? "red"
                            : "#6FD195",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        color: "white",
                        textTransform: "capitalize",
                      }}
                    >
                      {animal.alert?.toLowerCase() === "no helmet"
                        ? // animal.alert == "Checkpost Crossing"
                          "Alert"
                        : "Log"}
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
        </Box>
      </Box>
      <Modal
        open={openLogModal}
        onClose={handleCloseLogModal}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "65%",
              bgcolor: "#272727",
              boxShadow: 24,
              pt: 2,
              px: 2,
              pb: 2,
              height: "calc(100vh - 100px)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "normal",
                }}
              >
                View Log
              </h2>
              <Button
                onClick={handleCloseLogModal}
                style={{
                  color: "#fff",
                  backgroundColor: "#D32F2F", // Standard Material UI Red
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "none",
                  boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                X
              </Button>
            </Box>

            {selectedAnimal && (
              <>
                <Box
                  sx={{ position: "relative" }}
                  ref={containerRef}
                  id="my-container"
                >
                  {/* Image */}
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL}/GalleryAPI/Download?path=/${selectedAnimal.folder}`} // Use selected animal's image
                    alt="detectedAnimal"
                    style={{
                      width: "100%",
                      maxHeight: "100%",
                      objectFit: "cover",
                    }}
                  />

                  {/* Details Box (Top-Right Corner) */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
                      borderRadius: "4px",
                      padding: "8px",
                      color: "#ffffff",
                    }}
                  >
                    <Typography variant="body2">
                      <strong>Details:</strong>{" "}
                      {selectedAnimal && selectedAnimal.alert}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Animal:</strong> {selectedAnimal.animal}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Time:</strong>{" "}
                      {formatTimestamp(selectedAnimal.date)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Location:</strong> {selectedAnimal.area}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Camera:</strong> {selectedAnimal.camera}
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Box>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "65%",
              bgcolor: "#272727",
              boxShadow: 24,
              pt: 2,
              px: 2,
              pb: 2,
              height: "calc(100vh - 100px)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  color: "#ffffff",
                  fontSize: "16px",
                  fontWeight: "normal",
                }}
              >
                View Log
              </h2>
              <Button
                onClick={handleCloseLogModal}
                style={{
                  color: "#fff",
                  backgroundColor: "#D32F2F", // Standard Material UI Red
                  padding: "6px 10px",
                  borderRadius: "4px",
                  border: "none",
                  boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                X
              </Button>
            </Box>

            {selectedAnimal && (
              <>
                <Box>
                  <img
                    src={`${process.env.REACT_APP_API_BASE_URL}/GalleryAPI/Download?path=/${selectedAnimal.folder}`} // Use selected animal's image
                    alt="detectedAnimal"
                    style={{
                      width: "100%",
                      maxHeight: "450px",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box
                    sx={{
                      flex: "0 0 33.33%",
                      textAlign: "center",
                      borderRight: "1px solid #FFF6F6",
                    }}
                  >
                    <Typography sx={{ fontSize: "28px", color: "#ffffff" }}>
                      {selectedAnimal && selectedAnimal.alert}
                    </Typography>
                    <span style={{ fontSize: "16px", color: "#ffffffbf" }}>
                      {formatTimestamp(selectedAnimal.date)}
                    </span>
                  </Box>
                  <Box
                    sx={{
                      flex: "0 0 33.33%",
                      textAlign: "center",
                    }}
                  >
                    <Typography sx={{ fontSize: "28px", color: "#ffffff" }}>
                      Location
                    </Typography>
                    <span style={{ fontSize: "16px", color: "#ffffffbf" }}>
                      {selectedAnimal.area}
                    </span>
                  </Box>
                  <Box
                    sx={{
                      flex: "0 0 33.33%",
                      textAlign: "center",
                      borderLeft: "1px solid #FFF6F6",
                    }}
                  >
                    <Typography sx={{ fontSize: "28px", color: "#ffffff" }}>
                      {selectedAnimal.animal}
                    </Typography>
                    <span style={{ fontSize: "16px", color: "#ffffffbf" }}>
                      {selectedAnimal.camera}
                    </span>
                  </Box>
                </Box>

                <Box sx={{ marginTop: "25px", textAlign:"right"}}>
                  <Button
                    sx={{
                      backgroundImage:
                        "radial-gradient(circle, #ffffff -89%, #FF7715 100%)",
                      color: "#ffffff",
                      padding: "10px 30px",
                    }}
                    onClick={() => {
                      localStorage.setItem("fromPage", "homepage");
                      setOpenLogModal(false);
                      setOpenTicket(true);
                    }}
                  >
                    Create Ticket
                  </Button>
                  <Button
                    sx={{
                      backgroundImage:
                        "radial-gradient(circle, #ffffff -89% , #65C565 100%)",
                      color: "#ffffff",
                      padding: "10px 30px",
                      marginLeft: "10px",
                    }}
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </>
      </Modal>
      <CustomModal
        selectedAnimal={selectedAnimal}
        openTicket={openTicket}
        setOpenTicket={setOpenTicket} // Directly pass the setter function
      />
    </Box>
  );
};

export default Logs;
