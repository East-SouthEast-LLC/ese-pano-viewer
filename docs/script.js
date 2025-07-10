// Global variables
let viewer = null;
let panoDataMap = new Map(); // This will hold our fetched correction data

/**
 * Fetches and loads the correction data from the JSON file.
 */
async function loadCorrectionData() {
    try {
        // Assumes the JSON file is in a 'data' folder relative to the HTML file
        const response = await fetch('data/correction-data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Convert the JSON object to a Map for easy lookups
        panoDataMap = new Map(Object.entries(data));
        console.log("Correction data loaded successfully.");
    } catch (error) {
        console.error("Could not load or parse correction data:", error);
        // Alert the user that the correction feature might not work
        alert("Warning: Could not load panorama correction data. Images may appear tilted.");
    }
}

/**
 * Converts a quaternion to Euler angles (in degrees).
 * @param {object} q - Quaternion with w, x, y, z properties.
 * @returns {object} An object with pitch and roll in degrees.
 */
function quaternionToEuler(q) {
    const { w, x, y, z } = q;
    const sinr_cosp = 2 * (w * x + y * z);
    const cosr_cosp = 1 - 2 * (x * x + y * y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp) * (180 / Math.PI);
    const sinp = 2 * (w * y - z * x);
    let pitch;
    if (Math.abs(sinp) >= 1) {
        pitch = (Math.sign(sinp) * Math.PI / 2) * (180 / Math.PI);
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

    if (pose && pose.orientation) {
        const eulerAngles = quaternionToEuler(pose.orientation);
        // Apply the corrected logic you discovered
        horizonPitch = -eulerAngles.pitch;
        horizonRoll = eulerAngles.roll;
        console.log(`Applying correction for ${file.name}: Pitch=${horizonPitch.toFixed(2)}, Roll=${horizonRoll.toFixed(2)}`);
    } else {
        console.warn(`No correction data found for ${file.name}. Displaying with default horizon.`);
    }

    // Initialize Pannellum
    viewer = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": imageUrl,
        "autoLoad": true,
        "showControls": true,
        "title": file.name,
        "horizonPitch": horizonPitch,
        "horizonRoll": horizonRoll
    });
}

// --- Event Listeners ---

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

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

dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadPanorama(file);
    }
});

// --- Initial Load ---
// Load the correction data as soon as the script runs.
loadCorrectionData();