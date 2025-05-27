import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AncitImage from "../Images/business-logo-view.png";
import RightDrawNav from "../Images/RightDrawNav.gif";
import Drawer from "react-modern-drawer";
import { color } from "framer-motion";
import SmartChatLog from "../Images/SmartChatLog.png";

const NavBar = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userSearch, setuserSearch] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [token, setAccessToken] = useState(
    sessionStorage.getItem("Token") || ""
  );
  const navigate = useNavigate();

  // const LogoutUser = () => {
  //   alert("You'r trying to log-out ...!");
  //   sessionStorage.removeItem("Token");
  //   navigate("/");
  // };

  // Function to handle logout
  const LogoutUser = async () => {
    alert("You'r trying to log-out ...!");
    try {
      const response = await fetch("http://localhost:3006/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies to clear them on logout
      });

      if (!response.ok) {
        throw new Error("Logout failed: " + response.statusText);
      }

      const data = await response.json();

      console.log(`res status : ${response.status}`);
      console.log(` res msg : ${data.message}`);

      // Clear access token from localStorage and state
      sessionStorage.removeItem("Token");
      navigate("/");
    } catch (error) {
      alert(`Logout failed ${error}`);
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleSearchContent = () => {
    alert("handleSearchContent ...?");
  };

  return (
    <header className="top-nav-bar-Test">
      <img
        src={AncitImage}
        alt="Ancit Logo"
        style={{ borderRadius: "2vh", height: "2.5vw" }}
      />
      <nav>
        <ul className="top-nav-bars-List-Test">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/services">Services</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
          <li onClick={toggleDropdown} style={{ position: "relative" }}>
            <Link to="#">SmartWheels </Link>
            {dropdownVisible && (
              <ul className="dropdown-Items-Test">
                <li>
                  <Link to="/Telematic">Telematics</Link>
                </li>
                <li>
                  <Link to="#">Resource_Manage</Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      <div className="ChatInputWrapper">
        <img
          src={SmartChatLog}
          alt={"Smart Chat"}
          className="ChatBot-img"
          onClick={() => navigate(`/ChatBot`)}
        />

        <input
          type="text"
          placeholder="Search..."
          value={userSearch}
          onChange={(e) => setuserSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchContent();
            }
          }}
          className="UserSearchBox"
        />
      </div>

      <img
        src={RightDrawNav}
        alt="gif"
        className="Draw-nav"
        onClick={() => setIsDrawerOpen(true)}
      />

      <Drawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        direction="right"
        className="Draw-Nav-Bar"
      >
        <div className="Required-stuff">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/ChatBot">Chat-Bot</Link>
          </li>
          <li>
            <Link to="">Settings</Link>
          </li>
        </div>

        <div style={{ borderBottom: "3px solid #ccc", margin: "1vh 0" }}></div>

        <div className="General-Stuff">
          <li onClick={LogoutUser}>
            <Link to="">Log-Out</Link>
          </li>
          <li>
            <Link to="">Settings</Link>
          </li>
        </div>
      </Drawer>
    </header>
  );
};

export default NavBar;
