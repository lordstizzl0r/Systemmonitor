const { app, BrowserWindow, ipcMain, screen, shell } = require("electron");
const path = require("path");
const si = require("systeminformation");

let mainWindow;
let isExpanded = false;

function createWindow() {
  const display = screen.getPrimaryDisplay();
  const collapsedWidth = 300;
  const collapsedHeight = 200;
  const expandedWidth = 800;
  const expandedHeight = 600;

  function getIconPath() {
    switch (process.platform) {
      case "win32":
        return path.join(__dirname, "icons", "win", "icon.ico");
      case "darwin": // macOS
        return path.join(__dirname, "icons", "mac", "icon.icns");
      default: // Linux und andere
        return path.join(__dirname, "icons", "png", "512x512.png");
    }
  }

  if (process.platform === "win32") {
    app.setAppUserModelId(app.name || "SystemMonitor");
  }

  mainWindow = new BrowserWindow({
    width: collapsedWidth,
    height: collapsedHeight,
    x: display.bounds.width - collapsedWidth - 20,
    y: display.bounds.height - collapsedHeight - 40,
    frame: false,
    transparent: true,
    icon: getIconPath(),
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // Erlaube Links, die sich im Standardbrowser öffnen sollen
      nativeWindowOpen: true,
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.setAlwaysOnTop(true, "floating");

  // Erlaube Verlinkungen zu externen URLs wie PayPal
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Öffne externe Links im Standard-Browser
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Handle window expansion/collapse
  ipcMain.on("toggle-expand", () => {
    isExpanded = !isExpanded;
    const bounds = mainWindow.getBounds();

    if (isExpanded) {
      mainWindow.setBounds(
        {
          width: expandedWidth,
          height: expandedHeight,
          x: display.bounds.width - expandedWidth - 20,
          y: display.bounds.height - expandedHeight - 40,
        },
        true
      ); // true enables animation
    } else {
      mainWindow.setBounds(
        {
          width: collapsedWidth,
          height: collapsedHeight,
          x: display.bounds.width - collapsedWidth - 20,
          y: display.bounds.height - collapsedHeight - 40,
        },
        true
      );
    }
    mainWindow.webContents.send("expansion-state-changed", isExpanded);
  });
}

// Füge IPC-Handler für PayPal-Links hinzu
ipcMain.handle("open-external-link", async (event, url) => {
  if (url.startsWith("https://www.paypal.com")) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

if (process.platform === "darwin") {
  app.whenReady().then(() => {
    app.dock.setIcon(path.join(__dirname, "icons", "mac", "icon.icns"));
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// System information gathering
async function getSystemInfo() {
  const cpu = await si.currentLoad();
  const mem = await si.mem();
  const disk = await si.fsSize();
  const network = await si.networkStats();
  const cpuTemp = await si.cpuTemperature();
  const processes = await si.processes();
  const os = await si.osInfo();

  return {
    cpu: Math.round(cpu.currentLoad),
    cpuTemp: Math.round(cpuTemp.main || 0),
    memory: Math.round((mem.used / mem.total) * 100),
    memoryTotal: Math.round(mem.total / 1024 / 1024 / 1024), // in GB
    memoryUsed: Math.round(mem.used / 1024 / 1024 / 1024), // in GB
    disk: Math.round((disk[0].used / disk[0].size) * 100),
    diskTotal: Math.round(disk[0].size / 1024 / 1024 / 1024), // in GB
    diskUsed: Math.round(disk[0].used / 1024 / 1024 / 1024), // in GB
    network: {
      up: Math.round(network[0].tx_sec / 1024), // KB/s
      down: Math.round(network[0].rx_sec / 1024), // KB/s
    },
    topProcesses: processes.list.slice(0, 5).map((p) => ({
      name: p.name,
      cpu: Math.round(p.cpu * 100) / 100,
      mem: Math.round(p.mem * 100) / 100,
    })),
    os: os.platform + " " + os.release,
  };
}

// Handle IPC calls from renderer
ipcMain.handle("get-system-info", async () => {
  return await getSystemInfo();
});
