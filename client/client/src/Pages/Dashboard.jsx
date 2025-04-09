import  { useState, useEffect } from "react";


import { useNavigate } from "react-router-dom";
import axios from "../api/api";
import Swal from "sweetalert2"
import { Card, Input, Button, Typography, Space, Alert,message,Modal, Row, Col } from "antd";
import { CheckCircleTwoTone } from "@ant-design/icons";
import moment from "moment";
const { Title, Text } = Typography;
import "../Styles/Dashboard.css";

function Dashboard( ) {
  const [shiftStarted, setShiftStarted] = useState(false);
  
  const [currentShift, setCurrentShift] = useState("");
  const [nextShift, setNextShift] = useState("");
  const [radioNumber, setRadioNumber] = useState("");
  const [lxeNumber, setLxeNumber] = useState("");
  const [radioAssigned, setRadioAssigned] = useState(false);
  const [lxcAssigned, setLxcAssigned] = useState(false);
  const [user, setUser] = useState("")
  
  const [isCompleted, setIsCompleted] = useState(false)

  const navigate = useNavigate();
  axios.defaults.withCredentials = true


  useEffect(()=>{

  const getUsername = async () => {
    
    try {
       const response= await axios.get("/api/users/me");
       if(response.status===200){
        setUser(response.data)
       }
       
      
    } catch (error) {
     
      console.log(error)
    }
  };
  getUsername()
},[])


  const getGroup = async () => {
    
    try {
       const response= await axios.get("/api/users/get_group",{
        withCredentials: true,
      });
     
      if(response.status===200){
        console.log("clerk",response.data.clerk)
        setDisabledLxe(response.data.clerk)
       return response.data.group
      
      }
      
      } catch (error) {
        console.error("Error fetching group:", error.response?.data || error.message);
        return null; // Ensure function always returns something
      }
  };

  


  const [tomorrow, setTomorrow] = useState("");
  
  
  // Determine shift based on group and day rotation
  const calculateShift = async () => {
    const startDate = new Date("2025-01-01");
    const currentDate = new Date();
    const tomorrowDate = new Date();
    tomorrowDate.setDate(currentDate.getDate() + 1);
    setTomorrow(moment(tomorrowDate).format("YYYY-MM-DD"));
  
    try {
      const group = await getGroup();
      const daysSinceStart = Math.floor(
        (currentDate - startDate) / (1000 * 60 * 60 * 24)
      );
      const rotation = daysSinceStart % 7;
  
      let shift = { current: "", next: "" };
  
      if (group === 'Red Eagle') {
        if (rotation === 0 || rotation === 1) {
            shift = { current: "Morning", next: "Evening" };
        } else if (rotation === 2 || rotation === 3) {
            shift = { current: "Evening", next: "Off" };
        } else if(rotation === 4 || rotation === 5){
            shift = { current: "Off", next: "Morning" };
        } else {
          shift = { current: "Morning", next: "Evening" };
      }
    } else if (group === 'White Ox') {
        if (rotation === 0 || rotation === 1) {
            shift = { current: "Evening", next: "Off" };
        } else if (rotation === 2 || rotation === 3) {
            shift = { current: "Off", next: "Morning" };
        } else if(rotation === 4 || rotation === 5) {
            shift = { current: "Morning", next: "Evening" };
        }else {
            shift = { current: "Evening", next: "Off" };
        }
    } else if (group === 'Blue Falcon') {
      if (rotation === 0 || rotation === 1) {
          shift = { current: "Off", next: "Morning" };
      } else if (rotation === 2 || rotation === 3) {
          shift = { current: "Morning", next: "Evening" };
      } else if (rotation === 4 || rotation === 5) {
          shift = { current: "Evening", next: "Off" };
      } else {
          shift = { current: "Off", next: "Morning" };
      }
      }
  
      // Optionally determine what is *currently active* by hour
      const hour = new Date().getHours();
      let activeShift = "Off";
      if (shift.current === "Morning" && hour >= 8 && hour < 19) {
        activeShift = "Morning";
      } else if (shift.current === "Evening" && (hour >= 19 || hour < 8)) {
        activeShift = "Evening";
      }
  
      setCurrentShift(activeShift);
      setNextShift(shift.next);
  
    } catch (error) {
      console.error(error);
    }
  };
  
  useEffect(() => {
    calculateShift();
  }, []);

  const handleRadioInput = (e) => {
    setRadioNumber(e.target.value);
  };

  const handleLxcInput = (e) => {
    setLxeNumber(e.target.value);
  };

  const handleStartShift = async() => {
    try{
      axios.defaults.withCredentials = true
    if (currentShift === "Off") {
      alert("You are off duty today. Enjoy your day off!");
      return;
    }
    if (isCompleted===true){
        Swal.fire({
          title: "Shift already completed",
          icon: "warning",
          timer: 3000
        })
        return
    }
    
    if (!radioNumber) {
      Swal.fire({
        title: "Please enter both Radio and LXC numbers",
        icon: "warning",
        timer: 3000
      })
      return;
    }
    const response= await axios.post("/api/shift/start-shift",{lxeNumber,radioNumber,location: location.placeName,currentShift})
    console.log(response.data)
   
    setShiftStarted(true);
    setRadioAssigned(true);
    setLxcAssigned(true);
    startLocationTracking();
}catch(error){
  if (error.response && error.response.status === 404) {
    message.error(error.response.data?.message || "Resource not found");
  }
  console.log(error)
}

  };

  const startLocationTracking = () => {
    navigator.geolocation.watchPosition((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    });
  };

 


  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    placeName: null,
    error: null,
  });

  function getLocationName() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setLocation((prev) => ({ ...prev, latitude: lat, longitude: lon }));

          // Reverse Geocoding with Mapbox API
          const accessToken = "pk.eyJ1IjoiYWt1YWZvLTEiLCJhIjoiY200MXhxNnJrMDQzNjJrcjAzbXg4cTliMCJ9.6cwG6dff4E2UjnQz7q963A";
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${accessToken}`
            );
            const data = await response.json();
            if (data.features.length > 0) {
              setLocation((prev) => ({ ...prev, placeName: data.features[0].place_name }));
            } else {
              setLocation((prev) => ({ ...prev, placeName: "Location not found" }));
            }
          } catch (error) {
            console.log(error)
            setLocation((prev) => ({ ...prev, error: "Failed to fetch location name" }));
          }
        },
        (error) => {
          setLocation((prev) => ({ ...prev, error: error.message }));
        }
      );
    } else {
      setLocation((prev) => ({ ...prev, error: "Geolocation is not supported" }));
    }
  }
  useEffect(() => {
    getLocationName();
  }, []);
  

  
  
  
  const [quayCrane,set_quay_crane] = useState('');
  const [requestType, setRequestType] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [missedSignOut, setMissedSignOut] = useState(false)

  const [disabledLxe, setDisabledLxe] = useState(false)
  useEffect(()=>{
      const getShift = async () =>{
        try{
          const response = await axios.get("/api/shift/check-shift");
          const { status, data } = response;

          if (status === 200 && data.message === "User is currently on shift. Shift has not ended yet.") {
            setShiftStarted(true);
            setIsCompleted(false);
            setMissedSignOut(false);
          } else if (status === 201 && data.message === "User has already signed out today.") {
            setShiftStarted(false);
            setIsCompleted(true);
            setMissedSignOut(false);
          } else if (status === 202 && data.message === "Shift ended. User did not sign out. Marked as missed sign-out.") {
            setShiftStarted(false);
            setIsCompleted(true);
            setMissedSignOut(true); // handle this in UI if needed
          }
         
      }catch(error){
        if(error.response && error.response.status === 401){
        Modal.warning({
          title: "Session Expired",
          content: "Your session has expired. Please log in again.",
          okText: "Login",
          onOk: () => {
            
            navigate("/")
          },
        });
      }
        console.log(error)
      }
    }
    getShift() 
  },[])

  // Show the modal when the user clicks the button
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Hide the modal
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Function to handle button clicks (LXE or Radio)
  const handleRequestType = (type) => {
    setRequestType(type);
  };

  // Function to handle the form submission
  const handleSubmit1 = async () => {
    if (!quayCrane || !requestType) {
      message.error('Please enter an quay crane name and select a request type');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/shift/submit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          
        },
        credentials:"include",
        body: JSON.stringify({ quayCrane, requestType }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Request submitted successfully');
        // Optionally, navigate to another page after success
        
        handleCancel(); // Close the modal after submission
      } else {
        message.error(data.error || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      message.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };




  const handleSignOut = async() => {
    if (!shiftStarted) {
      alert("Shift has not started yet!");
      return;
    }
    try{
      const response = await axios.post("/api/shift/end-shift")
    

      if(response.status===200){
   
    setShiftStarted(false);
    setRadioNumber("");
    setLxeNumber("");
    setRadioAssigned(false);
    setLxcAssigned(false);
    navigate("/");

    return
      }
     

  }catch(error){
     console.log(error)
  }
  };


  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      if ((hours === 18 && minutes === 30) || (hours === 7 && minutes === 30) && shiftStarted && currentShift==="Morning" || currentShift==="Evening") { // 6:30 PM
        handleSignOut()
      }
      
    };

    const interval = setInterval(checkTime, 60000); // Check every minute

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);


 

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px" }}>
        
       <Modal
        title="Request Battery Form"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={400}
      >
        <div>
          <Row gutter={16}>
            <Col span={24}>
              <Input
                value={quayCrane}
                onChange={(e) => set_quay_crane(e.target.value)}
                placeholder="Enter quay crane name"
                size="large"
                style={{ marginBottom: '10px' }}
              />
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: '20px' }}>
            <Col span={12}>
              <Button
                onClick={() => handleRequestType('LXE')}
                type={requestType === 'LXE' ? 'primary' : 'default'}
                size="large"
                style={{ width: '100%' }}
                disabled={!disabledLxe}
              >
                LXE Battery
              </Button>
            </Col>
            <Col span={12}>
              <Button
                onClick={() => handleRequestType('Radio')}
                type={requestType === 'Radio' ? 'primary' : 'default'}
                size="large"
                style={{ width: '100%' }}
                
              >
                Radio Battery
              </Button>
            </Col>
          </Row>

          <Row gutter={16} style={{ marginTop: '20px' }}>
            <Col span={24}>
              <Button
                onClick={handleSubmit1}
                type="primary"
                size="large"
                loading={loading}
                style={{ width: '100%' }}
                disabled={!quayCrane || !requestType || currentShift==="Off"}
              >
                Submit Request
              </Button>
            </Col>
          </Row>
        </div>
      </Modal>

      <Card style={{border:"1px solid #d9d9d9",borderRadius:"10px"}}>
        <Title level={3}>Welcome, {user}</Title>
        <Text strong>Today's Shift:</Text> <Text>{currentShift}</Text>
        <br />
        <Text strong>Next Shift:</Text> <Text>{nextShift}</Text>
      </Card>
      
      {currentShift !== "Off" && (
        <Card style={{ marginTop: 20 ,border:"1px solid #d9d9d9",borderRadius:"10px"}}>
          <Title level={4}>Enter Equipment Details</Title>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Input
              placeholder="Enter Radio Number"
              value={radioNumber}
              onChange={handleRadioInput}
              disabled={shiftStarted}
            />
            {disabledLxe ? (
              <Input
              placeholder="Enter LXE Number"
              value={lxeNumber}
              onChange={handleLxcInput}
              disabled={shiftStarted}
            />
              
            ) : (
              ""
            )}
            
          </Space>
        </Card>
      )}

      {isCompleted ? (
        <Alert
          message="Today's shift completed"
          type="success"
          showIcon
          icon={<CheckCircleTwoTone twoToneColor="#52c41a" />}
          style={{ marginTop: 20 }}
        />
      ) : (
        <Space style={{ marginTop: 20 }}>
          <Button
            type="primary"
            onClick={()=> {
              handleStartShift()
              getLocationName();
            }}
            disabled={currentShift === "Off" || shiftStarted || (radioAssigned && lxcAssigned)}
          >
            {currentShift === "Off" ? "No Shift Today" : "Start Shift"}
          </Button>
          <Button type="default" danger onClick={handleSignOut} disabled={!shiftStarted}>
            Sign Out
          </Button>
          <Button type="primary" onClick={showModal}>Request battery</Button>
        </Space>
      )}

      
        <Card style={{ marginTop: 20 ,border:"1px solid #d9d9d9",borderRadius:"10px"}}>
          <Text strong>Your Current Location:</Text>
          <Text>
          {location.placeName}
          </Text>
          
        </Card>
      
    </div>
  );
}

export default Dashboard;
