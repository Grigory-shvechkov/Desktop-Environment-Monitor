# Indoor weather Monitor

This project is designed to monitor and display environmental data using a **DHT11 Temperature and Humidity Sensor**. The system consists of two main components: a **Client** and a **Server**. 

## Overview

### Client:
The **Client** is designed to run on a **Raspberry Pi** (or any device capable of reading **GPIO pins**) and communicates with the **DHT11 sensor** to gather temperature and humidity data. The client is responsible for reading sensor values and sending them to the **Server** via an API for storage and processing.

### Server:
The **Server** runs on a separate machine and handles the backend operations. It stores the incoming temperature and humidity data from the **Client** into a **MySQL database**. A RESTful API is then set up to handle GET requests, allowing the **React front-end** to retrieve and display the data in real time.

### MySQL Database:
A **MySQL database** is used to store the temperature and humidity readings. The data from the sensor is inserted into the database by the server, ensuring persistent storage and easy retrieval via the API.

### DHT11 Sensor:
The **DHT11 sensor** is a key component in this project. It is used to measure temperature and humidity, which are essential data points that the system tracks and processes.

### Raspberry Pi:
The **Raspberry Pi** serves as the hardware platform running the client application, which reads GPIO pins to interact with the **DHT11 sensor**.

## Key Requirements:
- **DHT11 Sensor**: Crucial for collecting temperature and humidity data.
- **MySQL Database**: Used to store the sensor data and enable fast retrieval via the API.
- **Raspberry Pi (or compatible device)**: The client application that interacts with the DHT11 sensor.
- **API Backend**: The server manages the storage and retrieval of data via a RESTful API.
- **React Front-end**: Displays the data received from the API in real-time.

## How it works:
1. The **client application** on the Raspberry Pi collects data from the **DHT11 sensor**.
2. The client sends this data to the **server**.
3. The **server** processes and stores the data in the **MySQL database**.
4. The **React front-end** retrieves the data by making a GET request to the **server's API**.
5. The data is displayed in the React app, providing real-time monitoring of temperature and humidity.
