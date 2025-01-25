import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart } from '@mui/x-charts/LineChart';
import { Container, Paper, Typography, Box } from '@mui/material';

const SensorData = () => {
  const [error, setError] = useState(null);
  const [timestamps, setTimestamps] = useState([]); // Store all x-axis (timestamps)
  const [temperatures, setTemperatures] = useState([]); // Store all y-axis (temperatures)

  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get('http://192.168.0.187:3000/items') // Replace with your actual API endpoint
        .then((response) => {
          const data = response.data;

          const newTimestamp = formatTimestamp(new Date()); // Use the current timestamp
          const newTemperature = data.temperature; // Get the temperature from the response

          setTimestamps((prevTimestamps) => [...prevTimestamps, newTimestamp]); // Keep all timestamps
          setTemperatures((prevTemperatures) => [...prevTemperatures, newTemperature]); // Keep all temperatures
        })
        .catch((err) => {
          setError('Error fetching data');
          console.error(err);
        });
    }, 5000); // Fetch data every 5 second

    return () => clearInterval(interval);
  }, []);

  // Function to format the time as hour.minutes.seconds
  const formatTimestamp = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Combine the time into fractional format (hour.minutesseconds)
    const fractionalTime = `${hours}.${minutes
      .toString()
      .padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
    return fractionalTime;
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div
      style={{
        background: 'linear-gradient(45deg, #FF7F50, #8A2BE2)', // Orange to Purple Gradient
        height: '100vh',
        transition: 'background 2s ease', // Smooth transition for background
      }}
    >
      <Container maxWidth="md" sx={{ paddingTop: 4 }}>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Typography variant="h4" color="primary" gutterBottom>
            Sensor Data Over Time
          </Typography>

          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="h6" color="textSecondary">
              Real-time Temperature Data
            </Typography>
          </Box>

          <div style={{ width: '100%' }}>
            {/* LineChart component with timestamps and temperatures */}
            <LineChart
              xAxis={[
                { data: timestamps, label: 'Time (Hour.MinutesSeconds)' },
              ]} // X-axis as formatted timestamps
              series={[
                { data: temperatures, label: 'Temperature (°C)' },
              ]} // Y-axis as temperatures
              width={850} // Increased width to fit the expanding timeline
              height={400} // Height for better visibility
            />
          </div>
        </Paper>
      </Container>
    </div>
  );
};

export default SensorData;
