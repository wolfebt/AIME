/*
    File: imaging-bundle.js
    Reference: Imaging Studio Logic
    Creator: Wolfe.BT, TangentLLC
*/

// --- Global Data Stores ---
let loadedAssets = []; // Data store for asset content
let referenceImageAssetId = null; // ID of the asset designated as the reference image
let selectedGems = {}; // Data store for all selected positive guidance options
let gemsData = {};     // Holds the specific positive gem configuration for the current page
let selectedNegativeGems = {}; // Data store for all selected negative guidance options
let negativeGemsData = {}; // Holds the specific negative gem configuration for the current page

const allGemsData = {
    "IMAGING": {
        "Style & Medium": ["Photorealistic", "Oil Painting", "Watercolor", "Illustration", "3D Render", "Pixel Art", "Anime", "Concept Art", "Line Art"],
        "Aesthetics": ["Cinematic", "Ethereal", "Gritty", "Vibrant", "Minimalist", "Surreal", "Gothic", "Steampunk", "Cyberpunk", "Art Deco"],
        "Composition": ["Wide Shot", "Full Shot", "Medium Shot", "Close-up", "Dutch Angle", "Symmetrical", "Asymmetrical", "Leading Lines"],
        "Lighting": ["Soft Light", "Hard Light", "Dramatic Lighting", "Backlight", "Rim Lighting", "Golden Hour", "Blue Hour", "Studio Lighting"],
        "Color Palette": ["Vivid & Saturated", "Muted & Desaturated", "Monochromatic", "Analogous", "Complementary", "Triadic", "Pastel"],
        "Camera & Film": ["DSLR", "Vintage Film", "Polaroid", "Lomo", "35mm", "Long Exposure", "Macro", "Telephoto Lens", "Shallow Depth of Field"]
    },
    "IMAGING_NEGATIVE": {
        "Image Quality": ["Blurry", "Pixelated", "Low-resolution", "JPEG artifacts", "Noise", "Grainy", "Watermark", "Signature", "Text"],
        "Anatomy & Form": ["Deformed", "Malformed", "Disfigured", "Ugly", "Bad anatomy", "Extra limbs", "Missing limbs", "Mutated hands", "Poorly drawn face"],
        "Color Issues": ["Dull colors", "Oversaturated", "Underexposed", "Overexposed", "Black and white", "Monochrome"],
        "Composition & Style": ["Cluttered", "Asymmetrical", "Bad composition", "Out of frame", "Cropped", "Amateur", "Unprofessional"]
    }
};

// --- Helper Functions ---
function showLoading(show, message = "AIME is generating your image...") {
    const gallery = document.getElementById('image-gallery');
    if (show) {
        gallery.innerHTML = `
            <div class="loading-indicator">
                <div class="loading-spinner"></div>
                <p class="loading-text">${message}</p>
            </div>`;
    } else {
        gallery.innerHTML = ''; // Clear loading indicator
    }
}

function showError(message, container) {
    container.innerHTML = `<div class="placeholder-gallery"><p class="error-text">${message}</p></div>`;
}

function craftSuperPrompt(basePrompt) {
    let processedPrompt = basePrompt;

    // Add annotations from all loaded assets (excluding the referenced image itself)
    loadedAssets.forEach(asset => {
        // This check ensures we don't re-add annotations from the image being processed,
        // as its information is already part of the basePrompt via Gemini Vision.
        if (asset.id !== referenceImageAssetId && asset.annotation && asset.importance !== 'Non-Informative') {
            processedPrompt += `, ${asset.annotation}`;
        }
    });

    // Add all selected guidance gems
    const guidanceKeywords = Object.values(selectedGems).flat();
    if (guidanceKeywords.length > 0) {
        processedPrompt += `, ${guidanceKeywords.join(', ')}`;
    }

    const cleanedPrompt = processedPrompt.replace(/\s+/g, ' ').trim().replace(/, ,/g, ',').replace(/,$/, '');
    console.log("Final Super Prompt:", cleanedPrompt);
    return cleanedPrompt;
}

