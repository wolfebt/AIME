/*
    File: element-bundle.js
    Reference: Element Pages Logic
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
         // Set initial state for active accordions
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
        "Tone": ["Serious", "Humorous", "Dark", "Optimistic", "Gritty"],
        "Pacing": ["Fast-paced", "Slow-burn", "Methodical"],
        "Complexity": ["Simple & Direct", "Nuanced & Layered", "Intricate & Detailed"],
        "Style": ["Cinematic", "Literary", "Scientific", "Mythological"]
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


// --- AI Generation Logic ---

function craftSuperPrompt(elementType) {
    let promptData = {
        elementType: elementType,
        fields: {},
        gems: [],
        assets: []
    };

    const inputs = document.querySelectorAll('.main-column .input-field');
    inputs.forEach(input => {
        if (input.id && input.value) {
            const label = document.querySelector(`label[for="${input.id}"]`);
            promptData.fields[label ? label.textContent : input.id] = input.value;
        }
    });

    const activeGems = document.querySelectorAll('#guidance-gems-container .gem-option.active');
    activeGems.forEach(gem => promptData.gems.push(gem.textContent));

    const assetItems = document.querySelectorAll('#asset-list .asset-name');
    assetItems.forEach(item => promptData.assets.push(item.textContent));

    let formattedPrompt = `You are AIME, an AI creative partner. Your task is to generate a detailed and creative description for a world-building element based on user-provided details.\n\n`;
    formattedPrompt += `--- GENERATION REQUEST ---\n`;
    formattedPrompt += `ELEMENT TYPE: ${promptData.elementType}\n\n`;
    
    formattedPrompt += `--- CORE DETAILS ---\n`;
    for (const [key, value] of Object.entries(promptData.fields)) {
        formattedPrompt += `${key}: ${value}\n`;
    }
    
    if (promptData.gems.length > 0) {
        formattedPrompt += `\n--- GUIDANCE GEMS (TONE & STYLE) ---\n`;
        formattedPrompt += `Adhere to these styles: ${promptData.gems.join(', ')}\n`;
    }

    if (promptData.assets.length > 0) {
        formattedPrompt += `\n--- CONTEXTUAL ASSETS (REFERENCE THESE) ---\n`;
        formattedPrompt += `Use the following as context: ${promptData.assets.join(', ')}\n`;
    }
    
    formattedPrompt += `\n--- TASK ---\nBased on all the information above, write a comprehensive, well-structured, and imaginative description for this element. Use paragraphs, and be descriptive.`;

    return formattedPrompt;
}

async function generateContent(prompt) {
    const apiKey = ""; // This will be handled by the environment.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: prompt
            }]
        }],
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            return candidate.content.parts[0].text;
        } else {
            throw new Error("Invalid response format from API.");
        }
    } catch (error) {
        console.error("Error generating content:", error);
        return "An error occurred while generating content. Please check the console for details.";
    }
}


function initializeGeneration() {
    const generateButton = document.getElementById('generate-button');
    const responseContainer = document.getElementById('response-container');
    if (!generateButton || !responseContainer) return;

    generateButton.addEventListener('click', async () => {
        const elementType = generateButton.dataset.elementType;
        const superPrompt = craftSuperPrompt(elementType);
        
        console.log("--- Generated Super-Prompt ---");
        console.log(superPrompt);
        
        responseContainer.innerHTML = '<p class="loading-text">AIME is crafting your vision...</p>';
        generateButton.disabled = true;

        const aiResponse = await generateContent(superPrompt);
        
        // Sanitize and format the response for display
        const formattedResponse = aiResponse
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br>");

        responseContainer.innerHTML = `
            <div class="response-content">
                <h4>Generated ${elementType.charAt(0) + elementType.slice(1).toLowerCase()} Description</h4>
                <p>${formattedResponse}</p>
            </div>
        `;
        generateButton.disabled = false;
    });
}

// --- Utility Functions ---
function initializeClearFields() {
    const clearButton = document.getElementById('clear-fields-button');
    if(clearButton) {
        clearButton.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.main-column .input-field');
            inputs.forEach(input => input.value = '');
            const responseContainer = document.getElementById('response-container');
            if (responseContainer) {
                responseContainer.innerHTML = '';
            }
        });
    }
}


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // initializeResizableColumns(); // Disabled for now
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeGeneration();
    initializeClearFields();
});

