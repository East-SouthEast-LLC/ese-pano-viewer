// Get references to the necessary DOM elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const panoramaContainer = document.getElementById('panorama');

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

    // Determine camera settings from radio buttons
    const cameraType = document.querySelector('input[name="camera"]:checked').value;
    let vaov, vOffset;

    if (cameraType === 'faro') {
        vaov = 150;
        vOffset = 15;
    } else { // 'lb5'
        vaov = 180;
        vOffset = 0;
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

// Add event listeners to radio buttons to reload the pano with new settings
document.querySelectorAll('input[name="camera"]').forEach(radio => {
    radio.addEventListener('change', () => {
        loadPanorama(); // Reload with the last file
    });
});

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