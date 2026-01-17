import axios from "axios";

// API endpoint
const API_URL = "http://localhost:5000/api/logs";

// Radios being monitored
const radios = [
  "KBC Radio 1",
  "KBC English Service",
  "KBC Radio Taifa",
  "KBC Coro FM",
  "KBC Mayienga FM",
  "pwani_fm",
  "iftin",           
  "minto",
  "kitwek_fm",
  "mwatu_fm",
  "ingo_fm",
  "mwago_fm",      
  "nosim_fm",      
  "ngemi_fm"        
];

// Possible offline issues
const issues = [
  "No audio signal",
  "Stream timeout",
  "Network instability",
  "Decoder error",
  "Power fluctuation"
];

function generateLog() {
  const radio = radios[Math.floor(Math.random() * radios.length)];

  // 80% online, 20% offline
  const isOnline = Math.random() < 0.8;

  return {
    date_time: new Date().toISOString().slice(0, 19).replace("T", " "),
    radio,
    status: isOnline ? "online" : "offline",
    issue: isOnline
      ? null
      : issues[Math.floor(Math.random() * issues.length)]
  };
}

// Send log every 30 seconds
setInterval(async () => {
  const payload = generateLog();

  try {
    await axios.post(API_URL, payload);
    console.log("✅ Log sent:", payload);
  } catch (err) {
    console.error("❌ Failed to send log:", err.message);
  }
}, 30000);
