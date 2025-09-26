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
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            resizeHandle.classList.remove('resizing');
        });
        resizeHandle.classList.add('resizing');
    });

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

// --- Guidance Gems ---
function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;
    const gemsData = {
        "Primary Art Style": ["Photorealistic", "Illustration", "Concept Art", "Anime", "Pixel Art"],
        "Pose / Framing": ["Close-up Portrait", "Full Body", "Action Pose", "Landscape", "Cinematic"],
        "Lighting Style": ["Studio Lighting", "Golden Hour", "Natural Light", "Noir", "Cyberpunk Neon"],
        "Color Palette": ["Vibrant & Saturated", "Monochromatic", "Pastel", "Muted Tones", "Triadic"],
        "Artist Influences": "text"
    };

    let html = '';
    for (const [title, options] of Object.entries(gemsData)) {
        html += `<div class="gem-category"><h4 class="gem-title">${title}</h4><div class="gem-options">`;
        if (Array.isArray(options)) {
            options.forEach(option => {
                html += `<button class="gem-option">${option}</button>`;
            });
        } else if (options === 'text') {
            html += `<input type="text" id="artist-influences" class="input-field gem-input" placeholder="e.g., Van Gogh, H.R. Giger">`;
        }
        html += `</div></div>`;
    }
    container.innerHTML = html;
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('gem-option')) {
            e.target.classList.toggle('active');
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
        assetInfoHtml = `
            <div class="asset-info">
                <img src="${fileURL}" alt="${file.name}" class="asset-thumbnail">
                <span class="asset-name">${file.name}</span>
            </div>`;
    } else {
        assetInfoHtml = `
             <div class="asset-info">
                <span class="asset-icon-text">TXT</span>
                <span class="asset-name">${file.name}</span>
            </div>`;
    }

    assetItem.innerHTML = `${assetInfoHtml}<button class="remove-asset-btn">&times;</button>`;
    assetList.appendChild(assetItem);
    assetItem.querySelector('.remove-asset-btn').addEventListener('click', () => {
        URL.revokeObjectURL(fileURL);
        assetItem.remove();
    });
}

// --- Toolbar Logic ---
function initializeToolbar() {
    const toolbar = document.getElementById('image-toolbar');
    if (!toolbar) return;
    toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('.toolbar-btn');
        if (!button) return;
        const action = button.dataset.action;
        console.log(`Toolbar action: ${action}`);
        if (action === 'new') {
            const imageContainer = document.getElementById('image-container');
            imageContainer.innerHTML = '<p class="placeholder-text">Your generated image will appear here.</p>';
            toolbar.classList.add('hidden');
        }
        // Add logic for other actions like variations, upscale, save
    });
}

// --- AI Image Generation Logic ---

function craftImageSuperPrompt() {
    const mainPrompt = document.getElementById('main-prompt').value || "A masterpiece";
    const activeGems = document.querySelectorAll('#guidance-gems-container .gem-option.active');
    const artistInfluences = document.getElementById('artist-influences').value;
    const assetItems = document.querySelectorAll('#asset-list .asset-name');

    let promptParts = [mainPrompt];
    
    activeGems.forEach(gem => {
        promptParts.push(gem.textContent);
    });

    if (artistInfluences) {
        promptParts.push(`in the style of ${artistInfluences}`);
    }

    if (assetItems.length > 0) {
        let assetNames = [];
        assetItems.forEach(item => assetNames.push(item.textContent));
        promptParts.push(`featuring elements from: ${assetNames.join(', ')}`);
    }

    return promptParts.join(', ');
}

async function generateImage(prompt) {
    const apiKey = ""; // This will be handled by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    
    const payload = {
        instances: [{ prompt: prompt }],
        parameters: { "sampleCount": 1 }
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
        } else {
            throw new Error('Invalid response structure from API.');
        }
    } catch (error) {
        console.error("Image generation failed:", error);
        return null;
    }
}

function initializeImageGeneration() {
    const generateBtn = document.getElementById('generate-button');
    const imageContainer = document.getElementById('image-container');
    const toolbar = document.getElementById('image-toolbar');
    if (!generateBtn || !imageContainer || !toolbar) return;

    generateBtn.addEventListener('click', async () => {
        toolbar.classList.add('hidden');
        imageContainer.innerHTML = `
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
                <p class="loading-text">AIME is crafting your vision...</p>
            </div>
        `;
        generateBtn.disabled = true;

        const prompt = craftImageSuperPrompt();
        console.log("--- Image Super-Prompt ---");
        console.log(prompt);

        const imageUrl = await generateImage(prompt);

        if (imageUrl) {
            imageContainer.innerHTML = `<img src="${imageUrl}" alt="AI Generated Image" class="generated-image">`;
            toolbar.classList.remove('hidden');
        } else {
            imageContainer.innerHTML = '<p class="error-text">Failed to generate image. Please try a different prompt or check the console for errors.</p>';
        }
        
        generateBtn.disabled = false;
    });
}


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // initializeResizableColumns(); // Disabled for now to use fixed layout
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeToolbar();
    initializeImageGeneration();
});

