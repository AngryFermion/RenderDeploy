const { exec } = require("child_process");
const { json } = require("express");

// Expected JSON packet from MQTT

// {
//     "Message_ID":101,               ------------- CAN ID
//     "DLC":1,                        ------------- Length of data bytes.
//     "Payload": [21,0,0,0,0,0,0,25]  ------------- 8 byte CAN data

// }

async function DecodeDbc(dbcFileName) {
  return new Promise((resolve, reject) => {
    console.error(`DecodeDbc function call :${dbcFileName}`);
    exec(
      `python ../pyscripts/process-dbc.py ../dbc-uploads/PowerTrain.dbc`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        try {
          const res = JSON.parse(stdout);
          console.log("Data from Python:", res);
          resolve(res);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
        }
      }
    );
  });
}

async function DecodeCanPacket(jOBJ) {
  const output = await DecodeDbc();
  console.log(output[0]);

  return new Promise((resolve, reject) => {
    console.log("Inside CAN packet parser...\n");
    console.log("Message ID:", jOBJ.Message_ID);

    var data_length = jOBJ.DLC;
    console.log("Data length", data_length);

    console.log("Byte value 1:", jOBJ.Payload[0]);

    // var i =0;
    // var flag = true

    // // blocking code - slow - requires optimization
    // while(flag){

    //     if(output[0].children[i].message_ID === jOBJ[i].Message_ID){
    //         console.log("found");
    //         console.log("Message name:",output[0].children[i].message_name)
    //         console.log("number of signals:",(output[0].children[i].children).length)
    //         var j = 0;
    //         var signal_flag = true
    //         while(signal_flag){
    //             console.log("signal name:",output[0].children[i].children[j].signal_name)
    //             console.log("signal value:",output[0].children[i].children[j].signal_value)
    //             console.log("signal length:",output[0].children[i].children[j].signal_length)
    //             console.log("signal start bit:",output[0].children[i].children[j].signal_start_bit)

    //             output[0].children[i].children[j].signal_value = ((((jOBJ[i].Payload[0] >> output[0].children[i].children[j].signal_start_bit) << (8 - output[0].children[i].children[j].signal_length

    //             )) & 0xFF) >> (8 -
    //                 output[0].children[i].children[j].signal_length))

    //             console.log("signal value changed:",output[0].children[i].children[j].signal_value)
    //             j = j + 1
    //             if(j == (output[0].children[i].children).length){
    //                 signal_flag = false
    //             }

    //         }
    //         flag = false
    //     }
    //     else{
    //         i = i+1
    //     }
    // }

    const matchingChild = output[0].children.find(
      (child) => child.message_ID === jOBJ.Message_ID
    );

    if (matchingChild) {
      console.log("found");
      console.log("Message name:", matchingChild.message_name);
      console.log("number of signals:", matchingChild.children.length);

      // Process each signal in the matching child
      matchingChild.children.forEach((signal) => {
        console.log("signal name:", signal.signal_name);
        console.log("signal length:", signal.signal_length);
        console.log("signal start bit:", signal.signal_start_bit);

        // Calculate the new signal value
        const signalValue =
          (((jOBJ.Payload[0] >> signal.signal_start_bit) <<
            (8 - signal.signal_length)) &
            0xff) >>
          (8 - signal.signal_length);

        console.log("signal value changed:", signalValue);

        // Check if jOBJ.signal_value exists, if not, initialize it
        if (!jOBJ.signal_value) {
          jOBJ.signal_value = {};
        }

        // Assign the signal value to jOBJ.signal_value using signal.signal_name as the key
        jOBJ.signal_value[signal.signal_name] = signalValue;
      });
    }

    console.log("Updated jOBJ:", jOBJ);

    resolve(jOBJ);
  });
}

module.exports = { DecodeDbc, DecodeCanPacket };
