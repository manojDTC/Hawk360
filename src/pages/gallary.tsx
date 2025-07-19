import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardMedia,
  Typography,
  Button,
  Drawer,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "./../store/store";
import { fetchGallery } from "./../store/slice/gallerySlice";
import { toast } from "react-toastify";
const Gallery = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { gallerys, loadingGallery } = useSelector(
    (state: RootState) => state.gallerys
  );
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    dispatch(fetchGallery());
  }, [dispatch]);

  const filteredImages =
    filter === "all"
      ? gallerys
      : gallerys.filter((img) => img.category === filter);
  const [selectedImage, setSelectedImage] = useState<{
    id: number;
    src: string;
    category: string;
    title: string;
    camera: string;
    location: string;
    dateTime: string;
  } | null>(null);

  const handleDownload = async () => {
    if (!selectedImage || !selectedImage.src) {
      toast.error("No image selected");
      return;
    }

    const fileUrl = `${process.env.REACT_APP_API_BASE_URL}${selectedImage.src}`;

    try {
      const response = await fetch(fileUrl, { method: "GET" });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const blob = await response.blob(); // Convert response to a Blob
      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute(
        "download",
        selectedImage.src.split("/").pop() || "download.jpg"
      ); // Set filename
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      toast.error("Error downloading file");
    }
  };

  return (
    <Box
      sx={{
        marginLeft: "48px",
        position: "relative",
        top: "2px",
        flexGrow: 1,
        p: 2,
        background: "#000",
        color: "#fff",
        mt: 6,
      }}
    >
      {/* Filter Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <Button
          sx={{
            backgroundColor: filter === "all" ? "#65C565" : "transparent",
            color: filter === "all" ? "#fff" : "#65C565",
            borderColor: "#65C565",
            "&:hover": {
              backgroundColor: filter === "all" ? "#4DA54D" : "#E8F5E9", // Darker green when active, light green when inactive
            },
          }}
          variant={filter === "all" ? "contained" : "outlined"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          sx={{
            backgroundColor: filter === "animal" ? "#65C565" : "transparent",
            color: filter === "animal" ? "#fff" : "#65C565",
            borderColor: "#65C565",
            "&:hover": {
              backgroundColor: filter === "animal" ? "#4DA54D" : "#E8F5E9", // Darker green when active, light green when inactive
            },
          }}
          variant={filter === "animal" ? "contained" : "outlined"}
          onClick={() => setFilter("animal")}
        >
          Animals
        </Button>
        <Button
          sx={{
            backgroundColor: filter === "alert" ? "#65C565" : "transparent",
            color: filter === "alert" ? "#fff" : "#65C565",
            borderColor: "#65C565",
            "&:hover": {
              backgroundColor: filter === "alert" ? "#4DA54D" : "#E8F5E9", // Darker green when active, light green when inactive
            },
          }}
          variant={filter === "alert" ? "contained" : "outlined"}
          onClick={() => setFilter("alert")}
        >
          Alert
        </Button>
      </Box>

      {/* Image Grid */}
      {/* Left: Image Grid */}
      <Grid container spacing={2} sx={{ flex: 1 }}>
        {filteredImages.length > 0
          ? filteredImages.map((image) => (
              <Grid item xs={12} sm={1.7} key={image.id}>
                <Card
                  sx={{ background: "#222D3A", cursor: "pointer" }}
                  onClick={() => setSelectedImage(image)}
                >
                  <CardMedia
                    component="img"
                    image={`${process.env.REACT_APP_API_BASE_URL}` + image.src}
                    alt={image.category}
                    sx={{ height: 100 }}
                  />
                </Card>
              </Grid>
            ))
          : loadingGallery && (
              <Typography
                variant="h5"
                sx={{
                  minHeight: "calc(100vh - 120px)",
                  color: "#FFF",
                  alignContent: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  width: "-webkit-fill-available",
                }}
              >
                Images are not available.
              </Typography>
            )}
      </Grid>

      {/* Sliding Drawer for Image Details */}
      <Drawer
        anchor="right"
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "50vw",
            padding: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        }}
      >
        {selectedImage && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              width: "100%",
            }}
          >
            {/* Close Button */}
            <IconButton
              sx={{ position: "absolute", top: 10, right: 10 }}
              onClick={() => setSelectedImage(null)}
            >
              <CloseIcon />
            </IconButton>

            {/* Image Preview */}
            <CardMedia
              component="img"
              image={
                `${process.env.REACT_APP_API_BASE_URL}` + selectedImage.src
              }
              alt={selectedImage.title}
              sx={{
                width: "100%", // Ensures it fills the width of the container
                height: "100%", // Ensures it fills the height of the container
                maxHeight: "70vh", // Prevents it from exceeding the viewport height
                objectFit: "contain", // Ensures full visibility without cropping
                borderRadius: 2,
              }}
            />

            {/* Image Details */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              {selectedImage.title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedImage.camera}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedImage.location}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {selectedImage.dateTime}
            </Typography>

            {/* Download Button */}
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              component="a"
              onClick={handleDownload}
              /// disabled={!selectedImage || !selectedImage.src}
            >
              Download Image
            </Button>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default Gallery;
