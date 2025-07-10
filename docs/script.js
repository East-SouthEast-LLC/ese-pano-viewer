// Global viewer instance
let viewer = null;

/**
 * Parses the CSV data from the <pre> tag into a usable format.
 * @returns {Map<string, object>} A map where keys are filenames and values are pose data.
 */
function parsePanoData() {
    const dataElement = document.getElementById('pano-data');
    if (!dataElement) return new Map();

    const text = dataElement.textContent;
    const lines = text.trim().split('\n');
    const dataMap = new Map();

    lines.forEach(line => {
        // Skip header or comment lines
        if (line.startsWith('[') || line.startsWith('#')) return;

        // Clean up line breaks and split by semicolon
        const cleanedLine = line.replace(/(\r\n|\n|\r)/gm, "").trim();
        const parts = cleanedLine.split(';').map(p => p.trim());
        
        if (parts.length >= 10) {
            const filename = parts[1];
            const poseData = {
                w: parseFloat(parts[6]),
                x: parseFloat(parts[7]),
                y: parseFloat(parts[8]),
                z: parseFloat(parts[9])
            };
            dataMap.set(filename, poseData);
        }
    });
    return dataMap;
}

const panoDataMap = parsePanoData();

/**
 * Converts a quaternion to Euler angles (in degrees).
 * @param {object} q - Quaternion with w, x, y, z properties.
 * @returns {object} An object with pitch, yaw, and roll in degrees.
 */
function quaternionToEuler(q) {
    const { w, x, y, z } = q;

    // Roll (x-axis rotation)
    const sinr_cosp = 2 * (w * x + y * z);
    const cosr_cosp = 1 - 2 * (x * x + y * y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp) * (180 / Math.PI);

    // Pitch (y-axis rotation)
    const sinp = 2 * (w * y - z * x);
    let pitch;
    if (Math.abs(sinp) >= 1) {
        pitch = (Math.sign(sinp) * Math.PI / 2) * (180 / Math.PI); // use 90 degrees if out of range
    } else {
        pitch = Math.asin(sinp) * (180 / Math.PI);
    }

    return { roll, pitch };
}


/**
 * Loads a panoramic image into the Pannellum viewer.
 * @param {File} file - The image file to load.
 */
function loadPanorama(file) {
    if (viewer) {
        viewer.destroy();
    }
    
    const imageUrl = URL.createObjectURL(file);
    const pose = panoDataMap.get(file.name);
    
    let horizonPitch = 0;
    let horizonRoll = 0;

    if (pose) {
        const eulerAngles = quaternionToEuler(pose);
        horizonPitch = eulerAngles.pitch;
        // We negate the roll for Pannellum's coordinate system
        horizonRoll = -eulerAngles.roll; 
    } else {
        console.warn(`No pose data found for ${file.name}. Using default horizon.`);
    }

    // Initialize Pannellum
    viewer = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": imageUrl,
        "autoLoad": true,
        "showControls": true,
        "title": file.name,
        // Apply the calculated corrections
        "horizonPitch": horizonPitch,
        "horizonRoll": horizonRoll
    });
}

// --- Event Listeners ---

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

// Drag and Drop listeners
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadPanorama(file);
    }
});

// Click-to-upload listeners
dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadPanorama(file);
    }
});