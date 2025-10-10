/*
    File: video-bundle.js
    Reference: Director's Suite Logic
    Creator: Wolfe.BT, TangentLLC
*/

// --- Resizable Columns ---
function initializeResizableColumns() {
    // This can be re-enabled if needed
}

// --- Accordion Logic ---
function initializeAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        const content = accordion.querySelector('.accordion-content');
        const chevron = header.querySelector('.accordion-chevron');
        if (!header || !content || !chevron) return;

        header.addEventListener('click', () => {
            const isOpen = header.classList.toggle('active');
            chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            if (isOpen) {
                content.style.padding = '1.5rem';
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
                content.style.padding = '0 1.5rem';
            }
        });

        if (header.classList.contains('active')) {
            content.style.padding = '1.5rem';
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
}

// --- Asset Hub Importer ---
function initializeAssetImporter() {
    const importBtn = document.getElementById('import-asset-btn');
    const fileInput = document.getElementById('asset-upload');
    const assetList = document.getElementById('asset-list');
    if (!importBtn || !fileInput || !assetList) return;

    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (event) => {
        for (const file of event.target.files) {
            addAssetToList(file, assetList);
        }
    });
}

function addAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    const fileURL = URL.createObjectURL(file);

    let assetInfoHtml = '';
    if (file.type.startsWith('image/')) {
        assetInfoHtml = `<div class="asset-info"><img src="${fileURL}" class="asset-thumbnail"><span class="asset-name">${file.name}</span></div>`;
    } else {
        assetInfoHtml = `<div class="asset-info"><span class="asset-icon-text">TXT</span><span class="asset-name">${file.name}</span></div>`;
    }
    assetItem.innerHTML = `${assetInfoHtml}<button class="remove-asset-btn">&times;</button>`;
    assetList.appendChild(assetItem);
    assetItem.querySelector('.remove-asset-btn').addEventListener('click', () => {
        URL.revokeObjectURL(fileURL);
        assetItem.remove();
    });
}

// --- Guidance Gems for Video ---
function initializeVideoGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) {
        console.error('Gems container not found!');
        return;
    }

    const gemsData = {
        "Shot Type": ["Wide Shot", "Medium Shot", "Close-up", "POV", "Dutch Angle"],
        "Camera Movement": ["Static", "Pan", "Tilt", "Dolly", "Handheld"],
        "Lighting": ["High-Key", "Low-Key", "Natural", "Cinematic"],
        "Visual Effects": ["None", "Black & White", "Sepia", "Lens Flare"]
    };

    let html = '';
    for (const [title, options] of Object.entries(gemsData)) {
        html += `<div class="gem-category"><h4 class="gem-title">${title}</h4><div class="gem-options">`;
        options.forEach(option => {
            html += `<button class="gem-option">${option}</button>`;
        });
        html += `</div></div>`;
    }
    container.innerHTML = html;

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('gem-option')) {
            e.target.classList.toggle('active');
        }
    });
}


// --- Director's Suite Logic ---

let mediaClips = [];
let nextMediaId = 0;

function initializeDirectorSuite() {
    const generateBtn = document.getElementById('generate-shot-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateNewShot);
    }
}

function generateNewShot() {
    const prompt = document.getElementById('shot-prompt').value || 'New Shot';
    const clipType = ['video', 'audio', 'image'][Math.floor(Math.random() * 3)];

    const newClip = {
        id: nextMediaId++,
        name: `${prompt.substring(0, 15)}_${nextMediaId}`,
        duration: Math.floor(Math.random() * 10) + 2, // 2-12s
        type: clipType,
        color: `hsl(${Math.random() * 360}, 50%, 40%)`
    };

    mediaClips.push(newClip);
    renderMediaBin();
}

function renderMediaBin() {
    const mediaBinList = document.getElementById('media-bin-list');
    mediaBinList.innerHTML = '';
    mediaClips.forEach(clip => {
        const item = document.createElement('div');
        item.className = 'media-bin-item';
        item.dataset.clipId = clip.id;
        item.draggable = true;
        item.innerHTML = `
            <span class="clip-type-indicator" style="background-color: ${clip.color};">${clip.type.charAt(0).toUpperCase()}</span>
            <span class="clip-name">${clip.name}</span>
            <span class="clip-duration">${clip.duration}s</span>
        `;

        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('application/json', JSON.stringify(clip));
            e.target.style.opacity = '0.5';
        });

        item.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
        });

        mediaBinList.appendChild(item);
    });
}


// --- Timeline Logic for Director's Suite ---
function initializeTimeline() {
    const tracks = document.querySelectorAll('.timeline-track');
    tracks.forEach(track => {
        track.addEventListener('dragover', (e) => {
            e.preventDefault();
            // You can add visual feedback here
        });
        track.addEventListener('drop', handleDropOnTrack);
    });

    // Generate ruler marks
    const ruler = document.getElementById('timeline-ruler');
    for (let i = 0; i <= 60; i += 5) {
        const mark = document.createElement('div');
        mark.className = 'ruler-mark';
        mark.style.left = `${(i / 60) * 100}%`;
        mark.textContent = `${i}s`;
        ruler.appendChild(mark);
    }
}

function handleDropOnTrack(e) {
    e.preventDefault();
    const clipData = JSON.parse(e.dataTransfer.getData('application/json'));
    const track = e.target.closest('.timeline-track');
    
    // Check if the clip type is allowed on this track
    const allowedType = track.dataset.trackType;
    if (clipData.type !== allowedType && !(allowedType === 'video' && clipData.type === 'image')) {
        console.warn(`Cannot drop ${clipData.type} on a ${allowedType} track.`);
        return;
    }

    const timelineRect = track.getBoundingClientRect();
    const dropPosition = e.clientX - timelineRect.left;

    createClipOnTrack(clipData, track, dropPosition);
}

function createClipOnTrack(clipData, track, dropPosition) {
    const trackWidth = track.clientWidth;
    const clipDurationSeconds = clipData.duration;
    const totalTimelineDuration = 60; // seconds

    const clipWidth = (clipDurationSeconds / totalTimelineDuration) * trackWidth;
    let clipLeft = dropPosition;

    // Prevent clip from going off the edge
    if (clipLeft + clipWidth > trackWidth) {
        clipLeft = trackWidth - clipWidth;
    }
    if(clipLeft < 0) clipLeft = 0;

    const clipElement = document.createElement('div');
    clipElement.className = 'timeline-clip';
    clipElement.style.left = `${clipLeft}px`;
    clipElement.style.width = `${clipWidth}px`;
    clipElement.style.backgroundColor = clipData.color;
    clipElement.textContent = clipData.name;
    
    makeClipDraggable(clipElement, track);
    track.appendChild(clipElement);
}

function makeClipDraggable(clipElement, track) {
     clipElement.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Prevent track-level events
        let offsetX = e.clientX - clipElement.getBoundingClientRect().left;
        
        function onMouseMove(moveEvent) {
            const trackRect = track.getBoundingClientRect();
            let newLeft = moveEvent.clientX - trackRect.left - offsetX;

            if (newLeft < 0) newLeft = 0;
            if (newLeft + clipElement.offsetWidth > trackRect.width) {
                newLeft = trackRect.width - clipElement.offsetWidth;
            }

            clipElement.style.left = `${newLeft}px`;
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // initializeResizableColumns();
    initializeAccordions();
    initializeAssetImporter();
    initializeVideoGems();
    initializeDirectorSuite();
    initializeTimeline();
    renderMediaBin();
});
