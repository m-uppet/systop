const path = require("path");
const { ipcRenderer } = require("electron");
const osu = require("node-os-utils");
const cpu = osu.cpu;
const mem = osu.mem;
const os = osu.os;

const intervalMs = 2000;
let cpuOverload;
let alertPeriod; // in mins

// Get settings from main process
ipcRenderer.on("settings:get", (e, settings) => {
  cpuOverload = +settings.cpuOverload;
  alertPeriod = +settings.alertPeriod;
});

// Run every intervalMs/1000 seconds
setInterval(() => {
  cpu.usage().then((info) => {
    document.getElementById("cpu-usage").innerText = info + "%";

    // CPU progress bar
    document.getElementById("cpu-progress").style.width = info + "%";
    if (info >= cpuOverload) {
      document.getElementById("cpu-progress").style.background = "red";
    } else {
      document.getElementById("cpu-progress").style.background = "#30c88b";
    }

    // Check overload
    if (info >= cpuOverload && runNotify(alertPeriod)) {
      notifyUser({
        title: "CPU overloaded",
        body: `CPU is over ${cpuOverload}%`,
        icon: path.join(__dirname, "img", "icon.png"),
      });
      localStorage.setItem("lastNotify", +new Date());
    }
  });

  cpu.free().then((info) => {
    document.getElementById("cpu-free").innerText = info + "%";
  });
  document.getElementById("sys-uptime").innerText = secsToHr(os.uptime());
}, intervalMs);

// Model
document.getElementById("cpu-model").innerText = cpu.model();

// Computer name
document.getElementById("comp-name").innerText = os.hostname();

// OS
document.getElementById("os").innerText = `${os.type()} ${os.arch()}`;

// Memory
mem.info().then((info) => {
  document.getElementById("mem-total").innerText = info.totalMemMb + "MB";
});

function secsToHr(seconds) {
  // Change seconds into human readable format
  seconds = +seconds;
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d}d, ${h}h, ${m}m, ${s}s`;
}

// Send notifications to user
function notifyUser(options) {
  new Notification(options.title, options);
}

function runNotify(period) {
  if (localStorage.getItem("lastNotify") === null) {
    localStorage.setItem("lastNotify", +new Date());
    return true;
  }
  const notifyTime = new Date(parseInt(localStorage.getItem("lastNotify")));
  const d = new Date();
  const diffMin = Math.ceil(Math.abs(d - notifyTime) / (1000 * 60)); // difference in minutes
  if (diffMin > period) {
    return true;
  } else {
    return false;
  }
}
