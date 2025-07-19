import { useState } from "react";
import { MenuItem, MenuList } from "@mui/material";
import homeIcon from "../../src/assets/images/homeIcon.png";
import alertsIcon from "../../src/assets/images/ticketsIcon.png";
import configureIcon from "../../src/assets/images/configureIcon.png";
import preset from "../../src/assets/images/presetIcon.png";
import { SidebarItemProps } from "../types/interface/SidebarItemProps.interface";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const [activeItem, setActiveItem] = useState<string>("");
  const configUrl = "http://37.27.230.246:7200";

  const sideBarItems: SidebarItemProps[] = [
    { title: "Home", icon: homeIcon, link: "home" },
    { title: "Ticket", icon: alertsIcon, link: "ticket" },
    { title: "preset", icon: preset, link: "preset" },
    // { title: "gallary", icon: galleryIcon, link: "gallary" },
    // { title: "maps", icon: mapIcon, link: "maps" },
    { title: "configure", icon: configureIcon, link: "configure" },
  ];

  const handleClick = (link: string) => {
    if (link === "configure") {
      window.open(configUrl);
      return;
    }

    navigate(`/${link}`);
    setActiveItem(link);
  };

  return (
    <MenuList
      sx={{
        position: "fixed",
        top: "52px",
        left: "0px",
        background: "black",
        width: "50px",
        height: "calc(100vh - 52px)",
        padding: "0",
      }}
    >
      {sideBarItems?.map((item, index) => {
        return (
          <MenuItem
            onClick={() => handleClick(item.link)}
            key={index}
            sx={{
              justifyContent: "center",
              padding: "15px 0",
              backgroundColor:
                item.link === `${activeItem}`
                  ? "rgb(116, 96, 171)"
                  : "transparent",
              borderLeft:
                item.link === `${activeItem}`
                  ? "5px rgb(169, 167, 174)"
                  : "5px solid transparent",
              "&:hover": { backgroundColor: "transparent" },
            }}
          >
            <img
              src={item.icon}
              style={{ height: "20px", objectFit: "contain" }}
              alt="Icon"
            ></img>
          </MenuItem>
        );
      })}
    </MenuList>
  );
};

export default Sidebar;
