const express = require("express")
const router = express.Router()
const Attendance = require("../Models/Attendance");
const verifyRefreshToken = require("../Middleware/Middleware");
const user= require("../Models/User")
const { RadioSchema, LxeSchema } = require('../Models/Radio&Lxe');
require("dotenv").config()
const nodemailer = require("nodemailer")


router.post("/start-shift", verifyRefreshToken, async (req, res) => {
  const { currentShift, lxeNumber, radioNumber, location } = req.body;
  const userId = req.user?.id;

  console.log(" Request Body:", req.body);
  console.log("User ID from Token:", userId);

  if (!currentShift || !userId) {
    return res.status(400).json({ message: "Missing shift type or user ID." });
  }

  try {
    // Find the radio
    const radio = await RadioSchema.findOne({ radio_number: radioNumber.trim().toUpperCase() });
    if (!radio) {
      console.log(" Radio not found:", radioNumber);
      return res.status(404).json({ message: "The provided radio number was not found." });
    }

    // Find the LXE (optional)
    let lxe = null;
    if (lxeNumber && lxeNumber.trim() !== "") {
      lxe = await LxeSchema.findOne({ lxe_number: lxeNumber.trim().toUpperCase() });
      if (!lxe) {
        console.log(" LXE not found:", lxeNumber);
        return res.status(404).json({ message: "The provided LXE number was not found." });
      }
    }

    // Check if radio or LXE is already in use today
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);

    const conditions = [{ radio_number: radioNumber }];
    if (lxeNumber && lxeNumber !== "") {
      conditions.push({ lxe_number: lxeNumber });
    }

    const existingUsage = await Attendance.findOne({
      $or: conditions,
      sign_out_time: null,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (existingUsage) {
      console.log(" Active radio or LXE found:", existingUsage);
      return res.status(400).json({ message: "Radio or LXE is already active in a shift today." });
    }

    // Check if user already has an active shift
    const activeUserShift = await Attendance.findOne({ userId, sign_out_time: null });
    if (activeUserShift) {
      console.log("User already on a shift:", activeUserShift);
      return res.status(400).json({ message: "You already have an active shift." });
    }

    // Create and save the shift
    const newShift = new Attendance({
      userId,
      Lxe_id: lxe?._id || null,
      radio_id: radio._id,
      location,
      shiftType: currentShift,
      sign_in_time: new Date(),
      shift: "Started",
      sign_out_time: null,
    });

    await newShift.save();

    console.log("✅ Shift started successfully:", newShift);
    res.status(200).json({ message: "Shift started successfully.", shift: newShift });

  } catch (error) {
    console.error("🔥 Error starting shift:", error);
    res.status(500).json({ message: "Internal server error while starting shift.", error });
  }
});



router.get("/check-shift", verifyRefreshToken, async (req, res) => {
    const userId = req.user.id;
  
    try {
      const now = new Date();
  
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
  
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
  
      const todayShift = await Attendance.findOne({
        userId,
        sign_in_time: { $gte: startOfDay, $lte: endOfDay },
      });
  
      if (!todayShift) {
        return res.status(404).json({ message: "No shift started today." });
      }
  
      const signInTime = new Date(todayShift.sign_in_time);
      const signInHour = signInTime.getHours();
      let shiftEnd;
  
      // Determine shift type based on sign-in hour
      if (signInHour >= 8 && signInHour < 19) {
        // Morning shift
        shiftEnd = new Date(signInTime);
        shiftEnd.setHours(18, 45, 0, 0); // 6:45 PM same day
      } else {
        // Evening shift
        shiftEnd = new Date(signInTime);
        shiftEnd.setDate(shiftEnd.getDate() + 1); // Next day
        shiftEnd.setHours(8, 45, 0, 0); // 8:45 AM next day
      }
  
      // If user hasn't signed out
      if (todayShift.sign_out_time === null) {
        if (now > shiftEnd) {
          // Shift has ended but user did not sign out — mark it as undefined
          todayShift.sign_out_time = undefined;
          await todayShift.save();
  
          return res.status(202).json({
            message: "Shift ended. User did not sign out. Marked as missed sign-out.",
          });
        }
  
        return res.status(200).json({
          message: "User is currently on shift. Shift has not ended yet.",
        });
      }
  
      // User has already signed out
      return res.status(201).json({
        message: "User has already signed out today.",
      });
  
    } catch (error) {
      console.error("Error checking today's shift", error);
      return res.status(500).json({
        message: "Error checking today's shift.",
        error,
      });
    }
  });
  





router.post("/end-shift", verifyRefreshToken,async (req,res)=>{
const  userId  = req.user.id;

    try {
        // Find the ongoing shift for the user
        const ongoingShift = await Attendance.findOne({ userId, sign_out_time: null });
        if (!ongoingShift) {
            return res.status(400).json({ message: "No ongoing shift found for the user." });
        }

        // End the shift
        ongoingShift.sign_out_time = new Date();
        ongoingShift.shift = "Completed";

        await ongoingShift.save();

        res.status(200).json({ message: "Shift ended successfully.", shift: ongoingShift });
    } catch (error) {
        res.status(500).json({ message: "Error ending shift.", error });
    }

})

router.post('/submit-request',verifyRefreshToken, async (req, res) => {
    const { quayCrane, requestType } = req.body;
    const userId = req.user.id
  
    if (!quayCrane || !requestType) {
      return res.status(400).json({ error: 'Email and request type are required' });
    }
  
    // Simulate saving the request in the database
    try {

      const users = await user.findById(userId)
      if (!users) return res.status(401).json({message: "Unauthorized"})
      // Here you can save the request to your database
      // Example: await Request.create({ email, requestType });
        // Send the reset email with the token
          const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,//email that will be sending messages from the server to the client
                pass: process.env.PASSWORD  //generated password form less secured apps from Google
            },
            tls: {
                rejectUnauthorized: false, //do not reject self-signed certificates  
              },
          });
      
          console.log(requestType)
      
          const mailOptions = {
            from: '"Do Not Reply" <' + users.email + '>',
            to: process.env.EMAIL,
            subject: requestType,
            text: `${requestType}" "Battery request ${quayCrane}`,
          };
      
          await transporter.sendMail(mailOptions);
      
          
        
      // Send a success response
      res.status(200).json({ message: 'Request submitted successfully' });
    } catch (error) {
      console.error('Error submitting request:', error);
      res.status(500).json({ error: 'Failed to submit request' });
    }
  });

module.exports = router