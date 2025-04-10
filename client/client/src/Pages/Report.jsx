import React, { useEffect, useState } from 'react';
import { DatePicker, Table,Modal, Row, Col, Spin, message } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import axios from '../api/api'; // Adjust the import path as necessary
import moment from 'moment';

const AttendanceReport = () => {
  const [reportData, setReportData] = useState({
    lateSignIns: [],
    missingSignOuts: [],
    usageStats: { LXE: [], Radio: [] },
  });
  const [selectedMonth, setSelectedMonth] = useState('3'); // Default March
  const [selectedYear, setSelectedYear] = useState('2025');
  const [attendanceDetails, setAttendanceDetails] = useState([]);
  axios.defaults.withCredentials = true;

  const fetchReportData = async () => {
    if (!selectedMonth || !selectedYear) return;
    const response = await axios.get(`/api/attendance/report?month=${selectedMonth}&year=${selectedYear}`);
    if (response.status === 200) {
      setReportData(response.data); 
    } else {
      message.error('Failed to fetch report data');
    }
  };


  const [isModalVisible,setIsModalVisible] = useState(false)
  const [modalTitle,setModalTitle] = useState("")
  const fetchAttendanceByLxeOrRadio = async (lxeOrRadioNumber, type) => {
    try {
      const response = await axios.get(`/api/attendance/details?${type}=${lxeOrRadioNumber}&month=${selectedMonth}&year=${selectedYear}`);
      if (response.status === 200) {
        setAttendanceDetails(response.data);
        setModalTitle(`${type}: ${lxeOrRadioNumber}`);
        setIsModalVisible(true);
      } else {
        message.error('Failed to fetch attendance data');
      }
    } catch (error) {
      message.error('Error fetching attendance data');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth, selectedYear]);

  const handleDateChange = (date) => {
    setSelectedMonth(date.format('MM'));
    setSelectedYear(date.format('YYYY'));
  };

  // Handle click on bar (LXE or Radio)
  const handleBarClick = (data, type) => {
    console.log('Bar click data:', data); // Check what data is being passed
    if (data && data[type]) {
      const number = data[type];
      fetchAttendanceByLxeOrRadio(number, type);
    } else {
      console.error('Invalid data or missing type:', data);
    }
  };

  const lateSignInColumns = [
    {
      title: 'Name',
      dataIndex: 'userId',
      key: 'fullname',
      render: (user) => user?.fullname || 'N/A',
    },
    {
      title: 'Email',
      dataIndex: 'userId',
      key: 'email',
      render: (user) => user?.email || 'N/A',
    },
    { title: 'Shift', dataIndex: 'shiftType', key: 'shiftType' },
    { title: 'Sign-In Time', dataIndex: 'sign_in_time', key: 'sign_in_time', render: (text) => moment(text).format('MMM YYYY hh:mm A') },
    { title: 'Sign-Out Time', dataIndex: 'sign_out_time', key: 'sign_out_time', render: (text) => text ? moment(text).format('MMM YYYY hh:mm A') : 'N/A' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
  ];

  const modalColumns = [
  {
    title: 'Full Name',
    dataIndex: 'userId',
    key: 'fullname',
    render: (user) => user?.fullname || 'N/A',
  },
  {
    title: 'Email',
    dataIndex: 'userId',
    key: 'email',
    render: (user) => user?.email || 'N/A',
  },
  {
    title: 'Sign-In Time',
    dataIndex: 'sign_in_time',
    key: 'sign_in_time',
    render: (text) => moment(text).format('YYYY-MM-DD hh:mm A'),
  },
  {
    title: 'Sign-Out Time',
    dataIndex: 'sign_out_time',
    key: 'sign_out_time',
    render: (text) => text ? moment(text).format('YYYY-MM-DD hh:mm A') : 'N/A',
  },
  {
    title: 'Shift',
    dataIndex: 'shiftType',
    key: 'shiftType',
  },
  {
    title: 'Location',
    dataIndex: 'location',
    key: 'location',
  },
];


  return (
    <div style={{ padding: '20px' }}>

<Modal
  title={`Monthly report - ${modalTitle}`}
  open={isModalVisible}
  onCancel={() => setIsModalVisible(false)}
  footer={null}
  width={900}
>
  <Table
    dataSource={attendanceDetails}
    columns={modalColumns}
    rowKey="_id"
    scroll={{ x: true }}
    pagination={{ pageSize: 5 }}
  />
</Modal>

      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Monthly Report</h2>
        <Row gutter={16} style={{ width: "150px", height: "50px", alignItems: 'center' }}>
          <Col span={24}>
            <DatePicker
              value={moment(`${selectedYear}-${selectedMonth}`, 'YYYY-MM')}
              onChange={handleDateChange}
              picker="month"
              format="YYYY-MM"
            />
          </Col>
        </Row>
      </section>

      {reportData ? (
        <>
          <div style={{ marginTop: '20px', height: 400 }}>
            <h3>LXE Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.usageStats.LXE}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="LXE" 
                  tickFormatter={(value) => `LXE-${value}`} // Adds "Radio-" to the label
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8"
                  
                  barSize={40}
                      onClick={(e) => handleBarClick(e, 'LXE')}
                   
                  />
               
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '20px', height: 400 }}>
            <h3>Radio Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.usageStats.Radio}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Radio" 
                  tickFormatter={(value) => `Radio-${value}`} // Adds "Radio-" to the label
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d"
                      barSize={40}
                      onClick={(e) => handleBarClick(e, 'Radio')}
                  
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3>Late Sign-Ins</h3>
            <Table dataSource={reportData?.lateSignIns || []} scroll={{ x: 'max-content' }} columns={lateSignInColumns} rowKey="_id" />
          </div>

          
        </>
      ) : (
        <Spin size="large" />
      )}
    </div>
  );
};

export default AttendanceReport;
