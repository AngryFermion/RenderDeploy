const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { DecodeDbc, DecodeCanPacket } = require("./runpy");
var bodyParser = require("body-parser");
// var Mongoclient = require('mongodb').MongoClient;
var multer = require("multer");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "Ancit-SmaratWheels-Tech"; // Use environment variables for real projects
const REFRESH_SECRET_KEY = "Ancit-SmaratWheels-Tech-refresh-secret_key"; // Refresh token secret key

// var CONNECION_STRING="mongodb+srv://smartwheels:smartwheels@cluster0.tnjxq72.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
var DATABASE_NAME = "Telemetry";
var database;

const mqtt = require("mqtt");

const path = require("path");

const cors = require("cors");

const { error } = require("console");

const fs = require("node:fs");

let data = "";

const PORT = process.env.PORT || 3006;
const WS_PORT = 3007;

// variables for Software Update
var file_content = [];
var test_buffer_data = [];
var read_file_flag = 0;
var file_index = 0;
var file_row_index = 0;
var fota_cmd = "";
// var Topic_UpdateMaster = "UpdateMaster";
// var Topic_PingSmartWheels = "PingFromSmartWheels";
// var Topic_PingFromWebApp = "PingFromWebApp";

var file_line_number = 0;
var ping = 0;
var Id = 0;
var test_buffer_type = Buffer.from("S0");
var test_buffer_BMS_command = [];
const CmdStartFirmwareWrite = "0x00000007";
const CmdJumpToApp = "0x00000008";
const CmdJumpToBootloader = "0x00000006";
const CmdDelBmsError = "0x0000EE00";
const CmdFetchDeviceFirmware = "0x0000FF00";
const CmdClearDTC = "0x00000D00"; // Cell_max_Vltg -> Ble_Fsm.c Ble_PackBmsData()
var client = mqtt.connect("mqtt://broker.emqx.io");
var device_disc_threshold = 0;
const mysql = require("mysql2");
var jsonData;
let deviceStatusMap = {};
// const filePath = '../SREC/Telemetrics.log';
// Define the relative file path
const filePath = path.join(__dirname, "../SREC/Telemetrics.log");

const app = express();
app.use(cookieParser());

const allowedOrigins = ["https://smartwheels-dashboard.onrender.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is in the allowedOrigins array
      if (allowedOrigins.includes(origin)) {
        callback(null, true); // Origin is allowed
      } else {
        callback(new Error("Not allowed by CORS")); // Origin is not allowed
      }
    },
    credentials: true,
  })
);

