import React, { useState, useEffect,useRef } from 'react';
import axios from "../api/api";
import Swal from 'sweetalert2'
import { format } from "date-fns";
import { Layout,Select,Input, Menu, Button,Tooltip, Table, Tabs, Modal, Card, Typography, Space, message } from "antd";
import { UserOutlined, LogoutOutlined, PlusOutlined,BarChartOutlined, DeleteOutlined  } from "@ant-design/icons";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from "recharts";
const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
import '../Styles/AdminDashboard.css';
import {NavLink, useNavigate} from 'react-router-dom'
import useLogout from '../Hooks/Logout';


const AdminDashboard = () => {
  const { Search } = Input;
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ fullname:'', email: '', password:'',role:undefined,group:undefined });
    const [newRadio, setNewRadio] = useState("");
    const [newLxe, setNewLxe] = useState("");
    const [attendance, setAttendance] = useState([]);
    const [isOpen, setIsOpen] = useState(false)
    const [isOpen1, setIsOpen1] = useState(false)
    const [isOpen2, setIsOpen2] = useState(false)
    const [lxe,setLxe] = useState([])
    const [radio,setRadio] = useState([])
    const [user,setUser]=useState("")
    const popupRef = useRef(null);
    const popupRef1 = useRef(null);
    const popupRef2 = useRef(null);
    
    const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [isLxeModalOpen, setLxeModalOpen] = useState(false);
  const [isRadioModalOpen, setRadioModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("1");


  const logout = useLogout();
    axios.defaults.withCredentials= true
    
  // Fetch the login users name on every page refresh
    useEffect(()=>{

        const getUsername = async () => {
          
          try {
             const response= await axios.get("/api/users/me");
             setUser(response.data)
             console.log(response.data)
            
          } catch (error) {
           
            console.log(error)
          }
        };
        getUsername()
      },[])


    //Toggle Add user pop up
    function toggleAddUser(){
        setIsOpen(!isOpen)
    }
    function toggleAddLXE(){
        setIsOpen1(!isOpen1)
    }

    function toggleAddRadio(){
        setIsOpen2(!isOpen2)
    }

    const [searchTerm, setSearchTerm] = useState("");

    // Filter attendance based on the search term
    const filteredAttendance = attendance.filter((record) => {
      if (!searchTerm) return true;
      return record?.userId?.fullname?.toLowerCase().includes(searchTerm.toLowerCase());
    });
    // fetch attendance data
    const fetchAttendance = async () => {
        try{
        const response = await axios.get('/api/attendance');
        setAttendance(response.data);
        console.log(response.data)
        }catch(error){
            console.log(error)
        }
    };

    const deleteAttendance = async (record) => {
        try {
            const response = await axios.delete(`/api/attendance/${record._id}`);
            if (response.status === 200) {
              setAttendance(prev=> prev.filter(item => item._id !== record._id)); // Remove deleted record from state
                message.success("Attendance record deleted successfully!");
                fetchAttendance(); // Refresh attendance data after deletion
            } else {
                message.error("Failed to delete attendance record.");
            }
        }
        catch (error) {
            console.log(error)
        }
      }


      const deleteUser = async (record) => {
        try {
            const response = await axios.delete(`/api/users/${record._id}`);
            if (response.status === 200) {
              setUsers(prev=> prev.filter(item => item._id !== record._id)); // Remove deleted record from state
                message.success("User deleted successfully!");
                getAllusers(); // Refresh user data after deletion
            } else {
                message.error("Failed to delete user.");
            }
        }catch(error){
            console.log(error)
        }
      }

      const deleteLxe = async (record) => {
        try {
            const response = await axios.delete(`/api/lxeRadio/lxe/${record._id}`);
            if (response.status === 200) {
              setLxe(prev=> prev.filter(item => item._id !== record._id)); // Remove deleted record from state
                message.success("LXE deleted successfully!");
                getLxe(); // Refresh user data after deletion
            } else {
                message.error("Failed to delete LXE.");
            }
        }catch(error){
            console.log(error)
        }
      }

      const deleteRadio = async (record) => {
        try {
            const response = await axios.delete(`/api/lxeRadio/radio/${record._id}`);
            if (response.status === 200) {
              setRadio(prev=> prev.filter(item => item._id !== record._id)); // Remove deleted record from state
                message.success("Radio deleted successfully!");
                getRadio(); // Refresh user data after deletion
            } else {
                message.error("Failed to delete Radio.");
            }
        }catch(error){
            console.log(error)
        }
      }

    // fetch all user information
    const getAllusers = async () => {
        try{
            const response = await axios.get('/api/users/get-all-users');
            setUsers(response.data)
            console.log("users",response.data)
        }catch(error){
            console.log(error)
        }
        };

    // Function to get all LXE only executes when it is called
    const navigate = useNavigate()
    const getLxe = async () => {
    try{
        const response = await axios.get('/api/lxeRadio/get-lxes');
      
        setLxe(response.data)
        console.log("lxe",response.data)
    }catch(error){
        console.log(error)
    }
    };


    // Function to get all radio only executes when it is called
    const getRadio = async () => {
        try{
        const response = await axios.get('/api/lxeRadio/get-radios');
        console.log(response.data)
        setRadio(response.data)
        }catch(error){
            console.log(error)
            if(error.status===405){
                Swal.fire({
                    title:"You're not authorized to view this page",
                    icon:"error",
                    timer:3000
                })
                navigate(-1);
                return
            }
        }
    };

    // Fetch all the data once the page is refreshed
    useEffect(()=>{
        getLxe()
        getRadio()
        getAllusers()
        fetchAttendance()
    },[])


    //function to add a new radio
    const postRadio = async () => {
        try{
        const response= await axios.post('/api/lxeRadio/post-radio',{radioNumber:newRadio});
        const Data= response.data.data;
        if(response.status===200){
        setNewRadio('')
        setRadio(prevData => [...Data,...prevData])
        setRadioModalOpen(false)
        message.success("New Radio added!")
        }
        }catch(error){
            console.log(error)
        }
    };


    //Function to add a new LXE
    const postLxe = async () => {
        try{
        const response=await axios.post('/api/lxeRadio/post-lxe',{lxeNumber:newLxe});
         
         const Data=response.data.data
         if(response.status===200){
         setLxe(prevData => [...Data,...prevData])
         message.success("New LXE added!")
         setNewLxe('')
         setLxeModalOpen(false)
         }
        }catch(error){
          message.error("Failed to add LXC")
            console.log(error)
        }
    };

    const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({ fullname: "", chartData: [] });

  const handleAnalytics = (fullname) => {
    // Filter user attendance records
    const userAttendance = attendance.filter(
      (record) => record.userId.fullname === fullname
    );
  
    // Group sign-ins by month
    const monthlySignIns = userAttendance.reduce((acc, entry) => {
      if (!entry.sign_in_time) return acc;
  
      const month = format(new Date(entry.sign_in_time), "MMMM yyyy"); // Example: "March 2025"
      acc[month] = (acc[month] || 0) + 1;
  
      return acc;
    }, {});
  
    // Convert to chart data format
    const chartData = Object.entries(monthlySignIns).map(([month, count]) => ({
      month,
      signIn: count,
    }));
  
    // Set modal data & show modal
    setAnalyticsData({ fullname, chartData });
    setIsModalVisible(true);
  };
  


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };


    // Finction to add a new user
    const handleAddUser = async () => {
        try{
        const response = await axios.post('/api/users/signup', newUser);
        if(response.status===200){
            message.success("New user added!");
            setUserModalOpen(false)
            setUsers(prevData => [response.data.data,...prevData])
         }else{
            message.error("Error adding user !")
         }
        
        setNewUser({ name: '', email: '', password: '' });
        }catch(error){
            if(error.response.status===400 || error.response.status===404){
                message.error("User already exist!")
            }else{
            message.error("Error adding user !");
            console.log(error)
            }  
        }
    };

    

    // Function to handle clicks outside of popups and close them
