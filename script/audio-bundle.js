/*
    File: audio-bundle.js
    Reference: Audio Lab Logic
    Creator: Wolfe.BT, TangentLLC
*/

// --- Resizable Columns ---
function initializeResizableColumns() {
    // ... (This function can be added back if resizable columns are needed)
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


// --- Audio Lab Specific Logic ---

// State Management for Audio Clips
let audioClips = [];
let nextClipId = 0;
let activeClip = null;

function initializeAudioLab() {
    const generateBtn = document.getElementById('generate-audio-btn');
    const audioTypeSelect = document.getElementById('audio-type');

    if (generateBtn) {
        generateBtn.addEventListener('click', generateNewAudioClip);
    }
    if (audioTypeSelect) {
        audioTypeSelect.addEventListener('change', updateAdvancedProperties);
        updateAdvancedProperties(); // Initial call
    }
}

function updateAdvancedProperties() {
    const audioType = document.getElementById('audio-type').value;
    const musicProps = document.getElementById('music-properties');
    const sfxProps = document.getElementById('sfx-properties');
    const dialogueProps = document.getElementById('dialogue-properties');

    musicProps.style.display = 'none';
    sfxProps.style.display = 'none';
    dialogueProps.style.display = 'none';

    if (audioType === 'music') {
        musicProps.style.display = 'flex';
    } else if (audioType === 'sfx') {
        sfxProps.style.display = 'flex';
    } else if (audioType === 'dialogue') {
        dialogueProps.style.display = 'flex';
    }
}

function generateNewAudioClip() {
    const prompt = document.getElementById('audio-prompt').value || 'Untitled';
    const newClip = {
        id: nextClipId++,
        name: `${prompt.substring(0, 20)}_${nextClipId}`,
        duration: Math.floor(Math.random() * 15) + 5, // Random duration 5-20s
    };
    audioClips.push(newClip);
    renderMediaBin();
}

function renderMediaBin() {
    const mediaBinList = document.getElementById('media-bin-list');
    mediaBinList.innerHTML = '';
    audioClips.forEach(clip => {
        const item = document.createElement('div');
        item.className = 'media-bin-item';
        item.dataset.clipId = clip.id;
        item.draggable = true;
        item.innerHTML = `<span class="clip-name">${clip.name}</span> <span class="clip-duration">${clip.duration}s</span>`;
        
        item.addEventListener('click', () => {
            setActiveClip(clip.id);
        });

        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', clip.id);
            e.target.style.opacity = '0.5';
        });

        item.addEventListener('dragend', (e) => {
            e.target.style.opacity = '1';
        });

        mediaBinList.appendChild(item);
    });
    updateActiveClipHighlight();
}

function setActiveClip(clipId) {
    activeClip = audioClips.find(c => c.id === clipId);
    console.log("Active clip:", activeClip);
    updatePlayer();
    updateActiveClipHighlight();
}

function updatePlayer() {
    const playerTitle = document.getElementById('player-title');
    const toolbar = document.getElementById('player-toolbar');
    if (activeClip) {
        playerTitle.textContent = activeClip.name;
        toolbar.classList.remove('hidden');
    } else {
        playerTitle.textContent = "No Clip Loaded";
        toolbar.classList.add('hidden');
    }
}

function updateActiveClipHighlight() {
    const items = document.querySelectorAll('.media-bin-item');
    items.forEach(item => {
        if (activeClip && parseInt(item.dataset.clipId) === activeClip.id) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// --- Timeline Logic ---
function initializeTimeline() {
    const tracks = document.querySelectorAll('.timeline-track');
    tracks.forEach(track => {
        track.addEventListener('dragover', (e) => e.preventDefault());
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
    const clipId = parseInt(e.dataTransfer.getData('text/plain'));
    const clipData = audioClips.find(c => c.id === clipId);
    const track = e.target.closest('.timeline-track');
    const timelineRect = track.getBoundingClientRect();
    const dropPosition = e.clientX - timelineRect.left;

    if (clipData && track) {
        createClipOnTrack(clipData, track, dropPosition);
    }
}

function createClipOnTrack(clipData, track, dropPosition) {
    const trackWidth = track.clientWidth;
    const clipDurationSeconds = clipData.duration;
    const totalTimelineDuration = 60; // seconds

    const clipWidth = (clipDurationSeconds / totalTimelineDuration) * trackWidth;
    let clipLeft = dropPosition;

    if (clipLeft + clipWidth > trackWidth) {
        clipLeft = trackWidth - clipWidth;
    }
    if(clipLeft < 0) clipLeft = 0;

    const clipElement = document.createElement('div');
    clipElement.className = 'timeline-clip';
    clipElement.style.left = `${clipLeft}px`;
    clipElement.style.width = `${clipWidth}px`;
    clipElement.textContent = clipData.name;
    
    makeClipDraggable(clipElement, track);
    track.appendChild(clipElement);
}

function makeClipDraggable(clipElement, track) {
    clipElement.addEventListener('mousedown', (e) => {
        e.stopPropagation();
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
    initializeAudioLab();
    initializeTimeline();
    renderMediaBin(); // Initial render
    updatePlayer();
});