// Session setup
app.use(
  session({
    secret: "your_secret_key", // Replace with a strong secret key
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Logging middleware to check session data
app.use((req, res, next) => {
  // console.log("Session before handling request:", req.session);
  next();
});

// Use Helmet to set various HTTP headers for security
app.use(helmet());

// Create connection to the database
// const db = mysql.createConnection({
//   host: "127.0.0.1",
//   user: "AjithBalaji", // Replace with your MySQL username
//   password: "Shanmugam1937@12", // Replace with your MySQL password
//   database: "smartwheels", // Replace with your database name
// });

// // Define SQL query to create table
// const createTableQuery = `
//   CREATE TABLE IF NOT EXISTS users (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     username VARCHAR(255) NOT NULL,
//     password VARCHAR(255) NOT NULL
//   )
// `;
// // Execute SQL query to create table
// db.query(createTableQuery, (err, result) => {
//   if (err) {
//     console.error("Error creating table:", err);
//     return;
//   }
//   console.log("Users table created successfully");
// });

// Function to ensure the directory exists
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

// Ensure the directory exists
ensureDirectoryExistence(filePath);

app.listen(PORT, () => {
  console.log("IN");
  // Mongoclient.connect(CONNECION_STRING,(error,client)=>{
  //   database = client.db(DATABASE_NAME);
  //   console.log("Mongo DB connection successful\n")
  //   console.log('Database:', database)
  //   insertData('150')
  // })

  // Connect to the database
  // db.connect((err) => {
  //   if (err) {
  //     console.error("error connecting: " + err.stack);
  //     return;
  //   }
  //   console.log("connected as id " + db.threadId);
  // });
});

function insertData(val) {
  console.log("Inserting new telemetry");
  database
    .collection("Telemetrycollection")
    .count({}, function (error, numberOfDocs) {
      database.collection("Telemetrycollection").insertOne({
        id: (numberOfDocs + 1).toString(),
        telemetryName: "Vehicle Speed",
        telemetryValue: val,
      });
    });
}

// app.use(cors());
var jsonParser = bodyParser.json();

// Middleware to parse JSON bodies globally
// app.use(bodyParser.json());

// Middleware to parse JSON bodies for all incoming requests
// app.use(express.json());

var counter = 1;

app.use(express.static(path.resolve(__dirname, "../dashboard_v1_1/build")));

// MQTT send to server API

function MQTT_post(message, topic) {
  //if(writeStart == 0){
  //writeStart  = 1
  // var client = mqtt.connect('mqtt://broker.emqx.io');
  // console.log('Running MQTT...\n')

  //}

  client.publish(topic, message);

  console.log("Publishing...\n");
}

var dataFromServer = "";
var deviceStatus = "";
var NotificationMessage = "";
var SpeedMessage = "";
var FuelMessage = "";
var DiagnositicMessage = "";
var CanTestMessage = "";
var GPSMessage = "";
var JsonMessage;
var ResponceMessage = "";
var parsedJsonMessage;

// var client = mqtt.connect("mqtt://broker.emqx.io");
// data = []
// var UpdateTopic = "UpdateSlave";
// var TelemetryTopic = "BobToAlice";
// var SubTopic_PingDevice = "SmartWheels_Heartbeat";
// var LiveNotification = "Telemetric-Notification";
// var LiveSpeed = "Telemetric-Speed";
// var LiveFuel = "Telemetric-Fuel";
// var LiveDiagnositic = "Telemetric-Diagnositic";
// var LiveCanTest = "Telemetric-Can-Test";
// var LiveGPS = "Telemetric-GPS";
// var JsonData = "Telemetry_V";
// var Topic_ESP_Reset = "ESP_Reset";
// var Update_Slave = "UpdateSlave";
// var Ping_From_SmartWheels = "PingFromSmartWheels";
// var SmartWheels_Heartbeat = "SmartWheels_Heartbeat";
// var Topic_UpdateMaster = "UpdateMaster";
// var Topic_PingSmartWheels = "PingFromSmartWheels";
// var Topic_PingFromWebApp = "PingFromWebApp";

// var UpdateTopic = "";
// var TelemetryTopic = "";
// var SubTopic_PingDevice = "";
// var JsonData = "";
// var Topic_ESP_Reset = "";
// var Update_Slave = "";
// var Ping_From_SmartWheels = "";
// var SmartWheels_Heartbeat = "";
// var Topic_UpdateMaster = "";
// var Topic_PingSmartWheels = "";
// var Topic_PingFromWebApp = "";
// var LiveNotification = "";
// var LiveSpeed = "";
// var LiveFuel = "";
// var LiveDiagnositic = "";
// var LiveCanTest = "";
// var LiveGPS = "";

// Create a WebSocket server instance
const server = new WebSocket.Server({ port: WS_PORT });

// Object to store all connected clients
const clientsSocket = new Set();

const sendJsonData = async (jsonPayLoad) => {
  console.log("Client request data...");

  const jsonData = JSON.stringify(await DecodeCanPacket(jsonPayLoad));
  console.log("Dbc Structured telemetry values: ", jsonData);
  // Send the JSON string to all connected clients
  clientsSocket.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonData);
      // client.send(combinedMessage);
      console.log("Client sending data...");
    }
  });
  console.log("Client sent data...");
};

const sendLiveData = () => {
  console.log("Client request data...");
  const telemetricData = {
    speed: SpeedMessage,
    fuel: FuelMessage,
    gps: GPSMessage,
    diagnostic: DiagnositicMessage,
    canTest: CanTestMessage,
    notification: NotificationMessage,
  };
  console.log(`speed message form object..: ${telemetricData.speed}`);
  console.log(`fuel message form object..: ${telemetricData.fuel}`);
  console.log(`gps message form object..: ${telemetricData.gps}`);
  console.log(`diagnostic message form object..: ${telemetricData.diagnostic}`);
  console.log(`canTest message form object..: ${telemetricData.canTest}`);
  console.log(
    `notification message form object..: ${telemetricData.notification}`
  );

  jsonData = JSON.stringify(telemetricData);

  // Send the JSON string to all connected clients
  clientsSocket.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonData);
    }
  });
  console.log("Client sent data...");
};

function UpdateTopicWithBoardPin(userPinId) {
  console.log("Generating topics with the uniqe pin id...\n");
  // Append userPinId to each topic string
  // UpdateTopic = "UpdateSlave_" + userPinId;
  // TelemetryTopic = "BobToAlice_" + userPinId;
  // SubTopic_PingDevice = "SmartWheels_Heartbeat_" + userPinId;
  // Topic_ESP_Reset = "ESP_Reset_" + userPinId;
  // Update_Slave = "UpdateSlave_" + userPinId;
  // Ping_From_SmartWheels = "PingFromSmartWheels_" + userPinId;
  // SmartWheels_Heartbeat = "SmartWheels_Heartbeat_" + userPinId;
  // Topic_UpdateMaster = "UpdateMaster_" + userPinId;
  // Topic_PingSmartWheels = "PingFromSmartWheels_" + userPinId;
  // Topic_PingFromWebApp = "PingFromWebApp_" + userPinId;
  // LiveNotification = "Telemetric-Notification_" + userPinId;
  // LiveSpeed = "Telemetric-Speed_" + userPinId;
  // LiveFuel = "Telemetric-Fuel_" + userPinId;
  // LiveDiagnositic = "Telemetric-Diagnositic_" + userPinId;
  // LiveCanTest = "Telemetric-Can-Test_" + userPinId;
  // LiveGPS = "Telemetric-GPS_" + userPinId;
  // JsonData = "Telemetry_V_" + userPinId;
}

