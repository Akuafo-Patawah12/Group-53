const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connect= require("./Connection")
const cors = require('cors')
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // For parsing JSON request bodies
app.use(cookieParser()); // For parsing cookies
app.use(cors({
  origin: process.env.REACT_APP_API_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))




// Import routes
const authRoutes = require('./Controllers/AuthRoutes');
const userRoutes = require('./Controllers/UserRoutes');

const attendanceRoutes = require('./Controllers/AttendanceRoutes');

const adminRoutes = require('./Controllers/AdminRoutes');
const shiftRoutes =require('./Controllers/ShiftRoute')


// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use('/api/attendance', attendanceRoutes);

app.use('/api/lxeRadio', adminRoutes);
app.use('/api/shift', shiftRoutes);





// Start the server
async  function start(){
try{
    await connect()
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
}catch(error){
    console.log(error)
}
}
start()
