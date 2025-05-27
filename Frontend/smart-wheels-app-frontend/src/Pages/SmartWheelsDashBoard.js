import React from 'react';
import settingsImage from '../Images/settings.png';
import telematicsImage from '../Images/telematics.jpg';
import { useNavigate } from "react-router-dom"
import { motion } from 'framer-motion';

function SmartWheelsDashBoard() {
    const navigate = useNavigate();

    function handleSettingsImage() {
        alert("Setting Icon is clicked up...!");
    }

    function handleTelematicsImage() {
        navigate(`/Telematic`);
    }

    function handleHover() {
        const element = document.querySelector('.Telematic-logo');
        element.style.transform = 'rotateX(360deg)';
        element.style.cursor = 'pointer';
      }
      
      function handleMouseLeave() {
        const element = document.querySelector('.Telematic-logo');
        element.style.transform = 'none';
      }

    return (
        <div className="App">
        <div className="Dashboard-Container">
            <motion.div  whileHover={{scale:1.1}} style={{display:'flex',alignItems:'center',borderRadius:'4.4vh',height:'8vw',backgroundColor:'white',boxShadow:'0px 4px 8px rgba(0, 0, 0, 0.9)'}}>
                <span className='text'>SMARTWHEELS DASHBOARD</span>
            </motion.div>
            <div className="Dashboard-Options">
            <motion.div whileHover={{scale:1.1}} whileTap={{transform:"scale(0.9)"}} className="Dashboard-Options-telematics">
            <img 
                src={telematicsImage} 
                alt="Telematic Logo" 
                onClick={handleTelematicsImage} 
                onMouseEnter={handleHover}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: 'pointer', borderRadius:'3vh',marginRight:'2vh',  maxWidth: '100%'}}
                className="Telematic-logo"/>   
                <span style={{display:'flex',justifyContent:'center',color:'#249fbb',flex:1,fontSize:30,fontWeight:'bold',cursor:'pointer'}}>telematics</span>
            </motion.div>

            <motion.div whileHover={{scale:1.1}} whileTap={{transform:"scale(0.9)"}} className="Dashboard-Options-settings">
            <img
                src={settingsImage} 
                alt="Setting Logo" 
                onClick={handleSettingsImage} 
                style={{ cursor: 'pointer', height: "11.5vw", width: "35vh", borderRadius:'3vh',marginLeft:'2vh',  maxWidth: '100%'}}/>    
                <span style={{display:'flex',justifyContent:'center',color:'#249fbb',flex:1,fontSize:30,fontWeight:'bold',cursor:'pointer'}}>settings</span>
            </motion.div>
            </div>
            
        </div>
        </div>
    );
}

export default SmartWheelsDashBoard;