const isDefaultDevice = (id) => id === "DefaultDevice";

const subscribeToDefaultTopic = () => {
  console.log("Subscribing default topics...\n");

  client.subscribe(`PingFromSmartWheels`, () => {
    console.log(`Subscribe to topic PingFromSmartWheels`);
  });

  client.subscribe(`UpdateSlave`, () => {
    console.log(`Subscribe to topic UpdateSlave`);
  });

  client.subscribe(`ESP_Reset`, () => {
    console.log(`Subscribe to topic ESP_Reset`);
  });

  client.subscribe(`UpdateMaster`, () => {
    console.log(`Subscribe to topic UpdateMaster`);
  });

  client.subscribe(`TelemetryV`, () => {
    console.log(`Subscribe to topic TelemetryV`);
  });
};

const subscribeToIdTopic = (PinId) => {
  console.log(`Subscribing topics with ids ${PinId}...\n`);

  client.subscribe(`PingFromSmartWheels_${PinId}`, () => {
    console.log(`Subscribe to topic PingFromSmartWheels_${PinId}`);
  });

  client.subscribe(`UpdateSlave_${PinId}`, () => {
    console.log(`Subscribe to topic UpdateSlave_${PinId}`);
  });

  client.subscribe(`ESP_Reset_${PinId}`, () => {
    console.log(`Subscribe to topic ESP_Reset_${PinId}`);
  });

  client.subscribe(`UpdateMaster_${PinId}`, () => {
    console.log(`Subscribe to topic UpdateMaster_${PinId}`);
  });

  client.subscribe(`TelemetryV_${PinId}`, () => {
    console.log(`Subscribe to topic TelemetryV_${PinId}`);
  });
};

function unsubscribeToIdTopic(unsubscribeId) {
  console.log(`UnSubscribing topics with id ${unsubscribeId}...\n`);
  client.unsubscribe(`TelemetryV_${unsubscribeId}`, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from topic: ${unsubscribeId}`);
    } else {
      console.log(`Successfully unsubscribed from topic: ${unsubscribeId}`);
    }
  });

  client.unsubscribe(`PingFromSmartWheels_${unsubscribeId}`, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from topic: ${unsubscribeId}`);
    } else {
      console.log(`Successfully unsubscribed from topic: ${unsubscribeId}`);
    }
  });

  client.unsubscribe(`ESP_Reset_${unsubscribeId}`, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from topic: ${unsubscribeId}`);
    } else {
      console.log(`Successfully unsubscribed from topic: ${unsubscribeId}`);
    }
  });

  client.unsubscribe(`UpdateSlave_${unsubscribeId}`, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from topic: ${unsubscribeId}`);
    } else {
      console.log(`Successfully unsubscribed from topic: ${unsubscribeId}`);
    }
  });

  client.unsubscribe(`UpdateMaster_${unsubscribeId}`, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from topic: ${unsubscribeId}`);
    } else {
      console.log(`Successfully unsubscribed from topic: ${unsubscribeId}`);
    }
  });
}

function unsubscribeToDefaultTopic() {
  console.log(`UnSubscribing Default topics...\n`);
  client.unsubscribe(`TelemetryV`, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from topic: TelemetryV`);
    } else {
      console.log(`Successfully unsubscribed from topic: TelemetryV`);
    }
  });

  client.unsubscribe(`PingFromSmartWheels`, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from topic: PingFromSmartWheels`);
    } else {
      console.log(`Successfully unsubscribed from topic:PingFromSmartWheels`);
    }
  });

  client.unsubscribe(`ESP_Reset`, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from topic: ESP_Reset`);
    } else {
      console.log(`Successfully unsubscribed from topic: ESP_Reset`);
    }
  });

  client.unsubscribe(`UpdateSlave`, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from topic: UpdateSlave`);
    } else {
      console.log(`Successfully unsubscribed from topic: UpdateSlave`);
    }
  });

  client.unsubscribe(`UpdateMaster`, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from topic: UpdateMaster`);
    } else {
      console.log(`Successfully unsubscribed from topic: UpdateMaster`);
    }
  });
}

