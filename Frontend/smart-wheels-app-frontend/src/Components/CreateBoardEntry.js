import { useState } from "react";
import CustomLinkComponents from "./CustomLinkComponents";
import { useBoardContext } from "../ReactContextStore/BoardContext";

function CreateBoardEntry({ onClick }) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [boardId, setBoardId] = useState("");
  const [dropdownValue, setDropdownValue] = useState("DefaultDevice");

  const { boardIdList, setBoardIdList } = useBoardContext();

  const addToBoardId = () => {
    console.log(boardId);
    if (onClick) onClick();

    if (boardId.trim()) {
      setBoardIdList([...boardIdList, boardId]);
      setBoardId("");
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  return (
    <div className="modal-overlay">
      <div className="BoardId-Register-Container">
        <div className="Input-Text-Container">
          <span className="WelcomePageText">Configure new Board Id</span>

          <input
            type="text"
            placeholder="Enter Board ID to be configured up or select default topic..."
            value={boardId}
            onChange={(ev) => {
              setBoardId(ev.target.value);
              setDropdownVisible(false);
            }}
            onClick={() => setDropdownVisible((prev) => !prev)}
            className="ComboInputTextBox"
          />
          {dropdownVisible && (
            <ul className="dropdown-Config-Id">
              <li
                onClick={() => {
                  setBoardId(dropdownValue);
                  setDropdownVisible((prev) => !prev);
                }}
              >
                <span className="dropdown-Options">{dropdownValue}</span>
              </li>
            </ul>
          )}
          <CustomLinkComponents.LinkButton
            onClick={addToBoardId}
            className="Board-Id-Config-Button"
            isDisabled={!boardId}
          >
            Create
          </CustomLinkComponents.LinkButton>
        </div>
      </div>
    </div>
  );
}

export default CreateBoardEntry;
