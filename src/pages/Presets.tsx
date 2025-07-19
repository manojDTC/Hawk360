import React, { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  MenuList,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import { ExpandMoreOutlined } from "@mui/icons-material";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import arrow from "../assets/images/upArrow.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  fetchCameras,
  fetchStreamLinks,
  setCameraMode,
} from "../store/slice/cameraSlice";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import {
  changePTZPosition,
  resetCameraPosition,
} from "../store/slice/cameraSlice";
import NavigationRoundedIcon from "@mui/icons-material/NavigationRounded";
import {
  addArea,
  addPreset,
  Area,
  getAreasById,
  getPresets,
  PresetData,
} from "../store/slice/presetSlice";

const Preset = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const escPressedRef = useRef<boolean | null>(false);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(
    null
  );
  const drawnPolygonsRef = useRef<google.maps.Polygon[]>([]);
  const drawnLabelsRef = useRef<google.maps.OverlayView[]>([]);
  const torchCircleRef = useRef<google.maps.Circle | null>(null);
  const torchAngleRef = useRef(0); // Stores the angle for movement
  const torchPolygonRef = useRef<google.maps.Polygon | null>(null);
  const targetAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  let drawnPolygons: google.maps.Polygon[] = [];

  const [polygonCoords, setPolygonCoords] = useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [lastPolygon, setLastPolygon] = useState<google.maps.Polygon | null>(
    null
  );
  const [zoneName, setZoneName] = useState<string>("");
  const [zones, setZones] = useState<{ name: string; coordinates: string[] }[]>(
    []
  );
  const [showAccordions, setShowAccordions] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [areas, setAreas] = useState<Area[]>([
    {
      name: "",
      polygon: "",
      id: "",
      cameraId: "",
    },
  ]);
  const [formData, setFormData] = useState({
    cameraId: "",
    areaId: "",
    presetName: "",
    seconds: 5,
  });
  const [errors, setErrors] = useState({
    cameraId: false,
    areaId: false,
    presetName: false,
    seconds: false,
  });
  const [loadingCamera, setLoadingCamera] = useState<boolean>(false);
  const [streamLinks, setStreamLinks] = useState({
    raw: "",
    processed: "",
  });
  const [presets, setPresets] = useState<{ [key: string]: PresetData[] }>({});
  const [expanded, setExpanded] = useState<string | false>(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("");

  const dispatch = useDispatch<AppDispatch>();

  const { cameras } = useSelector((state: RootState) => state.cameras);

  const center = { lat: 11.51874, lng: 77.060969 };
  const radius = 3000;

  useEffect(() => {
    try{
    dispatch(fetchCameras());
    }
    catch(e){
      toast.error("API Failed- Couldn't load camera's")
    }
  }, []);

  useEffect(() => {
    if (!window.google || !window.google.maps) return;

    const map = new google.maps.Map(mapRef.current as HTMLDivElement, {
      center: center,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      fullscreenControl: false,
      streetViewControl: false,
    });

    mapInstance.current = map;

    new google.maps.Circle({
      map,
      center,
      radius,
      strokeColor: "white",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "black", // Black overlay
      fillOpacity: 0.2, // 10% opacity
    });

    // Draw torchlight triangle (polygon)
    torchPolygonRef.current = new google.maps.Polygon({
      map,
      paths: getTorchTriangle(torchAngleRef.current),
      strokeWeight: 0,
      fillColor: "white",
      fillOpacity: 0.4,
    });

    let activePolygon: google.maps.Polygon | null = null;

    const drawingManagerInstance = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: false,
      polygonOptions: {},
    });
    drawingManagerInstance.setMap(map);
    drawingManagerRef.current = drawingManagerInstance;

    google.maps.event.addListener(
      drawingManagerInstance,
      "overlaycomplete",
      (event: any) => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          setIsDrawing(false);
          drawingManagerInstance.setDrawingMode(null);

          const polygon = event.overlay as google.maps.Polygon;
          drawnPolygons.push(polygon);
          updatePolygonCoords(polygon);
          setLastPolygon(polygon);
          if (!escPressedRef.current) {
            setOpen(true);
          } else {
            handleClose(polygon);
          }

          google.maps.event.addListener(polygon.getPath(), "set_at", () =>
            updatePolygonCoords(polygon)
          );
          google.maps.event.addListener(polygon.getPath(), "insert_at", () =>
            updatePolygonCoords(polygon)
          );
        }
      }
    );

    const handleKeyDown = (event: KeyboardEvent) => {
      escPressedRef.current = true;
      if (event.key === "Escape") {
        drawingManagerInstance.setDrawingMode(null);
        if (activePolygon) {
          activePolygon.setMap(null);
          activePolygon = null;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      torchCircleRef.current?.setMap(null);
      drawingManagerInstance.setMap(null);
      document.removeEventListener("keydown", handleKeyDown);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (formData.cameraId) {
      dispatch(fetchStreamLinks(formData.cameraId))
        .unwrap()
        .then((result) => setStreamLinks(result));
    }
  }, [formData.cameraId]);

  useEffect(() => {
    if (loadingCamera) {
      const timer = setTimeout(() => {
        setLoadingCamera(false);
      }, 5000);

      return () => clearTimeout(timer); // Cleanup to avoid memory leaks
    }
  }, [loadingCamera]);

  const fetchPresets = async () => {
    try {
      dispatch(getPresets())
        .unwrap()
        .then((response) => {
          if(response){
          // Ensure the key exists and is valid
          const presetData: { [key: string]: PresetData[] } = response.reduce(
            (acc: any, preset: PresetData) => {
              if (!preset.areaId) {
                console.warn("Missing areaId in preset:", preset);
                return acc;
              }

              // Ensure we are using areaId correctly
              const areaId = String(preset.areaId);

              if (!acc[areaId]) {
                acc[areaId] = [];
              }
              acc[areaId].push(preset);
              return acc;
            },
            {} as { [key: string]: PresetData[] }
          );
          setPresets(presetData);
        }else{
          toast.error("APIfailed - Error fetching presets");
        }
        });
    } catch (error) {
      toast.error("APIfailed - Error fetching presets");
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const getAreas = (cameraId: string) => {
    dispatch(getAreasById(cameraId))
      .unwrap()
      .then((response) => {
        const data = response;
        setAreas(data);

        if (data.length > 0) {
          const cleanedData = data.map((nestedArray: any) => {
            const nestedString = nestedArray.polygon;

            const coordinateStrings = nestedString.split(", ");

            const cleanedCoordinates = coordinateStrings.map((coord: any) =>
              coord.replace(/'/g, "")
            );

            return { name: nestedArray.name, coordinates: cleanedCoordinates };
          });

          setZones(cleanedData);

          cleanedData.forEach((polygonCoords: any) => {
            drawPolygon(
              polygonCoords.coordinates,
              mapInstance.current,
              polygonCoords.name
            );
          });
        }
      });
  };

  const updatePolygonCoords = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath().getArray();

    // Compute centroid
    const latSum = path.reduce((sum, point) => sum + point.lat(), 0);
    const lngSum = path.reduce((sum, point) => sum + point.lng(), 0);
    const centroid = new google.maps.LatLng(
      latSum / path.length,
      lngSum / path.length
    );

    // Convert coordinates to string format
    const newCoords = path.map(
      (point) => `${point.lat().toFixed(6)},${point.lng().toFixed(6)}`
    );

    // Fix: Ensure polygonCoords is a flat array
    setPolygonCoords((prevCoords) => [...prevCoords, ...newCoords]);

    // Create a custom label instead of InfoWindow
    class CustomLabel extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;
      private position: google.maps.LatLng;

      constructor(position: google.maps.LatLng) {
        super();
        this.position = position;
      }

      draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        const position = projection.fromLatLngToDivPixel(this.position);
        if (position) {
          this.div.style.left = `${position.x}px`;
          this.div.style.top = `${position.y}px`;
        }
      }

      onRemove() {
        this.div?.parentNode?.removeChild(this.div);
        this.div = null;
      }
    }

    const label = new CustomLabel(centroid);
    label.setMap(polygon.getMap()!);
  };

  const drawPolygon = (
    coordinates: string[],
    map: google.maps.Map | null,
    name: string
  ) => {
    const path = coordinates.map((coord) => {
      const [lat, lng] = coord.split(",").map(Number);
      return new google.maps.LatLng(lat, lng);
    });

    const polygon = new google.maps.Polygon({
      paths: path,
      map,
      strokeColor: "#000000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#000000",
      fillOpacity: 0.35,
    });

    drawnPolygonsRef.current.push(polygon);

    // Calculate centroid
    const latSum = path.reduce((sum, point) => sum + point.lat(), 0);
    const lngSum = path.reduce((sum, point) => sum + point.lng(), 0);
    const centroid = new google.maps.LatLng(
      latSum / path.length,
      lngSum / path.length
    );

    // Create a custom label using OverlayView
    class CustomLabel extends google.maps.OverlayView {
      private div: HTMLDivElement | null = null;

      constructor() {
        super();
      }

      onAdd() {
        this.div = document.createElement("div");
        this.div.style.position = "absolute";
        this.div.style.background = "rgba(255, 255, 255, 0.8)";
        this.div.style.padding = "4px 8px";
        this.div.style.borderRadius = "5px";
        this.div.style.fontSize = "14px";
        this.div.style.fontWeight = "bold";
        this.div.style.whiteSpace = "nowrap";
        this.div.innerText = name;

        const panes = this.getPanes();
        panes?.overlayLayer.appendChild(this.div);
      }

      draw() {
        if (!this.div) return;

        const projection = this.getProjection();
        const position = projection.fromLatLngToDivPixel(centroid);

        if (position) {
          this.div.style.left = `${position.x}px`;
          this.div.style.top = `${position.y}px`;
        }
      }

      onRemove() {
        this.div?.parentNode?.removeChild(this.div);
        this.div = null;
      }
    }

    const label = new CustomLabel();
    label.setMap(map);

    drawnLabelsRef.current.push(label);
  };

  const handleSave = async () => {
    if (!zoneName) {
      toast.error("Enter Area Name");
      return;
    }

    if (polygonCoords.length === 0) {
      alert("No Location to save!");
      return;
    }

    const formattedCoords = polygonCoords
      .map((coord) => `'${coord}'`)
      .join(", ");

    try {
      const data = {
        cameraId: formData.cameraId,
        name: zoneName,
        polygon: formattedCoords,
        id: "",
      };

      const response = await dispatch(addArea(data));

      if (response) {
        escPressedRef.current = false;
        setOpen(false);
        toast.success("Area saved successfully!");
        setPolygonCoords([]);
        setZoneName("");
        removeAllPolygons();
        getAreas(formData.cameraId);
        fetchPresets();
      }
    } catch (e) {
      toast.error("failed to save Area");
    }
  };

  const handleClose = (lastPolygon: google.maps.Polygon | null) => {
    if (lastPolygon) {
      escPressedRef.current = false;
      lastPolygon.setMap(null);
      setLastPolygon(null);
    }
    setOpen(false);
    setZoneName("");
  };

  const enablePolygonDrawing = () => {
    if (drawingManagerRef.current) {
      setIsDrawing(true);
      drawingManagerRef.current.setDrawingMode(
        google.maps.drawing.OverlayType.POLYGON
      );
    }
  };

  const handleCameraChange = (event: SelectChangeEvent) => {
    if (event.target.value === "") {
      return;
    }

    cameraReset();
    moveTorch(0);
    dispatch(setCameraMode({ mode: "Manual", preset: "", cameraIdTemp: formData.cameraId }));


    setLoadingCamera(true);
    setFormData((prev) => ({ ...prev, cameraId: event.target.value }));
    setErrors((prev) => ({ ...prev, cameraId: false }));
    removeAllPolygons();
    getAreas(event.target.value);
  };

  const handleAreaChange = (event: SelectChangeEvent) => {
    setFormData((prev) => ({ ...prev, areaId: event.target.value }));
    setErrors((prev) => ({ ...prev, areaId: false }));
  };

  const toggleAccordions = () => {
    setShowAccordions(!showAccordions);
  };

  const removeAllPolygons = () => {
    drawnPolygonsRef.current.forEach((polygon) => polygon.setMap(null));
    drawnPolygonsRef.current = [];

    drawnLabelsRef.current.forEach((label) => label.setMap(null));
    drawnLabelsRef.current = [];
  };

  const joystickOptions = (key: string) => {
    dispatch(changePTZPosition({key, cameraIdTemp: formData.cameraId})); // Dispatch Redux Thunk

    if (key === "d") {
      rotateJoystickByDegrees(2.25);
    } else if (key === "a") {
      rotateJoystickByDegrees(-2.25);
    } else if (key === "x") {
      rotateJoystickByDegrees(0);
    }
  };

  const rotateJoystickByDegrees = (degrees: number) => {
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
    const newRotation = currentRotation + degrees;

    // Apply new rotation while preserving the translate
    stick.style.transform = `translate(-50%, -50%) rotate(${newRotation}deg)`;
    stick.style.transformOrigin = "center";
  };

  const cameraReset = () => {
    dispatch(resetCameraPosition(formData.cameraId));

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

  const SavePreset = async () => {
    const newErrors = {
      cameraId: formData.cameraId.trim() === "",
      areaId: formData.areaId.trim() === "",
      presetName: formData.presetName === "",
      seconds: formData.seconds <= 0,
    };

    setErrors(newErrors);
    if (
      !newErrors.cameraId &&
      !newErrors.areaId &&
      !newErrors.presetName &&
      !newErrors.seconds
    ) {
      try {
        const selectedCamera = cameras.find(
          (camera: any) => camera.id === formData.cameraId
        );

        const selectedArea = areas.find((area) => area.id === formData.areaId);
        const data = {
          PresetName: formData.presetName,
          CameraName: selectedCamera!.name,
          CameraId: formData.cameraId,
          AreaId: formData.areaId,
          AreaName: selectedArea!.name,
          Duration: formData.seconds,
        };
        dispatch(addPreset(data))
          .unwrap()
          .then(() => {
            toast.success("Preset saved successfully!");
            setFormData({
              cameraId: formData.cameraId,
              areaId: "",
              presetName: "",
              seconds: 5,
            });
          });
      } catch (error) {
        toast.error("API Failed- Error saving presets:");
      }
    }
  };

  const handleAccordionChange = (areaId: string) => {
    setExpanded((prev) => (prev === areaId ? false : areaId));
  };

  const goToPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    dispatch(setCameraMode({ mode: "Preset", preset: presetId, cameraIdTemp: formData.cameraId }))
      .unwrap()
      .then((response) => {
        moveTorch(response.data.northOffset);
        rotateJoystickByDegrees(response.data.northOffset);
      });
  };

  // Function to calculate the triangle (torch) points
  const getTorchTriangle = (angle: number) => {
    const angleRad = (angle * Math.PI) / 180;
    const spreadAngle = 20 * (Math.PI / 180);

    const centerPoint = center;
    const leftEdge = {
      lat: center.lat + (radius / 111320) * Math.cos(angleRad - spreadAngle),
      lng:
        center.lng +
        (radius / (111320 * Math.cos(center.lat * (Math.PI / 180)))) *
        Math.sin(angleRad - spreadAngle),
    };
    const rightEdge = {
      lat: center.lat + (radius / 111320) * Math.cos(angleRad + spreadAngle),
      lng:
        center.lng +
        (radius / (111320 * Math.cos(center.lat * (Math.PI / 180)))) *
        Math.sin(angleRad + spreadAngle),
    };

    return [centerPoint, leftEdge, rightEdge];
  };

  // Function to smoothly transition the torchlight
  const animateTorch = () => {
    if (!torchPolygonRef.current) return;

    const currentAngle = torchAngleRef.current;
    const targetAngle = targetAngleRef.current;

    if (Math.abs(targetAngle - currentAngle) < 0.5) {
      torchAngleRef.current = targetAngle; // Snap to final position
      torchPolygonRef.current.setPath(getTorchTriangle(torchAngleRef.current));
      animationFrameRef.current = null; // Allow new animations
      return;
    }

    // Linear Interpolation (lerp) for smooth transition
    torchAngleRef.current += (targetAngle - currentAngle) * 0.1;
    torchPolygonRef.current.setPath(getTorchTriangle(torchAngleRef.current));

    animationFrameRef.current = requestAnimationFrame(animateTorch);
  };

  // Function to move the torch left or right smoothly
  const moveTorch = (direction: number) => {
    if (direction === 0) {
      targetAngleRef.current = 0;
    }

    if (direction === -1 || direction === 1) {
      targetAngleRef.current += direction * -2.25;
    } else {
      targetAngleRef.current = direction;
    }

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(animateTorch);
    }
  };

  return (
    <Box
      className="home-layout"
      sx={{
        marginLeft: "50px",
        marginTop: "52px",
        background: "#000000e0",
        padding: "15px",
        position: "fixed",
        //width: "-webkit-fill-available",
        height: "calc(100vh - 80px)",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {!showAccordions && (
          <Box sx={{ display: "flex", gap: "10px" }}>
            <FormControl sx={{ m: 1, minWidth: 300 }} size="small">
              <InputLabel
                id="demo-select-small-label"
                sx={{ color: "#ffffff", fontSize: "14px" }}
              >
                Select Camera
              </InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={formData.cameraId}
                label="Select Camera"
                onChange={handleCameraChange}
                sx={{
                  height: "38px",
                  background: "#0000008f",
                  border: "none",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiSelect-select": {
                    fontSize: "14px",
                    color: "#ffffff",
                  },
                  "& .MuiSelect-icon": {
                    color: "#ffffff",
                  },
                }}
              >
                <MenuItem value="">
                  <em>--Select Camera--</em>
                </MenuItem>
                {cameras.length> 0 && cameras.map((camera) => (
                  <MenuItem key={camera.id} value={camera.id}>
                    {camera.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.cameraId && (
                <FormHelperText sx={{ color: "red" }}>
                  Camera is required
                </FormHelperText>
              )}
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 300 }} size="small">
              <InputLabel
                id="demo-select-small-label"
                sx={{ color: "#ffffff", fontSize: "14px" }}
              >
                Select Area
              </InputLabel>
              <Select
                labelId="area-label"
                id="area"
                value={formData.areaId}
                label="Select Camera"
                onChange={handleAreaChange}
                sx={{
                  height: "38px",
                  background: "#0000008f",
                  border: "none",
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiSelect-select": {
                    fontSize: "14px",
                    color: "#ffffff",
                  },
                  "& .MuiSelect-icon": {
                    color: "#ffffff",
                  },
                }}
              >
                <MenuItem key="--Select Area--" value="">
                  --Select Area--
                </MenuItem>
                {areas.length>0 && areas!.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.name}
                  </MenuItem>
                ))}
                <MenuItem
                  value=""
                  sx={{
                    display: "block",
                    lineHeight: "2",
                    padding: "0",
                    position: "sticky", // Make this sticky at the bottom
                    top: "0",
                    zIndex: 1,
                  }}
                >
                  <Box justifyContent="center">
                    <Button
                      variant="contained"
                      onClick={enablePolygonDrawing}
                      sx={{
                        lineHeight: "2",
                        background: "#EEECEC",
                        width: "100%",
                        padding: "10px",
                        color: "#1D97F3",
                        boxShadow: "none",
                        borderRadius: "0", // Ensures background color over other items
                      }}
                      disabled={!formData.cameraId}
                    >
                      + Add Area
                    </Button>
                  </Box>
                </MenuItem>
              </Select>
              {errors.areaId && (
                <FormHelperText sx={{ color: "red" }}>
                  Area is required
                </FormHelperText>
              )}
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 300 }} size="small">
              <TextField
                id="preset Name"
                label="Preset Name"
                variant="outlined"
                size="small"
                sx={{
                  background: "#0000008f",
                  border: "none",
                  color: "#ffffff",
                }}
                InputLabelProps={{
                  style: { color: "#ffffff" },
                }}
                InputProps={{
                  style: { color: "white" }, // Change text color to white
                }}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    presetName: e.target.value,
                  }));
                  setErrors((prev) => ({ ...prev, presetName: false }));
                }}
                value={formData.presetName}
              />
              {errors.presetName && (
                <FormHelperText sx={{ color: "red" }}>
                  Preset Name is required
                </FormHelperText>
              )}
            </FormControl>
            <FormControl sx={{ m: 1, minWidth: 300, marginTop: "-7px" }}>
              <TextField
                label="Seconds"
                type="number"
                variant="outlined"
                margin="normal"
                size="small"
                sx={{
                  background: "#0000008f",
                  border: "none",
                  color: "#ffffff",
                  "& .MuiInputLabel-root": {
                    color: "#ffffff",
                  },
                }}
                inputProps={{
                  min: 5,
                  max: 300,
                  style: { color: "white" },
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === "" ? 0 : parseInt(value);

                  setFormData((prev) => ({
                    ...prev,
                    seconds: numValue, // Allow empty string for clearing input
                  }));

                  // Show error if the value is out of range and not empty
                  if (
                    JSON.stringify(numValue) !== "" &&
                    (numValue < 5 || numValue > 300)
                  ) {
                    setErrors((prev) => ({ ...prev, seconds: true }));
                  } else {
                    setErrors((prev) => ({ ...prev, seconds: false }));
                  }
                }}
                value={formData.seconds === 0 ? "" : formData.seconds}
              />
              {errors.seconds && (
                <FormHelperText sx={{ color: "red" }}>
                  Seconds can't be less than 5 or greater than 300
                </FormHelperText>
              )}
            </FormControl>

            <Box sx={{ textAlign: "right", marginTop: "10px" }}>
              <Button variant="contained" onClick={SavePreset}>
                Save
              </Button>
            </Box>
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            height: showAccordions
              ? "calc(100vh - 77px)"
              : "calc(100vh - 146px)",
            transition: "height 0.5s",
          }}
        >
          <Box
            sx={{
              flex: showAccordions ? "0 0 43%" : "0 0 49%",
              transition: "flex 0.5s",
              background: "#222D3A",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                flex: "0 0 49%",
                height: "100%",
              }}
            >
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
              ) : formData.cameraId ? (
                <div
                  style={{ height: "100%", position: "relative" }}
                  className="hoverShow"
                >
                  <iframe
                    src={streamLinks.raw}
                    style={{
                      width: "100%",
                      height: "99%",
                      // borderRadius: "10px",
                      // border: "3px solid red",
                    }}
                    title=""
                  ></iframe></div>
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
                  bottom: "10px",
                  left: "10px",
                  width: "98%",
                }}
                className="HoverView"
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "end",
                  }}
                >
                  {formData.cameraId && (
                    <Box>
                      <div
                        className="joystick-container"
                        onDoubleClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <div className="joystick">
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
                                moveTorch(1);
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
                                moveTorch(-1);
                                joystickOptions("d");
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
                              moveTorch(0);
                              //rotateFoV("up");
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
                            }}
                          />
                        </div>
                      </div>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
          <div
            style={{
              width: "96.7%",
              height: showAccordions
                ? "calc(100vh - 77px)"
                : "calc(100vh - 146px)",
              transition: "height 0.5s",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                zIndex: "9",
                height: "80px",
                width: "80px",
                textAlign: "center",
                background: "#ffffffcc",
                borderRadius: "50%",
              }}
            >
              <p
                style={{
                  margin: "0",
                  paddingTop: "4px",
                  color: "#6b6b6b",
                  fontSize: "12px",
                }}
              >
                N
              </p>
              <NavigationRoundedIcon
                sx={{ height: "35px", width: "35px", color: "red" }}
              />
            </div>
            <div
              ref={mapRef}
              style={{
                width: "100%",
                height: "100%",
                position: "fixed",
              }}
            ></div>
          </div>
          {showAccordions && (
            <Box
              sx={{
                flex: showAccordions ? "0 0 14%" : "0",
                background: "#222D3A",
                color: "white",
                overflow: "scroll",
                height: showAccordions
                  ? "calc(100vh - 77px)"
                  : "calc(100vh - 146px)",
                transition: "flex 0.5s , height 0.5s",
              }}
            >
              {areas.length > 0 && areas.map((area) => (
                <Accordion
                  key={area.id}
                  expanded={expanded === area.id}
                  onChange={() => handleAccordionChange(area.id)}
                  sx={{
                    background: "transparent",
                    color: "white",
                    margin: "0!important",
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreOutlined sx={{ color: "white" }} />}
                    aria-controls={`panel-content-${area.id}`}
                    id={`panel-header-${area.id}`}
                    sx={{
                      minHeight: "40px!important",
                      margin: "0!important",
                      ".MuiAccordionSummary-content": {
                        margin: "0!important",
                        padding: 0,
                      },
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        margin: "0",
                        padding: "0",
                        width: "150px",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <abbr
                        title={area.name}
                        style={{ textDecoration: "none" }}
                      >
                        {area.name}
                      </abbr>
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ padding: "0" }}>
                    <MenuList>
                      {presets[area.id]?.length > 0 ? (
                        presets[area.id].map((preset, index) => (
                          <MenuItem
                            key={preset.id}
                            sx={{
                              fontSize: "14px",
                              backgroundColor:
                                selectedPreset === preset.id ? "#b2b2b2e6" : "",
                              "&:hover": {
                                background:
                                  selectedPreset === preset.id
                                    ? "#b2b2b2e6"
                                    : "",
                              },
                            }}
                            onClick={() => goToPreset(preset.id)}
                          >
                            {preset.name}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem sx={{ fontSize: "14px" }}>
                          No Presets Found
                        </MenuItem>
                      )}
                    </MenuList>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </Box>
      </Box>
      {formData.cameraId && areas.length > 0 && (
        <Button
          onClick={toggleAccordions}
          sx={{
            position: "absolute",
            top: "50%",
            zIndex: "999",
            minWidth: "40px",
            padding: "0",
            background: "white",
            right: "-10px",
            display: "block",
            height: "33px",
            alignContent: "center",
            lineHeight: "0",
          }}
        >
          {showAccordions ? (
            <KeyboardDoubleArrowLeftIcon sx={{ color: "black" }} />
          ) : (
            <KeyboardDoubleArrowLeftIcon
              sx={{ transform: "rotate(180deg)", color: "black" }}
            />
          )}
        </Button>
      )}

      <Dialog open={open}>
        <DialogTitle>Do you want to save this co-ordinates?</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            id="co-ordinates"
            name="co-ordinates"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            type="text"
            fullWidth
            label="Zone"
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(lastPolygon)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Preset;