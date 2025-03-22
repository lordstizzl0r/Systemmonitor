const { ipcRenderer } = require('electron');

// Maximum number of data points to keep in charts
const MAX_DATA_POINTS = 60;

// Chart configuration
const chartConfig = {
    type: 'line',
    options: {
        animation: false, // Disable animations for better performance
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                display: false,
                type: 'time',
                time: {
                    unit: 'second'
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#94a3b8'
                }
            }
        }
    }
};

// Initialize charts
const charts = {
    cpu: new Chart(document.getElementById('cpuChart').getContext('2d'), {
        ...chartConfig,
        data: {
            datasets: [{
                data: [],
                borderColor: '#00ff95',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                backgroundColor: 'rgba(0, 255, 149, 0.1)'
            }]
        },
        options: {
            ...chartConfig.options,
            scales: {
                ...chartConfig.options.scales,
                y: {
                    ...chartConfig.options.scales.y,
                    max: 100
                }
            }
        }
    }),
    memory: new Chart(document.getElementById('memoryChart').getContext('2d'), {
        ...chartConfig,
        data: {
            datasets: [{
                data: [],
                borderColor: '#00a6ff',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                backgroundColor: 'rgba(0, 166, 255, 0.1)'
            }]
        },
        options: {
            ...chartConfig.options,
            scales: {
                ...chartConfig.options.scales,
                y: {
                    ...chartConfig.options.scales.y,
                    max: 100
                }
            }
        }
    }),
    disk: new Chart(document.getElementById('diskChart').getContext('2d'), {
        ...chartConfig,
        data: {
            datasets: [{
                data: [],
                borderColor: '#ff00ea',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                backgroundColor: 'rgba(255, 0, 234, 0.1)'
            }]
        },
        options: {
            ...chartConfig.options,
            scales: {
                ...chartConfig.options.scales,
                y: {
                    ...chartConfig.options.scales.y,
                    max: 100
                }
            }
        }
    }),
    network: new Chart(document.getElementById('networkChart').getContext('2d'), {
        ...chartConfig,
        data: {
            datasets: [
                {
                    label: 'Upload',
                    data: [],
                    borderColor: '#ffe600',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    backgroundColor: 'rgba(255, 230, 0, 0.1)'
                },
                {
                    label: 'Download',
                    data: [],
                    borderColor: '#00ff95',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: true,
                    backgroundColor: 'rgba(0, 255, 149, 0.1)'
                }
            ]
        }
    })
};

// Elements cache
const elements = {
    cpu: {
        usage: document.getElementById('cpu-usage'),
        temp: document.getElementById('cpu-temp')
    },
    memory: {
        usage: document.getElementById('memory-usage'),
        total: document.getElementById('memory-total')
    },
    disk: {
        usage: document.getElementById('disk-usage'),
        total: document.getElementById('disk-total')
    },
    network: {
        up: document.getElementById('network-up'),
        down: document.getElementById('network-down')
    },
    processList: document.getElementById('process-list')
};

// Close button handler
document.getElementById('close-button').addEventListener('click', () => {
    window.close();
});

// Update charts with new data
function updateCharts(info) {
    const timestamp = new Date();

    // Update CPU chart
    charts.cpu.data.datasets[0].data.push({
        x: timestamp,
        y: info.cpu
    });
    if (charts.cpu.data.datasets[0].data.length > MAX_DATA_POINTS) {
        charts.cpu.data.datasets[0].data.shift();
    }
    charts.cpu.update('none'); // Use 'none' mode for better performance

    // Update Memory chart
    charts.memory.data.datasets[0].data.push({
        x: timestamp,
        y: info.memory
    });
    if (charts.memory.data.datasets[0].data.length > MAX_DATA_POINTS) {
        charts.memory.data.datasets[0].data.shift();
    }
    charts.memory.update('none');

    // Update Disk chart
    charts.disk.data.datasets[0].data.push({
        x: timestamp,
        y: info.disk
    });
    if (charts.disk.data.datasets[0].data.length > MAX_DATA_POINTS) {
        charts.disk.data.datasets[0].data.shift();
    }
    charts.disk.update('none');

    // Update Network chart
    charts.network.data.datasets[0].data.push({
        x: timestamp,
        y: info.network.up
    });
    charts.network.data.datasets[1].data.push({
        x: timestamp,
        y: info.network.down
    });
    if (charts.network.data.datasets[0].data.length > MAX_DATA_POINTS) {
        charts.network.data.datasets[0].data.shift();
        charts.network.data.datasets[1].data.shift();
    }
    charts.network.update('none');
}

// Format bytes to appropriate unit
function formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }
    
    return `${Math.round(value)} ${units[unitIndex]}`;
}

// Update UI with system information
let updateTimeout = null;
async function updateSystemInfo() {
    try {
        const info = await ipcRenderer.invoke('get-system-info');
        
        // Update stats
        elements.cpu.usage.textContent = `${info.cpu}%`;
        elements.cpu.temp.textContent = `${info.cpuTemp}°C`;
        
        elements.memory.usage.textContent = `${info.memory}%`;
        elements.memory.total.textContent = `${info.memoryUsed}/${info.memoryTotal} GB`;
        
        elements.disk.usage.textContent = `${info.disk}%`;
        elements.disk.total.textContent = `${info.diskUsed}/${info.diskTotal} GB`;
        
        elements.network.up.textContent = `${formatBytes(info.network.up * 1024)}/s`;
        elements.network.down.textContent = `${formatBytes(info.network.down * 1024)}/s`;
        
        // Update process list
        elements.processList.innerHTML = info.topProcesses.map(process => `
            <div class="process-item">
                <div class="process-name">${process.name}</div>
                <div class="process-stats">
                    <span>CPU: ${process.cpu}%</span>
                    <span>MEM: ${process.mem}%</span>
                </div>
            </div>
        `).join('');

        // Update charts
        updateCharts(info);

        // Schedule next update using setTimeout instead of setInterval
        updateTimeout = setTimeout(updateSystemInfo, 1000);
    } catch (error) {
        console.error('Error updating system info:', error);
        updateTimeout = setTimeout(updateSystemInfo, 1000);
    }
}

// Start updates
updateSystemInfo();

// Cleanup on window close
window.addEventListener('beforeunload', () => {
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }
});
