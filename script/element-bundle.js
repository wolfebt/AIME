/*
    File: element-bundle.js
    Reference: Element Pages Logic
    Creator: Wolfe.BT, TangentLLC
*/

// --- Resizable Columns ---
function initializeResizableColumns() {
    // This functionality is currently disabled in the initializer at the bottom
    // to ensure stability, but the code is here for future implementation.
    const workspace = document.querySelector('.workspace-layout');
    if (!workspace) return;

    const mainColumn = workspace.querySelector('.main-column');
    const sideColumn = workspace.querySelector('.side-column');
    const resizeHandle = workspace.querySelector('.resize-handle');

    let isResizing = false;

    if (!resizeHandle) return;

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
        <div class="asset-info">
            <span class="asset-icon-text">TXT</span>
            <span class="asset-name">${file.name}</span>
        </div>
        <button class="remove-asset-btn">&times;</button>
    `;
    assetList.appendChild(assetItem);
    assetItem.querySelector('.remove-asset-btn').addEventListener('click', () => assetItem.remove());
}

function addImageAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    const imageURL = URL.createObjectURL(file);

    assetItem.innerHTML = `
        <div class="asset-info">
            <img src="${imageURL}" class="asset-thumbnail" alt="${file.name}">
            <span class="asset-name">${file.name}</span>
        </div>
        <button class="remove-asset-btn">&times;</button>
    `;
    assetList.appendChild(assetItem);
    assetItem.querySelector('.remove-asset-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        assetItem.remove();
        URL.revokeObjectURL(imageURL);
    });
}


// --- Guidance Gems ---
function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;

    const gemsData = {
        "Tone": ["Epic", "Gritty", "Mystical", "Hopeful", "Dystopian"],
        "Scope": ["Personal", "Planetary", "Galactic", "Cosmic"],
        "Core Theme": ["Conflict", "Exploration", "Mystery", "Survival", "Intrigue"]
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

// --- Element Generation Logic ---
async function generateElementContent(button) {
    const elementType = button.dataset.elementType;
    const responseContainer = document.getElementById('response-container');
    
    const apiKey = localStorage.getItem('AIME_API_KEY');
    if (!apiKey) {
        alert('API Key not found. Please set it in the settings.');
        return;
    }

    button.disabled = true;
    button.textContent = 'Generating...';
    responseContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="loading-spinner"></div>
            <p class="loading-text">AIME is forging your Element...</p>
        </div>`;

    const superPrompt = craftSuperPrompt(elementType);
    
    try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: superPrompt }] }] };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            responseContainer.innerHTML = `<div class="response-content">${text.replace(/\n/g, '<br>')}</div>`;
        } else {
            responseContainer.innerHTML = `<p class="error-text">Received an empty response from the AI.</p>`;
        }
    } catch (error) {
        console.error('Error generating content:', error);
        responseContainer.innerHTML = `<p class="error-text">An error occurred. Check the console for details.</p>`;
    } finally {
        button.disabled = false;
        button.textContent = 'Generate';
    }
}

function craftSuperPrompt(elementType) {
    let prompt = `You are AIME, an AI world-building assistant. The user wants to generate details for a "${elementType}" Element. Use the provided information to create a rich, detailed, and creative description.\n\n--- ELEMENT DETAILS ---\n`;
    
    const inputs = document.querySelectorAll('.form-section .input-field');
    inputs.forEach(input => {
        const label = input.previousElementSibling ? input.previousElementSibling.textContent : input.id;
        if (input.value.trim()) {
            prompt += `${label}: ${input.value.trim()}\n`;
        }
    });

    const activeGems = document.querySelectorAll('#guidance-gems-container .gem-option.active');
    if (activeGems.length > 0) {
        prompt += "\n--- GUIDANCE GEMS ---\n";
        activeGems.forEach(gem => prompt += `- ${gem.textContent.trim()}\n`);
    }

    const assetItems = document.querySelectorAll('#asset-list .asset-name');
    if (assetItems.length > 0) {
        prompt += "\n--- CONTEXTUAL ASSETS ---\n";
        assetItems.forEach(item => prompt += `- ${item.textContent.trim()}\n`);
    }

    prompt += `\n--- TASK ---\nGenerate the content for the "${elementType}" Element based on the data above. Be descriptive and imaginative. Format the output clearly with headings.`;
    
    console.log("Super Prompt:", prompt);
    return prompt;
}

function initializeGeneration() {
    const generateButton = document.getElementById('generate-button');
    if (generateButton) {
        generateButton.addEventListener('click', () => generateElementContent(generateButton));
    }
}

function initializeClearButton() {
    const clearButton = document.getElementById('clear-fields-button');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.form-section .input-field');
            inputs.forEach(input => input.value = '');
            const responseContainer = document.getElementById('response-container');
            if (responseContainer) responseContainer.innerHTML = '';
        });
    }
}

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // initializeResizableColumns(); // Intentionally disabled for stability
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeGeneration();
    initializeClearButton();
});

