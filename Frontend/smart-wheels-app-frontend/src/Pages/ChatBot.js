import React, { useState, useRef } from "react";
import UserImg from "../Images/UserImg.png";
import BotImg from "../Images/ChatBotMsg.png";
import slide1 from "../Images/TelemetryEntryImg.png";
import slide2 from "../Images/SearchForDevice.png";
import slide3 from "../Images/DeviceConnected.png";
import slide4 from "../Images/startTelemetry.png";
import slide5 from "../Images/telemetryValues.png";
import slide6 from "../Images/GraphForTelemetry.png";
import SmartChatLog from "../Images/SmartChatLog.png";
import CustomLinkComponents from "../Components/CustomLinkComponents";
import ImageSlider from "../Components/ImageSlider";
import ChatFeeds from "../ChatBotFeeds/ChatBotData.json";
function ChatBot() {
  let [messages, setmessages] = useState([
    { sender: "bot", text: "How can I assist you today?" },
  ]);
  let [userTextMsg, setuserTextMsg] = useState("");
  let [canDisableLogo, setcanDisableLogo] = useState(true);
  let [closeOptions, SetcloseOptions] = useState(true);
  let [OpenSlide, SetOpenSlide] = useState(false);

  const smartWheels = "About SmartWheels";
  const updateBootLoaderApp = "How to Update Application with .Srec file ?";
  const telemetry = "About Telemetry";
  const Mqtt = "How does MQTT Works ?";
  const noSuchData = "Sorry, I couldn't fetch data on that.";
  const TelemetrySlids = [slide1, slide2, slide3, slide4, slide5, slide6];

  const containerRef = useRef(null);

  const scrollToBottom = () => {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  };

  const AnalizeUserMsg = (userMessage) => {
    let botResponse = "";

    switch (userMessage) {
      case "About SmartWheels":
        botResponse = ChatFeeds.SmartWheels;
        break;
      case "How to Update Application with .Srec file ?":
        botResponse = ChatFeeds.UpdateApplicationwithSrec;
        break;
      case "How does MQTT Works ?":
        botResponse = ChatFeeds.MQTT;
        break;
      case "About Telemetry":
        botResponse = ChatFeeds.telemetry;
        break;
      default:
        botResponse = noSuchData;
        break;
    }

    if (botResponse != noSuchData) {
      SetcloseOptions(false);
    }

    return botResponse;
  };

  // Function to handle sending a new message
  const sendMessage = (userMessage) => {
    setcanDisableLogo(false);
    setmessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: userMessage },
    ]);

    const ChatBotReplaySec = setTimeout(() => {
      const botResponse = AnalizeUserMsg(userMessage);
      setmessages((prevMessages) => [
        ...prevMessages,
        { sender: "bot", text: botResponse },
      ]);
    }, 1000);
  };

  const kickStartSlide = (slides) => {
    console.log(slides);
    // return (
    //   // <div className='modal-overlay'>
    //   //      <div className='Slide-Container-Modal '>
    //   //
    //   //      </div>
    //   // </div>
    // );
  };

  const handleChatMsg = () => {
    console.log("Inside Chat Msg Handler....!");
    if (userTextMsg.trim()) {
      sendMessage(userTextMsg);
      setuserTextMsg("");
    }
  };

  const renderMessage = (message, index) => {
    return (
      <div
        key={index}
        className={message.sender === "bot" ? "ChatBotMsg" : "UserMsg"}
      >
        <div className="message-container">
          <img
            src={message.sender === "bot" ? BotImg : UserImg}
            alt={message.sender === "bot" ? "Bot Avatar" : "User Avatar"}
            style={{ width: "2vw", height: "2vw" }}
          />
          <div className="message-text">
            {message.text}
            {/* <pre>{message.text}</pre> */}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {/* <span className='ChatBotHeader'>SmartWheels Chat-Bot</span> */}
      <div ref={containerRef} className="Chat-Bot-Msg-Container">
        {messages.map((message, index) => renderMessage(message, index))}

        {canDisableLogo ? (
          <div className="Chat-Smart-Log-Container">
            <div className="Chat-Smart-Log">
              <img
                src={SmartChatLog}
                alt={"Smart Chat"}
                style={{ width: "3vw", height: "3vw" }}
              />
              <span className="ChatBotKickStart" style={{ fontWeight: "bold" }}>
                Smart-Chat
              </span>
            </div>
            <span className="ChatBotKickStart" style={{ marginTop: "1vh" }}>
              Welcome!
            </span>
          </div>
        ) : (
          ""
        )}

        {/* <span className='ChatScroller' onClick={scrollToBottom} >D</span> */}

        {closeOptions ? (
          <div className="Options-ChatBotText-Container">
            <span
              className="ChatBot-options"
              onClick={() => sendMessage(smartWheels)}
            >
              {smartWheels}
            </span>
            <span
              className="ChatBot-options"
              onClick={() => sendMessage(updateBootLoaderApp)}
            >
              {updateBootLoaderApp}
            </span>
            <span
              className="ChatBot-options"
              onClick={() => sendMessage(telemetry)}
            >
              {telemetry}
            </span>
            <span className="ChatBot-options" onClick={() => sendMessage(Mqtt)}>
              {Mqtt}
            </span>
            <span
              className="ChatBot-options"
              onClick={() => SetOpenSlide(true)}
            >
              Guide for Telemetry data's
            </span>
            <span
              className="ChatBot-options-Close"
              onClick={() => SetcloseOptions(false)}
            >
              X
            </span>
          </div>
        ) : (
          ""
        )}
        {OpenSlide ? <ImageSlider images={TelemetrySlids} /> : ""}
      </div>

      <div className="Input-ChatBotText-Container">
        <input
          type="text"
          placeholder="Type Your Queries..."
          onClick={() => SetcloseOptions(true)} // Add the onClick event handler
          value={userTextMsg}
          onChange={(e) => setuserTextMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleChatMsg();
            }
          }}
          className="ChatInputText"
        />
        <CustomLinkComponents.LinkButton
          onClick={() => handleChatMsg()}
          className="Chat-Send-Button"
          isDisabled={userTextMsg.trim() === ""}
        >
          Send
        </CustomLinkComponents.LinkButton>
      </div>
      <span className="ChatBotFooter">
        SmartWheelsWeb-Chat - "Search content related only to the web
        appllication"
      </span>
    </div>
  );
}

export default ChatBot;