function subscribeToTopic(userPinId) {
  console.log("Subscribing topics...\n");

  if (isDefaultDevice(userPinId)) {
    subscribeToDefaultTopic();
  } else {
    subscribeToIdTopic(userPinId);
  }
}

function unsubscribeToTopic(unsubscribeId) {
  if (isDefaultDevice(unsubscribeId)) {
    unsubscribeToDefaultTopic();
  } else {
    unsubscribeToIdTopic(unsubscribeId);
  }
}

function sendTelematicData(payload) {
  // console.log(`JsonData......>  '${payload}'`);
  // parsedJsonMessage = payload.toString();
  // console.log(`JsonData......>  '${parsedJsonMessage}'`);
  JsonMessage = JSON.parse(payload.toString());
  // sendJsonData();
  sendJsonData(JSON.parse(payload));
}

function extractUserPinFromTopic(topic) {
  return topic.split("_")[1];
}

client.on("message", (Topic, payload) => {
  // Extract userPinId from the topic (depending on your topic structure)
  const userPinId = extractUserPinFromTopic(Topic);
  // console.log("userPinId1 : ", typeof userPinId);
  // console.log("userPinId2 : ", typeof `Telemetry_V_${userPinId}`);

  if (Topic === `TelemetryV_${userPinId}` || Topic === `TelemetryV`) {
    console.log(`Received Message: ${Topic} -  - ${payload.toString()}`);
  }

  switch (Topic) {
    case `UpdateSlave`:
      // console.log("Message received from Dummy ESP32:", payload.toString());
      ResponceMessage = payload.toString();
      // console.log("ResponceMessage : ", ResponceMessage);
      if (payload.toString() == "A") {
        console.log("Write OK. Sending Next line\n");
        if (file_line_number === -3) {
          StartUpdate(file_line_number);
        }
        if (file_line_number >= 0) {
          file_line_number = file_line_number + 1;
        }
        StartUpdate(file_line_number);

        //MQTT_post('Hello',Topic_UpdateMaster);
      } else if (payload.toString() == "E") {
        // sendNotificationMsg();
        console.log("Write FAILED.\n");
      } else if (payload.toString() == "J") {
        file_line_number = -3;
        // sendNotificationMsg();
        console.log("Updated Completed.\n");
      } else if (payload.toString() == "M") {
        file_line_number = -10;
        // sendNotificationMsg();
        console.log("Address MissMatch Error1.\n");
      } else if (payload.toString() == "F") {
        file_line_number = -12;
        // sendNotificationMsg();
        console.log("Format Error1.\n");
      } else if (payload.toString() == "T") {
        file_line_number = -808;
        // sendNotificationMsg();
        console.log("Time out Error.\n");
      } else if (payload.toString() == "0") {
        console.log("Device Active...");
        ping = 1;
      }
      break;
    case `PingFromSmartWheels`:
      // console.log(payload.toString());

      deviceStatusMap["DefaultDevice"] = payload.toString();
      // console.log(deviceStatusMap["0"]);
      break;
    case `PingFromSmartWheels_${userPinId}`:
      // console.log("payload value : ", payload.toString());
      deviceStatusMap[userPinId] = payload.toString();
      break;
    case `TelemetryV_${userPinId}`:
      console.log(`Telemetry-V_1109 payload......>  '${payload.toString()}'`);
      // parsedJsonMessage = payload.toString();
      // console.log(`JsonData......>  '${parsedJsonMessage}'`);
      // JsonMessage = JSON.parse(payload.toString());
      // sendJsonData();
      sendTelematicData(payload.toString());
      break;
    case `TelemetryV`:
      console.log(`TelemetryV payload......>  '${payload.toString()}'`);
      // parsedJsonMessage = payload.toString();
      // console.log(`JsonData......>  '${parsedJsonMessage}'`);
      // JsonMessage = JSON.parse(payload.toString());
      // sendJsonData();
      sendTelematicData(payload.toString());
      break;

    case `SmartWheels_Heartbeat`:
      // setting ping to 1

      ping = 1;
      break;
    default:
      break;
  }
});

console.log(`WebSocket server is running on ws://localhost:${WS_PORT}`);

// Creating API endpoint
app.get("/api", (req, res) => {
  counter = counter + 1;
  res.json({ message: dataFromServer });
  // insertData(dataFromServer)
});

app.post("/api_send", jsonParser, (req, res) => {
  var data = [];
  data = req.body;
  console.log("ENDPOINT HIT:", req.body.message);

  // send this message to MQTT server

  //MQTT_post(req.body.message)
});

const Read_SrecFile = () => {
  try {
    // let  data1 = fs.readFileSync('../SREC/BLE_appl_1_42000.srec', 'utf8');
    return data;
  } catch (err) {
    console.error(err);
  }
};

// function sleep(ms) {
//   return new Promise<void>(resolve => setTimeout(resolve, ms));
// }

