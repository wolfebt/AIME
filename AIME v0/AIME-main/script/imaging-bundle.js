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
                // To get smooth animation, we need to set padding before maxHeight
                if (!content.style.padding || content.style.padding === '0px 1.5rem' || content.style.padding === '0px 24px') {
                    content.style.padding = '1.5rem';
                }
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
                // To get smooth animation on close, we remove padding after the animation might have started
                 if (content.style.padding === '1.5rem' || content.style.padding === '24px') {
                   content.style.padding = '0 1.5rem';
                }
            }
        });

         // Open active accordions by default
        if (header.classList.contains('active')) {
            content.style.padding = '1.5rem';
            content.style.maxHeight = content.scrollHeight + "px";
            chevron.style.transform = 'rotate(180deg)';
        }
    });
}


// --- Asset Hub Importer ---
function initializeAssetImporter() {
    const importBtn = document.getElementById('import-asset-btn');
    const fileInput = document.getElementById('asset-upload');
    const assetList = document.getElementById('asset-list');

    if (importBtn && fileInput && assetList) {
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (event) => {
            for (const file of event.target.files) {
                if (file.type.startsWith('image/')) {
                    addImageAssetToList(file, assetList);
                } else {
                    addTextAssetToList(file, assetList);
                }
            }
        });
    }
}

function addTextAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    assetItem.innerHTML = `
        <span class="asset-icon">TXT</span>
        <span class="asset-name">${file.name}</span>
        <button class="remove-asset-btn">&times;</button>
    `;
    assetList.appendChild(assetItem);
    assetItem.querySelector('.remove-asset-btn').addEventListener('click', () => assetItem.remove());
}

// THIS IS THE CORRECT, WORKING VERSION OF THE FUNCTION
function addImageAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    // This is the correct, modern, and secure method.
    // It creates a direct memory reference to the file that the browser can safely display.
    const imageURL = URL.createObjectURL(file);

    assetItem.innerHTML = `
        <img src="${imageURL}" class="asset-thumbnail">
        <span class="asset-name">${file.name}</span>
        <button class="remove-asset-btn">&times;</button>
    `;

    assetList.appendChild(assetItem);
    assetItem.querySelector('.remove-asset-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        assetItem.remove();
        URL.revokeObjectURL(imageURL); // Clean up the memory reference
    });
}


// --- Imaging Studio Logic ---
function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;

    const gemsData = {
        "Primary Art Style": ["Photorealistic", "Illustration", "Concept Art", "Anime", "Pixel Art", "Art Deco"],
        "Pose / Framing": ["Close-up Portrait", "Full Body", "Action Pose", "Concept Sheet", "Landscape", "Establishing Shot"],
        "Lighting Style": ["Studio Lighting", "Cinematic", "Natural Light", "Noir", "Golden Hour", "Cyberpunk Neon"],
        "Color Palette": ["Vibrant & Saturated", "Monochromatic", "Pastel", "Muted Tones", "Triadic", "Analogous"],
        "Artist Influences": "text"
    };

    let html = '';
    for (const [title, options] of Object.entries(gemsData)) {
        html += `<div class="gem-group"><h5 class="gem-title">${title}</h5><div class="gem-options">`;
        if (Array.isArray(options)) {
            options.forEach(option => {
                html += `<button class="gem-option">${option}</button>`;
            });
        } else if (options === 'text') {
            html += `<input type="text" class="input-field" placeholder="e.g., Alphonse Mucha, Syd Mead">`;
        }
        html += `</div></div>`;
    }
    container.innerHTML = html;

    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('gem-option')) {
            // Allow multiple selections by simply toggling
            e.target.classList.toggle('active');
        }
    });
}

async function generateImage() {
    const generateBtn = document.getElementById('generate-button');
    const imageContainer = document.getElementById('image-container');
    const toolbar = document.getElementById('image-toolbar');

    const apiKey = localStorage.getItem('AIME_API_KEY');
    if (!apiKey) {
        alert('API Key not found. Please set it in the settings.');
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    toolbar.classList.add('hidden');
    imageContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="loading-spinner"></div>
            <p class="loading-text">AIME is crafting your vision...</p>
        </div>`;

    const promptText = craftImageSuperPrompt();

    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
        const payload = {
            instances: [{ prompt: promptText }],
            parameters: { "sampleCount": 1 }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        if (result.predictions && result.predictions.length > 0 && result.predictions[0].bytesBase64Encoded) {
            const imageUrl = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
            imageContainer.innerHTML = `<img src="${imageUrl}" alt="Generated Image">`;
            toolbar.classList.remove('hidden');
        } else {
            imageContainer.innerHTML = `<p class="placeholder-text">Could not generate image. Response was empty.</p>`;
        }
    } catch (error) {
        console.error('Error generating image:', error);
        imageContainer.innerHTML = `<p class="placeholder-text">An error occurred during image generation. Check the console for details.</p>`;
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Image';
    }
}


function craftImageSuperPrompt() {
    const mainPrompt = document.getElementById('main-prompt').value;
    let finalPrompt = mainPrompt;

    const gemGroups = document.querySelectorAll('.gem-group');
    gemGroups.forEach(group => {
        const title = group.querySelector('.gem-title').textContent.trim();
        const activeGems = group.querySelectorAll('.gem-option.active');
        const textInput = group.querySelector('.input-field');

        if (activeGems.length > 0) {
            const selectedOptions = Array.from(activeGems).map(gem => gem.textContent.trim()).join(', ');
            finalPrompt += `, ${title}: ${selectedOptions}`;
        }

        if (textInput && textInput.value.trim() !== '') {
            finalPrompt += `, with influences from ${textInput.value.trim()}`;
        }
    });

    const assetList = document.getElementById('asset-list');
    const assets = assetList.querySelectorAll('.asset-name');
    if (assets.length > 0) {
        const assetNames = Array.from(assets).map(asset => asset.textContent.trim().replace(/\.[^/.]+$/, "")).join(', ');
        finalPrompt += `, featuring elements from: ${assetNames}`;
    }

    console.log("Final Image Prompt:", finalPrompt);
    return finalPrompt;
}


function initializeImageGeneration() {
    const generateBtn = document.getElementById('generate-button');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateImage);
    }
}


function initializeToolbar() {
    const toolbar = document.getElementById('image-toolbar');
    if (!toolbar) return;
    toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('.toolbar-btn');
        if (!button) return;
        const action = button.dataset.action;
        switch (action) {
            case 'new':
                document.getElementById('image-container').innerHTML = `<p class="placeholder-text">Your generated image will appear here.</p>`;
                toolbar.classList.add('hidden');
                document.getElementById('main-prompt').value = '';
                break;
            case 'variations':
                console.log('Generate Variations clicked');
                // Placeholder for variations logic
                alert('Variations functionality not yet implemented.');
                break;
            case 'upscale':
                console.log('Upscale clicked');
                // Placeholder for upscale logic
                alert('Upscale functionality not yet implemented.');
                break;
            case 'save':
                const image = document.querySelector('#image-container img');
                if (image) {
                    const link = document.createElement('a');
                    link.href = image.src;
                    link.download = 'aime-generated-image.png';
                    link.click();
                }
                break;
        }
    });
}


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns();
    initializeAccordions();
    initializeAssetImporter();
    initializeGuidanceGems();
    initializeImageGeneration();
    initializeToolbar();
});

