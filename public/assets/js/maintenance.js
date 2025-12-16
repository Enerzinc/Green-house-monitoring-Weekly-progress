const SERVER_URL = "http://192.168.125.41:3000";

const modeStatus = document.getElementById("modeStatus");
const feedback   = document.getElementById("feedback");


let list = document.querySelectorAll(".navigation li");

        function activeLink() {
            list.forEach((item) => {
                item.classList.remove("hovered");
            });
            this.classList.add("hovered");
        }

        list.forEach((item) => item.addEventListener("mouseover", activeLink));

        let toggle = document.querySelector(".toggle");
        let navigation = document.querySelector(".navigation");
        let main = document.querySelector(".main");

        toggle.onclick = function () {
            navigation.classList.toggle("active");
            main.classList.toggle("active");
        };
        
let logs = JSON.parse(localStorage.getItem("maintenanceLogs")) || [];
const logModal = document.getElementById("logModal");
const addLogBtn = document.getElementById("addLogBtn");
const cancelLog = document.getElementById("cancelLog");
const saveLog = document.getElementById("saveLog");

const logTask = document.getElementById("logTask");
const logPerson = document.getElementById("logPerson");
const logNotes = document.getElementById("logNotes");

const table = document.getElementById("maintenance-table");
addLogBtn.addEventListener("click", () => {
    logModal.classList.remove("hidden");
});

cancelLog.addEventListener("click", () => {
    logModal.classList.add("hidden");
});


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

    localStorage.setItem("maintenanceLogs", JSON.stringify(logs));

    logTask.value = "";
    logPerson.value = "";
    logNotes.value = "";
    logModal.classList.add("hidden");
    renderLogs();
});

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
renderLogs();


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


// PUMP
document.getElementById("pumpBtn").addEventListener("click", function () {
    toggleControl(this, "Water Pump");

    const isOn = this.classList.contains("active");
    });


// VENT
document.getElementById("ventBtn").addEventListener("click", function () {
    toggleControl(this, "Vent");

    const isOn = this.classList.contains("active");
    });



    // -------------logout button logic -------------
document.getElementById("logoutBtn").addEventListener("click", () => {
const ask = confirm("Are you sure you want to log out?");
if (ask) {
    sessionStorage.clear();
    window.location.href = "../../index.html";
    }
});

document.getElementById("dashboard").addEventListener("click", () => {
    window.location.href = "../pages/dashboard.html";
});

document.getElementById("logs").addEventListener("click", () => {
    window.location.href = "../pages/datalogs.html";
});

document.getElementById("maintenance").addEventListener("click", () => {
    window.location.href = "../pages/maintenance.html";
}); 
document.getElementById("graph").addEventListener("click", () => {
    window.location.href = "../pages/graph.html";
});