function convertToHex(num) {
  switch (num) {
    case "A":
      return 0x0a;
    case "B":
      return 0x0b;
    case "C":
      return 0x0c;
    case "D":
      return 0x0d;
    case "E":
      return 0x0e;
    case "F":
      return 0x0f;
    default:
      return Number(num);
  }

  return 0;
}
async function packCommand(command) {
  console.log("Packing command....\n");

  var i = 2;

  while (i < 10) {
    test_buffer_BMS_command.push(
      (convertToHex(command[i]) << 4) | convertToHex(command[i + 1])
    );
    i = i + 2;
  }
}

const StartUpdate = (linenumber, topic) => {
  //+sleep(100);

  test_buffer_data = [];
  console.log("LINE NUMBER: ", linenumber);

  // check if line number value is -2.
  // a value of -2 indicates that end of file has reached.
  // if the end of file of file is detected
  // remove the modal responsible for showing progress
  // reset the Bms progress value to zero
  // wait for 4 seconds and retrieve the BMS version of the
  // new application from the MCU.

  if (linenumber == -2) {
    // update process complete

    // display = false;
    // setDisplay(display);
    // setModalProgressVisible(false);

    // // dialog pop-up to tell the users that the update is complete.

    // versionRequestCount = 0;
    // BmsRequestCount = 0;
    // StopUpdate = 0; // not needed anymore.
    // BmsProgress = 0;
    // setProgress(BmsProgress);
    // SetStopUpdate(StopUpdate);

    // // setTimeout(()=>{GetBmsVersion(),4000});
    // setUpdateModalText('Restarting the BMS. Wait for few seconds');
    // SetUpdateCompleteDialogVisible(true); // making the dialog box visible.

    // setTimeout(() => {

    //   GetBmsVersion();

    // }, 10000);

    // Look for updates again

    //LookForUpdates(true); // start looking for updates again with
    // a frequency of 30 seconds. Modifiable.

    console.log("Update Complete...\n");
  }

  // Increasing the Bms Progress circle by the slice amount.

  //  BmsProgress += progressSlice;

  //  setProgress(BmsProgress);

  // End of line condition also added in the Update feature.

  // at the end of each line read_file_flag is set to zero.
  while (!read_file_flag && linenumber != -1) {
    // file_index moves through each charcter of the entire file
    // file_row_index moves through each row and is reset at the end of each row
    // contents buffer contains the entire .srec file.
    if (file_content[file_index] == "\n" || file_content[file_index] == "\r") {
      // read_file_flag set to 1 so that while loop exit occurs.
      read_file_flag = 1;

      // incrementing the file_index so that the file_index pointer reaches the next line.
      file_index++;
    } else {
      // looking for the the characters S and 0,3,5 from the .srec file.
      // depending of the type the test_buffer_type is populated with the 2 bytes

      if (file_row_index == 0) {
        file_index; // not needed
        if (file_content[file_index] == "S") {
          if (file_content[file_index + 1] == "0") {
            // command is set to command start firmware write

            fota_cmd = CmdStartFirmwareWrite;

            // payload test_buffer_type populated with 2 character S0

            test_buffer_type = Buffer.from("S0");
          } else if (file_content[file_index + 1] == "3") {
            // command is set to command start firmware write

            fota_cmd = CmdStartFirmwareWrite;

            // payload test_buffer_type populated with 2 character S3
            test_buffer_type = Buffer.from("S3");
          } else if (file_content[file_index + 1] == "5") {
            // if S5 is detected then the end of file has reached and the smartphone app
            // has to tell the BMS MCU to jump to the newly written application.

            fota_cmd = CmdJumpToApp;

            // payload test_buffer_type populated with 2 character S3
            test_buffer_type = Buffer.from("S5");

            // Code to show that update is complete

            file_line_number = -3; // so that the file reading stops.
          } else {
            file_line_number = -12;
            console.log("Format Error.\n");
          }
        }
      }

      // populating the byte size, address, data and checksum from the srec file

      if (file_row_index >= 2) {
        if (file_row_index % 2 == 0) {
          // test_buffer_data array is populated.
          // contents array consist of characters, 2 characters form 1 byte
          // after conversion to hex.

          test_buffer_data.push(
            (convertToHex(file_content[file_index]) << 4) |
              convertToHex(file_content[file_index + 1])
          );
        }
      }
    }

    // incrementing file_index and file_row_index to read the next set of characters in the same line of .srec file.
    file_index++;
    file_row_index++;
  }

  read_file_flag = 0;
  file_row_index = 0; // file_row_index is reset and is ready to traverse through the next row of Srec file

  // Send lines and receive the error code

  var UpdateMessage = [];

  packCommand(fota_cmd);

  //   var j = 0;
  //  console.log('')
  //  while(j< test_buffer_BMS_command.length){
  //   UpdateMessage += test_buffer_BMS_command[j];
  //   j=j+1
  //  }
  // UpdateMessage = UpdateMessage + test_buffer_type;

  //UpdateMessage = test_buffer_BMS_command /*+ test_buffer_type*/ + test_buffer_data;

  UpdateMessage = Buffer.from(test_buffer_BMS_command);

  test_buffer_BMS_command = [];

  console.log("Line ", linenumber, " message:", UpdateMessage);
  //console.log('Size of Update message : ',(UpdateMessage.length));

  MQTT_post(UpdateMessage, "UpdateMaster");

  UpdateMessage = [];

  UpdateMessage = test_buffer_type;

  MQTT_post(UpdateMessage, "UpdateMaster");

  var k = 0;
  var temp_test_buffer_data = [];
  while (k < 2) {
    j = 0;
    if (k != 1) {
      while (j < 120) {
        console.log(String.fromCharCode(test_buffer_data[j + k * 120]));
        temp_test_buffer_data[j] = test_buffer_data[j + k * 120];
        j = j + 1;
      }
    } else {
      while (j < 14) {
        console.log(String.fromCharCode(test_buffer_data[j + k * 60]));
        temp_test_buffer_data[j] = test_buffer_data[j + k * 120];
        j = j + 1;
      }
    }

    k = k + 1;
    UpdateMessage = Buffer.from(temp_test_buffer_data);
    MQTT_post(UpdateMessage, "UpdateMaster");
    UpdateMessage = [];
    temp_test_buffer_data = [];
  }

  test_buffer_data = [];
};

