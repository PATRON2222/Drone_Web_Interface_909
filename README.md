# 🚀 Drone_Web_Interface_909  
**An advanced telemetry and monitoring system for real-time MAVLink data visualization.**  

## 🔥 Overview  
Drone_Web_Interface_909 is a cutting-edge web-based **UAV telemetry dashboard**, designed for real-time data visualization from drones using **MAVLink**. The system integrates with **Jetson and Pixhawk** and now features:  
- **3D Data Visualization** 📊  
- **Full TypeScript & React-based UI** 🎨  
- **Real-time MAVLink telemetry processing** ⏳  
- **Optimized for both mobile and desktop** 💻📱  

---

## 🔄 **Project Evolution: From Basic Web UI to TypeScript & 3D**  

### 🌟 **Previous Versions which were also built for ISRO IROC-U  (HTML, CSS, JavaScript)**  
Before transitioning to TypeScript and 3D visualization, the project was a **basic web interface** built using:  
✅ HTML, CSS, JavaScript  
✅ Simple data polling from JSON files  
✅ 2D telemetry displays (tables, simple graphs)  

📂 **Repository Link:** [IROC_WEB_INTERFACE](https://github.com/ArnavBallinCode/IROC_WEB_INTERFACE)  

---

### 🚀 **Current Version (Web_Interface_909 - TypeScript & 3D)**  
The new version is a **modern, interactive telemetry system**, with:  
✅ TypeScript + React for a modular UI  
✅ **Three.js for 3D telemetry visualization**  
✅ WebSockets for live data updates  
✅ Improved file-based JSON data fetching  

📂 **Repository Link:** [Web_Interface_909](https://github.com/ArnavBallinCode/Drone_Web_Interface_909)  

---

## ⚙️ **How It Works**  

### 🎯 **System Architecture**  
1️⃣ **Telemetry Data Flow**  
   - A **Python script (`listen.py`)** reads MAVLink telemetry and writes `.json` files in `public/params/`.  
   - The React-based frontend reads these JSON files and updates the UI dynamically.  

2️⃣ **Frontend (React + TypeScript)**  
   - Fetches and processes telemetry from `/public/params/`.  
   - Uses **Three.js** for **3D drone movement & attitude representation**.  
   - Displays real-time battery, altitude, and position data.  

3️⃣ **Backend (Python + MAVLink)**  
   - Uses `pymavlink` to listen to drone telemetry.  
   - Converts MAVLink messages into structured `.json` files.  

---

## 🚀 **Installation & Setup**  

### 📌 **1. Clone the Repository**  
git clone https://github.com/ArnavBallinCode/Drone_Web_Interface_909.git
cd Drone_Web_Interface_909

---

## 🛠 **2. Setting Up the TypeScript Project**  

### ✅ **For Windows (PowerShell/Command Prompt)**  
1️⃣ Install **Node.js** (latest LTS) from [nodejs.org](https://nodejs.org/)  
2️⃣ Install dependencies:  
```sh
npm install
```
3️⃣ Start the React development server:  
```sh
npm run dev
```
4️⃣ Open `http://localhost:5173/` in your browser.  

---

### ✅ **For macOS (Terminal)**  
1️⃣ Install **Homebrew** (if not installed):  
```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2️⃣ Install Node.js & dependencies:  
```sh
brew install node
npm install
```
3️⃣ Start the development server:  
```sh
npm run dev
```

---

### ✅ **For Linux (Debian/Ubuntu)**  
1️⃣ Install **Node.js**:  
```sh
sudo apt update && sudo apt install -y nodejs npm
```
2️⃣ Install dependencies:  
```sh
npm install
```
3️⃣ Start the development server:  
```sh
npm run dev
```

---

## 🛰 **3. Running MAVLink Telemetry Data Collection**  
1️⃣ Connect Pixhawk/Jetson via USB (`/dev/tty.usbserial-0001`)  
2️⃣ Run the Python script:  
```sh
python3 listen.py
```
3️⃣ Data will be written to `public/params/`.  

---

## 📡 **4. Viewing the Telemetry Dashboard**  
Once the frontend server is running:  
- Open **`http://localhost:5173/`** in your browser.  
- You will see **real-time drone telemetry, battery status, GPS, IMU data, and a 3D model** representing the drone’s movement.  



---

## 📌 **Previous Versions & Related Repositories which were also used in ISRO_IROC_U challenge **  

| Repository | Description | Link |
|------------|-------------|------|
| `IROC_WEB_INTERFACE` | Original UI (HTML, CSS, JS) | [View Here](https://github.com/ArnavBallinCode/IROC_WEB_INTERFACE) |
| `ISRO_IROC_Web` | Backend scripts (Python + MAVLink) | [View Here](https://github.com/ArnavBallinCode/ISRO_IROC_Web) |
| `ISRO_IROC_Webinterface` | Older telemetry interface (Python-based) | [View Here](https://github.com/ArnavBallinCode/ISRO_IROC_Webinterface) |

---

## 🎯 **Upcoming Features**  
✅ WebSocket-based real-time updates (instead of polling JSON files)  
✅ AI-powered anomaly detection for UAV telemetry  
✅ Enhanced **3D mapping using LiDAR & SLAM data**  

---

## 👨‍💻 **Contributing**  
1️⃣ Fork the repository  
2️⃣ Create a new branch (`feature-xyz`)  
3️⃣ Commit your changes (`git commit -m "Added XYZ feature"`)  
4️⃣ Push and submit a PR 🚀  

---

## 📜 **License**  
This project is open-source under the **MIT License**.  

---

## 📞 **Contact & Support**  
If you need help, open an issue in the repo or reach out via:  
📧 **Email:** 24bcs015@iiitdwd.ac.in  


