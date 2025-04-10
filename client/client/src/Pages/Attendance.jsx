import { useState, useEffect } from "react";
import { Table, Card } from "antd";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "../api/api";
import '../Styles/Attendance.css'; // Assuming you have a CSS file for custom styles

const AttendanceDashboard = () => {
  const [data, setData] = useState([]);
  const [currentMonthCount, setCurrentMonthCount] = useState(0);
  const [lastMonthCount, setLastMonthCount] = useState(0);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await axios.get("/api/attendance/get-attendance", { withCredentials: true });
        setData(response.data);
        console.log(response.data);
        calculateSignInCounts(response.data);  // Calculate the sign-in counts after fetching data
      } catch (error) {
        console.error("Error fetching attendance data:", error);
      }
    };
    fetchAttendanceData();
  }, []);

  const calculateSignInCounts = (attendanceData) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1; // If it's January, last month is December

    const currentMonthSignIns = attendanceData.filter((entry) => {
      const signInDate = new Date(entry.sign_in_time);
      return signInDate.getMonth() === currentMonth;
    }).length;

    const lastMonthSignIns = attendanceData.filter((entry) => {
      const signInDate = new Date(entry.sign_in_time);
      return signInDate.getMonth() === lastMonth;
    }).length;

    setCurrentMonthCount(currentMonthSignIns);
    setLastMonthCount(lastMonthSignIns);
  };

  const columns = [
    { 
      title: "Date", 
      dataIndex: "sign_in_time", 
      key: "date", 
      render: (text) => new Date(text).toLocaleDateString("en-US", { month: "short", day: "numeric" }) 
    },
    { title: "Shift Type", dataIndex: "shiftType", key: "shiftType" },
    { 
      title: "LXE", 
      dataIndex: "Lxe_id", 
      key: "Lxe_id",
      render: (Lxe_id) => Lxe_id?.lxe_number || "N/A" 
    },
    { 
      title: "Radio", 
      dataIndex: "radio_id", 
      key: "radio_id",
      render: (radio_id) => radio_id?.radio_number || "N/A"
    },
    { 
      title: "Location", 
      dataIndex: "location", 
      key: "location",
      render: (text) => text || "N/A"
    },
    { 
      title: "Shift", 
      dataIndex: "shift", 
      key: "shift",
      render: (text) => text || "N/A"
    },
    { 
      title: "Sign-in Time", 
      dataIndex: "sign_in_time", 
      key: "signIn",
      render: (text) => new Date(text).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    },
    { 
      title: "Sign-out Time", 
      dataIndex: "sign_out_time", 
      key: "signOut",
      render: (text) => text ? new Date(text).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "N/A"
    }
  ];

  // Create chart data based on attendance records
  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split("T")[0]; 
  };

  const weeklyAttendance = data.reduce((acc, entry) => {
    if (!entry.sign_in_time) return acc; 

    const weekStart = getWeekStart(entry.sign_in_time);
    const formattedWeek = `Week of ${new Date(weekStart).toDateString().slice(4, 10)}`; 

    if (!acc[formattedWeek]) {
      acc[formattedWeek] = { signIn: 0, dates: [] };
    }

    acc[formattedWeek].signIn += 1;
    acc[formattedWeek].dates.push(new Date(entry.sign_in_time).toDateString().slice(4, 10));

    return acc;
  }, {});

  const chartData = Object.entries(weeklyAttendance).map(([week, data]) => ({
    week,
    signIn: data.signIn,
    dates: [...new Set(data.dates)],
  }));

  chartData.sort((a, b) => {
    const weekNumberA = parseInt(a.week.match(/\d+/)[0], 10);
    const weekNumberB = parseInt(b.week.match(/\d+/)[0], 10);
    return weekNumberA - weekNumberB;
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { week, dates } = payload[0].payload;
      return (
        <div style={{
          backgroundColor: "white",
          padding: "8px",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid #ddd",
          borderRadius: "6px",
        }}>
          <p className="font-semibold">{week}</p>
          <p className="text-gray-600">Sign-ins: {payload[0].value}</p>
          <p className="text-sm text-gray-500">
            Dates: {dates.join(", ")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h2 className="dashboard-title">Device Sign In Records</h2>

      {/* Sign-in Count Cards */}
      <div className="sign-in-cards">
        <Card className="sign-in-card">
          <h3>Total Sign-ins This Month ({new Date().toLocaleString('default', { month: 'long' })}): 
            <span className="count">{currentMonthCount}</span>
          </h3>
        </Card>
        <Card className="sign-in-card">
          <h3>Total Sign-ins Last Month ({new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' })}): 
            <span className="count">{lastMonthCount}</span>
          </h3>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="attendance-table-card">
        <h3 className="table-title">Records</h3>
        <Table dataSource={data} columns={columns} scroll={{ x: 'max-content' }} pagination={{ pageSize: 5 }} rowKey={(record, index) => index} />
      </Card>

      {/* Attendance Chart */}
      <Card className="attendance-chart-card">
        <h3 className="chart-title">Weekly Attendance Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="week" />
            <YAxis allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="signIn" fill="#1890ff" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default AttendanceDashboard;