function StartUpdate_MQTT() {
  file_index = 0;
  topic = "UpdateMaster";
  console.log("Reading SREC file....\n");

  file_content = Read_SrecFile();

  console.log("SREC file contents:\n", file_content);

  StartUpdate(0, topic);

  //console.log( 'Publishing data on topic:',topic);

  //MQTT_post("Hello, let's start update process",topic);
}

app.post("/StartUpdate", jsonParser, (req, res) => {
  var datas = [];
  datas = req.body;
  console.log("ENDPOINT HIT:", req.body.message);
  res.send("Firmware Update Started...");
  console.log("\n starting software update...");
  StartUpdate_MQTT();

  // setInterval(()=>MQTT_post('Hello',Topic_UpdateMaster),2000);
});

function PingDevice() {
  packCommand(CmdFetchDeviceFirmware);
  var Message = [];
  Message = Buffer.from(test_buffer_BMS_command);
  var i = 0;

  console.log("MQTT Sending Command: ", Message);

  // while(i<35){
  //   MQTT_post(Message,Topic_PingSmartWheels);
  //   i = i + 1
  // }
  MQTT_post(Message, Topic_PingSmartWheels);

  test_buffer_BMS_command = [];
}

// Helper function to generate JWTs
const generateAccessToken = (username) => {
  // const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  return jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
};

// Helper function to generate Refresh Tokens
const generateRefreshToken = (username) => {
  return jwt.sign({ username }, REFRESH_SECRET_KEY, { expiresIn: "7d" });
};

// Middleware to verify token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Log the API endpoint and HTTP method
  // console.log(`API called: ${req.method} ${req.originalUrl}`);
  // console.log("Header token : ", authHeader);

  if (!authHeader) {
    console.log("Access Denied!");
    return res.status(403).json({ error: "Access Denied!" });
  }

  // Extract the token from the 'Bearer <token>' format
  const token = authHeader.split(" ")[1];

  // Check if token is null, undefined, or empty
  if (!token || token === "null" || token === "") {
    return res
      .status(403)
      .json({ error: "Access Denied: No valid token provided!" });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;

    // if (req.user.userPinId === req.session.userPinId) {
    next(); // Continue to the next middleware or route
    // } else {
    //   return res.status(400).json({ error: "Invalid token payload" }); // Handle payload mismatch
    // }
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
}

// API endpoint to handle user data insertion
app.post("/login", jsonParser, (req, res) => {
  const { username, password } = req.body; // frontend sends username and password

  // Check if username is exist
  // const query = "SELECT * FROM users WHERE username = ?";
  // db.query(query, [username], (err, results) => {
  //   if (err) {
  //     console.error("Error checking username:", err);
  //     res.status(500).json({ error: "Error checking username" });
  //     return;
  //   }

  //   if (1) {
  //     const user = results[0];
  //     if (1) {
  //       // Store userPinId in a variable
  //       // let userPinId = username;

  //       // Store the same userPinId in the session
  //       // req.session.userPinId = userPinId;

  //       // console.log(req.session);
  //       // console.log(req.session.userPinId);

  //       // req.session.deviceStatus = "";
  //       // const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
  //       console.log("logins......!");
  //       const accessToken = generateAccessToken(user);
  //       const refreshToken = generateRefreshToken(user);

  //       // Set the refresh token in an HTTP-only cookie
  //       res.cookie("refreshToken", refreshToken, {
  //         httpOnly: true,
  //         secure: false,
  //         sameSite: "None", // If your front-end and back-end are on different ports
  //       }); // In production, set `secure: true` for HTTPS

  //       res.status(200).json({
  //         message: "Login successful",
  //         token: accessToken,
  //       });
  //     } else {
  //       res.status(401).json({ message: "Invalid credentials" });
  //     }
  //   } else {
  //     res.status(401).json({ message: "Invalid credentials" });
  //   }
  // });
  const accessToken = generateAccessToken("Ancit");
  const refreshToken = generateRefreshToken("Ancit");
  res.status(200).json({
            message: "Login successful",
            token: accessToken,
          });
});

