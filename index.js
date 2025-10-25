const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve static HTML

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'SqlCoxatBMW', // change if needed
  database: 'WeatherStation'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL connected.');
});

// Route to receive ESP8266 data
app.post('/submit', (req, res) => {
    const { temperature, humidity } = req.body;
  
    // Check if temperature and humidity are provided
    if (!temperature || !humidity) {
      console.log("ESP8266 missing parameters!");
      return res.status(400).json({ error: "Missing parameters" });
    }
  
    const query = 'INSERT INTO readings (temperature, humidity) VALUES (?, ?)';
    db.query(query, [temperature, humidity], (err) => {
      if (err) {
        console.log("ESP8266 database error!");
        return res.status(500).json({ error: "Database error" });
      }
      res.json({ message: "Data received and saved" });
    });
  });

// Route to get history for chart
app.get('/history', (req, res) => {
  db.query('SELECT timestamp, temperature, humidity FROM readings ORDER BY timestamp DESC', (err, results) => {
    if (err) return res.status(500).send("Database error");
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
