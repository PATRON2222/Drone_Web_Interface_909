document.addEventListener("DOMContentLoaded", function () {
    const paramTypes = [
        'LOCAL_POSITION_NED', 'ATTITUDE', 'AHRS', 'AHRS2', 'BATTERY_STATUS',
        'HEARTBEAT', 'DISTANCE_SENSOR', 'GLOBAL_POSITION_INT',
        'RANGEFINDER', 'RAW_IMU', 'SCALED_IMU2'
    ];

    const container = document.getElementById("paramsContainer");
    const localPositionBox = document.getElementById("param-LOCAL_POSITION_NED");

    function createParamBox(param) {
        let paramBox = document.createElement("div");
        paramBox.classList.add("param");
        paramBox.id = `param-${param}`;
        paramBox.innerHTML = `
            <strong>${param}</strong>
            <table class="param-table">
                <tbody id="table-${param}"><tr><td>Loading...</td></tr></tbody>
            </table>
        `;
        return paramBox;
    }

    if (localPositionBox) {
        localPositionBox.innerHTML = `
            <strong>LOCAL_POSITION_NED</strong>
            <table class="param-table">
                <tbody id="table-LOCAL_POSITION_NED"><tr><td>Loading...</td></tr></tbody>
            </table>
        `;
    }

    paramTypes.slice(1).forEach(param => {
        let paramBox = createParamBox(param);
        container.appendChild(paramBox);
    });

    function updateParams() {
        paramTypes.forEach(param => {
            fetch(`../params/${param}.json?timestamp=${new Date().getTime()}`)
                .then(response => response.json())
                .then(data => {
                    let tableBody = document.getElementById(`table-${param}`);
                    if (tableBody) {
                        tableBody.innerHTML = '';
                        Object.entries(data).forEach(([key, value]) => {
                            if (key !== "mavpackettype") {
                                let row = `<tr><th>${key}</th><td>${value}</td></tr>`;
                                tableBody.innerHTML += row;
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error(`Error fetching ${param}:`, error);
                });
        });
    }

    setInterval(updateParams, 1000);

    // ✅ THREE.JS INTEGRATION BELOW THIS LINE ✅
    
    // Set up the scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("droneCanvas"), alpha: true });
    
    renderer.setSize(400, 400);
    document.getElementById("drone-visualizer-container").appendChild(renderer.domElement);

    // Create a Cube to Represent Drone Orientation
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00E1FF, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    camera.position.z = 2;

    // Function to Update Cube Orientation
    function updateDroneOrientation(roll, pitch, yaw) {
        cube.rotation.x = pitch * (Math.PI / 180); // Convert to radians
        cube.rotation.y = yaw * (Math.PI / 180);
        cube.rotation.z = roll * (Math.PI / 180);
    }

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // Fetch Telemetry Data for 3D Visualization
    function updateDroneVisualization() {
        fetch("../params/ATTITUDE.json?timestamp=" + new Date().getTime())
            .then(response => response.json())
            .then(data => {
                if (data) {
                    updateDroneOrientation(data.roll, data.pitch, data.yaw);
                }
            })
            .catch(error => console.error("Error fetching attitude data:", error));
    }

    setInterval(updateDroneVisualization, 1000);
});


