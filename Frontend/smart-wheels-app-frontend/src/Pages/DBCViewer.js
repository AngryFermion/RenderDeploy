import React, { useState, useEffect, useRef } from "react";
import CustomLinkComponents from "../Components/CustomLinkComponents";
import CloseClickIcon from "../Images/colse.gif";
import TreeView from "../Components/TreeView";

import { useLocation, useNavigate } from "react-router-dom";

function DBCViewer() {
  let [messages, setmessages] = useState("");
  let [ChatBotText, setChatBotText] = useState("");
  // let [isOpenDbcViewer, setOpenDbcViewer] = useState(false);
  let [isDbcFileSelect, setisDbcFileSelect] = useState(false);
  let [isDBCCompleted, setisDBCCompleted] = useState(false);
  var [DisableView, setDisableView] = useState(true);

  var [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDbcFile, setselectedDbcFile] = useState("");
  const [selectedItems, setSelectedItems] = useState(window.selectedItems);
  const [selectedItemsLength, setSelectedItemsLength] = useState(
    window.selectedItems.length
  );
  var [isSignalSelected, SetisSignalSelected] = useState(false);

  // const token = sessionStorage.getItem("Token");

  const [token, setAccessToken] = useState(
    sessionStorage.getItem("Token") || ""
  );

  // console.log('Jwt Token:', token);

  // const selectedItemsLength = window.selectedItems.length;

  const fileInputRef = useRef(null);
  const location = useLocation();
  const { data } = location.state || {};
  const navigate = useNavigate();

  //  const treeData = [
  //   {
  //     id: 1,
  //     name: "Messages 1",
  //     children: [
  //       { id: 2, name: "message A", ID:"0x61" },
  //       { id: 3, name: "message B", ID:"0x62" },
  //     ],
  //   },
  //   {
  //     id: 4,
  //     name: "Messages 2",
  //     children: [
  //       { id: 5, name: "message C", ID:"0x63" },
  //       {
  //         id: 6,
  //         name: "Messages 2.3",
  //         children: [{ id: 7, name: "Messages 2.3.1" }],
  //       },
  //     ],
  //   },
  // ];

  // const getselectedItemsLength = () => {
  //       const selectedItemsLength = window.selectedItems.length;

  //       return { selectedItemsLength };
  //     };
  // const getselectedItems = () => {
  //       const selectedItems = window.selectedItems;

  //       return { selectedItems };
  //     };

  // const { selectedItemsLength } = getselectedItemsLength();

  // const { selectedItems } = getselectedItems();

  const ReadLoadDbcViwer = async (DbcFile) => {
    console.log("selected DbcFile : ", DbcFile);
    try {
      const response = await fetch(
        `http://localhost:3006/DbcAligner?DbcFileName=${encodeURIComponent(
          DbcFile
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      treeData = await response.json();
      console.log(treeData);
      // navigate('/DbcViewer', { state: { data } });
      setTreeData(treeData);
    } catch (err) {
      // setError(err.message);
      console.error("Error message :", err.message);
    } finally {
      // setLoading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    setDisableView(false);
    const file = event.target.files[0];
    setselectedDbcFile(file.name);

    if (file) {
      readFile(file);
    }
  };

  const handleView = () => {
    setisDbcFileSelect(false);
    setisDBCCompleted(true);
    ReadLoadDbcViwer(selectedDbcFile);
  };

  const handleEvent = () => {
    SetisSignalSelected(!isSignalSelected);
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      console.log("Dbc file content:", content);
      uploadDbcFile(content, file.name);
    };
    reader.readAsText(file);
  };

  const renderContent = () => {
    const selectedMsgSignal = selectedItems[selectedItemsLength - 1];

    console.log("Inside the selectedItems", selectedMsgSignal);

    return (
      <div className="Selected-item">
        <>
          {/* <p>Signal Detail's</p> */}
          <p>Signal Name: {selectedMsgSignal?.signal_name}</p>
          <p>Message ID: {selectedMsgSignal?.message_ID}</p>
          <p>Signal Length: {selectedMsgSignal?.signal_length}</p>
          <p>Signal Start Bit: {selectedMsgSignal?.signal_start_bit}</p>
          <p>
            Signal Value:{" "}
            {selectedMsgSignal?.signal_value === null
              ? "null"
              : selectedMsgSignal?.signal_value}
          </p>
        </>
      </div>
    );
  };

  const uploadDbcFile = async (fileContent, fileName) => {
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
        "http://localhost:3006/uploadDbcFile",
        requestOptions
      );
      if (!response.ok) {
        throw new Error(`HTTP status code: ${response.status}`);
      }

      // Try to parse response as JSON
      // try {
      //     const data = await response.json();
      //     console.log('File uploaded successfully:', data);
      // } catch (jsonError) {
      //     // If parsing fails, handle as text
      //     const textData = await response.text();
      //     console.log('File uploaded successfully:', textData);
      // }

      const data = await response.json();
      console.log("File uploaded successfully:", data);
    } catch (error) {
      if (error.message.includes("500")) {
        alert("Only .dbc files are supported...!");
      } else {
        alert(error);
        console.error("Error uploading file:", error);
      }
    }
  };

  useEffect(() => {
    setisDbcFileSelect(true);
  }, []);

  useEffect(() => {
    const handleGlobalUpdate = () => {
      setSelectedItems(window.selectedItems);
      setSelectedItemsLength(window.selectedItems.length);
    };

    // Set up event listener
    window.addEventListener("selectedItemsUpdated", handleGlobalUpdate);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("selectedItemsUpdated", handleGlobalUpdate);
    };
  }, []); // Empty dependency array: this effect runs once on mount

  return (
    <div className="App">
      <div className="DBC-Viewer-container">
        {isDBCCompleted && (
          <>
            <div className="DBC-SignalView-container">
              <div className="DBC-Signal-view-container">
                <p>Selected Messages Value's</p>

                {selectedItemsLength !== 0 ? (
                  renderContent()
                ) : (
                  <p>No Signals Available</p>
                )}
              </div>

              <div className="DBC-SignalView-select-container">
                <CustomLinkComponents.LinkButton
                  onClick={
                    selectedItemsLength !== 0
                      ? () => navigate("/Telematic", { state: "setData" })
                      : handleEvent
                  }
                  className="Browse-Button"
                >
                  Ok
                </CustomLinkComponents.LinkButton>
              </div>
            </div>
            <div className="DBC-TreeViewer-container">
              <TreeView data={treeData} />
            </div>
          </>
        )}

        {isDbcFileSelect && (
          // <div className='modal-overlay'>
          <div className="DBC-Upload-Container">
            <div className="DBC-Header-container">
              {/* style={{display:'flex',height:'4vw',padding:'1.5%',justifyContent:'center',alignItems:'center',backgroundColor:'#3b393a',borderTopRightRadius:'5vh',borderTopLeftRadius:'5vh',borderBottomLeftRadius:'1vh',borderBottomRightRadius:'1vh',boxShadow:'0px 4px 8px rgba(0, 0, 0, 0.9)'}} */}
              <span className="Dbc-Selection-bold-text">
                Select the DBC file to be uploaded
              </span>
            </div>

            <div className="DBC-Upload-File-Container">
              <div style={{ display: "flex", flexDirection: "row" }}>
                <input
                  type="text"
                  placeholder="Select DBC file..."
                  value={selectedDbcFile}
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
                  onClick={() => handleView()}
                  className="Browse-Button"
                  isDisabled={DisableView}
                >
                  View
                </CustomLinkComponents.LinkButton>
              </div>
            </div>

            {/* </div> */}
          </div>
        )}

        {/* {isSignalSelected && (
            <div className='modal-overlay'>
            
            </div>)} */}
        <CustomLinkComponents.ConfirmationModal
          isOpen={isSignalSelected}
          onClose={handleEvent}
          onConfirm={handleEvent}
          text={"No signals has been selected yet."}
          clickType={"Ok"}
        />

        {/* <CustomLinkComponents.LinkButton onClick={()=>navigate('/Telematic',{state:"setData"})} className="Browse-Button" isDisabled={false}>Ok</CustomLinkComponents.LinkButton>  */}
      </div>
    </div>
  );
}

export default DBCViewer;
