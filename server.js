const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); 

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/greenhouse')
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Error:', err));

const SensorSchema = new mongoose.Schema({
  mode: String,
  temp: Number,
  humid: Number,
  light: Number,
  soil: Number,
  rain: Boolean,
  arduino_ts: Number,
  timestamp: { type: Date, default: Date.now } 
});
const SensorData = mongoose.model('Sensor', SensorSchema);

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

let nextCommand = "NONE"; 

// ================= ROUTES =================

app.post('/api/sensors', async (req, res) => {
  console.log('📥 Data Received:', req.body);
  try {
    const newData = new SensorData({
      mode: req.body.mode,
      temp: parseFloat(req.body.temp),
      humid: parseFloat(req.body.humid),
      light: parseInt(req.body.light),
      soil: parseInt(req.body.soil),
      rain: (req.body.rain === "true"),
      arduino_ts: req.body.ts
    });
    await newData.save();
  } catch (error) { console.error('⚠️ Save Error:', error); }

  if (nextCommand !== "NONE") {
    console.log(`📤 Sending Command: ${nextCommand}`);
    res.json({ status: "ok", cmd: nextCommand });
    nextCommand = "NONE";
  } else {
    res.json({ status: "ok", cmd: "CONTINUE" });
  }
});

app.get('/control/:mode', (req, res) => {
  const m = req.params.mode;
  if(m === 'on') nextCommand = "SET_ON";
  else if(m === 'maintenance') nextCommand = "SET_MAINT";
  else if(m === 'sleep') nextCommand = "SET_SLEEP";
  res.send(`Command Queued: ${nextCommand}`);
});

app.get('/api/latest', async (req, res) => {
  try {
    const data = await SensorData.findOne().sort({ timestamp: -1 });
    res.json(data);
  } catch (error) { res.status(500).json({ error: "DB Error" }); }
});

app.get('/api/logs', async (req, res) => {
  try {
    const logs = await SensorData.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) { res.status(500).json({ error: "DB Error" }); }
});


app.use(express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.get("/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "public/pages/dashboard.html"))
);

app.get("/logs", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/datalogs.html"));
});

app.get("/maintenance", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/maintenance.html"));
});

app.get("/graph", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/graph.html"));
});

app.get("/sensors", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/sensors.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "pages/login.html"));
});

// ================= START SERVER =================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server Running at http://localhost:${PORT}`);
});