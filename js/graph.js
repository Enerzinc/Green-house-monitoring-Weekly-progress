// const ctx = document.getElementById('tempChart').getContext('2d');
// const ctx2 = document.getElementById('humChart').getContext('2d');
// const ctx3 = document.getElementById('soilChart').getContext('2d');
// const ctx4 = document.getElementById('lightChart').getContext('2d');

// function createCharts() {
//     const options = { responsive: true };
//     tempChart = new Chart(ctx, {
//         type: 'line',
//         data: { labels, datasets: [{ label: "Temperature", data: tempData, borderColor: "#f44336" , fill:true}] },
//         options
//     });
//     humChart = new Chart(ctx2, {
//         type: 'line',
//         data: { labels, datasets: [{ label: "Humidity", data: humData, borderColor: "#2196f3", fill:true }] },
//         options
//     });
//     soilChart = new Chart(ctx3, {
//         type: 'line',
//         data: { labels, datasets: [{ label: "Soil Moisture", data: soilData, borderColor: "#4caf50", fill:true }] },
//         options
//     });
//     lightChart = new Chart(ctx4, {
//         type: 'line',
//         data: { labels, datasets: [{ label: "Light", data: lightData, borderColor: "#ff9800", fill:true }] },
//         options
//     });
// }
// createCharts();



// DUMMY LOG DATA
const dummyLogs = [
  { time: "2025-12-10 08:10", temperature: 28, humidity: 65, soilPercent: 30, light: 850 },
  { time: "2025-12-10 08:00", temperature: 27, humidity: 64, soilPercent: 32, light: 830 },
  { time: "2025-12-10 07:50", temperature: 26.5, humidity: 67, soilPercent: 33, light: 810 },
  { time: "2025-12-10 07:40", temperature: 26, humidity: 68, soilPercent: 35, light: 790 },
  { time: "2025-12-10 07:30", temperature: 25.8, humidity: 70, soilPercent: 40, light: 760 }
];

// Convert dummy time to labels
const labels = dummyLogs.map(d => d.time);

// Extract datasets
const tempData = dummyLogs.map(d => d.temperature);
const humData = dummyLogs.map(d => d.humidity);
const soilData = dummyLogs.map(d => d.soilPercent);
const lightData = dummyLogs.map(d => d.light);

// Chart Instances
let tempChart, humChart, soilChart, lightChart;

function createCharts() {
  const options = { responsive: true };

  tempChart = new Chart(document.getElementById('tempChart'), {
    type: 'line',
    data: { labels, datasets: [{ label: "Temperature", data: tempData, borderColor: "#f44336" , backgroundColor:"#f4433653", fill:true}] },
    options
  });

  humChart = new Chart(document.getElementById('humChart'), {
    type: 'line',
    data: { labels, datasets: [{ label: "Humidity", data: humData, borderColor: "#2196f3" }] },
    options
  });

  soilChart = new Chart(document.getElementById('soilChart'), {
    type: 'line',
    data: { labels, datasets: [{ label: "Soil Moisture", data: soilData, borderColor: "#4caf50" }] },
    options
  });

  lightChart = new Chart(document.getElementById('lightChart'), {
    type: 'line',
    data: { labels, datasets: [{ label: "Light", data: lightData, borderColor: "#ff9800" }] },
    options
  });
}

createCharts();

// Date Filter (still works with dummy data)
document.getElementById("filterBtn").addEventListener("click", () => {
  alert("Date filter works only with real database. Dummy mode active.");
});
