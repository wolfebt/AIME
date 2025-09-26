/*
    File: imaging-bundle.js
    Reference: Imaging Studio Logic
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

// --- Asset Hub (REWRITTEN & STABLE) ---
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
        fileInput.value = ''; // Reset input
    });
}

function addAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';

    const assetInfo = document.createElement('div');
    assetInfo.className = 'asset-info';

    if (file.type.startsWith('image/')) {
        const thumbnail = document.createElement('img');
        const imageURL = URL.createObjectURL(file); // Correct Method
        thumbnail.src = imageURL;
        thumbnail.className = 'asset-thumbnail';
        thumbnail.onload = () => URL.revokeObjectURL(imageURL); // Clean up memory
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

// --- Imaging Studio Specific Logic ---
function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;
    const gemsData = {
        "Primary Art Style": ["Photorealistic", "Illustration", "Anime", "Concept Art"],
        "Pose / Framing": ["Close-up", "Full Body", "Action Pose", "Concept Sheet"],
        "Lighting Style": ["Cinematic", "Studio", "Natural Light", "Noir"],
        "Color Palette": ["Vibrant", "Monochromatic", "Pastel", "Muted"]
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

function initializeImageGeneration() {
    const generateBtn = document.getElementById('generate-button');
    const imageContainer = document.getElementById('image-container');
    const toolbar = document.getElementById('image-toolbar');
    if (!generateBtn || !imageContainer || !toolbar) return;

    generateBtn.addEventListener('click', () => {
        imageContainer.innerHTML = `<div class="loading-indicator"><div class="loading-spinner"></div><p class="loading-text">AIME is crafting your vision...</p></div>`;
        toolbar.style.display = 'none';
        setTimeout(() => {
            imageContainer.innerHTML = `<img src="https://placehold.co/1024x1024/0d1117/e6edf3?text=Generated+Image" alt="Generated AI art" style="width: 100%; height: 100%; object-fit: cover;">`;
            toolbar.style.display = 'flex';
        }, 2000);
    });

    const newBtn = document.getElementById('new-btn');
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            imageContainer.innerHTML = `<span class="placeholder-text">Generated image will appear here.</span>`;
            toolbar.style.display = 'none';
        });
    }
}

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns();
    initializeAccordions();
    initializeAssetImporter();
    initializeGuidanceGems();
    initializeImageGeneration();
});

