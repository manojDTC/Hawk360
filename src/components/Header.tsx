import React from "react";
import Box from "@mui/material/Box";
import Logo from "../../src/assets/images/wildlife_logo.png";
import Avatar from "../../src/assets/images/Avatar.png";

const Header = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px",
        background: "#313133",
        position: "fixed",
        width: "99%",
        top: "0",
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: "7px",
          alignItems: "center",
          //cursor: "pointer",
        }}
      >
        <span>
          <img
            src={Logo}
            alt="Logo"
            style={{ height: "38px", width: "100%" }}
          ></img>
        </span>
      </Box>
      <Box sx={{ alignSelf: "center" }}>
        <Box>
          <img src={Avatar} alt=""></img>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
