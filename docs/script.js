// Get references to the necessary DOM elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const panoramaContainer = document.getElementById('panorama');

let viewer = null; // To hold the pannellum instance

/**
 * Loads a panoramic image into the Pannellum viewer.
 * @param {File} file - The image file to load.
 */
function loadPanorama(file) {
    // If there's already a viewer, destroy it to free up resources
    if (viewer) {
        viewer.destroy();
    }

    // The key step: create a temporary URL for the local file
    const imageUrl = URL.createObjectURL(file);

    // Initialize Pannellum
    viewer = pannellum.viewer('panorama', {
        "type": "equirectangular",
        "panorama": imageUrl,
        "autoLoad": true,
        "showControls": true,
        "title": file.name // Use the file name as the title
    });
}

// --- Event Listeners for Drag and Drop ---

// 1. When a file is dragged over the drop zone
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault(); // Prevent the browser's default behavior
    dropZone.classList.add('drag-over');
});

// 2. When a file leaves the drop zone area
dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
});

// 3. When a file is dropped onto the zone
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    // Get the first file that was dropped
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        loadPanorama(file);
    }
});

// --- Fallback for Clicking ---

// When the drop zone is clicked, trigger the hidden file input
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// When a file is selected via the file dialog
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadPanorama(file);
    }
});