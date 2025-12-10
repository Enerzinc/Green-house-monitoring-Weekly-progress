// ===============================
// MAINTENANCE LOG SYSTEM
// ===============================

// Load logs from localStorage or create empty list
let logs = JSON.parse(localStorage.getItem("maintenanceLogs")) || [];

// HTML elements
const logModal = document.getElementById("logModal");
const addLogBtn = document.getElementById("addLogBtn");
const cancelLog = document.getElementById("cancelLog");
const saveLog = document.getElementById("saveLog");

const logTask = document.getElementById("logTask");
const logPerson = document.getElementById("logPerson");
const logNotes = document.getElementById("logNotes");

const table = document.getElementById("maintenance-table");

// Show modal
addLogBtn.addEventListener("click", () => {
    logModal.classList.remove("hidden");
});

// Hide modal
cancelLog.addEventListener("click", () => {
    logModal.classList.add("hidden");
});

// Save log
saveLog.addEventListener("click", () => {
    const task = logTask.value.trim();
    const person = logPerson.value.trim();
    const notes = logNotes.value.trim();

    if (!task || !person) {
        alert("Task and Performed By are required.");
        return;
    }

    const newLog = {
        date: new Date().toLocaleString(),
        task,
        person,
        notes
    };

    logs.push(newLog);

    // // Save to localStorage
    localStorage.setItem("maintenanceLogs", JSON.stringify(logs));

    // Clear inputs
    logTask.value = "";
    logPerson.value = "";
    logNotes.value = "";
    logModal.classList.add("hidden");
    renderLogs();
});
// Render the logs to the table
function renderLogs() {
    table.innerHTML = logs
    .map(
        (log) => `
        <tr class="border-b text-sm">
            <td class="py-2">${log.date}</td>
            <td class="py-2">${log.task}</td>
            <td class="py-2">${log.person}</td>
            <td class="py-2">${log.notes || "—"}</td>
        </tr>
        `
    )
    .join("");
}

// Load on page startup
renderLogs();
// ===============================

// Utility: Toggle button state + style
function toggleControl(btn, deviceName) {
  const isActive = btn.classList.contains("active");

  if (!isActive) {
    btn.classList.add("active");
    btn.classList.add("opacity-80");
    btn.textContent = `${deviceName} (ON)`;
  } else {
    btn.classList.remove("active");
    btn.classList.remove("opacity-80");
    btn.textContent = `${deviceName}`;
  }
}

// Example function to send commands to ESP32 API
async function sendToDevice(endpoint, state) {
    try {
        // Example: change URL to your actual ESP32 endpoint
        const res = await fetch(`http://192.168.4.1/${endpoint}?state=${state}`);
        console.log(await res.text());
    } catch (err) {
        console.error("Device unreachable:", err);
    }
}

// PUMP
document.getElementById("pumpBtn").addEventListener("click", function () {
    toggleControl(this, "Water Pump");

    const isOn = this.classList.contains("active");
    // sendToDevice("pump", isOn ? "on" : "off");
    });


// VENT
document.getElementById("ventBtn").addEventListener("click", function () {
    toggleControl(this, "Vent");

    const isOn = this.classList.contains("active");
    // sendToDevice("vent", isOn ? "open" : "close");
    });
