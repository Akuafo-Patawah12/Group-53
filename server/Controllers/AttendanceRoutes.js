const express = require('express');
const router = express.Router();
const moment = require('moment');
const Attendance = require('../Models/Attendance');
const { RadioSchema, LxeSchema } = require('../Models/Radio&Lxe');
const verifyAdmin = require('../Middleware/Adminware');
const verifyRefreshToken = require('../Middleware/Middleware');
// Record attendance for a user




// Mark sign-out for attendance
router.put('/:attendance_id',verifyAdmin, async (req, res) => {
  const { attendance_id } = req.params;
  const { sign_out_time } = req.body;

  try {
    
    const attendance = await Attendance.findByIdAndUpdate(
      attendance_id,
      { sign_out_time },
      { new: true }
    );
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error updating attendance', error });
  }
});

router.get('/get-attendance',verifyRefreshToken, async (req, res)=>{
  const userId= req.user.id
  try{
    const attendance = await Attendance.find({ userId })
      .populate({
        path: 'radio_id',
        select: 'radio_number', // Only fetch the radio_number field
      })
      .populate({
        path: 'Lxe_id',
        select: 'lxe_number', // Only fetch the lxeNumber field
      });

      console.log("Attendance Record:", attendance);
    if (!attendance) {
      console.log("Attendance not found")
      return res.status(404).json({ message: 'Attendance not found' });
    }
    res.status(200).json(attendance)
  }catch(error){
    console.log("Error getting attendance",error)
    res.status(500).json({message: 'Error getting attendace', error})
  }
  
})

router.delete("/:id",verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the attendance record exists
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      console.log("Attendance record not found")
      return res.status(404).json({ message: "Attendance record not found" });
    }

    // Delete the record
    await Attendance.findByIdAndDelete(id);
    res.status(200).json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get('/', verifyAdmin, async (req, res) => {
  try {
    const attendance = await Attendance.find({}).populate('userId', 'fullname'); // Populate userId with only the username field
    res.status(200).json(attendance);
  } catch (error) {
    res.status(500).json({ message: 'Error getting attendance', error });
  }
});



router.get('/report', async (req, res) => {
  const { month, year } = req.query;

  // Validate month and year
  if (!month || !year) {
    return res.status(400).json({ error: 'Month and Year are required' });
  }

  const startOfMonth = new Date(year, month - 1, 1); // Start of the month
  const endOfMonth = new Date(year, month, 0); // End of the month
  console.log('Start of Month:', startOfMonth, 'End of Month:', endOfMonth); // Log the start and end dates
  try {
    // Fetch attendance records for the selected month and year
    const attendanceRecords = await Attendance.find({
      sign_in_time: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .populate('userId', 'fullname email') // Populate user data
      .populate('Lxe_id', 'lxe_number location') // Populate LXE data
      .populate('radio_id', 'radio_number'); // Populate Radio data

    // Late sign-ins logic (Morning shift should sign in by 8 AM, Evening shift by 7 PM)
    const lateSignIns = attendanceRecords.filter((record) => {
      const signInTime = new Date(record.sign_in_time);
      if (record.shiftType === 'Morning') {
        return signInTime.getHours() >= 8; // Check if sign-in is after 8 AM
      } else if (record.shiftType === 'Evening') {
        return signInTime.getHours() >= 19; // Check if sign-in is after 7 PM
      }
      return false;
    });

    // Missing sign-outs logic (records with no sign-out time)
    const missingSignOuts = attendanceRecords.filter((record) => !record.sign_out_time);

    // Usage stats (LXE and Radio count)
    const usageStats = attendanceRecords.reduce((acc, record) => {
      // LXE usage count
      if (record.Lxe_id) {
        acc.LXE = acc.LXE || {};
        acc.LXE[record.Lxe_id.lxe_number] = (acc.LXE[record.Lxe_id.lxe_number] || 0) + 1;
      }

      // Radio usage count
      if (record.radio_id) {
        acc.Radio = acc.Radio || {};
        acc.Radio[record.radio_id.radio_number] = (acc.Radio[record.radio_id.radio_number] || 0) + 1;
      }

      return acc;
    }, {});

    // Convert usageStats into arrays for LXE and Radio
    const lxeUsage = Object.keys(usageStats.LXE || {}).map((lxeNumber) => ({
      LXE: lxeNumber,
      count: usageStats.LXE[lxeNumber],
    }));

    const radioUsage = Object.keys(usageStats.Radio || {}).map((radioNumber) => ({
      Radio: radioNumber,
      count: usageStats.Radio[radioNumber],
    }));

    // Prepare the final report data
    const reportData = {
      lateSignIns,
      missingSignOuts,
      usageStats: {
        LXE: lxeUsage,
        Radio: radioUsage,
      },
    };

    res.status(200).json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});


router.get('/details', async (req, res) => {
  const { LXE, Radio, month, year } = req.query;
  console.log(LXE, Radio, month, year);

  if (!month || !year) {
    return res.status(400).json({ error: 'Month and year are required.' });
  }

  const formattedMonth = String(month).padStart(2, '0');
  const startOfMonth = moment(`${year}-${formattedMonth}-01`).startOf('month');
  const endOfMonth = moment(startOfMonth).endOf('month');

  const query = {
    sign_in_time: {
      $gte: startOfMonth.toDate(),
      $lte: endOfMonth.toDate(),
    },
  };

  try {
    let radio, lxe;

    if (LXE) {
      lxe = await LxeSchema.findOne({ lxe_number: LXE });
      if (!lxe) return res.status(404).json({ error: 'LXE not found' });
      query.Lxe_id = lxe._id;
    }

    if (Radio) {
      radio = await RadioSchema.findOne({ radio_number: Radio });
      if (!radio) return res.status(404).json({ error: 'Radio not found' });
      query.radio_id = radio._id;
    }
    console.log('Final Query:', query);

    const attendance = await Attendance.find(query).populate('userId', 'fullname email');
    res.status(200).json(attendance);
    console.log(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});






module.exports = router;
