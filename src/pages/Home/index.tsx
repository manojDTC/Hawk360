import { useState } from "react";
import LiveVideo from "./LiveVideo";
import ThermalVideo from "./ThermalVideo";
import Analytics from "./Analytics";
import Logs from "./Logs";
import { Box } from "@mui/material";

const Home = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  return (
    <div
      style={{
        marginLeft: "50px",
        marginTop: "52px",
        background: "#000000e0",
        padding: "8px 15px",
        position: "fixed",
      }}
      className="home-layout"
    >
      <Box sx={{ display: "flex", gap: "10px" }}>
        <Box
          sx={{
            flex: "0 0 50%",
            justifyItems: "center",
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 70px)",
            gap: "5px",
          }}
        >
          <LiveVideo />
          <LiveVideo />

          {/* <ThermalVideo /> */}
        </Box>
        <Box sx={{ flex: "1" }}>
          <Analytics isPlaying={isPlaying} />
          <Logs isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
        </Box>
      </Box>
    </div>
  );
};

export default Home;