// Refresh Token Route - Allows user to get a new access token using the refresh token
app.post("/refresh-token", (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res.status(403).json({ message: "Refresh token missing" });

  jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token" });

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  });
});

// API endpoint to handle user data insertion
app.post("/saveUserData", jsonParser, (req, res) => {
  const { username, password } = req.body; // Assuming your frontend sends username and password

  // Check if username already exists
  const checkQuery = "SELECT COUNT(*) AS count FROM users WHERE username = ?";
  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error("Error checking username:", err);
      res.status(500).json({ error: "Error checking username" });
      return;
    }

    const count = results[0].count;

    if (count > 0) {
      // Username already exists
      res.status(409).json({ error: "Username already exists" });
    } else {
      // Insert data into MySQL
      const insertQuery =
        "INSERT INTO users (username, password) VALUES (?, ?)";
      db.query(insertQuery, [username, password], (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          res.status(500).json({ error: "Error inserting data" });
          return;
        }
        console.log("Inserted ID:", result.insertId);
        res.status(200).json({ message: "User data inserted successfully" });
      });
    }
  });
});

// app.use(limiter);

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 100 requests per windowMs
});

// Middleware to exclude specific routes from rate limiting
const excludeRateLimit = (req, res, next) => {
  // List of routes to exclude
  const excludedRoutes = ["/PingDevice", "/InitilizeData", "/ProgressCount"];

  // Check if the request route matches any excluded routes
  if (excludedRoutes.includes(req.path)) {
    return next(); // Bypass the rate limiter
  }

  // Apply rate limiter to all other routes
  limiter(req, res, next);
};

// Use the exclusion middleware before defining routes
app.use(excludeRateLimit);

// Apply verifyToken middleware to routes except for the ones listed above
app.use(verifyToken);

// API endpoint to handle user data insertion
app.post("/UserExist", jsonParser, (req, res) => {
  const { username } = req.body; // frontend sends username

  // Check if username is exist
  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error checking username:", err);
      res.status(500).json({ error: "Error checking username" });
      return;
    }

    if (results.length > 0) {
      res.status(200).json({ message: "User Exist" });
    } else {
      res.status(201).json({ message: "Invalid User" });
    }
  });
});

// API endpoint to handle user data insertion
app.post("/ResetPassword", jsonParser, (req, res) => {
  const { username, password } = req.body; // frontend sends username and password

  // Check if username is exist
  const query = "SELECT * FROM users WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error checking username:", err);
      res.status(500).json({ error: "Error checking username" });
      return;
    }

    if (results.length > 0) {
      const user = results[0];

      // Update the password in the database
      const updateQuery = "UPDATE users SET password = ? WHERE username = ?";
      db.query(
        updateQuery,
        [password, username],
        (updateErr, updateResults) => {
          if (updateErr) {
            console.error("Error updating password:", updateErr);
            res.status(500).json({ error: "Error updating password" });
            return;
          }

          res.status(200).json({ message: "Password updated successfully" });
        }
      );
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// Set up multer storage
const DbcStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../dbc-uploads/"); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Save with unique filename
  },
});

const uploadDbc = multer({
  storage: DbcStorage,
  fileFilter: (req, file, cb) => {
    // Accept only .dbc files
    if (path.extname(file.originalname) === ".dbc") {
      cb(null, true);
    } else {
      cb(new Error("Only .dbc files are allowed"));
    }
  },
});

app.post("/uploadDbcFile", uploadDbc.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  res.json({ message: "File uploaded and read successfully" });
});

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Use memory storage to keep file in memory
const upload = multer({ storage: storage });

// Route to handle file upload
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file || !req.file.buffer) {
    console.log("error in file loading...! ");
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileBuffer = req.file.buffer;
  data = fileBuffer.toString("utf8");

  console.log("File contents:", data);

  res.json({ message: "File uploaded and read successfully" });
});