const handleClickOutside = (event) => {
    // Check if the click happened outside popupRef and close the popup
    if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsOpen(false);
    }
    // Check if the click happened outside popupRef1 and close the popup
    if (popupRef1.current && !popupRef1.current.contains(event.target)) {
        setIsOpen1(false);
    }
    // Check if the click happened outside popupRef2 and close the popup
    if (popupRef2.current && !popupRef2.current.contains(event.target)) {
        setIsOpen2(false);
    }
};

useEffect(() => {
    // Add event listener to detect mouse clicks anywhere in the document
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function to remove event listener when component unmounts
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, []); // Empty dependency array ensures this runs only once when component mounts


    return (
        <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#001529", padding: "0 20px" }}>
          <Title level={3} style={{ color: "white", margin: 0 }}>Admin Dashboard</Title>
          <Space>
            
            
            <Button icon={<LogoutOutlined />} onClick={logout} danger>Logout</Button>
            <Button 
              shape="circle" 
              style={{ width: 30, height: 30, padding: 0, textAlign: 'center' }}
            >
              <span style={{ fontSize: '18px', color: '#222' }}>{user[0]}</span>
            </Button>
          </Space>
        </Header>
  
        <Layout>
          <Sider width={200} className="side" style={{ background: "#fff",paddingTop:"30px" }}>
            <Menu mode="inline" selectedKeys={[activeTab]} className="side" onClick={(e) => setActiveTab(e.key)}>
              <Menu.Item key="1">Attendance</Menu.Item>
              <Menu.Item key="2">Users</Menu.Item>
              <Menu.Item key="3">Radio</Menu.Item>
              <Menu.Item key="4">LXE</Menu.Item>
            </Menu>
            <NavLink to="/reports" style={{ textDecoration: "none", color: "#333" }}>
              <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: "20px", width: "100%" }} >Reports</Button>
            </NavLink>
          </Sider>
  

      
          <Layout style={{ padding: "24px" }}>
         
            <Content>
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
              
                <TabPane tab="Attendance" key="1">
                 {/* Search Bar */}
      <Search
        placeholder="Search by Fullname"
        allowClear
        enterButton="Search"
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16, width: 300 }}
      />
                <Table
  dataSource={filteredAttendance}
  scroll={{ x: 'max-content' }}
  columns={[
    { title: "Name", dataIndex: ["userId", "fullname"], key: "name" },
    { title: "Session", dataIndex: "shiftType", key: "session" },
    { title: "Location", dataIndex: "location", key: "location" },
    {
      title: "Sign in",
      dataIndex: "sign_in_time",
      key: "signIn",
      render: (text) =>
        text ? format(new Date(text), "MMMM d, yyyy h:mm a") : "-",
    },
    {
      title: "Sign out",
      dataIndex: "sign_out_time",
      key: "signOut",
      render: (text) =>
        text ? format(new Date(text), "MMMM d, yyyy h:mm a") : "-",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Tooltip title="View Analytics">
            <Button
              type="primary"
              icon={<BarChartOutlined />}
              onClick={() => handleAnalytics(record.userId.fullname)}
            />
          </Tooltip>
          <Tooltip title="Delete Record">
            <Button
              type="danger"
              icon={<DeleteOutlined />}
              onClick={() => deleteAttendance(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ]}
/>
                </TabPane>
                <TabPane tab="Users" key="2">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setUserModalOpen(true)}>Add User</Button>
                  <Table
  dataSource={users}
  scroll={{ x: 'max-content' }}
  columns={[
    { title: "Name", dataIndex: "fullname", key: "fullname" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Tooltip title="Delete User">
          <Button
            type="danger"
            icon={<DeleteOutlined />}
            onClick={() => deleteUser(record)}
          />
        </Tooltip>
      ),
    },
  ]}
/>
                </TabPane>
                <TabPane tab="Radio" key="3">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setRadioModalOpen(true)}>Add Radio</Button>
                  <Table
  dataSource={radio}
  scroll={{ x: 'max-content' }}
  columns={[
    { title: "Radio Number", dataIndex: "radio_number", key: "radio_number" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Tooltip title="Delete Radio">
          <Button
            type="danger"
            icon={<DeleteOutlined />}
            onClick={() => deleteRadio(record)}
          />
        </Tooltip>
      ),
    },
  ]}
