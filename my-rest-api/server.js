// Import express package to create a web server
const express = require('express');
const mysql = require('mysql2'); // Import MySQL client (mysql2)
 const cors = require('cors');  // Import CORS middleware
// Initialize express app
const app = express();
const port = 3000;  // Define the port where the server will run


 app.use(cors());

// Sample in-memory data (an array of items)
// let items = [
//     { id: 1, name: 'Item 1' },
//     { id: 2, name: 'Item 2' }
// ];



// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',        // MySQL server host
    user: 'tUSERNAME',             // Your MySQL username
    password: 'YOUR_PASSWORD',             // Your MySQL password
    database: 'sensor_data'          // The database to use
  });


// Establish connection to MySQL server
connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL database:', err);
      return;
    }
    console.log('Connected to MySQL database');
  });

  // Define a GET route to fetch all items
  app.get('/items', (req, res) => {
    // Query to fetch the most recent reading from the 'sensor_data' table
    connection.query('SELECT * FROM sensor_data ORDER BY timestamp DESC LIMIT 1', (err, results) => {
      if (err) {
        res.status(500).send('Error fetching data');
        return;
      }
  
      if (results.length === 0) {
        res.status(404).send('No sensor data found');
        return;
      }
  
      res.json(results[0]);  // Respond with the most recent reading as JSON
    });
  });

// Middleware to parse incoming JSON data in request body
app.use(express.json());

// GET /items - Fetch all items
// app.get('/items', (req, res) => {
//     res.json(items);  // Respond with the items as a JSON array
// });

// GET /items/:id - Fetch a specific item by ID
// app.get('/items/:id', (req, res) => {
//     const item = items.find(i => i.id === parseInt(req.params.id));
//     if (item) {
//         res.json(item);  // Respond with the item if found
//     } else {
//         res.status(404).send('Item not found');  // Return 404 if the item doesn't exist
//     }
// });

// // POST /items - Add a new item
// app.post('/items', (req, res) => {
//     const newItem = {
//         id: items.length + 1,  // New ID based on length of existing items
//         name: req.body.name  // Use the name sent in the request body
//     };
//     items.push(newItem);  // Add the new item to the in-memory data
//     res.status(201).json(newItem);  // Respond with the new item and a 201 status code (created)
// });

// // DELETE /items/:id - Delete an item by ID
// app.delete('/items/:id', (req, res) => {
//     items = items.filter(i => i.id !== parseInt(req.params.id));  // Filter out the item to delete
//     res.status(204).send();  // Respond with a 204 No Content status (successful deletion)
// });

// Start the server and listen on port 3000
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

