import React, { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store"; // Import types
import {
  fetchCameras,
  fetchPresets,
  fetchStreamLinks,
  setCameraMode,
} from "../../store/slice/cameraSlice";
import {
  changePTZPosition,
  resetCameraPosition,
} from "../../store/slice/cameraSlice";
import CloseIcon from "@mui/icons-material/Close";
import arrow from "../../assets/images/upArrow.png";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { toast } from "react-toastify";

export type Age = {
  id: string;
  name: string;
  description: string;
  cameraProtocol: number;
  connectionString: string;
  areaId: string;
  area: null;
  customerId: string;
};

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

const ThermalVideo: React.FC = () => {
  const [camera, setCamera] = React.useState<Age | undefined>(undefined);
  const [presets, setPresets] = React.useState("20");
  const [openLiveVideoModal, setOpenLiveVideoModal] = React.useState(false);
  const [checked, setChecked] = useState(false);
  const [loadingCamera, setLoadingCamera] = useState<boolean>(false);
  const [listPresets, setListPresets] = useState<Preset[] | undefined>(
    undefined
  );
  const [cameraIdTemp, setCameraIdTemp] = useState<string>("");
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  const [streamLinks, setStreamLinks] = useState({
    raw: "",
    processed: "",
  });

  const handleCloseLiveVideoModal = () => {
    setOpenLiveVideoModal(false);
  };

  const handleChange = (e: any) => {
    setCamera(e.target.value);
  };

  const handleChangePresets = (event: SelectChangeEvent) => {
    setPresets(event.target.value);
  };

  const dispatch = useDispatch<AppDispatch>();

  const { cameras } = useSelector((state: RootState) => state.cameras);

  useEffect(() => {
    dispatch(fetchCameras());
  }, [dispatch]);

  useEffect(() => {
  if (cameras.length > 0) {
    setCameraIdTemp(cameras[0].id);
  }
}, [cameras]);

  useEffect(() => {
    if (loadingCamera) {
      const timer = setTimeout(() => {
        setLoadingCamera(false);
      }, 5000);

      return () => clearTimeout(timer); // Cleanup to avoid memory leaks
    }
  }, [loadingCamera]);

  useEffect(() => {
    const camId = camera?.connectionString?.split("/").pop();
    if (typeof camId === "string") {
      setCameraIdTemp(camId);
      dispatch(fetchStreamLinks(camId))
        .unwrap()
        .then((result) => setStreamLinks(result));
    }
    setPresets("20");
  }, [camera]);

  const joystickOptions = (key: string) => {
    dispatch(changePTZPosition({key, cameraIdTemp})); // Dispatch Redux Thunk

    const stick = document.getElementById("stick");
    if (!stick) return;

    // Get current rotation (default to 0 if not set)
    const currentTransform =
      stick.style.transform || "translate(-50%, -50%) rotate(0deg)";
    const currentRotationMatch = currentTransform.match(
      /rotate\(([-]?\d+)deg\)/
    );
    const currentRotation = currentRotationMatch
      ? parseInt(currentRotationMatch[1])
      : 0;

    // Calculate new rotation
    let newRotation = currentRotation;
    if (key === "d") {
      newRotation = currentRotation - 2.25; // 18 degrees left (counter-clockwise)
    } else if (key === "a") {
      newRotation = currentRotation + 2.25; // 18 degrees right (clockwise)
    }

    // Apply new rotation while preserving the translate
    stick.style.transform = `translate(-50%, -50%) rotate(${newRotation}deg)`;
    stick.style.transformOrigin = "center";
  };

  const cameraReset = () => {
    dispatch(resetCameraPosition(cameraIdTemp));

    const stick = document.getElementById("stick");
    if (stick) {
      // Extremely slow movement (3 seconds for each rotation)
      stick.style.transition = "transform 3s ease-in-out";

      // Initial big rotation
      stick.style.transform = "translate(-50%, -50%) rotate(-30deg)";

      // Very long delays between steps (up to 2 seconds)
      setTimeout(() => {
        stick.style.transform = "translate(-50%, -50%) rotate(20deg)";

        setTimeout(() => {
          stick.style.transform = "translate(-50%, -50%) rotate(-10deg)";

          setTimeout(() => {
            stick.style.transform = "translate(-50%, -50%) rotate(5deg)";

            setTimeout(() => {
              stick.style.transform = "translate(-50%, -50%) rotate(0deg)";
              // Final ultra-slow return to neutral
              stick.style.transition = "transform 5s ease";
            }, 2000); // 2 second pause
          }, 1500); // 1.5 second pause
        }, 1000); // 1 second pause
      }, 500); // 0.5 second initial pause
    }
  };

  useEffect(() => {
    dispatch(fetchPresets()).then((result) => {
      if (fetchPresets.fulfilled.match(result)) {
        setListPresets(result.payload); // result.payload contains the actual data
      } else {
        toast.error(result.error.message);
      }
    });
  }, []);

  useEffect(() => {
    if (presets === "10") {
      dispatch(setCameraMode({ mode: "Auto", preset: "", cameraIdTemp }));
    } else if (presets === "20") {
      dispatch(setCameraMode({ mode: "Manual", preset: "", cameraIdTemp }));
    } else {
      dispatch(setCameraMode({ mode: "Preset", preset: presets, cameraIdTemp }));
    }
  }, [presets, camera]);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        flex: "0 0 49%",
        height: "50%",
      }}
      onDoubleClick={() =>
        camera && typeof camera === "object" ? setOpenLiveVideoModal(true) : ""
      }
    >
      {/* <SyncedPlayback cameraId={camera} videoRef={videoRef} /> */}

      {loadingCamera ? (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 1, color: "#fff" }}>
            Initializing video...
          </Typography>
        </Box>
      ) : camera && typeof camera === "object" && !checked ? (
        <img
          alt="test-img1"
          style={{
            width: "100%",
            height: "100%",
            border: "0",
            objectFit: "fill", // or "contain" based on your requirement
          }}
          className="hoverShow"
          src={`${process.env.REACT_APP_STREAM_API_BASE_URL}${streamLinks.raw}`}
          // width="640"
          // height="480"
        ></img>
      ) : camera && typeof camera === "object" && checked ? (
        <img
          alt="test-img2"
          style={{
            width: "100%",
            height: "100%",
            border: "0",
            objectFit: "fill", // or "contain" based on your requirement
          }}
          className="hoverShow"
          src={`${process.env.REACT_APP_STREAM_API_BASE_URL}${streamLinks.processed}`}
          // width="640"
          // height="480"
        ></img>
      ) : (
        <div
          id="camera-placeholder"
          className="hoverShow"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#00000",
            border: "1px dashed #ccc",
            color: "#fff",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          Select a Camera
        </div>
      )}

      <Box
        sx={{ position: "absolute", top: "5px", zIndex: "9", width: "100%" }}
        className="HoverView"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: "5px" }}>
            <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
              {/* <InputLabel
                id="demo-select-small-label"
                sx={{
                  color: "#ffffff", // Default color
                  fontSize: "14px",
                  "&.Mui-focused": {
                    color: "#ffffff !important", // Ensure white color on focus
                  },
                  "&.MuiInputLabel-root": {
                    color: "#ffffff", // Ensure default white
                  },
                }}
              >
                Select Camera
              </InputLabel> */}
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={camera}
                label="Select Camera"
                onChange={(e) => {
                  handleChange(e);
                  setLoadingCamera(true);
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
                  PaperProps: {
                    sx: {
                      background: "#162232",
                      color: "#ffffff",
                      maxHeight: 200, // Fixed height for scroll
                      overflowY: "auto",
                      "& .MuiMenuItem-root": {
                        color: "#ffffff",
                        "&:hover": { backgroundColor: "#1e293b" }, // Darker blue on hover
                      },
                    },
                  },
                }}
              >
                <MenuItem key={1} value="" disabled>
                  --Select Camera--
                </MenuItem>
                {cameras.map((camera) => (
                  <MenuItem key={camera.id} value={camera}>
                    {/* ✅ Use camera.id instead of object */}
                    {camera.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {camera && typeof camera === "object" ? (
              <FormControl
                sx={{ m: 1, minWidth: 200 }}
                size="small"
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
                        handleCheckboxChange(e);
                        setLoadingCamera(true);
                      }}
                      sx={{
                        color: "#ffffff",
                        "&.Mui-checked": {
                          color: "#ffffff",
                        },
                      }}
                    />
                  }
                  label={
                    <span style={{ color: "#ffffff", fontSize: "14px" }}>
                      Show Detection
                    </span>
                  }
                />
              </FormControl>
            ) : (
              ""
            )}
          </Box>
          {camera && typeof camera === "object" ? (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {/* <FormControl size="small">
              <input
                type="checkbox"
                className="checkbox-as-radio"
                id="checkbox1"
                checked={isRadioSelected}
                onChange={handleRadioChange}
              ></input>
            </FormControl> */}
              <FormControl sx={{ m: 1, minWidth: 100 }} size="small">
                {/* <InputLabel
                  id="demo-select-small-label"
                  sx={{
                    color: "#ffffff", // Default color
                    fontSize: "14px",
                    "&.Mui-focused": {
                      color: "#ffffff !important", // Ensure white color on focus
                    },
                    "&.MuiInputLabel-root": {
                      color: "#ffffff", // Ensure default white
                    },
                  }}
                >
                  Preset
                </InputLabel> */}

                <Select
                  labelId="demo-select-small-label"
                  id="demo-select-small"
                  value={presets}
                  label="Select Presets"
                  onChange={handleChangePresets}
                  sx={{
                    width: "200px",
                    height: "38px",
                    background:
                      presets === "10"
                        ? "#004d40"
                        : presets === "20"
                        ? "#b71c1c"
                        : "#162232", // Green for Auto, Red for Manual
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
                  renderValue={(selected) => {
                    const selectedItem = listPresets?.find(
                      (preset) => preset.id === selected
                    );
                    if (selected === "10") {
                      return <span style={{ color: "#00ff00" }}>Auto</span>; // Green text
                    } else if (selected === "20") {
                      return <span style={{ color: "#ff9800" }}>Manual</span>; // Orange text
                    }
                    return selectedItem ? selectedItem.name : "Select Presets";
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        background: "#162232",
                        color: "#ffffff",
                        maxHeight: 200,
                        overflowY: "auto",
                        "& .MuiMenuItem-root": {
                          color: "#ffffff",
                          "&:hover": { backgroundColor: "#1e293b" },
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value={"10"}>Auto</MenuItem>
                  <MenuItem value={"20"}>Manual</MenuItem>
                  {listPresets &&
                    Array.isArray(listPresets) &&
                    listPresets
                      .filter((preset) => {
                        const cameraIdFromConnection = camera?.connectionString
                          ?.split("/")
                          .pop();
                        return preset.cameraId === cameraIdFromConnection;
                      })
                      .map((preset) => (
                        <MenuItem key={preset.id} value={preset.id}>
                          {preset.name}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>
            </Box>
          ) : (
            ""
          )}
        </Box>
        {/* <Box>
          <Box
            sx={{
              width: "fit-content",
              background: "#01010152",
              marginLeft: "10px",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img src={pointer} alt=""></img>
            <Box>
              <p style={{ margin: "0", color: "white", fontSize: "14px" }}>
                Distance-<span></span>
              </p>
              <p style={{ margin: "5px 0", color: "white", fontSize: "14px" }}>
                Click Anywhere
              </p>
            </Box>
          </Box>
        </Box> */}
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          width: "98%",
        }}
        className="HoverView"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Typography
            sx={{ color: "white", fontSize: "16px", alignSelf: "end" }}
          ></Typography>
          {/* <Box sx={{ background: "#0000006e" }}>
            <Button
              sx={{ display: "block", justifySelf: "center", lineHeight: "0" }}
            >
              <KeyboardArrowUpIcon sx={{ color: "white" }} />
            </Button>
            <Button>
              <KeyboardArrowUpIcon
                sx={{ transform: "rotate(-90deg)", color: "white" }}
              />
            </Button>
            <Button>
              <KeyboardArrowUpIcon
                sx={{ transform: "rotate(90deg)", color: "white" }}
              />
            </Button>
            <Button
              sx={{ display: "block", justifySelf: "center", lineHeight: "0" }}
            >
              <KeyboardArrowDownIcon sx={{ color: "white" }} />
            </Button>
          </Box> */}
          {camera && typeof camera === "object" && presets == "20" ? (
            <Box>
              <div
                className="joystick-container"
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="joystick">
                  {/* Your existing joystick code remains the same */}
                  <Typography
                    className="button top"
                    sx={{
                      position: "absolute",
                      left: "38%",
                      top: "-12px",
                      zIndex: "9",
                      height: "10px",
                      padding: "15px",
                      margin: "-15px",
                      background: "transparent",
                      paddingBottom: "40px",
                      cursor: "pointer", // Add pointer cursor
                      "&:hover": {
                        backgroundColor: "rgba(255, 180, 180, 0.3)",
                      },
                      "&:active": {
                        // Optional: add an active/click effect
                        transform: "scale(0.95)",
                      },
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      joystickOptions("w");
                      setPresets("20");
                    }}
                  >
                    <img src={arrow} alt="uparrow" style={{ height: "10px" }} />
                  </Typography>

                  <div className="buttons-row">
                    {/* Left Button */}
                    <Typography
                      className="button left"
                      sx={{
                        transform: "rotate(-90deg)",
                        position: "absolute",
                        left: "-14px",
                        top: "41%",
                        zIndex: "9",
                        padding: "15px", // Extends clickable area
                        margin: "-15px", // Compensates for padding
                        background: "transparent",
                        "&:hover": {
                          backgroundColor: "rgba(255, 180, 180, 0.3)",
                        },
                        "&:active": {
                          // Optional: add an active/click effect
                          transform: "scale(0.95)",
                        }, // Makes the extended area transparent
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        joystickOptions("a");
                        setPresets("20");
                      }}
                    >
                      <img
                        src={arrow}
                        alt="uparrow"
                        style={{ height: "10px" }}
                      />
                    </Typography>

                    {/* Center Area */}
                    <div className="joystick-center">
                      <div id="border">
                        <div id="inner">
                          <p id="n">N</p>
                          <p id="s"></p>
                          <p id="e"></p>
                          <p id="w"></p>
                          <div id="stick"></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Button */}
                    <Typography
                      className="button right"
                      sx={{
                        transform: "rotate(90deg)",
                        position: "absolute",
                        right: "-14px",
                        top: "41%",
                        zIndex: "9",
                        padding: "15px", // Extends clickable area
                        margin: "-15px", // Compensates for padding
                        background: "transparent", // Makes the extended area transparent
                        "&:hover": {
                          backgroundColor: "rgba(255, 180, 180, 0.3)",
                        },
                        "&:active": {
                          // Optional: add an active/click effect
                          transform: "scale(0.95)",
                        }, // Makes the extended area transparent
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        joystickOptions("d");
                        setPresets("20");
                      }}
                    >
                      <img
                        src={arrow}
                        alt="uparrow"
                        style={{ height: "10px" }}
                      />
                    </Typography>
                  </div>

                  {/* Bottom Button */}
                  <Typography
                    className="button bottom"
                    sx={{
                      transform: "rotate(-180deg)",
                      position: "absolute",
                      top: "93%",
                      left: "37%",
                      zIndex: "9",
                      padding: "15px", // Extends clickable area
                      margin: "-15px", // Compensates for padding
                      background: "transparent", // Makes the extended area transparent
                      "&:hover": {
                        backgroundColor: "rgba(255, 180, 180, 0.3)",
                      },
                      "&:active": {
                        // Optional: add an active/click effect
                        transform: "scale(0.95)",
                      }, // Makes the extended area transparent
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      joystickOptions("s");
                      setPresets("20");
                    }}
                  >
                    <img src={arrow} alt="uparrow" style={{ height: "10px" }} />
                  </Typography>
                </div>

                {/* Reset button positioned in center */}
                <div className="reset-button-center">
                  <RestartAltRoundedIcon
                    sx={{
                      color: "white",
                      fontSize: "20px",
                      cursor: "pointer",
                      padding: "10px",
                      transition: "transform 0.5s ease-in-out",
                      "&:hover": {
                        transform: "rotate(360deg)",
                        backgroundColor: "rgba(255, 180, 180, 0.3)",
                      },
                      "&:active": {
                        // Optional: add an active/click effect
                        transform: "scale(0.95)",
                      }, // Makes the extended area transparent
                    }}
                    onClick={() => {
                      cameraReset();
                      setPresets("20");
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "center",
                  paddingTop: "10px",
                  // justifyContent: "space-evenly",
                }}
              >
                <div
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <AddRoundedIcon
                    sx={{
                      color: "white",
                      fontSize: "20px",
                      background: "black",
                      borderRadius: "4px",
                      padding: "4px",
                      cursor: "pointer",
                      border: "1px solid #000000",
                      "&:hover": {
                        border: "1px solid #ffffff8f",
                      },
                    }}
                    onClick={() => {
                      joystickOptions("z");
                      setPresets("20");
                    }}
                  />
                </div>
                <div
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <RemoveRoundedIcon
                    sx={{
                      color: "white",
                      fontSize: "20px",
                      background: "black",
                      borderRadius: "4px",
                      padding: "4px",
                      cursor: "pointer",
                      border: "1px solid #000000",
                      "&:hover": {
                        border: "1px solid #ffffff8f",
                      },
                    }}
                    onClick={() => {
                      joystickOptions("x");
                      setPresets("20");
                    }}
                  />
                </div>
              </div>
            </Box>
          ) : (
            ""
          )}
        </Box>
      </Box>
      <Modal
        open={openLiveVideoModal}
        onClose={handleCloseLiveVideoModal}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            // width: "75%",
            bgcolor: "background.paper",
            // border: "2px solid #000",
            boxShadow: 24,
            pt: 2,
            px: 2,
            pb: 2,
            height: "calc(100vh)",
            width: "calc(100vw)",
          }}
        >
          {/* <video
            autoPlay
            loop
            muted
            style={{
              width: "100%",
              height: "100%",
              border: "0",
              objectFit: "cover",
            }}
            className="hoverShow"
          >
            <source src={ElephantDetection} type="video/mp4" />
            Your browser does not support the video tag.
          </video> */}
          {/* <SyncedPlayback cameraId={camera} videoRef={videoRef} /> */}

          {loadingCamera ? (
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 2,
                textAlign: "center",
              }}
            >
              <CircularProgress />
              <Typography variant="body2" sx={{ mt: 1, color: "#000" }}>
                Initializing video...
              </Typography>
            </Box>
          ) : camera && typeof camera === "object" && !checked ? (
            <img
              style={{
                width: "100%",
                height: "100%",
                border: "0",
                objectFit: "fill", // or "contain" based on your requirement
              }}
              className="hoverShow"
              src={`${process.env.REACT_APP_STREAM_API_BASE_URL}${streamLinks.raw}`}
              width="640"
              height="480"
            ></img>
          ) : camera && typeof camera === "object" && checked ? (
            <img
              style={{
                width: "100%",
                height: "100%",
                border: "0",
                objectFit: "fill", // or "contain" based on your requirement
              }}
              className="hoverShow"
              src={`${process.env.REACT_APP_STREAM_API_BASE_URL}${streamLinks.processed}`}
              width="640"
              height="480"
            ></img>
          ) : (
            <div
              id="camera-placeholder"
              className="hoverShow"
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#00000",
                border: "1px dashed #ccc",
                color: "#fff",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              Select a Camera
            </div>
          )}

          <Box
            sx={{
              position: "absolute",
              top: "5px",
              zIndex: "9",
              width: "100%",
            }}
            className="HoverView"
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                margin: "70px",
              }}
            >
              <Box sx={{ display: "flex", gap: "5px" }}>
                <FormControl sx={{ m: 1, minWidth: 200 }} size="small">
                  {/* <InputLabel
                    id="demo-select-small-label"
                    sx={{
                      color: "#ffffff", // Default color
                      fontSize: "14px",
                      "&.Mui-focused": {
                        color: "#ffffff !important", // Ensure white color on focus
                      },
                      "&.MuiInputLabel-root": {
                        color: "#ffffff", // Ensure default white
                      },
                    }}
                  >
                    Select Camera
                  </InputLabel> */}
                  <Select
                    labelId="demo-select-small-label"
                    id="demo-select-small"
                    value={camera}
                    label="Select Camera"
                    onChange={(e) => {
                      handleChange(e);
                      setLoadingCamera(true);
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
                      PaperProps: {
                        sx: {
                          background: "#162232",
                          color: "#ffffff",
                          maxHeight: 200, // Fixed height for scroll
                          overflowY: "auto",
                          "& .MuiMenuItem-root": {
                            color: "#ffffff",
                            "&:hover": { backgroundColor: "#1e293b" }, // Darker blue on hover
                          },
                        },
                      },
                    }}
                  >
                    <MenuItem key={1} value="" disabled>
                      --Select Camera--
                    </MenuItem>
                    {cameras.map((camera) => (
                      <MenuItem key={camera.id} value={camera}>
                        {/* ✅ Use camera.id instead of object */}
                        {camera.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {camera && typeof camera === "object" ? (
                  <FormControl
                    sx={{ m: 1, minWidth: 200 }}
                    size="small"
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(e) => {
                            handleCheckboxChange(e);
                            setLoadingCamera(true);
                          }}
                          sx={{
                            color: "#ffffff",
                            "&.Mui-checked": {
                              color: "#ffffff",
                            },
                          }}
                        />
                      }
                      label={
                        <span style={{ color: "#ffffff", fontSize: "14px" }}>
                          Show Detection
                        </span>
                      }
                    />
                  </FormControl>
                ) : (
                  ""
                )}
              </Box>
              {camera && typeof camera === "object" ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginRight: "30px",
                  }}
                >
                  {/* <FormControl size="small">
              <input
                type="checkbox"
                className="checkbox-as-radio"
                id="checkbox1"
                checked={isRadioSelected}
                onChange={handleRadioChange}
              ></input>
            </FormControl> */}
                  <FormControl sx={{ m: 1, minWidth: 100 }} size="small">
                    {/* <InputLabel
                      id="demo-select-small-label"
                      sx={{
                        color: "#ffffff", // Default color
                        fontSize: "14px",
                        "&.Mui-focused": {
                          color: "#ffffff !important", // Ensure white color on focus
                        },
                        "&.MuiInputLabel-root": {
                          color: "#ffffff", // Ensure default white
                        },
                      }}
                    >
                      Preset
                    </InputLabel> */}

                    <Select
                      labelId="demo-select-small-label"
                      id="demo-select-small"
                      value={presets}
                      label="Select Presets"
                      onChange={handleChangePresets}
                      sx={{
                        width: "200px",
                        height: "38px",
                        background:
                          presets === "10"
                            ? "#004d40"
                            : presets === "20"
                            ? "#b71c1c"
                            : "#162232", // Green for Auto, Red for Manual
                        border: "none",
                        "& .MuiOutlinedInput-notchedOutline": {
                          border: "none",
                        },
                        "& .MuiSelect-select": {
                          fontSize: "14px",
                          color: "#ffffff",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        },
                        "& .MuiSelect-icon": { color: "#ffffff" },
                      }}
                      renderValue={(selected) => {
                        const selectedItem = listPresets?.find(
                          (preset) => preset.id === selected
                        );
                        if (selected === "10") {
                          return <span style={{ color: "#00ff00" }}>Auto</span>; // Green text
                        } else if (selected === "20") {
                          return (
                            <span style={{ color: "#ff9800" }}>Manual</span>
                          ); // Orange text
                        }
                        return selectedItem
                          ? selectedItem.name
                          : "Select Presets";
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            background: "#162232",
                            color: "#ffffff",
                            maxHeight: 200,
                            overflowY: "auto",
                            "& .MuiMenuItem-root": {
                              color: "#ffffff",
                              "&:hover": { backgroundColor: "#1e293b" },
                            },
                          },
                        },
                      }}
                    >
                      <MenuItem value={"10"}>Auto</MenuItem>
                      <MenuItem value={"20"}>Manual</MenuItem>
                      {listPresets &&
                        Array.isArray(listPresets) &&
                        listPresets
                          .filter((preset) => {
                            const cameraIdFromConnection =
                              camera?.connectionString?.split("/").pop();
                            return preset.cameraId === cameraIdFromConnection;
                          })
                          .map((preset) => (
                            <MenuItem key={preset.id} value={preset.id}>
                              {preset.name}
                            </MenuItem>
                          ))}
                    </Select>
                  </FormControl>
                </Box>
              ) : (
                ""
              )}
            </Box>
            {/* <Box>
          <Box
            sx={{
              width: "fit-content",
              background: "#01010152",
              marginLeft: "10px",
              padding: "5px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <img src={pointer} alt=""></img>
            <Box>
              <p style={{ margin: "0", color: "white", fontSize: "14px" }}>
                Distance-<span></span>
              </p>
              <p style={{ margin: "5px 0", color: "white", fontSize: "14px" }}>
                Click Anywhere
              </p>
            </Box>
          </Box>
        </Box> */}
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              width: "98%",
            }}
            className="HoverView"
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                margin: "70px",
              }}
            >
              <Typography
                sx={{ color: "white", fontSize: "16px", alignSelf: "end" }}
              ></Typography>
              {/* <Box sx={{ background: "#0000006e" }}>
            <Button
              sx={{ display: "block", justifySelf: "center", lineHeight: "0" }}
            >
              <KeyboardArrowUpIcon sx={{ color: "white" }} />
            </Button>
            <Button>
              <KeyboardArrowUpIcon
                sx={{ transform: "rotate(-90deg)", color: "white" }}
              />
            </Button>
            <Button>
              <KeyboardArrowUpIcon
                sx={{ transform: "rotate(90deg)", color: "white" }}
              />
            </Button>
            <Button
              sx={{ display: "block", justifySelf: "center", lineHeight: "0" }}
            >
              <KeyboardArrowDownIcon sx={{ color: "white" }} />
            </Button>
          </Box> */}
              {camera && typeof camera === "object" && presets == "20" ? (
                <Box>
                  <div
                    className="joystick-container"
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <div className="joystick">
                      {/* Your existing joystick code remains the same */}
                      <Typography
                        className="button top"
                        sx={{
                          position: "absolute",
                          left: "38%",
                          top: "-12px",
                          zIndex: "9",
                          height: "10px",
                          padding: "15px",
                          margin: "-15px",
                          background: "transparent",
                          paddingBottom: "40px",
                          cursor: "pointer", // Add pointer cursor
                          "&:hover": {
                            backgroundColor: "rgba(255, 180, 180, 0.3)",
                          },
                          "&:active": {
                            // Optional: add an active/click effect
                            transform: "scale(0.95)",
                          },
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          joystickOptions("w");
                          setPresets("20");
                        }}
                      >
                        <img
                          src={arrow}
                          alt="uparrow"
                          style={{ height: "10px" }}
                        />
                      </Typography>

                      <div className="buttons-row">
                        {/* Left Button */}
                        <Typography
                          className="button left"
                          sx={{
                            transform: "rotate(-90deg)",
                            position: "absolute",
                            left: "-14px",
                            top: "41%",
                            zIndex: "9",
                            padding: "15px", // Extends clickable area
                            margin: "-15px", // Compensates for padding
                            background: "transparent",
                            "&:hover": {
                              backgroundColor: "rgba(255, 180, 180, 0.3)",
                            },
                            "&:active": {
                              // Optional: add an active/click effect
                              transform: "scale(0.95)",
                            }, // Makes the extended area transparent
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            joystickOptions("a");
                            setPresets("20");
                          }}
                        >
                          <img
                            src={arrow}
                            alt="uparrow"
                            style={{ height: "10px" }}
                          />
                        </Typography>

                        {/* Center Area */}
                        <div className="joystick-center">
                          <div id="border">
                            <div id="inner">
                              <p id="n">N</p>
                              <p id="s"></p>
                              <p id="e"></p>
                              <p id="w"></p>
                              <div id="stick"></div>
                            </div>
                          </div>
                        </div>

                        {/* Right Button */}
                        <Typography
                          className="button right"
                          sx={{
                            transform: "rotate(90deg)",
                            position: "absolute",
                            right: "-14px",
                            top: "41%",
                            zIndex: "9",
                            padding: "15px", // Extends clickable area
                            margin: "-15px", // Compensates for padding
                            background: "transparent", // Makes the extended area transparent
                            "&:hover": {
                              backgroundColor: "rgba(255, 180, 180, 0.3)",
                            },
                            "&:active": {
                              // Optional: add an active/click effect
                              transform: "scale(0.95)",
                            }, // Makes the extended area transparent
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            joystickOptions("d");
                            setPresets("20");
                          }}
                        >
                          <img
                            src={arrow}
                            alt="uparrow"
                            style={{ height: "10px" }}
                          />
                        </Typography>
                      </div>

                      {/* Bottom Button */}
                      <Typography
                        className="button bottom"
                        sx={{
                          transform: "rotate(-180deg)",
                          position: "absolute",
                          top: "93%",
                          left: "37%",
                          zIndex: "9",
                          padding: "15px", // Extends clickable area
                          margin: "-15px", // Compensates for padding
                          background: "transparent", // Makes the extended area transparent
                          "&:hover": {
                            backgroundColor: "rgba(255, 180, 180, 0.3)",
                          },
                          "&:active": {
                            // Optional: add an active/click effect
                            transform: "scale(0.95)",
                          }, // Makes the extended area transparent
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          joystickOptions("s");
                          setPresets("20");
                        }}
                      >
                        <img
                          src={arrow}
                          alt="uparrow"
                          style={{ height: "10px" }}
                        />
                      </Typography>
                    </div>

                    {/* Reset button positioned in center */}
                    <div className="reset-button-center">
                      <RestartAltRoundedIcon
                        sx={{
                          color: "white",
                          fontSize: "20px",
                          cursor: "pointer",
                          padding: "10px",
                          transition: "transform 0.5s ease-in-out",
                          "&:hover": {
                            transform: "rotate(360deg)",
                            backgroundColor: "rgba(255, 180, 180, 0.3)",
                          },
                          "&:active": {
                            // Optional: add an active/click effect
                            transform: "scale(0.95)",
                          }, // Makes the extended area transparent
                        }}
                        onClick={() => {
                          cameraReset();
                          setPresets("20");
                        }}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      justifyContent: "center",
                      paddingTop: "10px",
                      // justifyContent: "space-evenly",
                    }}
                  >
                    <div
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <AddRoundedIcon
                        sx={{
                          color: "white",
                          fontSize: "20px",
                          background: "black",
                          borderRadius: "4px",
                          padding: "4px",
                          cursor: "pointer",
                          border: "1px solid #000000",
                          "&:hover": {
                            border: "1px solid #ffffff8f",
                          },
                        }}
                        onClick={() => {
                          joystickOptions("z");
                          setPresets("20");
                        }}
                      />
                    </div>
                    <div
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <RemoveRoundedIcon
                        sx={{
                          color: "white",
                          fontSize: "20px",
                          background: "black",
                          borderRadius: "4px",
                          padding: "4px",
                          cursor: "pointer",
                          border: "1px solid #000000",
                          "&:hover": {
                            border: "1px solid #ffffff8f",
                          },
                        }}
                        onClick={() => {
                          joystickOptions("x");
                          setPresets("20");
                        }}
                      />
                    </div>
                  </div>
                </Box>
              ) : (
                ""
              )}
            </Box>
          </Box>
          {/* <Button onClick={handleCloseLiveVideoModal}>Close Child Modal</Button> */}
          <IconButton
            onClick={handleCloseLiveVideoModal}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "#fff",
              backgroundColor: "#444", // Standard dark gray background
              padding: "6px",
              borderRadius: "4px", // Slightly rounded but not oval
              border: "1px solid #666", // Subtle border for definition
              boxShadow: "0px 2px 5px rgba(0,0,0,0.3)",
              marginTop: "20px",
              marginRight: "20px",
              cursor: "pointer",
              zIndex: "11111111",
              transition: "background-color 0.2s, color 0.2s",
              "&:hover": {
                backgroundColor: "#555", // Slightly lighter on hover
                color: "red", // Red color on hover for close action
              },
              "&:focus": {
                backgroundColor: "#333", // Slightly darker when focused
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Modal>
    </Box>
  );
};

export default ThermalVideo;