/>
                </TabPane>
                <TabPane tab="LXE" key="4">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setLxeModalOpen(true)}>Add LXE</Button>
                  <Table
                    dataSource={lxe}
                    
                    columns={[
                      { title: "LXE Number", dataIndex: "lxe_number", key: "lxe_number" },
                      {
                        title: "Action",
                        key: "action",
                        render: (_, record) => (
                          <Tooltip title="Delete LXE">
                            <Button
                              type="danger"
                              icon={<DeleteOutlined />}
                              onClick={() => deleteLxe(record)}
                            />
                          </Tooltip>
                        ),
                      },
                    ]}
                  />
                </TabPane>
              </Tabs>
            </Content>
          </Layout>
        </Layout>
  
        {/* Add User Modal */}
        <Modal title="Add User" visible={isUserModalOpen} onCancel={() => setUserModalOpen(false)} footer={null}>
  <Input placeholder="Name" type="text" value={newUser.fullname} onChange={(e) => setNewUser({...newUser,fullname:e.target.value})} style={{ marginBottom: 10 }} />
  <Input placeholder="Email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser,email:e.target.value})} style={{ marginBottom: 10 }} />
  <Input placeholder="Password" type="password" value={newUser.password} onChange={(e) =>  setNewUser({...newUser,password:e.target.value})} style={{ marginBottom: 10 }} />

  <Select placeholder="Select Role"  value={newUser.role} onChange={(value) => setNewUser({ ...newUser, role: value })} style={{ width: '100%', marginBottom: 10 }}>
    <Select.Option value="Supervisor" >Supervisor</Select.Option>
    <Select.Option value="Admin">Admin</Select.Option>
    <Select.Option value="Lasher">Lasher</Select.Option>
    <Select.Option value="Clerk">Clerk</Select.Option>
    <Select.Option value="Worker">Worker</Select.Option>
  </Select>

  <Select placeholder="Select Group"  value={newUser.group} onChange={(value) => setNewUser({ ...newUser, group: value })} style={{ width: '100%', marginBottom: 10 }}>
    <Select.Option value="Red Eagle">Red Eagle</Select.Option>
    <Select.Option value="Blue Falcon">Blue Falcon</Select.Option>
    <Select.Option value="White Ox">White Ox</Select.Option>
  </Select>

  <Button type="primary" block onClick={handleAddUser}>Add User</Button>

  
