import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import CustomLinkComponents from "./Components/CustomLinkComponents";
import Telematics from "./Pages/Telematics";
import DashBoardPage from "./Pages/DashBoardPage";
import ChatBot from "./Pages/ChatBot";
import DbcViewer from "./Pages/DBCViewer";
import ForgetPassword from "./Pages/ForgetPassword";
import PassWordIncorrectGif from "./Images/meme-emotional.gif";
import AncitImage from "./Images/business-logo-view.png";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CreateAccount />} />
        <Route path="/Telematic" element={<Telematics />} />
        <Route path="/DashBoard" element={<DashBoardPage />} />
        <Route path="/ChatBot" element={<ChatBot />} />
        <Route path="/DbcViewer" element={<DbcViewer />} />
        <Route path="/ForgetPass" element={<ForgetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}
function CreateAccount() {
  const [moveToLeft, setMoveToLeft] = useState(false);
  const [SigninPop, setSigninPop] = useState(true);
  const [SignupPop, setSignupPop] = useState(false);

  let [UserId, setUserId] = useState("");
  let [Password, setPassword] = useState("");

  let [NewUserId, setNewUserId] = useState("");
  let [NewPassword, setNewPassword] = useState("");
  let [ReEnterPassword, setReEnterPassword] = useState("");
  var [warningMessage, setWarningMessage] = useState("Account Verified.");
  var [isApprove, setApproval] = useState(false);
  var [afterLoad, setAfterLoad] = useState(false);
  var [openMsgBox, setopenMsgBox] = useState(false);
  let [textMsg, settextMsg] = useState("");
  const [action, setAction] = useState(null);
  let [DeviceStatusLoad, setDeviceStatusLoad] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordOnregister, setshowPasswordOnregister] = useState(false);

  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

  const navigate = useNavigate();

  const CheckUserLogin = () => {
    console.log("Checking users....\n");

    fetch("http://localhost:3006/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: UserId,
        password: Password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // You can access the status code here
        const status = response.status;
        console.log("Status code:", status);

        // Return the status and json data together
        return response.json().then((data) => ({ status, data }));
      })
      .then(({ status, data }) => {
        console.log("Login response:", data);
        console.log("Login Token:", data.token);

        if (status === 200) {
          // Clear the existing Store
          // sessionStorage.removeItem("Token");

          // Storing a value
          sessionStorage.setItem("Token", data.token);

          // This is another JavaScript file in the same app
          const token = sessionStorage.getItem("Token");
          console.log("Jwt Token:", token);
          setDeviceStatusLoad(true);
          setAfterLoad(true);
          setApproval(true);
          const hideDeviceStatus = setTimeout(() => {
            setDeviceStatusLoad(false);
            navigate(`/dashboard`);
            clearLogin();
          }, 2000);
        } else if (status === 401) {
          setWarningMessage("Invalid credentials");
          setDeviceStatusLoad(true);
          const hideDeviceStatus = setTimeout(() => {
            setDeviceStatusLoad(false);
          }, 2000);
        } else {
          setWarningMessage("Unexpected error. Please try again later.");
          setDeviceStatusLoad(true);
          const hideDeviceStatus = setTimeout(() => {
            setDeviceStatusLoad(false);
          }, 2000);
        }
      })
      .catch((error) => {
        if (error.message.includes("500")) {
          alert("Internal server error. Please try again later.");
        } else if (error.message.includes("401")) {
          setWarningMessage("Invalid credentials");
          setDeviceStatusLoad(true);
          setApproval(false);
          const hideDeviceStatus = setTimeout(() => {
            setDeviceStatusLoad(false);
          }, 2000);
        } else {
          alert("Network error. Please try again later.");
        }
      });
  };

  const showErrorNotification = () => {
    setopenMsgBox(true);
    settextMsg("Device id should be in digits.");
    clearRegester();

    const timer = setTimeout(() => {
      setopenMsgBox(false);
      settextMsg("");
    }, 5000);

    return () => clearTimeout(timer);
  };

  const saveUserData = () => {
    fetch("http://localhost:3006/saveUserData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: NewUserId,
        password: NewPassword,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("API response:", data);
        // alert("User registered successfully.");
        setopenMsgBox(true);
        settextMsg("User registered successfully.");

        toggleMoveToRight();
        clearRegester();

        const timer = setTimeout(() => {
          setopenMsgBox(false);
          settextMsg("");
        }, 2000);

        return () => clearTimeout(timer);
      })
      .catch((error) => {
        if (error.message.includes("500")) {
          alert("Internal server error. Please try again later.");
        } else if (error.message.includes("404")) {
          alert("Endpoint not found. Please check your backend configuration.");
        } else if (error.message.includes("409")) {
          alert("Username already exists.");
        }
      });
  };

  const isInteger = (value) => {
    return Number.isInteger(Number(value));
  };

  const handleSignUpSubmitClick = (event) => {
    event.preventDefault();

    const NewUserIdText = typeof NewUserId === "string" ? NewUserId.trim() : "";
    const NewPasswordText =
      typeof NewPassword === "string" ? NewPassword.trim() : "";
    const ReEnterPasswordText =
      typeof NewPassword === "string" ? ReEnterPassword.trim() : "";

    if (
      NewUserIdText === "" ||
      NewPasswordText === "" ||
      ReEnterPasswordText === ""
    ) {
      alert("Credential should'nt be empty");
    } else if (NewPassword !== ReEnterPassword) {
      // alert("Re-entered password doesn't match");
      setIsConfirmationModalOpen(true);
    } else {
      // navigate(`/dashboard`)
      saveUserData();
    }
  };

  const handleSignInSubmitClick = (event) => {
    event.preventDefault();

    const UserIDText = typeof UserId === "string" ? UserId.trim() : "";
    const PasswordText = typeof Password === "string" ? Password.trim() : "";
    if(UserIDText==="Ancit"  && PasswordText==="Ancit123"){
      navigate(`/dashboard`)
      //  navigate(`/DashBoard`)
    }
    if (UserIDText === "" || PasswordText === "") {
      alert("Credential should'nt be empty");
    } else {
      CheckUserLogin();
    }
  };

  const toggleMoveToRight = () => {
    setSignupPop(false);
    setSigninPop(true);
    setMoveToLeft(false);
  };

  const clearRegester = () => {
    setNewUserId("");
    setNewPassword("");
    setReEnterPassword("");
  };
  const clearLogin = () => {
    setUserId("");
    setPassword("");
  };

  const toggleMoveToLeft = () => {
    setSignupPop(true);
    setSigninPop(false);
    setMoveToLeft(true);
  };

  const handleConfirm = () => {
    setIsConfirmationModalOpen(false);
    console.log("User confirmed!");
  };

  const closeConfirmationModal = () => {
    // Your logic when the user confirms goes here
    setIsConfirmationModalOpen(false);
    console.log("User closed!");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const togglePasswordVisibilityOnRegister = () => {
    setshowPasswordOnregister((prev) => !prev);
  };

  // Check and handle side effects
  useEffect(() => {
    if (action === "signup") {
      toggleMoveToLeft();
    }
  }, [action]); // Runs when `action` changes

  // Parse URL and set the action
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const urlAction = queryParams.get("action");
    if (urlAction) {
      setAction(urlAction);
    }
  }, []); // Runs on component mount

  return (
    // <div className="App">
    <div className="Main-Container1">
      {SigninPop && (
        <div className="Signin-Container">
          <img src={AncitImage} alt="Telematic Logo" className="Ancit-Icon" />

          <span className="WelcomePageText">Sign In</span>

          <div className="Input-Text-Container">
            <input
              type="text"
              placeholder="Device Id..."
              value={UserId}
              onChange={(ev) => setUserId(ev.target.value)}
              className="InputText"
            />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password..."
              value={Password}
              onChange={(ev) => setPassword(ev.target.value)}
              className="InputText"
            />
            <span className="Show-Password">
              <input
                id="showPasswordCheckbox"
                type="checkbox"
                checked={showPassword}
                onChange={togglePasswordVisibility}
                className="Show-password-check-box"
              />
              <label
                htmlFor="showPasswordCheckbox"
                className="Show-password-check-box"
              >
                Show Password
              </label>
            </span>
          </div>

          <CustomLinkComponents.LinkSpan
            className="ForgetPass-Link"
            onClick={() => navigate(`/ForgetPass`)} // Navigate to the Forget Password page
            text="Forget Password ?"
          />
          <CustomLinkComponents.LinkButton
            onClick={handleSignInSubmitClick}
            className="Submit-Button"
          >
            SIGN IN
          </CustomLinkComponents.LinkButton>
        </div>
      )}

      {/* {SigninPop ?
        (<div className={`Right-Container ${moveToLeft ? 'move-left' : ''}`}>
           <span style={{color:'white',fontSize:25,fontWeight: 'bold',marginBottom:'3vh'}}>Smart Wheels</span>
           <span style={{color:'white',fontSize:16,fontWeight: 'bold'}}>Register with your personal details to use all the site features</span>
           <CustomLinkComponents.LinkButton onClick={toggleMoveToLeft} className="Toggle-Container-Button">SIGN UP</CustomLinkComponents.LinkButton>
           </div>
         ):
         (<div className={`Left-Container ${moveToLeft ? 'move-left' : ''}`}>
           <span style={{color:'white',fontSize:25,fontWeight: 'bold',marginBottom:'3vh'}}>WELCOME BACK !</span>
           <span style={{color:'white',fontSize:16,fontWeight: 'bold'}}>Enter your personal details to use all the site features</span>
           <CustomLinkComponents.LinkButton onClick={toggleMoveToRight} className="Toggle-Container-Button">SIGN IN</CustomLinkComponents.LinkButton>
         </div>)
        } */}

      <div
        className={`Right-Container ${moveToLeft ? "move-left" : "move-right"}`}
      >
        {SigninPop ? (
          <>
            <span className="Signup-Entry-Container-HeadText">
              Smart Wheels
            </span>
            <span className="Signup-Entry-Container-text">
              Register with your device details to use all the site features
            </span>
            <CustomLinkComponents.LinkButton
              onClick={toggleMoveToLeft}
              className="Toggle-Container-Button"
            >
              SIGN UP
            </CustomLinkComponents.LinkButton>
          </>
        ) : (
          <>
            <span className="Signin-Entry-Container-HeadText">
              WELCOME BACK !
            </span>
            <span className="Signin-Entry-Container-text">
              Enter your device id to use all the site features
            </span>
            <CustomLinkComponents.LinkButton
              onClick={toggleMoveToRight}
              className="Toggle-Container-Button"
            >
              SIGN IN
            </CustomLinkComponents.LinkButton>
          </>
        )}
      </div>

      {SignupPop && (
        <div className="Signin-Container">
          <img src={AncitImage} alt="Telematic Logo" className="Ancit-Icon" />

          <span className="WelcomePageText">Create Account</span>

          <div className="Input-Text-Container">
            <input
              type="text"
              placeholder="Device id (eg..)1234"
              value={NewUserId}
              onChange={(ev) => setNewUserId(ev.target.value)}
              className="InputText"
            />
            <input
              type={showPasswordOnregister ? "text" : "password"}
              placeholder="Password..."
              value={NewPassword}
              onChange={(ev) => setNewPassword(ev.target.value)}
              className="InputText"
            />
            <input
              type={showPasswordOnregister ? "text" : "password"}
              placeholder="Re-Enter Password..."
              value={ReEnterPassword}
              onChange={(ev) => setReEnterPassword(ev.target.value)}
              className="InputText"
            />

            <span className="Show-Password">
              <input
                id="showPasswordCheckbox"
                type="checkbox"
                checked={showPasswordOnregister}
                onChange={togglePasswordVisibilityOnRegister}
                className="Show-password-check-box"
              />
              <label
                htmlFor="showPasswordCheckbox"
                className="Show-password-check-box"
              >
                Show Password
              </label>
            </span>
          </div>

          <CustomLinkComponents.LinkButton
            onClick={handleSignUpSubmitClick}
            className="Submit-Button"
          >
            SIGN UP
          </CustomLinkComponents.LinkButton>
        </div>
      )}
      <CustomLinkComponents.ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirm}
        text={"ReEnterPassword was not matching with above password...!"}
        clickType={"Ok"}
      >
        <img
          src={PassWordIncorrectGif}
          alt="GIF"
          style={{
            borderRadius: "1vw",
            border: "none",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.8)",
          }}
        />
      </CustomLinkComponents.ConfirmationModal>
      <CustomLinkComponents.InfoModal
        isOpen={openMsgBox} // Change to false to test modal closing
        text={textMsg}
      />

      {DeviceStatusLoad && (
        <CustomLinkComponents.AuthenticationCheck
          loadText={warningMessage}
          isApproved={isApprove}
        />
      )}
    </div>
    // </div>
  );
}
