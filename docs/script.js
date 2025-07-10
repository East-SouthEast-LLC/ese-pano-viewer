// script.js

let viewer = null;
let panoDataMap = new Map();

async function loadCorrectionData() {
    try {
        const response = await fetch('data/correction-data.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        panoDataMap = new Map(Object.entries(data));
        console.log("Correction data loaded successfully.");
    } catch (error) {
        console.error("Could not load or parse correction data:", error);
    }
}

function quaternionToEuler(q) {
    const { w, x, y, z } = q;
    const sinr_cosp = 2 * (w * x + y * z);
    const cosr_cosp = 1 - 2 * (x * x + y * y);
    const roll = Math.atan2(sinr_cosp, cosr_cosp) * (180 / Math.PI);
    const sinp = 2 * (w * y - z * x);
    let pitch = Math.abs(sinp) >= 1 ? (Math.sign(sinp) * Math.PI / 2) * (180 / Math.PI) : Math.asin(sinp) * (180 / Math.PI);
    return { roll, pitch };
}

function loadPanorama(config) {
    if (viewer) viewer.destroy();
    
    const pose = panoDataMap.get(config.title);
    let finalConfig = { ...config };

    if (pose && pose.orientation) {
        const eulerAngles = quaternionToEuler(pose.orientation);
        finalConfig.horizonPitch = -eulerAngles.pitch;
        finalConfig.horizonRoll = eulerAngles.roll;
        console.log(`Applying correction for ${config.title}`);
    } else {
        console.warn(`No correction data for ${config.title}.`);
    }

    viewer = pannellum.viewer('panorama', finalConfig);
}

function handleFile(file) {
    const imageUrl = URL.createObjectURL(file);
    document.getElementById('drop-zone').style.display = 'none';
    loadPanorama({
        type: "equirectangular",
        panorama: imageUrl,
        autoLoad: true,
        showControls: true,
        title: file.name,
    });
}

async function handleUrlParameter() {
    await loadCorrectionData();
    const urlParams = new URLSearchParams(window.location.search);
    const panoFile = urlParams.get('pano');

    if (panoFile) {
        // Construct the full URL to the image on Squarespace assets
        const imageUrl = `https://www.ese-llc.com/s/${panoFile}`;
        document.getElementById('drop-zone').style.display = 'none';
        
        loadPanorama({
            type: "equirectangular",
            panorama: imageUrl,
            autoLoad: true,
            showControls: true,
            title: panoFile,
        });
    }
}

// Event Listeners for Drag and Drop / File Input
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

dropZone.addEventListener('dragover', e => e.preventDefault());
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});
fileInput.addEventListener('change', e => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});
dropZone.addEventListener('click', () => fileInput.click());

// --- Initial Load ---
handleUrlParameter();