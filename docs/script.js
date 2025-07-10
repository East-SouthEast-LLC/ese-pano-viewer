// Get references to the necessary DOM elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const panoramaContainer = document.getElementById('panorama');
const vOffsetInput = document.getElementById('vOffsetInput');
const applyVOffsetBtn = document.getElementById('applyVOffset');

let viewer = null; // To hold the pannellum instance
let lastFile = null; // Variable to store the last loaded file

/**
 * Loads a panoramic image into the Pannellum viewer.
 * @param {File} file - The image file to load.
 */
function loadPanorama(file) {
    if (file) {
        lastFile = file; // Store the file
    } else if (lastFile) {
        file = lastFile; // Reuse the last file if none is provided
    } else {
        return; // Exit if no file is available
    }

    if (viewer) {
        viewer.destroy();
    }
    
    const imageUrl = URL.createObjectURL(file);

    // 1. Determine camera settings from radio buttons
    const cameraType = document.querySelector('input[name="camera"]:checked').value;
    let vaov, vOffset;

    if (cameraType === 'faro') {
        vaov = 150;
        vOffset = 15;
    } else { // for 'lb5' and 'navis'
        vaov = 180;
        vOffset = 0;
    }

    // 2. Override vOffset if a manual value is entered
    const manualVOffset = parseFloat(vOffsetInput.value);
    if (!isNaN(manualVOffset)) {
        vOffset = manualVOffset;
    }

    // Initialize Pannellum with the correct projection settings
    viewer = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": imageUrl,
        "autoLoad": true,
        "showControls": true,
        "title": file.name,
        "vaov": vaov,
        "vOffset": vOffset
    });
}

// --- Event Listeners ---

// Reload the pano with new settings when a radio button is clicked
document.querySelectorAll('input[name="camera"]').forEach(radio => {
    radio.addEventListener('change', () => {
        vOffsetInput.value = ''; // Clear manual offset when changing camera type
        loadPanorama(); 
    });
});

// Reload the pano when the "Apply" button is clicked
applyVOffsetBtn.addEventListener('click', () => {
    loadPanorama();
});

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