import cantools as ct
import json
import sys


parent = []
msg_list = []
node_tx = []
node_rx = []
tree_data = []
count = 0
# print("Decoding DBC file...\n")

def main(dbc_file_path):
    global count
    db = ct.database.load_file(dbc_file_path)
    # print("Messages from the database:",db.messages,"\n" )
    count = count + 1
    messages = db.messages
    parent_details = {'id':count,"parent":"messages","children":[]}
    
    for item in messages:
        count = count + 1
        # new_entry = {'id':count,'message_name':item.name , 'message_ID':hex(item.frame_id)}
        # new_entry = {"Children":new_entry}
        # msg_list.append(new_entry)
        message_data={
            'id': count,
            'parent': item.name,
            'message_ID': hex(item.frame_id),
            'children':[]
        }
        
        for signals in item.signals:
            count = count + 1
            signal_data = {
                'id':count,
                'message_ID': hex(item.frame_id),
                'signal_name': signals.name,
                'signal_value': signals.initial,
                'signal_start_bit':signals.start,
                'signal_length':signals.length
            }
            message_data['children'].append(signal_data)

        parent_details['children'].append(message_data)
        
        if item.senders:
            tx_entry = {'tx_message_name':item.name , 'tx_message_ID':hex(item.frame_id)}
            node_tx.append(tx_entry)
        if item.receivers:
            rx_entry = {'rx_message_name':item.name , 'rx_message_ID':hex(item.frame_id)}
            node_rx.append(rx_entry)
   
    tree_data.append(parent_details)
    

    print(json.dumps(tree_data))



if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: example.py <path_to_dbc_file>"}))
    else:
        dbc_file_path = sys.argv[1]
        # dbc_file_path = "D:/Vishnu/Smartwheels/local/WebApp/node-dbc-viewer/src/pyscripts/PowerTrain.dbc"
        main(dbc_file_path)