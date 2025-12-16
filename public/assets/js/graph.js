// ==================== Navigation Logic ====================
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

// ==================== REAL LIVE GRAPH LOGIC ====================

const SERVER_URL = window.location.origin;

let labels = [];
let tempData = [];
let humData = [];
let soilData = [];
let lightData = [];

let tempChart, humChart, soilChart, lightChart;

async function loadLogs() {
    try {
        const response = await fetch(`${SERVER_URL}/api/logs`);
        const logs = await response.json();

        labels = logs.map(l => new Date(l.timestamp).toLocaleTimeString());
        tempData = logs.map(l => l.temp);
        humData = logs.map(l => l.humid);
        soilData = logs.map(l => l.soil);      
        lightData = logs.map(l => l.light || 0); 

        updateCharts();

    } catch (error) {
        console.error("Error loading graph logs:", error);
    }
}

function createCharts() {
    const options = { responsive: true };

    tempChart = new Chart(document.getElementById("tempChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Temperature (°C)",
                data: tempData,
                borderColor: "#f44336",
                backgroundColor: "#f4433653",
                fill: true
            }]
        },
        options
    });

    humChart = new Chart(document.getElementById("humChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Humidity (%)",
                data: humData,
                borderColor: "#2196f3",
                backgroundColor: "#1a5f989a",
                fill: true
            }]
        },
        options
    });

    soilChart = new Chart(document.getElementById("soilChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Soil Moisture",
                data: soilData,
                borderColor: "#4caf50"
            }]
        },
        options
    });

    lightChart = new Chart(document.getElementById("lightChart"), {
        type: "line",
        data: {
            labels,
            datasets: [{
                label: "Light Level",
                data: lightData,
                borderColor: "#ff9800"
            }]
        },
        options
    });
}

function updateCharts() {
    if (!tempChart) return;

    tempChart.data.labels = labels;
    tempChart.data.datasets[0].data = tempData;
    tempChart.update();

    humChart.data.labels = labels;
    humChart.data.datasets[0].data = humData;
    humChart.update();

    soilChart.data.labels = labels;
    soilChart.data.datasets[0].data = soilData;
    soilChart.update();

    lightChart.data.labels = labels;
    lightChart.data.datasets[0].data = lightData;
    lightChart.update();
}

async function initGraphs() {
    await loadLogs();  
    createCharts();    
}

initGraphs();

setInterval(loadLogs, 3);

async function loadLogs() {
    try {
        const response = await fetch(`${SERVER_URL}/api/logs`);
        const logs = await response.json();

        labels = logs.map(l => new Date(l.timestamp).toLocaleTimeString());
        tempData = logs.map(l => l.temp);
        humData = logs.map(l => l.humid);
        soilData = logs.map(l => l.soil);
        lightData = logs.map(l => l.light ?? 0);

        updateCharts();

    } catch (error) {
        console.error("Graph Fetch Error:", error);
    }
}

// ==================== DATE FILTER (Optional) ====================
document.getElementById("filterBtn").addEventListener("click", () => {
    alert("Date filter requires backend support. Currently disabled.");
});


// ==================== Logout & Navigation Buttons ====================
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
