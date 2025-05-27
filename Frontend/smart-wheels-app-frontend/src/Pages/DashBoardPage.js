import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
import CustomLinkComponents from "../Components/CustomLinkComponents";
import ChatBot from "./ChatBot";
import NavBar from "../Components/NavBar";
import Drawer from "react-modern-drawer";
import "react-modern-drawer/dist/index.css";
import ChatBoat from "../Images/ChatBot.gif";
import SmartChatLog from "../Images/SmartChatLog.png";

function DashBoardPage() {
  let [OpenChartBot, setOpenChartBot] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {}, []);

  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen((prevState) => !prevState);
  };

  const OpenChatBot = () => {
    navigate(`/ChatBot`);
    console.log("Chat Bot...!");
  };

  return (
    <div className="App">
      <NavBar />
      <div className="Dash-Board-Content">
        <span
          style={{
            color: "#D3D3D3",
            fontSize: "2vw",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer",
          }}
        >
          Welcome...!
        </span>
      </div>
    </div>
  );
}

export default DashBoardPage;
