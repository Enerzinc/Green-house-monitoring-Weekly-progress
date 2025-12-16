// ==================== 1. CONFIGURATION ====================
const SERVER_URL = "http://192.168.125.41:3000";
// const response = await fetch(`${SERVER_URL}/api/sensors/latest`);

// GLOBAL VARIABLES
let knobSoil = null;
let knobHumidity = null;
let knobLight = null;
let knobTemp = null;

const modeText   = document.getElementById("modeText");

const MODE_MAP = {
  AUTO: "Automatic",
  MAINT: "Maintenance",
  SLEEP: "Sleep"
};

// ==================== 2. KNOB SETUP ====================
function createKnob(id, color, min, max) {
    const element = document.getElementById(id);
    if (!element || typeof pureknob === "undefined") return null;

    element.innerHTML = "";

    const knob = pureknob.createKnob(100, 100);
    knob.setProperty("angleStart", -0.75 * Math.PI);
    knob.setProperty("angleEnd", 0.75 * Math.PI);
    knob.setProperty("colorFG", color);
    knob.setProperty("trackWidth", 0.4);
    knob.setProperty("valMin", min);
    knob.setProperty("valMax", max);
    knob.setProperty("textScale", 0.0);

    element.appendChild(knob.node());
    return knob;
}

function initKnobs() {
    knobSoil     = createKnob("knobSoil",     "#31694E", 0, 100);
    knobHumidity = createKnob("knobHumidity", "#BBC863", 0, 100);
    knobLight    = createKnob("knobLight",    "#FFC107", 0, 1000);
    knobTemp     = createKnob("knobTemp",     "#31694E", 0, 50);
}

function convertToPercent(value) {
    let percent = Math.round((value / 1024) * 100);
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;
    return percent;
}

// ==================== 3. DATA FETCHING & STATUS ====================
function updateSystemStatus(soilPercent, temp, isRaining) {
    const recText = document.getElementById("recText");
    const recIcon = document.querySelector(".rec-icon");
    if (!recText) return;

    if (soilPercent < 20) {
        recText.innerText = "Critical: Soil Dry";
        recText.style.color = "#e74c3c";
        if (recIcon) recIcon.style.color = "#e74c3c";
    } else if (temp > 35) {
        recText.innerText = "Warning: High Temp";
        recText.style.color = "#e67e22";
        if (recIcon) recIcon.style.color = "#e67e22";
    } else if (isRaining) {
        recText.innerText = "Status: Raining";
        recText.style.color = "#3498db";
        if (recIcon) recIcon.style.color = "#3498db";
    } else {
        recText.innerText = "System Healthy";
        recText.style.color = "#2ecc71";
        if (recIcon) recIcon.style.color = "#2ecc71";
    }
}

async function fetchLatestData() {
    try {
        const response = await fetch(`${SERVER_URL}/api/latest`);
        if (!response.ok) return;

        const data = await response.json();
        if (!data) return;

        // -------- SENSOR DATA --------
        const soilPercent = convertToPercent(data.soil || 0);
        const isRaining = data.rain === true || data.rain === "true";

        // Knobs
        knobSoil?.setValue(soilPercent);
        knobHumidity?.setValue(data.humid || 0);
        knobTemp?.setValue(data.temp || 0);
        knobLight?.setValue(data.light || 0);

        // Text values
        document.getElementById("percentSoil").innerText = soilPercent + "%";
        document.getElementById("percentHumidity").innerText = (data.humid ?? 0) + "%";
        document.getElementById("percentTemp").innerText = (data.temp ?? 0) + "°C";
        document.getElementById("percentLight").innerText = (data.light ?? 0) + " lux";

        // Rain status
        const rainText = document.getElementById("rainStatusText");
        const rainCard = document.getElementById("cardRain");
        rainText.innerText = isRaining ? "Raining" : "No Rain";
        rainCard.classList.toggle("raining", isRaining);
    } catch (err) {
        console.error("Fetch error:", err);
    }
}
// ==================== REAL-TIME MODE ====================
async function fetchCurrentMode() {
    try {
        const res = await fetch(`${SERVER_URL}/api/status`);
        if (!res.ok) return;

        const data = await res.json();
        if (!data.mode) return;

        const rawMode = String(data.mode).trim().toUpperCase();

        const MODE_MAP = {
            AUTO: "Automatic",
            MAINT: "Maintenance",
            SLEEP: "Sleep"
        };

        modeText.innerText = MODE_MAP[rawMode] || "Unknown";

    } catch (err) {
        console.error("Mode fetch error:", err);
    }
}


// ==================== 4. CLOCK LOGIC ====================
function updateClock() {
    const now = new Date();
    document.getElementById("clockTime").innerText =
        now.toLocaleTimeString("en-US", { hour12: false });

    document.getElementById("clockDate").innerText =
        now.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric"
        });
}

// ==================== 5. INTERACTION (BUTTONS) ====================

// Menu Toggle
const toggle = document.querySelector(".toggle");
const navigation = document.querySelector(".navigation");
const main = document.querySelector(".main");
if (toggle) {
    toggle.onclick = function () {
        navigation.classList.toggle("active");
        main.classList.toggle("active");
    };
}


// Navigation Links
function bindRedirect(id, path) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = path;
        });
    }
}
bindRedirect("dashboard", "/dashboard");
bindRedirect("logs", "/logs");
bindRedirect("maintenance", "/maintenance");
bindRedirect("graph", "/graph");

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (confirm("Are you sure you want to log out?")) {
            sessionStorage.clear();
            window.location.href = "/";
        }
    });
}

// ==================== 6. STARTUP ====================
document.addEventListener("DOMContentLoaded", () => {
    initKnobs();

    fetchLatestData();
    setInterval(fetchLatestData, 2000);
    
    fetchCurrentMode();                 // ⭐ ADD
    setInterval(fetchCurrentMode, 1000); // ⭐ ADD

    updateClock();
    setInterval(updateClock, 1000);
});
