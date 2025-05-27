import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import CustomLinkComponents from "../Components/CustomLinkComponents";
import CreateBoardEntry from "../Components/CreateBoardEntry";
import CreateNewBoardId from "../Components/CreateNewBoardId";
import GraphChart from "../Components/GraphChart";
import { motion, transform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UpdateImage from "../Images/updateFile.gif";
import ChatBoat from "../Images/ChatBot.gif";
import SpeedometerImage from "../Images/Speedometer.gif";
import notificationIcon from "../Images/Notification.gif";
import canTestData from "../Images/CanTestData.gif";
import VehicleDiagnosticImage from "../Images/vehicleDiagnostics.png";
import FuelImage from "../Images/ReFuel.gif";
import GPSLocation from "../Images/GPS.gif";
import CloseClickIcon from "../Images/colse.gif";
import Completed from "../Images/completed.gif";
import updating from "../Images/uploading.gif";
import BackClickIcon from "../Images/BackArrow.png";
import { StatusIndicator } from "@zendeskgarden/react-avatars";
import { Row, Col } from "@zendeskgarden/react-grid";
import { render } from "@testing-library/react";
import SmartChatLog from "../Images/SmartChatLog.png";
import { useLocation } from "react-router-dom";
import Drawer from "react-modern-drawer";

function Telematics() {
  let [canLoad, setCanLoad] = useState(false);
  let [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  let [isUpdateAbortConfirm, setIsUpdateAbortConfirm] = useState(false);
  let [infoVisible, setInfoVisible] = useState(false);
  let [buttonVisible, setButtonVisible] = useState(false);
  let [showDialog, setShowDialog] = useState(false);
  let [OpenChartBot, setOpenChartBot] = useState(true);
  let [isDeviceConnected, setisDeviceConnected] = useState(false);
  let [isLoadFileRender, setLoadFileRender] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  let [isupdateClicked, setUpdateClicked] = useState(false);
  let [DeviceStatusLoad, setDeviceStatusLoad] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  let [closeSuccessMsgBlock, setCloseSuccessMsgBlock] = useState(true);

  const navigate = useNavigate();

  const [selectedSrecFile, setSelectedSrecFile] = useState("");
  const [selectedBoardId, setSelectedBoardId] = useState("");
  let [UserPinId, setUserPinId] = useState("");
  let [progressCount, setLineCount] = useState(0);
  let [fileLineCount, setfileLineCount] = useState(0);
  const [messages, setMessages] = useState();
  var [socket, setSocket] = useState(null);
  var [isAvailable, setAvaiable] = useState(true);
  var [afterLoad, setAfterLoad] = useState(false);
  var [stopPinging, setStopPinging] = useState(false);
  const [items, setItems] = useState([]);
  var [receivedData, setReceivedData] = useState({});

  var [StartStop, setStartStop] = useState(true);
  var [StartStopButton, setStartStopButton] = useState("Run-Telemetry");
  const [showGraph, setShowGraph] = useState(false);
  var [DisableFlash, setDisableFlash] = useState(false);
  const [TriggerReTryUpdate, setTriggerReTryUpdate] = useState(0);
  const [AddressMissMatch, setAddressMissMatch] = useState(0);
  const [FormatError, setFormatError] = useState(0);
  const [length, setLength] = useState(0);
  const [selectedSignals, setSelectedSignals] = useState(0);
  const [telemetrySignalLength, setTelemetrySignalLength] = useState(0);

  const [telemetricsIndex, setSelectedTelemetricsIndex] = useState(0);
  const [telemetrySignals, setTelemetrySignals] = useState([]);

  // const token = sessionStorage.getItem("Token");
  const [token, setAccessToken] = useState(
    sessionStorage.getItem("Token") || ""
  );
  const mapIntervalOfBoardId = useRef(new Map()); // Store intervals per boardId
  const previousBoardId = useRef(null); // To store the previous boardId without causing re-renders
  // console.log('Jwt Token:', token);

  // Initialize state with the global variable window.selectedItems
  const [selectedSignal, setSelectedSignal] = useState([]);

  const fileInputRef = useRef(null);
  const isMounted = useRef(false); // Ref to track initial mount state
  var intervalToPingDevice;
  var intervalUpdateProgressBarCount;
  var appendingDatainterval;
  var floored;
  var propertyName;
  var propertyValue;
  var formatError =
    "File Format Error !!\nPlease check the format or select the proper one. Only .srec files are allowed.";
  var AddressMissMatchError =
    "Address MissMatch Error !!\nPlease check the address or select the proper one. Only .srec files are allowed.";

  var ws;

  const location = useLocation();

  // Function to get the lengths of both lists
  const getListLengths = () => {
    const receivedDataLength = receivedData.length;
    const selectedItemsLength = window.selectedItems.length;

    return { receivedDataLength, selectedItemsLength };
  };

  const { receivedDataLength, selectedItemsLength } = getListLengths();

  const progressBarStyle = {
    backgroundColor: "#f5f5f5",
  };

  const requestOptions = {
    headers: { "Content-Type": "application/json" },
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      console.log("File content:", content);
      const lineCount = content.split("\n");
      setfileLineCount(lineCount.length);
      console.log("File line count:", lineCount.length);
      uploadFile(content, file.name, lineCount.length);
    };
    reader.readAsText(file);
  };

  const uploadFile = async (fileContent, fileName, fileLength) => {
    const formData = new FormData();
    const blob = new Blob([fileContent], { type: "text/plain" });

    // Append the blob as a file to the FormData object
    formData.append("file", blob, fileName);

    const requestOptions = {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
      },
      body: formData,
    };

    try {
      const response = await fetch(
        "http://localhost:3006/upload",
        requestOptions
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("File uploaded successfully:", data);
    } catch (error) {
      if (error.message.includes("400")) {
        alert("No file uploaded Error. Please try again later.");
      } else {
        console.error("Error uploading file:", error);
      }
    }
  };

  const pingRespectedIds = (boardId) => {
    setSelectedBoardId(boardId + "-Board");

    // setShowCreateBoard((prev) => !prev);

    // Log the previous boardId before updating it
    console.log("Previous boardId:", previousBoardId.current);

    // Clear any existing interval for the previous boardId
    if (
      previousBoardId.current &&
      mapIntervalOfBoardId.current.has(previousBoardId.current)
    ) {
      clearInterval(mapIntervalOfBoardId.current.get(previousBoardId.current));
      mapIntervalOfBoardId.current.delete(previousBoardId.current);
      unSubDeleteId(previousBoardId.current);
    }

    // Update the ref to hold the current boardId
    previousBoardId.current = boardId; // This does NOT cause a re-render

    subscribeChannel(boardId);

    const ShowDeviceStatus = setTimeout(() => {
      setDeviceStatusLoad(true);
    }, 1000);

    intervalToPingDevice = setInterval(() => {
      // if (!stopPinging) {
      fetchPingDevice(boardId);
      // }
    }, 5000);

    // Store the interval in the Map for this boardId
    mapIntervalOfBoardId.current.set(boardId, intervalToPingDevice);
  };

  const handleClick = (index) => {
    console.log(`Clicked on item ${index + 1}`);

    setSelectedTelemetricsIndex(index);
    setShowGraph(true);
  };

  const handleFileChange = (event) => {
    // stopAwake();
    console.log("StopAwake........! ");
    const file = event.target.files[0];
    setSelectedSrecFile(file.name);
    console.log("File name........! ", file);
    if (file) {
      readFile(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const subscribeChannel = (boardId) => {
    fetch("http://localhost:3006/subscribeChannels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ configBoardId: boardId }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Parse response body as JSON
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log(data.message);
        console.log(data.isSubscribed);
      })
      .catch((error) => console.error("Error:", error));
  };

  const unSubDeleteId = (deleteId) => {
    fetch("http://localhost:3006/unsubscribeToTopic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ unsubscribeId: deleteId }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Parse response body as JSON
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log(data.message);
        console.log(data.isSubscribed);
      })
      .catch((error) => console.error("Error:", error));
  };

  const CheckFirmWereUpdateAvaiable = (event) => {
    console.log("check FirmWere Update....\n");
    if (FirmWereUpdate()) {
      setButtonVisible(true);
      setShowDialog(true);
    }
  };

  const InitilizeData = () => {
    fetch("http://localhost:3006/InitilizeData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ UserPinId }),
    })
      .then((response) => {
        console.log("HTTP Status Code:", response.status); // Log the status code
        if (response.ok) {
          return response.json(); // Parse response body as JSON
        } else {
          throw new Error(`HTTP status code: ${response.status}`);
        }
      })
      .then((data) => {
        console.log(data.message);
      })
      .catch((error) => console.error("Error:", error));
  };

  const stopAwake = () => {
    const message = { msg: "StopAwake" }; // Define your message here

    fetch("http://localhost:3006/StopAwake", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Parse response body as JSON
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log(data.message);
        console.log(data.success);
        setStopPinging(data.success);
      })
      .catch((error) => console.error("Error:", error));
  };

  const startTelemetry = () => {
    fetch("http://localhost:3006/StartTelemerty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log(data.message);
      })
      .catch((error) => console.error("Error:", error));
  };

  const downloadFile = async () => {
    try {
      const response = await fetch("http://localhost:3006/downloadLogFile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Telemetric.log";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

  const startAppendingData = () => {
    fetch("http://localhost:3006/append-to-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Parse response body as JSON
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log(data);
      })
      .catch((error) => console.error("Error:", error));
  };

  const fetchPingDevice = (boardId) => {
    console.log("Fetching Device....\n");
    console.log(boardId);
    //  console.log('Jwt Token:', token);

    const postRequestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ configBoardId: boardId }),
    };

    fetch("http://localhost:3006/PingDevice", postRequestOptions)
      .then((response) => {
        console.log("HTTP Status Code:", response.status);
        if (response.ok) {
          return response.text(); // Parse response body as text
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((jsonString) => {
        const data = JSON.parse(jsonString);
        console.log(data);
        console.log(typeof data.deviceStatus); // "string"
        console.log(typeof data.deviceId); // "string"
        if (data.deviceId === boardId && data.deviceStatus === "Awake") {
          console.log("inside the if condistion ", data); // "string"
          setisDeviceConnected(isDeviceConnected);
          // Check if the data is 'Device Ready'
          isDeviceConnected = true;
          setAvaiable(!isAvailable);
          setAfterLoad(true);
          const hideDeviceStatus = setTimeout(() => {
            setDeviceStatusLoad(false);
          }, 3000);
        } else {
          isDeviceConnected = false;
          setisDeviceConnected(isDeviceConnected);
          setAfterLoad(false);
          const ShowDeviceStatus = setTimeout(() => {
            setDeviceStatusLoad(true);
          }, 1000);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const FirmWereUpdate = () => {
    console.log("checking FirmWere Update...\n", isDeviceConnected);
    //have to add one more validation on if condition to check the update is available with api call
    if (isDeviceConnected) {
      return true;
    }
    return false;
  };

  const handleDiagnostiClick = () => {
    //  alert("CAN Test..?");
    //   navigate(`/GraphChart`);
  };

  const handleBackClick = () => {
    alert("back click...!");
  };

  const UpdateModalcloseAlertCheck = () => {
    if (progressCount > 0 && progressCount !== 100) {
      isUpdateAbortConfirm = true;
      setIsUpdateAbortConfirm(isUpdateAbortConfirm);
    } else {
      setLoadFileRender(false);
      reInitializeFileSelection();
    }
  };

  const CloseClick = () => {
    UpdateModalcloseAlertCheck();
    // setLoadFileRender(false);
  };

  const handleLoadClick = (event) => {
    event.preventDefault();

    setIsConfirmationModalOpen(true);
    console.log("Loading..\n");
  };

  const ReadLoadDbcViwer = async () => {
    try {
      const response = await fetch("http://localhost:3006/DbcAligner", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);
      navigate("/DbcViewer", { state: { data } });
      // setTreeData(data);
    } catch (err) {
      // setError(err.message);
      console.error("Error message :", err.message);
    } finally {
      // setLoading(false);
    }
  };

  const handleFameWareUpdateClick = () => {
    //  navigate(`/FirmWareUpdate`);
  };

  const RenderJsonValues = () => {
    ws = new WebSocket("ws://localhost:3007");

    console.log("Initialized WebSocket connect for Telemetry data....!");

    ws.onopen = () => {
      console.log("Connected to the Telemetry server");
    };

    ws.onmessage = (event) => {
      try {
        receivedData = JSON.parse(event.data);
        setReceivedData(receivedData);
        updateCommonItems();

        console.log("Rendereing json data", receivedData);
        console.log("Json data size", receivedData.length);

        setLength(receivedData.length);
        setStartStopButton("Download log file");

        // Set up an interval to call the method every 5 seconds
        appendingDatainterval = setInterval(() => {
          console.log("isLoadFileRender : ", isLoadFileRender);
          if (isLoadFileRender) {
            clearInterval(appendingDatainterval);
          } else {
            startAppendingData();
          }
        }, 5000);
      } catch (error) {
        // console.error('Error parsing received JSON:', error);
        alert("Data not yet received..!");
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from the server");
    };

    setSocket(ws);

    ws.onerror = (error) => {
      console.error("WebSocket encountered an error: ", error);
    };
  };

  const disconnectWebSocket = () => {
    if (socket) {
      socket.close();
    }
  };

  const OpenUploadFileModal = () => {
    // isLoadFileRender=true;
    setLoadFileRender(true);
    disconnectWebSocket();
  };

  const handleFameWareCancel = () => {
    setShowDialog(false);
    const intervalToCheckUpdateIsClicked = setInterval(() => {
      if (isupdateClicked === false && FirmWereUpdate()) {
        setShowDialog(true);
      } else {
        return () => {
          clearInterval(intervalToCheckUpdateIsClicked); // Clean up the interval on component unmount
        };
      }
    }, 5000);
  };

  const progressCountCal = () => {
    fetch("http://localhost:3006/ProgressCount", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log("HTTP Status Code:", response.status); // Log the status code
        if (response.ok) {
          return response.json(); // Parse response body as JSON
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        const lineCount = data.lineCount;
        //console.log('Line count from backend:', lineCount); // Debug log
        const progress = (100 / fileLineCount) * lineCount;
        //console.log('Calculated progress:', progress); // Debug log
        // const rounded = Math.round(number); // 6
        floored = Math.ceil(progress); // 5
        console.log("Calculated progress:", floored);
        console.log("linecount: ", lineCount);
        if (lineCount === -3) {
          progressCount = 100;
          setLineCount(progressCount);
          console.log("progressCount in return :", floored);
          clearInterval(intervalUpdateProgressBarCount);
          setStopPinging(false);
          // ClearFileSelection();
        } else if (lineCount === -12) {
          setFormatError(lineCount);
          alert(formatError);
          clearInterval(intervalUpdateProgressBarCount);
          ClearFileSelectionForNew();
          // ClearFileSelection();
        } else if (lineCount === -10) {
          setAddressMissMatch(lineCount);
          alert(AddressMissMatchError);
          clearInterval(intervalUpdateProgressBarCount);
          ClearFileSelectionForNew();
        } else if (lineCount === -808) {
          setTriggerReTryUpdate(lineCount);
          console.log("Timing Delay Exception :", lineCount);
          clearInterval(intervalUpdateProgressBarCount);
          ClearFileSelectionForNew();
          UpdateFirmWare();
          // ClearFileSelection();
        } else {
          setLineCount(floored);
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  const handleConfirm = () => {
    startTelemetry();

    // when the user confirms goes here
    setCanLoad(true);

    console.log("Reveived data : ", receivedData);
    RenderJsonValues();

    console.log("User confirmed random data!");
  };

  const handleAbortConfirmation = () => {
    setLoadFileRender(false);
    // clearInterval(intervalUpdateProgressBarCount);
    reInitializeFileSelection();
    isUpdateAbortConfirm = false;
    setIsUpdateAbortConfirm(isUpdateAbortConfirm);
    console.log("Handle Update Abort!");
  };

  const callInfoBlock = () => {
    // loadInfoModal();
    const infoVisibleTime = setTimeout(() => {
      setInfoVisible(true);
    }, 5000);
  };

  const reInitializeFileSelection = () => {
    if (
      TriggerReTryUpdate !== 808 ||
      AddressMissMatch !== -10 ||
      FormatError !== -12
    ) {
      setLoadFileRender(false); //closing the update modal
      setCloseSuccessMsgBlock(false); //closing the success msg modal
    }
    ClearFileSelectionForNew();
    setDisableFlash(false);
    setCloseSuccessMsgBlock(true); //Reseting the success msg modal to true, so that when progress bar cout reaches 100 % it pop im-mediately the msg
  };

  const ClearFileSelection = () => {
    InitilizeData();
  };

  const ClearFileSelectionForNew = () => {
    InitilizeData();
    progressCount = 0;
    setLineCount(progressCount);
    console.log("progress:", progressCount);
    setSelectedSrecFile("");
    setDisableFlash(false);
  };

  const colseSuccessMessage = () => {
    const timer = setTimeout(() => {
      reInitializeFileSelection();
      // setCloseSuccessMsgBlock(false);
    }, 5000);
  };

  const loadInfoModal = () => {
    console.log("update completed....!");
    return (
      <>
        {closeSuccessMsgBlock && (
          <div className="modal-overlay">
            <div className="modal">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <p>FirmWare Update is completed successfully...</p>
                <img src={Completed} alt="gif" className="Completed-modal" />
              </div>
            </div>
          </div>
        )}
        {closeSuccessMsgBlock && colseSuccessMessage()}
      </>
    );
  };

  const closeConfirmationModal = () => {
    // Your logic when the user confirms goes here
    setIsConfirmationModalOpen(false);
    console.log("User closed!");
  };

  const closeAbortConfirmation = () => {
    isUpdateAbortConfirm = false;
    setIsUpdateAbortConfirm(isUpdateAbortConfirm);
  };

  const OpenChatBot = () => {
    navigate(`/ChatBot`);
    console.log("Chat Bot...!");
  };

  const UpdateFirmWare = () => {
    //  alert("will do firmware update..!");

    setDisableFlash(true);
    setUpdateClicked(true);
    // handleFameWareCancel(); // to check latestest srec file update from Data base side

    intervalUpdateProgressBarCount = setInterval(() => {
      progressCountCal();
    }, 1000);

    const postRequestOptions = {
      ...requestOptions,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: "Device" }),
    };

    fetch("http://localhost:3006/StartUpdate", postRequestOptions)
      .then((response) => {
        if (response.ok) {
          return response.text(); // Parse response body as text
        } else {
          throw new Error("Network response was not ok");
        }
      })
      .then((data) => {
        console.log(data); // Log the text data
      })
      .catch((error) => console.error("Error:", error));
  };

  // Function to directly update window.selectedItems with values from list1
  const updateCommonItems = () => {
    console.log("selected signals : ", window.selectedItems);
    window.selectedItems.forEach((item2, index) => {
      console.log("receivedData json : ", receivedData.Message_ID);

      console.log("selected signal : ", item2.message_ID);
      // const match = receivedData.find(item1 => item1.message_ID === item2.message_ID);
      const match =
        receivedData.Message_ID === item2.message_ID ? receivedData : null;
      console.log("match : ", match);
      if (match) {
        // Directly mutate window.selectedItems
        console.log("matched json : ", match);
        window.selectedItems[index] = { ...item2, ...match };
        console.log("After Edit: ", window.selectedItems);
      }
    });

    // Update the local state to trigger re-render
    setSelectedSignal([...window.selectedItems]);
    console.log("in to the changed json : ", selectedSignal); // Log the text data
  };

  const TelematicsSignals = selectedSignal.map((signal, i) => (
    <div className="item" key={i} onClick={() => handleClick(i)}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bold",
          marginTop: "2vh",
        }}
      >
        <span className="bold-text"> {signal[`signal_name`]}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          fontWeight: "bold",
          marginTop: "2vh",
        }}
      >
        {signal["signal_value"] &&
        signal["signal_value"][signal["signal_name"]] != null
          ? signal["signal_value"][signal["signal_name"]]
          : ""}
      </div>
    </div>
  ));

  useEffect(() => {
    setReceivedData([]);
    console.log("from the dbc viewer class : ", location.state || {});

    if (selectedItemsLength !== 0) {
      console.log("from the dbc viewer class : ", window.selectedItems);
      setSelectedSignal([...window.selectedItems]);
      console.log("from the dbc viewer class : ", selectedItemsLength);
    }

    InitilizeData();

    // const ShowDeviceStatus = setTimeout(() => {
    //   setDeviceStatusLoad(true);
    // }, 1000);

    // intervalToPingDevice = setInterval(() => {
    //   if (!stopPinging) {
    //     fetchPingDevicea();
    //   }
    // }, 5000);

    // const intervalToCheckFirmwereUpdate = setInterval(() => {
    //     CheckFirmWereUpdateAvaiable();
    // }, 30000);
  }, []);

  return (
    <div className="CreateId-Telematic-Container">
      <CreateNewBoardId
        onClick={() => setShowCreateBoard((prev) => !prev)}
        onClickChannel={(boardId) => pingRespectedIds(boardId)}
        onClickUnSubscribeIds={(DeleteId) => unSubDeleteId(DeleteId)}
      />
      <div className="Telematic-Container">
        <div className="Header-container">
          <div>
            {isDeviceConnected || stopPinging ? (
              <Row>
                <Col textAlign="center">
                  <StatusIndicator
                    type="available"
                    aria-label="status: available"
                  >
                    <span className="Header-Status-text">
                      {" "}
                      {selectedBoardId} (Available)
                    </span>
                  </StatusIndicator>
                </Col>
              </Row>
            ) : (
              <Row>
                <Col textAlign="center">
                  <StatusIndicator type="offline" aria-label="status: offline">
                    <span className="Header-Status-text">
                      {" "}
                      {selectedBoardId} (Offline)
                    </span>
                  </StatusIndicator>
                </Col>
              </Row>
            )}
          </div>

          <span className="Header-bold-text">Telematics & Diagnostics</span>
          <span className="Header-Draw" onClick={() => setIsDrawerOpen(true)}>
            ...
          </span>
        </div>
        <div
          className={`values-container ${
            selectedItemsLength === 1 ? "center" : "space-between"
          }`}
        >
          {TelematicsSignals}
        </div>
        <div className="Credential-Button-container">
          <CustomLinkComponents.LinkButton
            onClick={
              StartStopButton === "Run-Telemetry"
                ? handleLoadClick
                : downloadFile
            }
            className="Credential-Containers-Button"
            isDisabled={false}
          >
            {StartStopButton}
          </CustomLinkComponents.LinkButton>
          <CustomLinkComponents.LinkButton
            onClick={() => navigate("/DbcViewer")}
            className="Credential-Containers-Button"
            isDisabled={false}
          >
            DBC-Viewer
          </CustomLinkComponents.LinkButton>

          <CustomLinkComponents.LinkButton
            onClick={OpenUploadFileModal}
            className="Credential-Containers-Button"
            isDisabled={false}
          >
            Update-firmware
          </CustomLinkComponents.LinkButton>

          {buttonVisible && (
            <CustomLinkComponents.LinkButton
              onClick={UpdateFirmWare}
              className="Credential-Containers-Button"
            >
              Update
            </CustomLinkComponents.LinkButton>
          )}
        </div>

        <CustomLinkComponents.ConfirmationModal
          isOpen={isConfirmationModalOpen}
          onClose={closeConfirmationModal}
          onConfirm={handleConfirm}
          text={
            "Proceed with this action ? Please confirm if you want to continue."
          }
          clickType={"Yes"}
        />

        {showDialog && (
          <div className="jumpingDiv">
            <div style={{ display: "flex" }}>
              <p>Firmware update is available.</p>
              <img
                src={UpdateImage}
                alt="png"
                style={{ width: "4vw", height: "4vw" }}
              />
            </div>
            Click "Update" to update firmware
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1vw",
              }}
            >
              <button onClick={UpdateFirmWare}>OK</button>
              <button onClick={handleFameWareCancel}>Cancel</button>
            </div>
          </div>
        )}

        {/* {OpenChartBot && (<div className='Hanging-Chat-Bot'>
               <img src={SmartChatLog} alt={'Smart Chat' } className="ChatBot-img" onClick={() => navigate(`/ChatBot`)}/>
             </div>)} */}

        {isLoadFileRender && (
          <div className="modal-overlay">
            <div className="Firmwere-Upload-Container1">
              <div
                style={{
                  display: "flex",
                  height: "4vw",
                  padding: "1.5%",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#3b393a",
                  borderTopRightRadius: "5vh",
                  borderTopLeftRadius: "5vh",
                  borderBottomLeftRadius: "1vh",
                  borderBottomRightRadius: "1vh",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.9)",
                }}
              >
                <img
                  src={BackClickIcon}
                  alt="png"
                  onClick={handleBackClick}
                  className="Back-Click-Icon"
                />
                <span className="SrecSelection-bold-text">
                  Select the Srec file to be uploaded
                </span>
                <img
                  src={CloseClickIcon}
                  alt="gif"
                  onClick={CloseClick}
                  className="close-Click-Icon"
                />
              </div>

              <div className="progressBarContainer">
                <span
                  style={{
                    color: "#A9A9A9",
                    fontSize: "2vw",
                    fontWeight: "bold",
                    border: "none",
                  }}
                >
                  {progressCount}%
                </span>
                <CustomLinkComponents.AnimatedExample
                  progressCount={progressCount}
                />
                {progressCount === 100 ? loadInfoModal() : ""}
              </div>

              <div className="Firmwere-Upload-Contents">
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <input
                    type="text"
                    placeholder="Select .Srec file..."
                    value={selectedSrecFile}
                    readOnly // Making the input read-only so user can't type in it
                    className="Srec-File-InputText"
                  />
                  <CustomLinkComponents.LinkButton
                    onClick={handleButtonClick}
                    className="Browse-Button"
                    isDisabled={false}
                  >
                    Select File
                  </CustomLinkComponents.LinkButton>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                </div>
                <div style={{ marginTop: "5vw" }}>
                  <CustomLinkComponents.LinkButton
                    onClick={UpdateFirmWare}
                    className="Browse-Button"
                    isDisabled={DisableFlash}
                  >
                    Flash
                  </CustomLinkComponents.LinkButton>
                </div>
              </div>
            </div>
          </div>
        )}

        <Drawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          direction="right"
          className="Draw-Nav-Bar-DBC-tree"
        >
          <div className="Required-stuff">
            {/* <li><Link to="/">Home</Link></li>
                 <li><Link to="/ChatBot">Chat-Bot</Link></li>
                 <li><Link to="">Settings</Link></li> */}
          </div>

          <div
            style={{ borderBottom: "3px solid #ccc", margin: "1vh 0" }}
          ></div>

          <div className="General-Stuff">
            {/* <li onClick={LogoutUser}><Link to="">Log-Out</Link></li>
                  <li><Link to="">Settings</Link></li> */}
          </div>
        </Drawer>

        <CustomLinkComponents.ConfirmationModal
          isOpen={isUpdateAbortConfirm}
          onClose={closeAbortConfirmation}
          onConfirm={handleAbortConfirmation}
          text={"update is in process ? Press Yes to abort action."}
          clickType={"Yes"}
        />

        {showGraph && (
          <div className="modal-overlay">
            <div className="chart-Modal">
              <div className="chart-header">
                <img
                  src={CloseClickIcon}
                  alt="gif"
                  onClick={() => setShowGraph(false)}
                  className="close-Click-Icon-graph"
                />
              </div>

              <GraphChart
                Label={selectedSignal[telemetricsIndex][`signal_name`]}
                GraphData={parseInt(
                  selectedSignal[telemetricsIndex]["signal_value"][
                    selectedSignal[telemetricsIndex]["signal_name"]
                  ],
                  10
                )}
              />
            </div>
          </div>
        )}

        {DeviceStatusLoad && (
          <CustomLinkComponents.Loading
            loadText={"Searching Device..."}
            isSignalDetected={afterLoad}
            afterLoadText={"Device Found......"}
          />
        )}
        {showCreateBoard && (
          <CreateBoardEntry
            onClick={() => setShowCreateBoard((prev) => !prev)}
          />
        )}
      </div>
    </div>
  );
}

export default Telematics;