// --- API Call Functions ---
async function analyzeImageWithGemini(imageAsset, userApiKey) {
    const visionModel = 'gemini-2.0-flash'; // This can be updated to other vision models
    const apiUrl = `/api/proxy`; // UPDATED to use the backend proxy

    const imageMimeType = imageAsset.content.split(';')[0].split(':')[1];
    const imageBase64 = imageAsset.content.split(',')[1];

    const payload = {
        model: visionModel, // Pass the desired model to our proxy
        contents: [{
            parts: [
                { text: "Describe this image in detail. Focus on elements, style, and composition that would be useful for a text-to-image AI. Be descriptive and concise." },
                {
                    inline_data: {
                        mime_type: imageMimeType,
                        data: imageBase64
                    }
                }
            ]
        }]
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-AIME-API-Key': userApiKey || '' // Send the key via header
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    const description = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!description) {
        throw new Error("Could not get a description from the vision model.");
    }
    return description;
}

async function generateImageWithImagen(prompt, negativePrompt, userApiKey) {
    const generationModel = 'imagen-3.0-generate-002';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${generationModel}:predict?key=${userApiKey}`;

    const payload = {
        instances: [{
            prompt: prompt,
            negativePrompt: negativePrompt
        }],
        parameters: { "sampleCount": 1 }
    };

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    const imageBase64 = result.predictions?.[0]?.bytesBase64Encoded;
    if (!imageBase64) {
        throw new Error("API returned a valid response but no image data was found.");
    }
    return imageBase64;
}

// --- Main Handler ---
async function handleImageGeneration() {
    const generateButton = document.getElementById('generate-button');
    const gallery = document.getElementById('image-gallery');
    const userApiKey = localStorage.getItem('AIME_API_KEY');

    if (!userApiKey) {
        showError("API Key is missing. Please set it in the settings menu.", gallery);
        return;
    }

    const initialPromptText = document.getElementById('prompt-input').value.trim();
    if (!initialPromptText) {
        showError("The main prompt cannot be empty.", gallery);
        return;
    }

    generateButton.disabled = true;
    showLoading(true, "Initializing...");

    // --- Craft Final Negative Prompt ---
    const customNegativePrompt = document.getElementById('negative-prompt-input').value.trim();
    const negativeKeywords = Object.values(selectedNegativeGems).flat();
    let finalNegativePrompt = customNegativePrompt;

    if (negativeKeywords.length > 0) {
        finalNegativePrompt += (finalNegativePrompt ? ', ' : '') + negativeKeywords.join(', ');
    }

    // --- Placeholder and Asset Identification ---
    let textPrompt = initialPromptText;
    const placeholders = textPrompt.match(/\[(.*?)\]/g) || [];

    // --- Asset Placeholder Replacement (Text/JSON) ---
    // This part of the logic remains to handle non-image asset placeholders.
    for (const placeholder of placeholders) {
        const fileName = placeholder.substring(1, placeholder.length - 1);
        const asset = loadedAssets.find(a => a.fileName === fileName);
        if (asset && (asset.type === 'text' || asset.type === 'json')) {
             let replacementText = '';
            if (asset.type === 'text' && asset.content) {
                replacementText = asset.content;
            } else if (asset.type === 'json' && asset.content) {
                try {
                    const jsonObj = JSON.parse(asset.content);
                    replacementText = Object.values(jsonObj).filter(v => typeof v === 'string').join(', ');
                } catch (e) { /* ignore */ }
            }
            textPrompt = textPrompt.replace(placeholder, replacementText);
        }
    }

    try {
        let basePromptForSuperPrompt;
        const referencedImageAsset = loadedAssets.find(a => a.id === referenceImageAssetId);

        if (referencedImageAsset) {
            // --- Multimodal Two-Step Path ---
            const userTextOnly = textPrompt.replace(`[${referencedImageAsset.fileName}]`, '').trim();
             if (!userTextOnly) {
                throw new Error("A text prompt is required even when using a reference image.");
            }

            showLoading(true, "Analyzing reference image...");
            console.log("Step 1: Analyzing image with Gemini Vision...");
            const imageDescription = await analyzeImageWithGemini(referencedImageAsset, userApiKey);
            console.log("Image description received:", imageDescription);

            showLoading(true, "Generating final image...");
            console.log("Step 2: Generating image with Imagen...");
            basePromptForSuperPrompt = `${userTextOnly}, incorporating these elements: ${imageDescription}`;

        } else {
            // --- Text-Only Path ---
            console.log("Generating image with Imagen (text-only)...");
            basePromptForSuperPrompt = textPrompt;
        }

        const finalPrompt = craftSuperPrompt(basePromptForSuperPrompt);
        const imageBase64 = await generateImageWithImagen(finalPrompt, finalNegativePrompt, userApiKey);

        showLoading(false);
        const imageUrl = `data:image/png;base64,${imageBase64}`;
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = initialPromptText;
        imgElement.className = 'generated-image';
        gallery.appendChild(imgElement);

    } catch (error) {
        console.error("Image Generation Error:", error);
        showError(`Error: ${error.message}`, gallery);
    } finally {
        generateButton.disabled = false;
        generateButton.textContent = 'Generate';
    }
}


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
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.body.style.cursor = 'default';
            resizeHandle.classList.remove('resizing');
        });
        document.body.style.cursor = 'col-resize';
        resizeHandle.classList.add('resizing');
    });
    function handleMouseMove(e) {
        if (!isResizing) return;
        const containerRect = workspace.getBoundingClientRect();
        const newLeftWidth = e.clientX - containerRect.left;
        let newLeftPercent = (newLeftWidth / containerRect.width) * 100;
        newLeftPercent = Math.max(20, Math.min(80, newLeftPercent));
        mainColumn.style.width = `calc(${newLeftPercent}% - 2px)`;
        sideColumn.style.width = `calc(${100 - newLeftPercent}% - 2px)`;
    }
}

// --- Guidance Gems Logic ---
function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;
    const modalOverlay = document.getElementById('gem-selection-modal-overlay');
    const modalTitle = document.getElementById('gem-modal-title');
    const modalOptionsContainer = document.getElementById('gem-modal-options-container');
    const modalSaveBtn = document.getElementById('gem-modal-save-btn');
    const modalCloseBtn = document.getElementById('gem-modal-close-btn');
    const customGemInput = document.getElementById('custom-gem-input');
    const addCustomGemBtn = document.getElementById('add-custom-gem-btn');
    if (!modalOverlay) return;

    function addCustomGem() {
        const category = modalOverlay.dataset.currentCategory;
        const value = customGemInput.value.trim();
        if (!category || value === '') return;
        if (gemsData[category] && gemsData[category].map(v => v.toLowerCase()).includes(value.toLowerCase())) {
            customGemInput.value = '';
            return;
        }
        if (!gemsData[category]) gemsData[category] = [];
        gemsData[category].push(value);
        const button = document.createElement('button');
        button.className = 'gem-modal-option-button active';
        button.textContent = value;
        button.dataset.value = value;
        modalOptionsContainer.appendChild(button);
        customGemInput.value = '';
        customGemInput.focus();
    }

    function renderSelectedGems(category) {
        const categoryContainer = container.querySelector(`[data-category="${category}"]`);
        if (!categoryContainer) return;
        const pillContainer = categoryContainer.querySelector('.gem-pill-container');
        pillContainer.innerHTML = '';
        if (selectedGems[category] && selectedGems[category].length > 0) {
            selectedGems[category].forEach(gemText => {
                const pill = document.createElement('span');
                pill.className = 'gem-selected-pill';
                pill.textContent = gemText;
                pillContainer.appendChild(pill);
            });
        } else {
            pillContainer.innerHTML = `<span class="gem-selected-placeholder">None selected</span>`;
        }
    }

    function openGemsModal(category) {
        modalTitle.textContent = `Select ${category}`;
        modalOptionsContainer.innerHTML = '';
        modalOverlay.dataset.currentCategory = category;
        const options = gemsData[category] || [];
        const currentSelections = selectedGems[category] || [];
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'gem-modal-option-button';
            button.textContent = option;
            button.dataset.value = option;
            if (currentSelections.includes(option)) button.classList.add('active');
            modalOptionsContainer.appendChild(button);
        });
        customGemInput.value = '';
        modalOverlay.classList.remove('hidden');
        customGemInput.focus();
    }

    function closeGemsModal() {
        modalOverlay.classList.add('hidden');
    }

    function saveGemsSelection() {
        const category = modalOverlay.dataset.currentCategory;
        if (!category) return;
        const selectedButtons = modalOptionsContainer.querySelectorAll('.gem-modal-option-button.active');
        selectedGems[category] = Array.from(selectedButtons).map(btn => btn.dataset.value);
        renderSelectedGems(category);
        closeGemsModal();
    }

    const generateButton = document.getElementById('generate-button');
    const elementType = generateButton ? generateButton.dataset.elementType : 'IMAGING';
    gemsData = (elementType && allGemsData[elementType]) ? { ...allGemsData[elementType] } : {};

    container.innerHTML = '';
    for (const category of Object.keys(gemsData)) {
        selectedGems[category] = [];
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'gem-category-container';
        categoryContainer.dataset.category = category;
        categoryContainer.innerHTML = `
            <button class="gem-category-button">${category}</button>
            <div class="gem-pill-container">
                <span class="gem-selected-placeholder">None selected</span>
            </div>`;
        container.appendChild(categoryContainer);
    }

    container.addEventListener('click', e => {
        if (e.target.matches('.gem-category-button')) {
            openGemsModal(e.target.closest('.gem-category-container').dataset.category);
        }
    });

    modalSaveBtn.addEventListener('click', saveGemsSelection);
    modalCloseBtn.addEventListener('click', closeGemsModal);
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeGemsModal(); });
    modalOptionsContainer.addEventListener('click', e => { if (e.target.matches('.gem-modal-option-button')) e.target.classList.toggle('active'); });
    addCustomGemBtn.addEventListener('click', addCustomGem);
    customGemInput.addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); addCustomGem(); } });
}

// --- Negative Guidance Gems Logic ---
function initializeNegativeGuidanceGems() {
    const container = document.getElementById('negative-guidance-gems-container');
    if (!container) return;

    const modalOverlay = document.getElementById('negative-gem-selection-modal-overlay');
    const modalTitle = document.getElementById('negative-gem-modal-title');
    const modalOptionsContainer = document.getElementById('negative-gem-modal-options-container');
    const modalSaveBtn = document.getElementById('negative-gem-modal-save-btn');
    const modalCloseBtn = document.getElementById('negative-gem-modal-close-btn');
    const customGemInput = document.getElementById('negative-custom-gem-input');
    const addCustomGemBtn = document.getElementById('negative-add-custom-gem-btn');
    if (!modalOverlay) return;

    // Load the data for negative gems
    negativeGemsData = { ...allGemsData["IMAGING_NEGATIVE"] };

    function addCustomGem() {
        const category = modalOverlay.dataset.currentCategory;
        const value = customGemInput.value.trim();
        if (!category || value === '') return;
        if (negativeGemsData[category] && negativeGemsData[category].map(v => v.toLowerCase()).includes(value.toLowerCase())) {
            customGemInput.value = '';
            return;
        }
        if (!negativeGemsData[category]) negativeGemsData[category] = [];
        negativeGemsData[category].push(value);
        const button = document.createElement('button');
        button.className = 'gem-modal-option-button active';
        button.textContent = value;
        button.dataset.value = value;
        modalOptionsContainer.appendChild(button);
        customGemInput.value = '';
        customGemInput.focus();
    }

    function renderSelectedGems(category) {
        const categoryContainer = container.querySelector(`[data-category="${category}"]`);
        if (!categoryContainer) return;
        const pillContainer = categoryContainer.querySelector('.gem-pill-container');
        pillContainer.innerHTML = '';
        if (selectedNegativeGems[category] && selectedNegativeGems[category].length > 0) {
            selectedNegativeGems[category].forEach(gemText => {
                const pill = document.createElement('span');
                pill.className = 'gem-selected-pill';
                pill.textContent = gemText;
                pillContainer.appendChild(pill);
            });
        } else {
            pillContainer.innerHTML = `<span class="gem-selected-placeholder">None selected</span>`;
        }
    }

    function openGemsModal(category) {
        modalTitle.textContent = `Select Negative ${category}`;
        modalOptionsContainer.innerHTML = '';
        modalOverlay.dataset.currentCategory = category;
        const options = negativeGemsData[category] || [];
        const currentSelections = selectedNegativeGems[category] || [];
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'gem-modal-option-button';
            button.textContent = option;
            button.dataset.value = option;
            if (currentSelections.includes(option)) button.classList.add('active');
            modalOptionsContainer.appendChild(button);
        });
        customGemInput.value = '';
        modalOverlay.classList.remove('hidden');
        customGemInput.focus();
    }

    function closeGemsModal() {
        modalOverlay.classList.add('hidden');
    }

    function saveGemsSelection() {
        const category = modalOverlay.dataset.currentCategory;
        if (!category) return;
        const selectedButtons = modalOptionsContainer.querySelectorAll('.gem-modal-option-button.active');
        selectedNegativeGems[category] = Array.from(selectedButtons).map(btn => btn.dataset.value);
        renderSelectedGems(category);
        closeGemsModal();
    }

    container.innerHTML = '';
    for (const category of Object.keys(negativeGemsData)) {
        selectedNegativeGems[category] = [];
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'gem-category-container';
        categoryContainer.dataset.category = category;
        categoryContainer.innerHTML = `
            <button class="gem-category-button">${category}</button>
            <div class="gem-pill-container">
                <span class="gem-selected-placeholder">None selected</span>
            </div>`;
        container.appendChild(categoryContainer);
    }

    container.addEventListener('click', e => {
        if (e.target.matches('.gem-category-button')) {
            openGemsModal(e.target.closest('.gem-category-container').dataset.category);
        }
    });

    modalSaveBtn.addEventListener('click', saveGemsSelection);
    modalCloseBtn.addEventListener('click', closeGemsModal);
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeGemsModal(); });
    modalOptionsContainer.addEventListener('click', e => { if (e.target.matches('.gem-modal-option-button')) e.target.classList.toggle('active'); });
    addCustomGemBtn.addEventListener('click', addCustomGem);
    customGemInput.addEventListener('keypress', e => { if (e.key === 'Enter') { e.preventDefault(); addCustomGem(); } });
}

function initializeAccordions() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        const content = header.nextElementSibling;

        // Set initial state on page load based on the 'active' class on the header
        if (header.classList.contains('active')) {
            if (content) content.classList.add('active');
        } else {
            if (content) content.classList.remove('active');
        }

        header.addEventListener('click', () => {
            header.classList.toggle('active');
            if (content) content.classList.toggle('active');
        });
    });
}


// --- Workspace Actions ---
function saveImage() {
    const gallery = document.getElementById('image-gallery');
    const imageElement = gallery.querySelector('.generated-image');

    if (!imageElement) {
        showToast("No image to save.", "error");
        return;
    }

    const promptText = document.getElementById('prompt-input').value.trim();
    const filename = promptText ? promptText.substring(0, 50).replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'generated_image';

    const link = document.createElement('a');
    link.href = imageElement.src;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Image saved successfully!");
}

function clearWorkspace() {
    // Clear prompts
    document.getElementById('prompt-input').value = '';
    document.getElementById('negative-prompt-input').value = '';

    // Clear image gallery and restore placeholder
    const gallery = document.getElementById('image-gallery');
    gallery.innerHTML = `<div class="placeholder-gallery"><p>Your generated images will appear here.</p></div>`;

    // Clear selected gems and re-render the UI
    selectedGems = {};
    initializeGuidanceGems(); // This will re-render the positive gems UI

    // Clear selected negative gems and re-render the UI
    selectedNegativeGems = {};
    initializeNegativeGuidanceGems(); // This will re-render the negative gems UI

    // Clear assets and reference image
    loadedAssets = [];
    referenceImageAssetId = null;
    renderAssetList();


    showToast("Workspace cleared.");
}

function setReferenceImage(assetId) {
    // If the same asset is clicked again, deselect it.
    if (referenceImageAssetId === assetId) {
        referenceImageAssetId = null;
    } else {
        // Find the asset to ensure it's an image before setting it
        const asset = loadedAssets.find(a => a.id === assetId);
        if (asset && asset.type === 'image') {
            referenceImageAssetId = assetId;
        }
    }
    renderAssetList(); // Re-render to update the button text and styles
}


// --- Event Listeners and Initializers ---
function initializeButtons() {
    const generateButton = document.getElementById('generate-button');
    if (generateButton) generateButton.addEventListener('click', handleImageGeneration);

    const saveButton = document.getElementById('save-button');
    if (saveButton) saveButton.addEventListener('click', saveImage);

    const newButton = document.getElementById('new-button');
    if (newButton) newButton.addEventListener('click', clearWorkspace);
}

function initializeAssetImporter() {
    const importBtn = document.getElementById('import-asset-btn');
    const fileInput = document.getElementById('asset-upload');

    if (!importBtn || !fileInput) return;

    importBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (event) => {
        const files = event.target.files;
        if (!files.length) return;

        for (const file of files) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const assetData = {
                    id: `asset-${Date.now()}-${Math.random()}`,
                    fileName: file.name,
                    content: e.target.result,
                    importance: 'Typical',
                    annotation: ''
                };

                const extension = file.name.split('.').pop().toLowerCase();
                const aimeExtensions = ['persona', 'world', 'setting', 'scene', 'species', 'philosophy', 'technology', 'universe'];

                if (file.type.startsWith('image/')) {
                    assetData.type = 'image';
                } else if (aimeExtensions.includes(extension) || file.name.endsWith('.json')) {
                    assetData.type = 'json';
                } else {
                    assetData.type = 'text';
                }

                loadedAssets.push(assetData);
                renderAssetList();
            };

            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        }
        event.target.value = null;
    });
}

function renderAssetList() {
    const assetList = document.getElementById('asset-list');
    if (!assetList) return;

    assetList.innerHTML = '';

    if (loadedAssets.length === 0) return;

    loadedAssets.forEach(asset => {
        const assetItem = document.createElement('div');
        assetItem.className = 'asset-item';
        if (asset.id === referenceImageAssetId) {
            assetItem.classList.add('is-reference');
        }

        let iconHtml;
        if (asset.type === 'image') {
            iconHtml = `<img src="${asset.content}" class="asset-thumbnail" alt="${asset.fileName}">`;
        } else {
            iconHtml = `<span class="asset-icon-text">TXT</span>`;
        }

        let referenceButtonHtml = '';
        if (asset.type === 'image') {
            const isReference = asset.id === referenceImageAssetId;
            const buttonText = isReference ? 'Clear Reference' : 'Use as Reference';
            referenceButtonHtml = `<button class="reference-asset-btn action-btn" data-asset-id="${asset.id}">${buttonText}</button>`;
        }

        assetItem.innerHTML = `
            <div class="asset-main-info">
                <div class="asset-info">
                    ${iconHtml}
                    <span class="asset-name">${asset.fileName}</span>
                </div>
                <div class="asset-buttons">
                    ${referenceButtonHtml}
                    <button class="remove-asset-btn" data-asset-id="${asset.id}">&times;</button>
                </div>
            </div>
            <div class="asset-controls">
                <select class="asset-importance-selector" data-asset-id="${asset.id}">
                    <option value="Typical" ${asset.importance === 'Typical' ? 'selected' : ''}>Typical Importance</option>
                    <option value="High" ${asset.importance === 'High' ? 'selected' : ''}>High Importance</option>
                    <option value="Low" ${asset.importance === 'Low' ? 'selected' : ''}>Low Importance</option>
                    <option value="Non-Informative" ${asset.importance === 'Non-Informative' ? 'selected' : ''}>Non-Informative</option>
                </select>
                <input type="text" class="asset-annotation-input" data-asset-id="${asset.id}" value="${asset.annotation}" placeholder="Add a directorial note...">
            </div>
        `;
        assetList.appendChild(assetItem);
    });
}

// Global event listeners for asset management
document.addEventListener('click', (e) => {
    if (e.target.matches('.remove-asset-btn')) {
        const assetId = e.target.dataset.assetId;
        loadedAssets = loadedAssets.filter(asset => asset.id !== assetId);
        // If the removed asset was the reference image, clear the reference
        if (referenceImageAssetId === assetId) {
            referenceImageAssetId = null;
        }
        renderAssetList();
    } else if (e.target.matches('.reference-asset-btn')) {
        const assetId = e.target.dataset.assetId;
        setReferenceImage(assetId);
    }
});

document.addEventListener('change', e => {
    if (e.target.matches('.asset-importance-selector')) {
        const assetId = e.target.dataset.assetId;
        const asset = loadedAssets.find(a => a.id === assetId);
        if (asset) asset.importance = e.target.value;
    }
});

document.addEventListener('input', e => {
    if (e.target.matches('.asset-annotation-input')) {
        const assetId = e.target.dataset.assetId;
        const asset = loadedAssets.find(a => a.id === assetId);
        if (asset) asset.annotation = e.target.value;
    }
});


document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns();
    initializeAccordions();
    initializeGuidanceGems();
    initializeNegativeGuidanceGems();
    initializeButtons(); // Replaces initializeImageGenerationButton
    initializeAssetImporter();
});

