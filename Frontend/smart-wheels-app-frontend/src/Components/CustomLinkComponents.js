import React from "react";
import { Line } from "rc-progress";
import loading from "../Images/loading6.gif";
import afterLoading from "../Images/success.gif";
import approveImg from "../Images/ApprovalUser.png";
import invalidImg from "../Images/Invalid.png";

class CustomLinkComponents {
  static LinkSpan = ({ className, onClick, text }) => {
    return (
      <span className={className} onClick={onClick}>
        {text}
      </span>
    );
  };

  static LinkButton = ({ className, onClick, children, isDisabled }) => {
    return (
      <button className={className} onClick={onClick} disabled={isDisabled}>
        {children}
      </button>
    );
  };

  static Loading = ({ loadText, isSignalDetected, afterLoadText }) => {
    return (
      <div className="modal-overlay">
        <div
          style={{
            display: "flex",
            textAlign: "center",
            justifyContent: "space-around",
            alignItems: "center",
            height: "15vh",
            backgroundColor: "white",
            opacity: "0.8",
            padding: "1vw",
            borderRadius: "2vw",
          }}
        >
          {isSignalDetected ? (
            <>
              <img src={afterLoading} alt="gif" className="after-Load-icon" />
              <span className="after-load-Text">{afterLoadText}</span>
            </>
          ) : (
            <>
              <img src={loading} alt="gif" className="Load-icon" />
              <span className="load-Text">{loadText}</span>
            </>
          )}
        </div>
      </div>
    );
  };

  static AuthenticationCheck = ({ loadText, isApproved }) => {
    return (
      <div className="modal-overlay">
        <div
          style={{
            display: "flex",
            textAlign: "center",
            justifyContent: "space-around",
            alignItems: "center",
            height: "15vh",
            backgroundColor: "white",
            opacity: "0.8",
            padding: "1vw",
            borderRadius: "2vw",
          }}
        >
          {isApproved ? (
            <>
              <span className="after-load-Text">{loadText}</span>
              <img src={approveImg} alt="gif" className="invalid-icon" />
            </>
          ) : (
            <>
              <span className="load-Text">{loadText}</span>
              <img src={invalidImg} alt="gif" className="valid-icon" />
            </>
          )}
        </div>
      </div>
    );
  };

  static AnimatedExample({ progressCount }) {
    return (
      <Line percent={progressCount} strokeWidth={4} strokeColor="#A9A9A9" />
    );
  }

  static ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    children,
    text,
    clickType,
  }) => {
    if (!isOpen) {
      return null; // Render nothing if modal is not open
    }

    const handleConfirm = () => {
      onConfirm(); // Call the onConfirm function provided by the parent component
      onClose(); // Close the modal
    };

    return (
      <div className="modal-overlay">
        <div className="modal">
          {children}
          <p>{text}</p>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button
              style={{ color: "white", fontWeight: "bold", border: "none" }}
              onClick={handleConfirm}
            >
              {clickType}
            </button>
            <button
              style={{ color: "white", fontWeight: "bold", border: "none" }}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  static InfoModal = ({ isOpen, text }) => {
    if (!isOpen) {
      return null; // Render nothing if modal is not open
    }

    return (
      <div className="modal-overlay">
        <div className="modal">
          <p>{text}</p>
        </div>
      </div>
    );
  };
}

export default CustomLinkComponents;
