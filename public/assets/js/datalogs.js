// ==================== 1. CONFIGURATION ====================
const SERVER_URL = window.location.origin;

// ==================== 2. HELPER FUNCTIONS ====================

function convertToPercent(value) {
    let percent = Math.round((value / 1024) * 100);
    if (percent > 100) percent = 100;
    if (percent < 0) percent = 0;
    return percent;
}

function formatDate(isoString) {
    if (!isoString) return "--";
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: 'short', day: 'numeric', 
        hour: 'numeric', minute: 'numeric', hour12: true 
    });
}

// ==================== 3. FETCH & DISPLAY LOGS ====================
async function fetchLogs() {
    try {
        const response = await fetch(`${SERVER_URL}/api/logs`);
        const logs = await response.json();


        const tbody = document.getElementById("logsTableBody") || document.getElementById("data-table");
        
        if (!tbody) {
            console.error("❌ Error: Could not find table body element.");
            return;
        }

        tbody.innerHTML = "";

        logs.forEach(log => {
            const soilPercent = convertToPercent(log.soil);
            const isRaining = (String(log.rain) === "true");

            const html = `
                <tr>
                    <td>${formatDate(log.timestamp || log.ts)}</td>
                    <td>${log.temp ?? "--"} °C</td>
                    <td>${log.humid ?? "--"} %</td>
                    <td style="${soilPercent < 20 ? 'color:red;' : ''}">${soilPercent} %</td>
                    <td>${log.soil ?? "--"}</td>
                    <td>${log.light ?? "--"} lux</td>
                    <td style="${isRaining ? 'color:blue; font-weight:bold;' : ''}">
                        ${isRaining ? "Yes" : "No"}
                    </td>
                </tr>
            `;
            tbody.innerHTML += html;
        });

    } catch (error) {
        console.error("Error fetching logs:", error);
    }
}

// ==================== 4. CSV DOWNLOAD LOGIC ====================
const downloadBtn = document.getElementById("downloadCsvBtn");

if (downloadBtn) {
    downloadBtn.addEventListener("click", async () => {
        try {
            const response = await fetch(`${SERVER_URL}/api/logs`);
            const logs = await response.json();

            const rows = [
                ["Timestamp", "Temp (C)", "Humidity (%)", "Soil (%)", "Raw Soil", "Light", "Rain"],
                ...logs.map(d => [
                    formatDate(d.timestamp || d.ts).replace(",", ""),
                    d.temp,
                    d.humid,
                    convertToPercent(d.soil),
                    d.soil,
                    d.light,
                    (String(d.rain) === "true") ? "Yes" : "No"
                ])
            ];

            let csvContent = "data:text/csv;charset=utf-8," 
                + rows.map(e => e.join(",")).join("\n");

            const link = document.createElement("a");
            link.href = encodeURI(csvContent);
            link.download = "greenhouse_logs.csv";
            link.click();
        } catch(err) {
            alert("Error downloading CSV");
        }
    });
}

let list = document.querySelectorAll(".navigation li");
let toggle = document.querySelector(".toggle");
let navigation = document.querySelector(".navigation");
let main = document.querySelector(".main");

function activeLink() {
    list.forEach((item) => item.classList.remove("hovered"));
    this.classList.add("hovered");
}
list.forEach((item) => item.addEventListener("mouseover", activeLink));

if(toggle) {
    toggle.onclick = function () {
        navigation.classList.toggle("active");
        main.classList.toggle("active");
    };
}


function bindRedirect(id, path) {
    const el = document.getElementById(id);
    if(el) {
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
if(logoutBtn) {
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
    fetchLogs();
    setInterval(fetchLogs, 5000);
});

document.getElementById("downloadPdfBtn").addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text("Plantelligence - Sensor Logs", 14, 15);

    let y = 25;
    const rows = document.querySelectorAll("#data-table tr");

    rows.forEach((row) => {
        const cols = row.querySelectorAll("td");
        let line = "";

        cols.forEach((col) => {
            line += col.innerText + " | ";
        });

        doc.text(line, 14, y);
        y += 8;

        if (y > 280) {
            doc.addPage();
            y = 20;
        }
    });

    doc.save("sensor-logs.pdf");
});
