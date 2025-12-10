document.getElementById("downloadCsvBtn").addEventListener("click", () => {
const rows = [
    ["Time", "Temperature", "Humidity", "Soil %", "Soil Raw", "Light", "Rain"],
    ...dummyLogs.map(d => [
        d.time,
        d.temperature,
        d.humidity,
        d.soilPercent + "%",
        d.soilRaw,
        d.light,
        d.rain ? "Rain" : "No Rain"
    ])
];
let csvContent = "data:text/csv;charset=utf-8,"
    + rows.map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "datalogs.csv");
    link.click();
});



// DUMMY SENSOR DATA 
const dummyLogs = [
  {
    time: "2025-12-10 08:10 AM",
    temperature: 28,
    humidity: 65,
    soilPercent: 30,
    soilRaw: 720,
    light: 850,
    rain: false
  },
  {
    time: "2025-12-10 08:00 AM",
    temperature: 27,
    humidity: 64,
    soilPercent: 32,
    soilRaw: 710,
    light: 830,
    rain: false
  },
  {
    time: "2025-12-10 07:50 AM",
    temperature: 26.5,
    humidity: 67,
    soilPercent: 33,
    soilRaw: 705,
    light: 810,
    rain: false
  },
  {
    time: "2025-12-10 07:40 AM",
    temperature: 26,
    humidity: 68,
    soilPercent: 35,
    soilRaw: 700,
    light: 790,
    rain: false
  },
  {
    time: "2025-12-10 07:30 AM",
    temperature: 25.8,
    humidity: 70,
    soilPercent: 40,
    soilRaw: 690,
    light: 760,
    rain: true
  }
];

// TABLE RENDERER FUNCTION
function loadDummyTable() {
  const tbody = document.getElementById("data-table");

  tbody.innerHTML = dummyLogs
    .map(
      (d) => `
      <tr class="border-b text-sm">
        <td class="py-2">${d.time}</td>
        <td class="py-2">${d.temperature}</td>
        <td class="py-2">${d.humidity}</td>
        <td class="py-2">${d.soilPercent}%</td>
        <td class="py-2">${d.soilRaw}</td>
        <td class="py-2">${d.light}</td>
        <td class="py-2">${d.rain ? "🌧️" : "☀️"}</td>
      </tr>
      `
    )
    .join("");
}

// RUN TABLE ON PAGE LOAD
loadDummyTable();

