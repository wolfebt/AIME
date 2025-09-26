/*
    File: audio-bundle.js
    Reference: Audio Lab Logic
    Creator: Wolfe.BT, TangentLLC
*/

// --- Resizable Columns ---
function initializeResizableColumns() {
    const workspace = document.querySelector('.workspace-layout');
    if (!workspace) return;
    const mainColumn = workspace.querySelector('.main-column');
    const sideColumn = workspace.querySelector('.side-column');
    const resizeHandle = workspace.querySelector('.resize-handle');
    let isResizing = false;
    resizeHandle.addEventListener('mousedown', () => { isResizing = true; });
    document.addEventListener('mouseup', () => { isResizing = false; });
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const containerRect = workspace.getBoundingClientRect();
        let newLeftPercent = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        newLeftPercent = Math.max(20, Math.min(80, newLeftPercent));
        mainColumn.style.width = `calc(${newLeftPercent}% - 6px)`;
        sideColumn.style.width = `calc(${100 - newLeftPercent}% - 6px)`;
    });
}

// --- Accordion Logic ---
function initializeAccordions() {
    document.querySelectorAll('.accordion .accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('active');
            if (header.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + 'px';
                if (getComputedStyle(content).paddingTop === '0px') {
                    content.style.padding = '1.5rem';
                }
            } else {
                content.style.maxHeight = null;
                if (getComputedStyle(content).paddingTop !== '0px') {
                    content.style.padding = '0 1.5rem';
                }
            }
        });
    });
}


// --- Audio Lab ---
let mediaBin = [];
let nextClipId = 1;
const pixelsPerSecond = 20;
let timelineDuration = 60; // 60 seconds
let playheadInterval;

function initializeAudioLab() {
    setupAdvancedProperties();
    setupMediaBinDragAndDrop();
    setupTimeline();
    document.getElementById('generate-button')?.addEventListener('click', generateAudioClip);
    document.getElementById('play-pause-btn')?.addEventListener('click', toggleTimelinePlayback);
}

function setupAdvancedProperties() {
    const audioTypeSelect = document.getElementById('audio-type');
    if (!audioTypeSelect) return;

    const renderProperties = () => {
        const container = document.getElementById('advanced-properties-container');
        const selectedType = audioTypeSelect.value;
        let html = '<div class="advanced-properties">';

        switch (selectedType) {
            case 'music':
                html += `
                    <label for="instrumentation">Instrumentation:</label><input type="text" id="instrumentation" class="input-field" value="Orchestral">
                    <label for="tempo">Tempo (BPM):</label><input type="number" id="tempo" class="input-field" value="120">
                    <label for="key">Musical Key:</label><input type="text" id="key" class="input-field" value="C Major">`;
                break;
            case 'sfx':
                html += `
                    <label for="material">Primary Material:</label><input type="text" id="material" class="input-field" value="Metal">
                    <label for="action">Action/Event:</label><input type="text" id="action" class="input-field" value="Impact">
                    <label for="environment">Environment:</label><input type="text" id="environment" class="input-field" value="Cavern">`;
                break;
            case 'dialogue':
                html += `
                    <label for="voice">Voice:</label><input type="text" id="voice" class="input-field" value="Deep Male">
                    <label for="emotion">Emotion:</label><input type="text" id="emotion" class="input-field" value="Serious">
                    <label for="delivery">Delivery Style:</label><input type="text" id="delivery" class="input-field" value="Narrator">`;
                break;
        }
        html += '</div>';
        container.innerHTML = html;
    };
    
    audioTypeSelect.addEventListener('change', renderProperties);
    renderProperties(); // Initial render
}

function generateAudioClip() {
    const prompt = document.getElementById('prompt-input').value || 'New Audio Clip';
    const newClip = {
        id: nextClipId++,
        name: prompt.substring(0, 30),
        duration: Math.floor(Math.random() * 8) + 3 // 3-10 seconds
    };
    mediaBin.push(newClip);
    renderMediaBin();
}

function renderMediaBin() {
    const list = document.getElementById('media-bin-list');
    list.innerHTML = ''; // Clear it
    if(mediaBin.length === 0) {
        list.innerHTML = `<p class="placeholder-text">Generated clips will appear here. Drag them to the timeline.</p>`;
        return;
    }
    mediaBin.forEach(clip => {
        const item = document.createElement('div');
        item.className = 'media-bin-item';
        item.textContent = `${clip.name} (${clip.duration}s)`;
        item.draggable = true;
        item.dataset.clipId = clip.id;
        list.appendChild(item);
    });
}

function setupMediaBinDragAndDrop() {
    const mediaBinList = document.getElementById('media-bin-list');
    const timelineTracks = document.querySelectorAll('.timeline-track');

    mediaBinList.addEventListener('dragstart', e => {
        if (e.target.classList.contains('media-bin-item')) {
            const clipId = e.target.dataset.clipId;
            e.dataTransfer.setData('text/plain', clipId);
        }
    });

    timelineTracks.forEach(track => {
        track.addEventListener('dragover', e => e.preventDefault());
        track.addEventListener('drop', e => {
            e.preventDefault();
            const clipId = parseInt(e.dataTransfer.getData('text/plain'), 10);
            const clipData = mediaBin.find(c => c.id === clipId);
            if (!clipData) return;

            const timelineRect = track.getBoundingClientRect();
            const dropPositionX = e.clientX - timelineRect.left;
            const startTime = dropPositionX / pixelsPerSecond;

            addClipToTimeline(clipData, track, startTime);
        });
    });
}

function addClipToTimeline(clipData, track, startTime) {
    const clipElement = document.createElement('div');
    clipElement.className = 'timeline-clip';
    clipElement.textContent = clipData.name;
    clipElement.style.left = `${startTime * pixelsPerSecond}px`;
    clipElement.style.width = `${clipData.duration * pixelsPerSecond}px`;
    clipElement.dataset.clipId = clipData.id;

    // Add handles for resizing
    const leftHandle = document.createElement('div');
    leftHandle.className = 'clip-handle left';
    const rightHandle = document.createElement('div');
    rightHandle.className = 'clip-handle right';
    clipElement.appendChild(leftHandle);
    clipElement.appendChild(rightHandle);
    
    track.appendChild(clipElement);
    // Add logic for moving and resizing clips on the timeline
}


function setupTimeline() {
    const ruler = document.getElementById('timeline-ruler');
    ruler.innerHTML = '';
    const totalWidth = timelineDuration * pixelsPerSecond;
    ruler.style.width = `${totalWidth}px`;

    for (let i = 0; i <= timelineDuration; i += 5) {
        const mark = document.createElement('div');
        mark.className = 'ruler-mark';
        mark.textContent = `${i}s`;
        mark.style.left = `${i * pixelsPerSecond}px`;
        ruler.appendChild(mark);
    }
}

function toggleTimelinePlayback() {
    const playhead = document.querySelector('.playhead');
    if (playheadInterval) {
        clearInterval(playheadInterval);
        playheadInterval = null;
    } else {
        let currentTime = 0;
        playheadInterval = setInterval(() => {
            currentTime += 0.1;
            if (currentTime > timelineDuration) {
                currentTime = 0;
            }
            playhead.style.left = `${currentTime * pixelsPerSecond}px`;
        }, 100);
    }
}


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns();
    initializeAccordions();
    initializeAudioLab();
});