// Endpoint to ping the S32K144 Smartwheel device.
app.post("/PingDevice", jsonParser, (req, res) => {
  const { configBoardId } = req.body;
  // console.log("session on pinging device ", req.session);
  // const userPinId = req.session.userPinId;

  // console.log("pinging id ", configBoardId);
  // console.log("pinging id setted variable ", deviceStatusMap);

  // console.log("hello0", req.session);
  // res.send(deviceStatusMap[userPinId]);

  // console.log("device status : ", deviceStatusMap[configBoardId]);

  res.json({
    deviceStatus: deviceStatusMap[configBoardId],
    deviceId: configBoardId,
  });
  // res.send();
  if (configBoardId != "DefaultDevice") {
    client.publish("PingFromSmartWheels_" + configBoardId, "");
  } else {
    client.publish("PingFromSmartWheels", "");
  }
});

app.post("/InitilizeData", (req, res) => {
  const { UserPinId = "" } = req.body || {};
  file_content = [];
  test_buffer_data = [];
  read_file_flag = 0;
  file_index = 0;
  file_row_index = 0;
  fota_cmd = "";
  file_line_number = 0;
  ping = 0;
  Id = 0;

  if (UserPinId) {
    client.publish("ESP_Reset_" + UserPinId, "Restart");
  }

  fs.writeFile(filePath, "", (err) => {
    if (err) {
      console.error("Error clearing file content:", err);
    } else {
      console.log("File content cleared successfully");
    }
  });
  res.json({ message: "Re-Initialized data..." });
  console.log("Ping count .......", ping);
});

app.get("/ProgressCount", (req, res) => {
  //console.log('File count .......', file_line_number);
  try {
    if (typeof file_line_number === "undefined") {
      return res.status(500).json({ error: "file_line_number is undefined" });
    }
    res.json({ lineCount: file_line_number });
  } catch (error) {
    console.error("Error in /ProgressCount:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/StartTelemerty", (req, res) => {
  server.on("connection", (socket) => {
    clientsSocket.add(socket);

    console.log("Client connected");

    // // Send the message initially
    // sendLiveData();
    // sendJsonData();
    // Receiving a message from the client
    socket.on("message", (message) => {
      console.log(`Received message through webSocket client: ${message}`);
    });

    // Client disconnected
    socket.on("close", () => {
      console.log("Client disconnected1");
    });
  });

  res.json({
    message: "Started telemerty",
  });
});

app.post("/StopAwake", (req, res) => {
  // const message = req.body.msg;
  // console.log('Stop Awake Message', message);
  // if (message) {

  // } else {
  //   res.status(400).json({ error: 'No message provided' });
  // }
  client.publish(Topic_PingFromWebApp, "StopAwake");
  res.json({
    message: "Awake msg Stopped",
    success: true,
  });
});

app.post("/append-to-file", (req, res) => {
  fs.appendFile(
    filePath,
    Id++ +
      "." +
      " " +
      new Date(Date.now()).toString() +
      "\n" +
      JSON.stringify(JsonMessage) +
      "\n",
    (err) => {
      if (err) {
        console.error("Error appending to file:", err);
        return res.status(500).json({ error: "Error appending to file" });
      }
      res.status(200).json({ message: "Data appended successfully" });
    }
  );
});

// Create a route to serve the file
app.get("/downloadLogFile", (req, res) => {
  res.download(filePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error downloading file");
    } else {
      console.log("File downloaded successfully");
      // You can't send a success response here because the response is already being sent as the file.
    }
  });
});

app.get("/DbcAligner", async (req, res) => {
  const dbcFileName = req.query.DbcFileName;
  console.log("hey in dbcFileName : ", dbcFileName);
  try {
    const output = await DecodeDbc(dbcFileName);
    console.log(output);
    res.json(output);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/DcodeDBC", async (req, res) => {
  console.log("hey in");
  try {
    const output = await DecodeCanPacket(JsonMessage);
    console.log(output);
    res.json(output);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/subscribeChannels", jsonParser, (req, res) => {
  console.log("id >>> ", req.body);
  const { configBoardId } = req.body;
  req.session.userPinId = configBoardId;
  // console.log(req.session);
  console.log("Subscribed Channels with id ", configBoardId);
  subscribeToTopic(configBoardId);
  res.json({
    message: `Subscribed with id ${req.session.userPinId}`,
    isSubscribed: true,
  });
});

// Logout Route - Clears the Refresh Token from Cookies
app.post("/logout", (req, res) => {
  // Clear the refresh token cookie
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
});

app.post("/unsubscribeToTopic", jsonParser, (req, res) => {
  console.log("unsubscribeId >>> ", req.body);
  const { unsubscribeId } = req.body;

  unsubscribeToTopic(unsubscribeId);
  res.json({
    message: `UnSubscribed with id ${unsubscribeId}`,
  });
});

// app.listen(PORT, () => {
//   console.log(`Server listening on ${PORT}`);
// });
