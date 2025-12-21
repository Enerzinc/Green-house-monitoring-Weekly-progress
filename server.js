const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); 
let currentMode = "UNKNOWN";

const app = express();
const PORT = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/greenhouse_v2')
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

let nextMode = null;
// ================= ROUTES =================

// website → server
app.post("/api/mode", (req, res) => {
  nextMode = req.body.mode; // "AUTO" | "MAINT" | "SLEEP"
  res.json({ ok: true });
});


app.post('/api/sensors', async (req, res) => {
  console.log('📥 Data Received:', req.body);
    // ⭐ UPDATE REAL-TIME MODE STATE
  if (req.body.mode) {
    currentMode = req.body.mode;
  }
  try {
    const payload = {
      mode: req.body.mode,
      arduino_ts: req.body.ts,
      timestamp: new Date() // CRITICAL
    };

    if (req.body.temp !== undefined && !isNaN(req.body.temp))
      payload.temp = Number(req.body.temp);

    if (req.body.humid !== undefined && !isNaN(req.body.humid))
      payload.humid = Number(req.body.humid);

    if (req.body.light !== undefined && !isNaN(req.body.light))
      payload.light = Number(req.body.light);

    if (req.body.soil !== undefined && !isNaN(req.body.soil))
      payload.soil = Number(req.body.soil);

    if (req.body.rain !== undefined)
      payload.rain = req.body.rain === true || req.body.rain === "true";

    const newData = new SensorData(payload);
    await newData.save();

    console.log("✅ Data Saved:", payload);

  } catch (err) {
    console.error("❌ Save Error:", err);
  }

  res.json({ status: "ok" });
});


app.get("/api/status", (req, res) => {
  res.json({
    mode: currentMode
  });
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
