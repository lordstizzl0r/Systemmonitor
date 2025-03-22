const { ipcRenderer } = require("electron");

// UI Elements
const cpuValue = document.getElementById("cpu-value");
const cpuBar = document.getElementById("cpu-bar");
const memoryValue = document.getElementById("memory-value");
const memoryBar = document.getElementById("memory-bar");
const diskValue = document.getElementById("disk-value");
const diskBar = document.getElementById("disk-bar");
const networkValue = document.getElementById("network-value");
const networkBar = document.getElementById("network-bar");
const expandButton = document.getElementById("expand-button");
const detailedStats = document.getElementById("detailed-stats");
const processList = document.getElementById("process-list");

// Initialize charts
let cpuChart, memoryChart, networkChart, temperatureChart;
const maxDataPoints = 60; // 1 minute of data
const initialData = Array(maxDataPoints).fill(0);
const timeLabels = Array(maxDataPoints).fill("");

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 0,
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(255, 255, 255, 0.1)",
      },
      ticks: {
        color: "rgba(255, 255, 255, 0.7)",
      },
    },
    x: {
      display: false,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

function createChart(ctx, label, color, data = [...initialData]) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [
        {
          label: label,
          data: data,
          borderColor: color,
          backgroundColor: color + "20",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: chartOptions,
  });
}

function initializeCharts() {
  const cpuCtx = document.getElementById("cpuChart").getContext("2d");
  const memoryCtx = document.getElementById("memoryChart").getContext("2d");
  const networkCtx = document.getElementById("networkChart").getContext("2d");
  const temperatureCtx = document
    .getElementById("temperatureChart")
    .getContext("2d");

  cpuChart = createChart(cpuCtx, "CPU Usage", "#00ff95");
  memoryChart = createChart(memoryCtx, "Memory Usage", "#00a6ff");
  networkChart = createChart(networkCtx, "Network Usage", "#ffe600");
  temperatureChart = createChart(temperatureCtx, "CPU Temperature", "#ff00ea");
}

// Handle window expansion
expandButton.addEventListener("click", () => {
  ipcRenderer.send("toggle-expand");
});

ipcRenderer.on("expansion-state-changed", (event, isExpanded) => {
  document.body.classList.toggle("expanded", isExpanded);
  expandButton.innerHTML = isExpanded ? "⤡" : "⤢";
  if (isExpanded && !cpuChart) {
    initializeCharts();
  }
});

function updateCharts(info) {
  if (!cpuChart) return;

  // Update CPU chart
  cpuChart.data.datasets[0].data.shift();
  cpuChart.data.datasets[0].data.push(info.cpu);
  cpuChart.update();

  // Update Memory chart
  memoryChart.data.datasets[0].data.shift();
  memoryChart.data.datasets[0].data.push(info.memory);
  memoryChart.update();

  // Update Network chart
  networkChart.data.datasets[0].data.shift();
  networkChart.data.datasets[0].data.push(info.network.up + info.network.down);
  networkChart.update();

  // Update Temperature chart
  temperatureChart.data.datasets[0].data.shift();
  temperatureChart.data.datasets[0].data.push(info.cpuTemp);
  temperatureChart.update();
}

// Update system information
async function updateSystemInfo() {
  const info = await ipcRenderer.invoke("get-system-info");

  // Update basic metrics
  cpuValue.textContent = `${info.cpu}%`;
  cpuBar.style.width = `${info.cpu}%`;

  memoryValue.textContent = `${info.memory}%`;
  memoryBar.style.width = `${info.memory}%`;

  diskValue.textContent = `${info.disk}%`;
  diskBar.style.width = `${info.disk}%`;

  const networkSpeed = info.network.up + info.network.down;
  networkValue.textContent = `${networkSpeed} KB/s`;
  networkBar.style.width = `${Math.min((networkSpeed / 1000) * 100, 100)}%`;

  // Update detailed information
  detailedStats.innerHTML = `
        <div class="stat-card">
            <span>CPU Temperature</span>
            <span>${info.cpuTemp}°C</span>
        </div>
        <div class="stat-card">
            <span>Memory Usage</span>
            <span>${info.memoryUsed}GB / ${info.memoryTotal}GB</span>
        </div>
        <div class="stat-card">
            <span>Disk Usage</span>
            <span>${info.diskUsed}GB / ${info.diskTotal}GB</span>
        </div>
        <div class="stat-card">
            <span>Network Speed</span>
            <span>↑${info.network.up}KB/s ↓${info.network.down}KB/s</span>
        </div>
    `;

  // Update process list
  processList.innerHTML = info.topProcesses
    .map(
      (process) => `
        <div class="process-item">
            <span>${process.name}</span>
            <span>CPU: ${process.cpu}% | MEM: ${process.mem}%</span>
        </div>
    `
    )
    .join("");

  // Update charts
  updateCharts(info);
}

// Update every second
setInterval(updateSystemInfo, 1000);
updateSystemInfo(); // Initial update

// Handle PayPal Donation Button
const donateButton = document.getElementById("donate-button");
if (donateButton) {
  donateButton.addEventListener("click", async () => {
    // Ersetze diese E-Mail mit deiner tatsächlichen PayPal-E-Mail
    const paypalDonateUrl =
      "https://www.paypal.com/donate/?business=mail@seelmeyer-it.de&item_name=System+Monitor+App&currency_code=EUR";

    try {
      // Verwende die sichere IPC-Methode zum Öffnen externer Links
      await ipcRenderer.invoke("open-external-link", paypalDonateUrl);
    } catch (error) {
      console.error("Fehler beim Öffnen des PayPal-Links:", error);
    }
  });
}
