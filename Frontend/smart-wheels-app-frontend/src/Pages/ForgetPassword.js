import { useState } from 'react';
import CustomLinkComponents from '../Components/CustomLinkComponents'
import { useNavigate } from "react-router-dom"

function ForgetPassword() {

    let [UserName,setUserName]=useState('');
    let [ResetPassword,setResetPassword]=useState('');
    let [ConfirmNewPassword,setConfirmNewPassword]=useState('');

    let [UserExist,setUserExist]=useState(false);
    let [VerifyAndSetPassword,setVerifyAndSetPassword]=useState('Verify-User');

    var [afterLoad,setAfterLoad]= useState(false);
    let [DeviceStatusLoad, setDeviceStatusLoad] = useState(false);

    const token = sessionStorage.getItem('Token');
    // console.log('Jwt Token:', token);

    const navigate = useNavigate();

    const CheckUserExist = ()=> {
        //   alert("checking user is registered or not");
         console.log('Jwt Token:', token);

          fetch('http://localhost:3006/UserExist', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              username: UserName
            }),
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
        
              // You can access the status code here
              const status = response.status;
              console.log('Status code:', status);
        
              // Return the status and json data together
              return response.json().then(data => ({ status, data }));
            })
            .then(({ status, data }) => {
              console.log('User Exist response:', data);
              
              if (status === 200) {
                setDeviceStatusLoad(true);
                setAfterLoad(true);
                const hideDeviceStatus = setTimeout(() => {
                  setDeviceStatusLoad(false);
                //    navigate(`/dashboard`);
                setUserExist(true);
                setVerifyAndSetPassword('ResetPassword');
              }, 2000);
               
              } else if (status === 201) {
                setDeviceStatusLoad(true);
                const hideDeviceStatus = setTimeout(() => {
                  setDeviceStatusLoad(false);
              }, 2000);
                
              }
            
            })
            .catch(error => {
              
              if (error.message.includes('500')) {
                alert('Internal server error. Please try again later.');
              } else if (error.message.includes('403')) {
                alert('Security Authentication failed up for this HTTP request.'); 
              }else if (error.message.includes('406')) {
                alert('Security Authentication failed with bearer.'); 
              } else {
                console.log("Error Message",error)
                alert('Network error. Please try again later.');
              }
            });

    }
    const ResetNewPassword = ()=> {
        //   alert("changing user password");
        fetch('http://localhost:3006/ResetPassword', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              username: UserName,
              password: ConfirmNewPassword
            }),
          })
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
        
              // You can access the status code here
              const status = response.status;
              console.log('Status code:', status);
        
              // Return the status and json data together
              return response.json().then(data => ({ status, data }));
            })
            .then(({ status, data }) => {
              console.log('Reset response:', data);
              
              if (status === 200) {
                alert('Password Updated successfully.');
                navigate(`/`);
               
              } else if (status === 201) {
             
                alert('Password Updated Failed.');
              }
            
            })
            .catch(error => {
              
              if (error.message.includes('500')) {
                alert('Internal server error. Please try again later.');
              } else if (error.message.includes('403')) {
                alert('Security Authentication failed up for this HTTP request.'); 
              } else {
                console.log("Error Message",error)
                alert('Network error. Please try again later.');
              }
            });
    }

  return (
    <div className="App">
        <div className="ForgetPassword-Container">
            <div className="Check-User-Present">
            <div className='Input-Text-Container'>

            <span className='WelcomePageText'>{!UserExist?'Enter your registered user name':'Enter your new password'}</span>

              <input type="text"
                     placeholder="Username..." 
                     value={UserName}
                     onChange={ev => setUserName(ev.target.value)}
                     className="InputText"/>

              {UserExist ? (<>
                <input type="password"
                     placeholder="Password..." 
                     value={ResetPassword}
                     onChange={ev => setResetPassword(ev.target.value)}
                     className="InputText"/>

              <input type="password"
                     placeholder="Re-Enter Password..." 
                     value={ConfirmNewPassword}
                     onChange={ev => setConfirmNewPassword(ev.target.value)}
                     className="InputText"/>       
              </>):""}  

              </div>
              <CustomLinkComponents.LinkButton onClick={VerifyAndSetPassword === 'Verify-User' ? CheckUserExist : ResetNewPassword} className="Verify-Button" isDisabled={!UserName}>{VerifyAndSetPassword}</CustomLinkComponents.LinkButton>
              {DeviceStatusLoad  && <CustomLinkComponents.Loading loadText={'Invalid User'} isSignalDetected={afterLoad} afterLoadText={'User exists'}/>}
            </div>
        </div>
    </div>
  )
}

export default ForgetPassword