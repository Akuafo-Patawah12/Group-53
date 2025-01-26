import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ fullname: '', email: '', password:'' });
    const [newRadio, setNewRadio] = useState("");
    const [newLxc, setNewLxc] = useState("");
    const [attendance, setAttendance] = useState([]);

    
    axios.defaults.withCredentials= true
    const fetchUsers = async () => {
        const response = await axios.get('/api/users');
        setUsers(response.data);
    };

    const fetchAttendance = async () => {
        const response = await axios.get('/api/users/attendance');
        setAttendance(response.data);
    };

    const postLxc = async () => {
        const response = await axios.post('/api/users/attendance');
        alert(response.data)
    };
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleAddUser = async () => {
        await axios.post('/api/users', newUser);
        fetchUsers();
        setNewUser({ name: '', email: '', password: '' });
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <div className="add-user">
                <h2>Add User</h2>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    value={newUser.name}
                    onChange={handleInputChange}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="password"
                    placeholder="Password"
                    value={newUser.password}
                    onChange={handleInputChange}
                />
                <button onClick={handleAddUser}>Add User</button>
            </div>

            <div className="add-user">
                <h2>Add Lxc</h2>
              
                <input
                    type="text"
                    name="lxc"
                    placeholder="LXC"
                    value={newLxc}
                    onChange={(e) => setNewLxc(e.target.value)}
                />
                
                <button onClick={handleAddUser}>Add User</button>
            </div>

            <div className="add-user">
                <h2>Add Lxc</h2>
               
               
                <input
                    type="text"
                    name="radioNumber"
                    placeholder="Radio Number"
                    value={newRadio}
                    onChange={(e) => setNewRadio(e.target.value)}
                />
                <button onClick={handleAddUser}>Add Radio</button>
            </div>

            <div className="users-list">
                <h2>Users</h2>
                <ul>
                    {users?.map((user) => (
                        <li key={user.id}>{user?.name} - {user?.lxc} - {user?.radioNumber}</li>
                    ))}
                </ul>
            </div>
            <div className="attendance-list">
                <h2>Attendance</h2>
                <ul>
                    {attendance?.map((record) => (
                        <li key={record.id}>{record?.userName} - {record?.date}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AdminDashboard;