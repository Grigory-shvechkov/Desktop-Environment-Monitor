import React, { useEffect, useState } from 'react';
import axios from 'axios';  // If you're using axios
import { LineChart } from '@mui/x-charts/LineChart';
import { Container, Paper, Typography, Box } from '@mui/material';

const SensorData = () => {
  // State to store fetched sensor data and chart data
  const [sensorData, setSensorData] = useState(null);
  const [error, setError] = useState(null);
  const [timestamps, setTimestamps] = useState([]); // Store the x-axis (timestamps)
  const [temperatures, setTemperatures] = useState([]); // Store the y-axis (temperatures)

  // Fetch data when the component mounts and periodically
  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get('http://192.168.0.187:3000/items')  // Replace with your actual API endpoint
        .then((response) => {
          const data = response.data;  // Access the data from the response object

          setSensorData(data); // Store the fetched data in the state

          const newTimestamp = formatTimestamp(data.timestamp);  // Format the timestamp
          const newTemperature = data.temperature;  // Get the temperature from the response

          setTimestamps((prevTimestamps) => [...prevTimestamps, newTimestamp]); // Add to timestamps
          setTemperatures((prevTemperatures) => [...prevTemperatures, newTemperature]); // Add to temperatures
        })
        .catch((err) => {
          setError('Error fetching data');
          console.error(err);
        });
    }, 15000); // Fetch data every 15 seconds

    // Clean up interval when component is unmounted
    return () => clearInterval(interval);
  }, []); // Empty dependency array, so it only runs once

  // Function to format timestamp to get the hour and minutes in the "hours.minutes" format
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const estDate = new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const hours = estDate.getHours(); // Get the hour
    const minutes = estDate.getMinutes(); // Get the minutes

    // Return formatted timestamp as "hours.minutes"
    return `${hours}.${minutes < 10 ? '0' : ''}${minutes}`;  // Ensures 2 digits for minutes
  };

  if (error) {
    return <div>{error}</div>;
  }

  // This renders an empty graph if there's no data yet
  return (
    <div
      style={{
        background: 'linear-gradient(45deg, #FF7F50, #8A2BE2)', // Orange to Purple Gradient
        height: '100vh',
        transition: 'background 2s ease',  // Smooth transition for background
      }}
    >
      <Container maxWidth="md" sx={{ paddingTop: 4 }}>
        <Paper elevation={3} sx={{ padding: 3, textAlign: 'center', borderRadius: 2, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Sensor Data Over Time
          </Typography>

          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="h6" color="textSecondary">
              Real-time Temperature Data 
            </Typography>
          </Box>

          <div style={{ width: '100%' }}>
            {/* LineChart component with initial empty data */}
            <LineChart
              xAxis={[{ data: timestamps }]} // X-axis as the array of formatted timestamps (hours.minutes)
              series={[{ data: temperatures }]} // Y-axis as the array of temperatures
              width={600}  // Fixed width (in pixels)
              height={400} // Increased height for better visibility
            />
          </div>
        </Paper>
      </Container>
    </div>
  );
};

export default SensorData;
