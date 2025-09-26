/*
    File: video-bundle.js
    Reference: Director's Suite Logic
    Creator: Wolfe.BT, TangentLLC
*/

// --- Resizable Columns ---
function initializeResizableColumns() {
    const workspace = document.querySelector('.workspace-layout');
    if (!workspace) return;
    const mainColumn = workspace.querySelector('.main-column');
    const sideColumn = workspace.querySelector('.side-column');
    const resizeHandle = workspace.querySelector('.resize-handle');
    if (!mainColumn || !sideColumn || !resizeHandle) return;

    let isResizing = false;
    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
    });

    function stopResizing() {
        isResizing = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
    }

    function handleMouseMove(e) {
        if (!isResizing) return;
        const containerRect = workspace.getBoundingClientRect();
        const newLeftWidth = e.clientX - containerRect.left;
        let newLeftPercent = (newLeftWidth / containerRect.width) * 100;
        newLeftPercent = Math.max(20, Math.min(80, newLeftPercent));
        mainColumn.style.width = `calc(${newLeftPercent}% - 6px)`;
        sideColumn.style.width = `calc(${100 - newLeftPercent}% - 6px)`;
    }
}

// --- Accordion Logic ---
function initializeAccordions() {
    document.querySelectorAll('.accordion .accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const chevron = header.querySelector('.accordion-chevron');
            const isOpen = header.classList.toggle('active');
            if (chevron) {
                chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            }
            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + 48 + "px";
                content.style.padding = '1.5rem';
            } else {
                content.style.maxHeight = null;
                content.style.padding = '0 1.5rem';
            }
        });
    });
}

// --- Asset Hub (with Image Support) ---
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
        fileInput.value = '';
    });
}

function addAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    const assetInfo = document.createElement('div');
    assetInfo.className = 'asset-info';
    if (file.type.startsWith('image/')) {
        const thumbnail = document.createElement('img');
        const imageURL = URL.createObjectURL(file);
        thumbnail.src = imageURL;
        thumbnail.className = 'asset-thumbnail';
        thumbnail.onload = () => URL.revokeObjectURL(imageURL);
        assetInfo.prepend(thumbnail);
    } else {
        const textIcon = document.createElement('div');
        textIcon.className = 'asset-icon-text';
        textIcon.textContent = 'TXT';
        assetInfo.prepend(textIcon);
    }
    const assetName = document.createElement('span');
    assetName.className = 'asset-name';
    assetName.textContent = file.name;
    assetInfo.appendChild(assetName);
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-asset-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => assetItem.remove();
    assetItem.appendChild(assetInfo);
    assetItem.appendChild(removeBtn);
    assetList.appendChild(assetItem);
}

// --- Director's Suite Specific Logic ---
function initializeDirectorSuite() {
    if (!document.getElementById('timeline-container')) return;
    initializeVideoGems();
    initializeMediaBin();
    initializeTimeline();
}

function initializeVideoGems() {
    // Restored to the standard, working ID
    const container = document.getElementById('guidance-gems-container');
    if (!container) {
        console.error("Error: Guidance Gems container ('guidance-gems-container') not found.");
        return;
    }
    const gemsData = {
        "Shot Type": ["Wide Shot", "Medium Shot", "Close-up", "POV", "Dutch Angle"],
        "Camera Movement": ["Static", "Pan", "Tilt", "Dolly Zoom", "Tracking Shot"],
        "Transition": ["Hard Cut", "Dissolve", "Wipe", "Fade to Black"],
        "Visual Effects": ["None", "Black & White", "Sepia Tone", "Lens Flare", "Slow Motion"]
    };
    let gemsHTML = '';
    for (const category in gemsData) {
        gemsHTML += `<div class="gem-category"><h4 class="gem-title">${category}</h4><div class="gem-options">`;
        gemsData[category].forEach(option => {
            gemsHTML += `<button class="gem-option">${option}</button>`;
        });
        gemsHTML += `</div></div>`;
    }
    container.innerHTML = gemsHTML;
    container.querySelectorAll('.gem-option').forEach(button => {
        button.addEventListener('click', () => button.classList.toggle('active'));
    });
}

function initializeMediaBin() {
    const generateBtn = document.getElementById('generate-shot-button');
    const mediaBinList = document.getElementById('media-bin-list');
    if (!generateBtn || !mediaBinList) return;
    let shotCounter = 1;
    generateBtn.addEventListener('click', () => {
        if (mediaBinList.querySelector('.placeholder-text')) {
            mediaBinList.innerHTML = '';
        }
        const shotName = `Shot_${shotCounter++}`;
        const clipType = Math.random() > 0.7 ? 'audio' : 'video';
        addClipToMediaBin(shotName, clipType, mediaBinList);
    });
}

function addClipToMediaBin(name, type, container) {
    const item = document.createElement('div');
    item.className = 'media-bin-item';
    item.draggable = true;
    item.dataset.clipName = name;
    item.dataset.clipType = type;
    const icon = document.createElement('span');
    icon.className = 'media-bin-icon';
    icon.textContent = type === 'video' ? 'V' : 'A';
    item.appendChild(icon);
    const text = document.createElement('span');
    text.textContent = name;
    item.appendChild(text);
    item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ name, type }));
        setTimeout(() => item.classList.add('dragging'), 0);
    });
    item.addEventListener('dragend', () => item.classList.remove('dragging'));
    container.appendChild(item);
}

function initializeTimeline() {
    const tracks = document.querySelectorAll('.timeline-track');
    tracks.forEach(track => {
        track.addEventListener('dragover', e => {
            e.preventDefault();
            const draggingItem = document.querySelector('.dragging');
            if (draggingItem && draggingItem.dataset.clipType === track.dataset.trackType) {
                 track.classList.add('drag-over');
            }
        });
        track.addEventListener('dragleave', () => track.classList.remove('drag-over'));
        track.addEventListener('drop', e => {
            e.preventDefault();
            track.classList.remove('drag-over');
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
             if (data.type !== track.dataset.trackType) return;
            const trackRect = track.getBoundingClientRect();
            const offsetX = e.clientX - trackRect.left;
            createTimelineClip(data.name, data.type, offsetX, track);
        });
    });
}

function createTimelineClip(name, type, left, track) {
    const clip = document.createElement('div');
    clip.className = `timeline-clip ${type}-clip`;
    clip.textContent = name;
    clip.style.left = `${left}px`;
    clip.style.width = '150px';
    track.appendChild(clip);
}

// --- DOMContentLoaded Initializer (Corrected Logic) ---
document.addEventListener('DOMContentLoaded', () => {
    // Step 1: Initialize universal, foundational UI components first.
    initializeResizableColumns();
    initializeAccordions();
    initializeAssetImporter();

    // Step 2: Now that the accordions are guaranteed to be interactive,
    // run the specific setup for the Director's Suite.
    initializeDirectorSuite();
});

