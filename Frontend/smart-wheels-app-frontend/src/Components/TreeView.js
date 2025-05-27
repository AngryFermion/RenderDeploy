// TreeView.js
import React, { useState } from "react";
import MsgImg from "../Images/MsgImg.png";
import SignalImg from "../Images/SignalImg.png";

window.selectedItems = [];
window.length = 0;
// Recursive TreeNode component

const TreeNode = ({ node }) => {
  const [expanded, setExpanded] = useState(false);

  // const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (item) => {
    // Check if the item is already in the selectedItems array
    if (window.selectedItems.includes(item)) {
      // If it is, remove it from the array (i.e., deselect the checkbox)
      window.selectedItems = window.selectedItems.filter(
        (selected) => selected !== item
      );
    } else {
      window.selectedItems.push(item);
      window.length = window.length + 1;

      // Emit a custom event
      window.dispatchEvent(new Event("selectedItemsUpdated"));

      // setSelectedItems(selectedItems)
      // setSelectedItems([...selectedItems, item]);
      console.log("Selected value :", window.selectedItems);
    }
  };

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div style={{ marginLeft: 20 }}>
      <div onClick={handleToggle} style={{ cursor: "pointer" }}>
        <li key={node.id}>
          <label>
            {node.children && (expanded ? " ▼ " : " ► ")}

            {node.parent ? (
              <>
                {node.message_ID && (
                  <>
                    {" "}
                    <img
                      src={MsgImg}
                      alt="png"
                      style={{ width: "1vw", height: "2vh" }}
                    />{" "}
                  </>
                )}
                {node.parent}
                {node.message_ID && ` ( ${node.message_ID} )`}
              </>
            ) : (
              <>
                {" "}
                <input
                  type="checkbox"
                  checked={window.selectedItems.includes(node)}
                  onChange={() => handleCheckboxChange(node)}
                />
                {
                  <>
                    {" "}
                    <img
                      src={SignalImg}
                      alt="png"
                      style={{ width: "1vw", height: "2vh" }}
                    />{" "}
                  </>
                }
                {node.signal_name}{" "}
              </>
            )}
          </label>
        </li>
      </div>
      {expanded && node.children && (
        <div>
          {node.children.map((childNode) => (
            <TreeNode key={childNode.id} node={childNode} />
          ))}
        </div>
      )}
    </div>
  );
};

// TreeView component
const TreeView = ({ data }) => {
  console.log(data);
  const [test, settest] = useState();
  return (
    <div style={{ padding: "1vw" }}>
      <ul style={{ listStyleType: "none", paddingLeft: 0, margin: 0 }}>
        {data.map((node) => (
          <TreeNode key={node.id} node={node} />
        ))}
      </ul>
    </div>
  );
};

// Export both components
export default TreeView;