</Modal>

{/* Analytics Modal */}
<Modal
  title={`Attendance Analytics - ${analyticsData.fullname}`}
  open={isModalVisible}
  onCancel={() => setIsModalVisible(false)}
  footer={null}
  width={600}
>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={analyticsData.chartData}>
      <XAxis dataKey="month" />
      <YAxis allowDecimals={false} />
      <RechartsTooltip />
      <Bar dataKey="signIn" fill="#1890ff" barSize={40} />
    </BarChart>
  </ResponsiveContainer>
</Modal>

  
        {/* Add LXE Modal */}
        <Modal title="Add LXE" open={isLxeModalOpen} onCancel={() => setLxeModalOpen(false)} footer={null}>
          <Input placeholder="LXE Number" value={newLxe} onChange={(e)=> setNewLxe(e.target.value)} style={{ marginBottom: 10 }} />
          <Button type="primary" block onClick={postLxe}>Add LXE</Button>
        </Modal>
  
        {/* Add Radio Modal */}
        <Modal title="Add Radio" visible={isRadioModalOpen} onCancel={() => setRadioModalOpen(false)} footer={null}>
          <Input placeholder="Radio Number" value={newRadio} onChange={(e)=> setNewRadio(e.target.value)} style={{ marginBottom: 10 }} />
          <Button type="primary" block onClick={postRadio}>Add Radio</Button>
        </Modal>
      </Layout>
    );
};

export default AdminDashboard;