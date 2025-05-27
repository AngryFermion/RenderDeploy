import { useState } from "react";
import deleteImg from "../Images/delete.png";
import { useBoardContext } from "../ReactContextStore/BoardContext";

function CreateNewBoardId({ onClick, onClickChannel, onClickUnSubscribeIds }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  const { boardIdList, setBoardIdList } = useBoardContext();
  // const token = sessionStorage.getItem("Token");
  const [token, setAccessToken] = useState(
    sessionStorage.getItem("Token") || ""
  );

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleCreaetId = () => {
    if (onClick) onClick();

    setIsCreated((prev) => !prev);
  };

  const deleteID = (deleteId) => {
    unSubDeleteId(deleteId);
    // if (onClickUnSubscribeIds) onClickUnSubscribeIds(deleteId);

    const updatedBoardList = boardIdList.filter(
      (boardId) => boardId !== deleteId
    );
    setBoardIdList(updatedBoardList);
  };

  const handleIdChannel = (id) => {
    if (onClickChannel) onClickChannel(id);

    // subscribeChannel(id);
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

  return (
    <div
      className="sideboardIdCreateBar"
      style={{
        width: isExpanded ? "20vw" : "5vw",
      }}
    >
      <div
        className="sideboardIdCreateHeader"
        style={{
          width: isExpanded ? "20vw" : "5vw",
        }}
      >
        {isExpanded && (
          <span
            className="boardIdHeadertext"
            style={{
              visibility: isExpanded ? "visible" : "hidden",
              opacity: isExpanded ? 1 : 0,
            }}
          >
            {isExpanded && "Create Connect's"}
          </span>
        )}

        <button onClick={toggleExpand} className="boardIdHeadertextButton">
          {isExpanded ? " < " : " > "}
        </button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          alignContent: "center",
          flexDirection: "column",
          height: "70vh",
          width: isExpanded ? "15vw" : "1.25vw",
          //   backgroundColor: "white",
        }}
      >
        <div
          className="boardIdCreatetcontainer"
          style={{
            width: isExpanded ? "15vw" : "1.25vw",
          }}
        >
          <div className="boardIdCreatetButton" onClick={handleCreaetId}>
            <span className="idCreatetButtonCircular">+</span>
            <span>{isExpanded && "Creaet New ID"}</span>
          </div>
        </div>
        <div
          className="createdIdContainer"
          style={{
            width: isExpanded ? "15vw" : "1.25vw",
          }}
        >
          {boardIdList.map((id) => (
            <div
              key={id}
              className="createdIdButton"
              style={{
                visibility: isExpanded ? "visible" : "hidden",
                opacity: isExpanded ? 1 : 0,
              }}
              onClick={() => handleIdChannel(id)}
            >
              <span style={{ flex: 1, textAlign: "center" }}>{id}</span>
              <div>
                <img
                  src={deleteImg}
                  alt="png"
                  onClick={() => deleteID(id)}
                  className="delete-created-id"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreateNewBoardId;
