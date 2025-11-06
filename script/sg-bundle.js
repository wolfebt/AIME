/*
    File: sg-bundle.js
    Reference: Scenario Guide Pages Logic
    Creator: AIME
*/

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
            content.classList.toggle('active'); // Toggle content visibility
            chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        });

        // Ensure initially active accordions are open on page load
        if (header.classList.contains('active')) {
            content.classList.add('active');
            chevron.style.transform = 'rotate(180deg)';
        }
    });
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

        // Clamp the percentage between 20% and 80%
        newLeftPercent = Math.max(20, Math.min(80, newLeftPercent));

        // The calc() accounts for half the handle's width (4px / 2 = 2px) to center the split
        mainColumn.style.width = `calc(${newLeftPercent}% - 2px)`;
        sideColumn.style.width = `calc(${100 - newLeftPercent}% - 2px)`;
    }
}



// --- Asset Hub Importer ---
let loadedAssets = []; // Data store for asset content

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
                    importance: 'Typical', // Default importance
                    annotation: ''       // Default annotation
                };

                const extension = file.name.split('.').pop().toLowerCase();
                const aimeExtensions = ['storyarc', 'adventure', 'npc', 'location', 'group', 'encounter', 'item', 'clue', 'map', 'handout'];

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
                reader.readAsDataURL(file); // For images
            } else {
                reader.readAsText(file); // For text-based files
            }
        }
        // Reset file input to allow re-uploading the same file
        event.target.value = null;
    });
}

function renderAssetList() {
    const assetList = document.getElementById('asset-list');
    if (!assetList) return;

    assetList.innerHTML = ''; // Clear the list before re-rendering

    loadedAssets.forEach(asset => {
        const assetItem = document.createElement('div');
        assetItem.className = 'asset-item';

        let iconHtml;
        let typeClass = '';

        if (asset.type === 'image') {
            iconHtml = `<img src="${asset.content}" class="asset-thumbnail" alt="${asset.fileName}">`;
            typeClass = 'image-asset';
        } else if (asset.type === 'json') {
            let parsedContent = {};
            try {
                parsedContent = JSON.parse(asset.content);
            } catch (e) {
                // If parsing fails, we can treat it as a simple text file visually
                console.error(`Failed to parse JSON for asset ${asset.fileName}:`, e);
            }
            const assetType = parsedContent.assetType || 'JSON';
            const isAimeAsset = !!parsedContent.assetType;
            iconHtml = isAimeAsset ? assetType.slice(0, 4) : 'JSON';
            typeClass = isAimeAsset ? 'aime-asset' : 'text-asset';
        } else {
            iconHtml = 'TXT';
            typeClass = 'text-asset';
        }

        const iconSpan = typeClass === 'image-asset' ? iconHtml : `<span class="${typeClass === 'aime-asset' ? 'asset-icon-aime' : 'asset-icon-text'}">${iconHtml}</span>`;

        // Note the data-asset-id attributes for event handling
        assetItem.innerHTML = `
            <div class="asset-main-info">
                <div class="asset-info">
                    ${iconSpan}
                    <span class="asset-name">${asset.fileName}</span>
                </div>
                <button class="remove-asset-btn" data-asset-id="${asset.id}">&times;</button>
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

// Global event listeners to manage the loadedAssets array
document.addEventListener('click', (e) => {
    if (e.target.matches('.remove-asset-btn')) {
        const assetId = e.target.dataset.assetId;
        loadedAssets = loadedAssets.filter(asset => asset.id !== assetId);
        renderAssetList();
    }
});

document.addEventListener('change', e => {
    if (e.target.matches('.asset-importance-selector')) {
        const assetId = e.target.dataset.assetId;
        const asset = loadedAssets.find(a => a.id === assetId);
        if (asset) {
            asset.importance = e.target.value;
        }
    }
});

document.addEventListener('input', e => {
    if (e.target.matches('.asset-annotation-input')) {
        const assetId = e.target.dataset.assetId;
        const asset = loadedAssets.find(a => a.id === assetId);
        if (asset) {
            asset.annotation = e.target.value;
        }
    }
});


// --- Guidance Gems ---
// REFACTORED: This entire section has been rewritten to use a modal for multi-selection.
let selectedGems = {}; // Data store for all selected guidance options

// MODIFICATION: Move gemsData to global scope for persistence
// This object now holds all gem configurations, keyed by element type.
const allGemsData = {
    "STORYARC": {
        "Pacing": ["Fast-paced", "Slow-burn", "Steady", "Urgent", "Relaxed"],
        "Tone": ["Serious", "Humorous", "Dark", "Uplifting", "Mysterious"],
        "Themes": ["Redemption", "Betrayal", "Discovery", "Survival", "Power"]
    },
    "ADVENTURE": {
        "Type": ["Dungeon Crawl", "Investigation", "Social Intrigue", "Wilderness Exploration"],
        "Tone": ["High-Action", "Suspenseful", "Lighthearted", "Horror"],
        "Complexity": ["Straightforward", "Multi-layered", "Sandbox"]
    },
    "NPC": {
        "Role": ["Ally", "Antagonist", "Quest Giver", "Information Broker", "Neutral"],
        "Temperament": ["Friendly", "Hostile", "Untrustworthy", "Mysterious", "Eccentric"],
        "Complexity": ["Simple", "Morally Ambiguous", "Secretly Important"]
    },
    "LOCATION": {
        "Atmosphere": ["Safe & Welcoming", "Dangerous & Hostile", "Eerie & Abandoned", "Bustling & Lively", "Ancient & Mysterious"],
        "Scale": ["Single Room", "Building", "District", "City", "Region"],
        "Features": ["Traps", "Hidden Passages", "Valuable Treasure", "Important NPCs"]
    },
    "GROUP": {
        "Attitude": ["Friendly", "Hostile", "Neutral", "Secretive"],
        "Power Level": ["Local Influence", "Regional Power", "Global Reach"],
        "Structure": ["Rigid Hierarchy", "Loose Alliance", "Cult-like"]
    },
    "ENCOUNTER": {
        "Type": ["Combat", "Social", "Puzzle", "Exploration"],
        "Difficulty": ["Easy", "Medium", "Hard", "Deadly"],
        "Pacing": ["Fast-paced", "Strategic", "Story-driven"]
    },
    "ITEM": {
        "Type": ["Weapon", "Armor", "Potion", "Magical Artifact", "Key Item"],
        "Properties": ["Single-use", "Rechargeable", "Cursed", "Sentient"],
        "Rarity": ["Common", "Uncommon", "Rare", "Legendary"]
    },
    "CLUE": {
        "Type": ["Physical Object", "Piece of Information", "Environmental Detail"],
        "Reliability": ["Accurate", "Misleading", "Partial"],
        "Importance": ["Critical", "Optional", "Red Herring"]
    },
    "MAP": {
        "Style": ["Schematic", "Artistic", "Schematic"],
        "Scope": ["Local", "Regional", "World"],
        "Features": ["Points of Interest", "Hidden Locations", "Dangers"]
    },
    "HANDOUT": {
        "Type": ["Letter", "Diary Entry", "Official Document", "Drawing"],
        "Style": ["Formal", "Informal", "Cryptic"],
        "Condition": ["Pristine", "Aged", "Damaged"]
    }
};

let gemsData = {}; // This will be populated dynamically based on the element type.

function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;

    // Modal elements - these will be added to the HTML of each element page
    const modalOverlay = document.getElementById('gem-selection-modal-overlay');
    const modalTitle = document.getElementById('gem-modal-title');
    const modalOptionsContainer = document.getElementById('gem-modal-options-container');
    const modalSaveBtn = document.getElementById('gem-modal-save-btn');
    const modalCloseBtn = document.getElementById('gem-modal-close-btn');
    const customGemInput = document.getElementById('custom-gem-input');
    const addCustomGemBtn = document.getElementById('add-custom-gem-btn');

    if (!modalOverlay || !modalTitle || !modalOptionsContainer || !modalSaveBtn || !modalCloseBtn || !customGemInput || !addCustomGemBtn) {
        // Fail silently if the modal isn't on the page yet.
        // This will be resolved when we add the modal HTML to the element pages.
        return;
    }

    // --- Functions ---
    function addCustomGem() {
        const category = modalOverlay.dataset.currentCategory;
        const value = customGemInput.value.trim();

        if (!category || value === '') return;

        // Prevent duplicates (case-insensitive)
        if (gemsData[category] && gemsData[category].map(v => v.toLowerCase()).includes(value.toLowerCase())) {
            customGemInput.value = '';
            return;
        }

        // Add to the main data source if it doesn't exist
        if (!gemsData[category]) {
            gemsData[category] = [];
        }
        gemsData[category].push(value);

        // Create and add the new button to the modal UI, and activate it
        const button = document.createElement('button');
        button.className = 'gem-modal-option-button active';
        button.textContent = value;
        button.dataset.value = value;
        modalOptionsContainer.appendChild(button);

        // Clear and refocus input for better UX
        customGemInput.value = '';
        customGemInput.focus();
    }


    function renderSelectedGems(category) {
        const categoryContainer = container.querySelector(`[data-category="${category}"]`);
        if (!categoryContainer) return;

        const pillContainer = categoryContainer.querySelector('.gem-pill-container');
        pillContainer.innerHTML = ''; // Clear existing pills

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
        modalOptionsContainer.innerHTML = ''; // Clear previous options
        modalOverlay.dataset.currentCategory = category; // Store which category is being edited

        const options = gemsData[category] || [];
        const currentSelections = selectedGems[category] || [];

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'gem-modal-option-button';
            button.textContent = option;
            button.dataset.value = option;
            if (currentSelections.includes(option)) {
                button.classList.add('active');
            }
            modalOptionsContainer.appendChild(button);
        });

        customGemInput.value = ''; // Clear previous custom input
        modalOverlay.classList.remove('hidden');
        customGemInput.focus(); // Focus on the input for easy typing
    }

    function closeGemsModal() {
        modalOverlay.classList.add('hidden');
    }

    function saveGemsSelection() {
        const category = modalOverlay.dataset.currentCategory;
        if (!category) return;

        const selectedButtons = modalOptionsContainer.querySelectorAll('.gem-modal-option-button.active');
        const newSelections = Array.from(selectedButtons).map(btn => btn.dataset.value);

        selectedGems[category] = newSelections;
        renderSelectedGems(category);
        closeGemsModal();
    }

    // --- Initial Setup ---

    // MODIFICATION: Dynamically select the correct gems based on the page's element type.
    const generateButton = document.getElementById('generate-button');
    const elementType = generateButton ? generateButton.dataset.elementType : null;

    if (elementType && allGemsData[elementType]) {
        // Create a shallow copy to prevent custom gems from modifying the original allGemsData object
        gemsData = { ...allGemsData[elementType] };
    } else {
        // Fallback for elements that don't have a specific gem set
        gemsData = {};
    }

    container.innerHTML = ''; // Clear existing content
    for (const category of Object.keys(gemsData)) {
        selectedGems[category] = []; // Initialize data store

        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'gem-category-container';
        categoryContainer.dataset.category = category;

        categoryContainer.innerHTML = `
            <button class="gem-category-button">${category}</button>
            <div class="gem-pill-container">
                <span class="gem-selected-placeholder">None selected</span>
            </div>
        `;
        container.appendChild(categoryContainer);
    }

    // --- Event Listeners ---

    container.addEventListener('click', e => {
        if (e.target.matches('.gem-category-button')) {
            const category = e.target.closest('.gem-category-container').dataset.category;
            openGemsModal(category);
        }
    });

    modalSaveBtn.addEventListener('click', saveGemsSelection);
    modalCloseBtn.addEventListener('click', closeGemsModal);
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) {
            closeGemsModal();
        }
    });

    modalOptionsContainer.addEventListener('click', e => {
        if (e.target.matches('.gem-modal-option-button')) {
            e.target.classList.toggle('active');
        }
    });

    addCustomGemBtn.addEventListener('click', addCustomGem);
    customGemInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // prevent form submission
            addCustomGem();
        }
    });
}

// --- Element Generation Logic ---
async function generateElementContent(button) {
    const elementType = button.dataset.elementType;
    const responseContainer = document.getElementById('response-container');
    const userApiKey = localStorage.getItem('AIME_API_KEY');

    if (!userApiKey && !confirm("You haven't set an API key. The application will try to use a server-configured key, which may not be available. Continue?")) {
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

    const model = 'gemini-2.5-flash-lite';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userApiKey}`;

    const payload = {
        contents: [{
            parts: [{
                text: superPrompt
            }]
        }]
    };

    const headers = {
        'Content-Type': 'application/json'
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            const errorDetails = result.error || { message: `API request failed with status ${response.status}` };
            console.error("API Error Response:", errorDetails);
            throw new Error(`API Error: ${errorDetails.message}`);
        }

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (text) {
            try {
                if (typeof marked === 'undefined') {
                    throw new Error('marked.js library is not loaded.');
                }
                responseContainer.innerHTML = marked.parse(text);

                document.getElementById('generate-button').classList.add('hidden');
                document.getElementById('iterate-button').classList.remove('hidden');
                document.getElementById('update-field-container').classList.remove('hidden');

            } catch (e) {
                console.error("Error parsing markdown:", e);
                responseContainer.innerHTML = `<p class="error-text">Error rendering content: ${e.message}</p>`;
            }
        } else {
            console.warn("Invalid or empty response from API.", result);
            const finishReason = result.candidates?.[0]?.finishReason;
            const safetyRatings = JSON.stringify(result.candidates?.[0]?.safetyRatings, null, 2);
            responseContainer.innerHTML = `<p class="error-text">Error: The AI model returned an empty response. This may be due to the safety filter. Finish Reason: ${finishReason}. Safety Ratings: ${safetyRatings}</p>`;
        }
    } catch (error) {
        console.error('Error generating content:', error);
        if (error instanceof TypeError) {
            responseContainer.innerHTML = `<p class="error-text">Error: A network error occurred. Please check your internet connection and ensure you can access the Google API.</p>`;
        } else {
            responseContainer.innerHTML = `<p class="error-text">An error occurred: ${error.message}</p>`;
        }
    } finally {
        button.disabled = false;
        button.textContent = 'Generate';
    }
}

function craftSuperPrompt(elementType, iterationData = null) {
    const creativeInstructions = {
        'STORYARC': `Write a compelling story arc. Focus on the narrative progression, key plot points, and the ultimate resolution. The goal is to create a satisfying and engaging storyline.`,
        'ADVENTURE': `Describe a self-contained adventure. Detail the hook that draws players in, the primary goal, the stakes involved, and potential resolutions. Make it feel like a complete and exciting scenario.`,
        'NPC': `Create a memorable non-player character. Describe their role in the story, their appearance, motivations, and any secrets they might have. Give them a distinct personality.`,
        'LOCATION': `Describe a vivid location. Use sensory details to establish the atmosphere, key sights, and potential encounters. Make it feel like a real place with a purpose.`,
        'GROUP': `Detail a faction or organization. Explain their goals, ideology, key members, and available resources. Give them a clear identity and purpose within the larger world.`,
        'ENCOUNTER': `Design an engaging encounter. Specify the type (combat, social, puzzle), the setup, potential resolutions, and any special mechanics involved.`,
        'ITEM': `Create a unique item. Describe its appearance, rarity, properties, and any special mechanics or history associated with it.`,
        'CLUE': `Detail a clue for an investigation. Explain what information it reveals, where it can be found, and what conclusions it might lead to.`,
        'MAP': `Describe a map. Explain its purpose, what it depicts, and any points of interest or secrets it might contain.`,
        'HANDOUT': `Create the content for a player handout. Write the text and describe any imagery that might be included. Ensure it serves a clear purpose in the story.`,
        'DEFAULT': `Generate rich, detailed, and creative content for the specified element, using all provided context to inform the output.`
    };

    let instruction;
    let prompt;

    if (iterationData) {
        instruction = `Your task is to revise and improve the following content based *only* on the new instructions provided. Do not repeat the old content unless it is being modified. Focus on integrating the changes smoothly.`;
        prompt = `You are AIME, an AI world-building assistant for tabletop RPGs. You are in an iteration loop.\n\n--- YOUR TASK ---\n${instruction}\n\n`;
        prompt += `--- PREVIOUS CONTENT ---\n${iterationData.existingContent}\n\n`;
        prompt += `--- USER'S UPDATE INSTRUCTIONS ---\n${iterationData.updateInstructions}\n\n`;
    } else {
        instruction = creativeInstructions[elementType] || creativeInstructions['DEFAULT'];
        prompt = `You are AIME, an AI world-building assistant for tabletop RPGs. Your task is to act as a creative partner and generate content based on the user's request.\n\n--- YOUR TASK ---\n${instruction}\n\nDo not describe the element itself in a meta way; instead, create the content *for* the element. Use the following information to guide your writing:\n\n`;

        prompt += "--- PRIMARY ELEMENT: " + elementType + " ---\n";
        const inputs = document.querySelectorAll('.form-section .input-field');
        let hasPrimaryTraits = false;
        inputs.forEach(input => {
            const label = input.previousElementSibling ? input.previousElementSibling.textContent : input.id;
            if (input.value.trim()) {
                prompt += `${label}: ${input.value.trim()}\n`;
                hasPrimaryTraits = true;
            }
        });
        if (!hasPrimaryTraits) {
            prompt += "No specific traits provided for this element. Please generate creatively.\n";
        }
    }

    let guidancePrompt = "";
    Object.values(selectedGems).forEach(gemsArray => {
        gemsArray.forEach(gem => {
            guidancePrompt += `- ${gem}\n`;
        });
    });

    if (guidancePrompt) {
        prompt += "\n--- GUIDANCE GEMS (STYLISTIC DIRECTION) ---\n";
        prompt += guidancePrompt;
    }

    const contextualAssets = loadedAssets.filter(asset => asset.type === 'text' || asset.type === 'json');
    if (contextualAssets.length > 0) {
        prompt += "\n--- CONTEXTUAL ASSETS (REFERENCE LORE) ---\n";
        contextualAssets.forEach(asset => {
            if (asset.importance === 'Non-Informative') return;

            let assetEntry = '';
            if (asset.type === 'json') {
                try {
                    const parsedContent = JSON.parse(asset.content);
                    const assetType = parsedContent.assetType || 'JSON Data';
                    assetEntry += `\n[Reference Asset: ${assetType} | Importance: ${asset.importance}]\n`;
                    if (asset.annotation) assetEntry += `  - Director's Note: ${asset.annotation}\n`;
                    assetEntry += JSON.stringify(parsedContent, null, 2) + '\n';
                } catch (e) {
                    console.error(`Skipping malformed JSON asset ${asset.fileName} in super prompt:`, e);
                    return;
                }
            } else {
                assetEntry += `\n[Reference Asset: Text File | Importance: ${asset.importance}]\n`;
                assetEntry += `- Filename: ${asset.fileName}\n`;
                if (asset.annotation) assetEntry += `  - Director's Note: ${asset.annotation}\n`;
                assetEntry += `--- Text Content ---\n${asset.content}\n--- End Content ---\n`;
            }
            prompt += assetEntry;
        });
    }

    prompt += `\n--- FINAL INSTRUCTION ---\nGenerate the content as requested. The output MUST be well-structured Markdown. Use headings (#), subheadings (##), bold text (**text**), italics (*text*), and lists (- item) to organize the information for clarity and readability.`;

    console.log("Super Prompt:", prompt);
    return prompt;
}

// --- Asset Saving Logic ---
function saveElementAsset() {
    const generateButton = document.getElementById('generate-button');
    if (!generateButton) {
        console.error('Generate button not found, cannot determine element type.');
        showToast('Error: Could not determine element type.', 'error');
        return;
    }
    const elementType = generateButton.dataset.elementType;
    const extension = elementType.toLowerCase();

    let markdownContent = `# ${elementType.charAt(0).toUpperCase() + elementType.slice(1).toLowerCase()} Asset\n`;
    markdownContent += `> Saved on: ${new Date().toUTCString()}\n\n`;

    let assetName = 'Untitled';

    const inputs = document.querySelectorAll('.form-section .input-field');
    inputs.forEach(input => {
        const labelElement = input.previousElementSibling;
        const label = labelElement ? labelElement.textContent.trim() : 'Unknown Field';
        const value = input.value.trim();

        if (value) {
            markdownContent += `## ${label}\n${value}\n\n`;
        }

        if (input.dataset.fieldId === 'name' && value) {
            assetName = value;
        }
    });

    const filename = `${assetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    URL.revokeObjectURL(url);
    showToast('Asset saved successfully!');
}

function initializeGeneration() {
    const generateButton = document.getElementById('generate-button');
    if (generateButton) {
        generateButton.addEventListener('click', () => generateElementContent(generateButton));
    }
}

function initializeSaveContentButton() {
    const saveButton = document.getElementById('save-content-button');
    if (saveButton) {
        saveButton.addEventListener('click', saveElementAsset);
    }
}

function saveElementPrompt() {
    const generateButton = document.getElementById('generate-button');
    if (!generateButton) {
        console.error('Generate button not found, cannot determine element type.');
        showToast('Error: Could not determine element type.', 'error');
        return;
    }
    const elementType = generateButton.dataset.elementType;
    const extension = `${elementType.toLowerCase()}prompt`;

    const promptData = {
        assetType: `${elementType.charAt(0).toUpperCase() + elementType.slice(1).toLowerCase()} Prompt`,
        savedAt: new Date().toISOString(),
        fields: {}
    };

    const inputs = document.querySelectorAll('.input-field[data-field-id]');
    inputs.forEach(input => {
        const fieldId = input.dataset.fieldId;
        const value = input.value.trim();
        if (value) {
            promptData.fields[fieldId] = value;
        }
    });

    let assetName = 'Untitled';
    const nameInput = document.querySelector('input[data-field-id="name"]');
    if (nameInput && nameInput.value.trim()) {
        assetName = nameInput.value.trim();
    }

    const filename = `${assetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;

    const jsonContent = JSON.stringify(promptData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    URL.revokeObjectURL(url);
    showToast('Prompt saved successfully!');
}

function initializeSavePromptButton() {
    const savePromptButton = document.getElementById('save-prompt-button');
    if (savePromptButton) {
        savePromptButton.addEventListener('click', saveElementPrompt);
    }
}

function initializeLoadButton() {
    const loadButton = document.getElementById('load-button');
    if (loadButton) {
        loadButton.addEventListener('click', () => {
            const generateButton = document.getElementById('generate-button');
            if (!generateButton) {
                console.error('Generate button not found, cannot determine element type for loading.');
                showToast('Error: Cannot determine element type.', 'error');
                return;
            }
            const elementType = generateButton.dataset.elementType.toLowerCase();
            const assetExtension = `.${elementType}`;
            const promptExtension = `.${elementType}prompt`;

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = `${assetExtension},${promptExtension}`;
            fileInput.style.display = 'none';

            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (!file) return;

                if (file.name.endsWith(promptExtension)) {
                    loadElementPrompt(file);
                } else if (file.name.endsWith(assetExtension)) {
                    loadElementAsset(file);
                } else {
                    showToast(`Invalid file type. Please select a '${assetExtension}' or '${promptExtension}' file.`, 'error');
                }
            });

            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });
    }
}

function loadElementPrompt(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);

            if (!data.fields || typeof data.fields !== 'object') {
                throw new Error("Invalid prompt file format: 'fields' object is missing.");
            }

            const allInputs = document.querySelectorAll('.input-field[data-field-id]');
            allInputs.forEach(input => input.value = '');

            for (const fieldId in data.fields) {
                const input = document.querySelector(`.input-field[data-field-id="${fieldId}"]`);
                if (input) {
                    input.value = data.fields[fieldId];
                } else {
                    console.warn(`Could not find a form field for data-field-id: "${fieldId}"`);
                }
            }
            showToast('Prompt loaded successfully!');

        } catch (error) {
            console.error('Error parsing prompt file:', error);
            showToast(`Error: Could not parse the prompt file. ${error.message}`, 'error');
        }
    };
    reader.onerror = () => {
        console.error('Error reading file.');
        showToast('Error: Could not read the selected file.', 'error');
    };
    reader.readAsText(file);
}

function loadElementAsset(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');

        const allInputs = document.querySelectorAll('.form-section .input-field');
        allInputs.forEach(input => input.value = '');

        let currentLabel = null;
        let currentValue = '';

        lines.forEach(line => {
            const match = line.match(/^##\s+(.+)/);
            if (match) {
                if (currentLabel) {
                    setFieldValue(currentLabel, currentValue.trim());
                }
                currentLabel = match[1].trim();
                currentValue = '';
            } else if (currentLabel) {
                currentValue += line + '\n';
            }
        });

        if (currentLabel) {
            setFieldValue(currentLabel, currentValue.trim());
        }
        showToast('Asset loaded successfully!');
    };
    reader.onerror = () => {
        console.error('Error reading file.');
        showToast('Error: Could not read the selected file.', 'error');
    };
    reader.readAsText(file);
}

function setFieldValue(label, value) {
    const labels = document.querySelectorAll('.form-group label');
    let targetInput = null;

    labels.forEach(lbl => {
        if (lbl.textContent.trim() === label) {
            targetInput = lbl.nextElementSibling;
        }
    });

    if (targetInput && (targetInput.tagName === 'INPUT' || targetInput.tagName === 'TEXTAREA')) {
        targetInput.value = value;
    } else {
        console.warn(`Could not find a form field for label: "${label}"`);
    }
}

async function iterateElementContent(button) {
    const elementType = document.getElementById('generate-button').dataset.elementType;
    const responseContainer = document.getElementById('response-container');
    const updateInstructions = document.getElementById('update-instructions');
    const userApiKey = localStorage.getItem('AIME_API_KEY');

    if (!userApiKey) {
        alert("API key not found. Please set it in the settings modal.");
        return;
    }

    if (updateInstructions.value.trim() === '') {
        alert("Please provide update instructions.");
        return;
    }

    button.disabled = true;
    button.textContent = 'Iterating...';
    responseContainer.style.opacity = '0.5';

    const iterationData = {
        existingContent: responseContainer.innerHTML,
        updateInstructions: updateInstructions.value
    };

    const superPrompt = craftSuperPrompt(elementType, iterationData);
    const model = 'gemini-2.5-flash-lite';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userApiKey}`;

    const payload = {
        contents: [{ parts: [{ text: superPrompt }] }]
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            const errorDetails = result.error || { message: `API request failed with status ${response.status}` };
            throw new Error(`API Error: ${errorDetails.message}`);
        }

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            try {
                if (typeof marked === 'undefined') {
                    throw new Error('marked.js library is not loaded.');
                }
                responseContainer.innerHTML = marked.parse(text);
                updateInstructions.value = '';
            } catch (e) {
                console.error("Error parsing markdown during iteration:", e);
                responseContainer.innerHTML += `<p class="error-text">Error rendering iterated content: ${e.message}</p>`;
            }
        } else {
            console.warn("Invalid or empty response from API during iteration.", result);
            showToast('Iteration failed: The AI returned an empty response.', 'error');
        }
    } catch (error) {
        console.error('Error iterating content:', error);
        responseContainer.innerHTML += `<p class="error-text">An error occurred during iteration: ${error.message}</p>`;
    } finally {
        button.disabled = false;
        button.textContent = 'Iterate';
        responseContainer.style.opacity = '1';
    }
}


function initializeNewButton() {
    const newButton = document.getElementById('new-button');
    if (newButton) {
        newButton.addEventListener('click', () => {
            const inputs = document.querySelectorAll('.form-section .input-field');
            const responseContainer = document.getElementById('response-container');
            let hasContent = false;

            inputs.forEach(input => {
                if (input.value.trim() !== '') {
                    hasContent = true;
                }
            });

            if (responseContainer && responseContainer.textContent.trim() !== '') {
                hasContent = true;
            }

            if (hasContent) {
                if (!confirm('You have unsaved changes. Are you sure you want to start a new element and clear the workspace?')) {
                    return;
                }
            }

            inputs.forEach(input => {
                input.value = '';
            });

            if (responseContainer) {
                responseContainer.innerHTML = '';
            }

            document.getElementById('generate-button').classList.remove('hidden');
            document.getElementById('iterate-button').classList.add('hidden');
            document.getElementById('update-field-container').classList.add('hidden');
            const updateInstructions = document.getElementById('update-instructions');
            if (updateInstructions) {
                updateInstructions.value = '';
            }

            loadedAssets = [];
            renderAssetList();
            selectedGems = {};
            initializeGuidanceGems();

            showToast('Workspace cleared.');
        });
    }
}

function initializeElementTabs() {
    const tabButtons = document.querySelectorAll('.element-nav-button');
    const tabs = document.querySelectorAll('.element-tab');

    if (!tabButtons.length || !tabs.length) return;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all buttons and hide all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabs.forEach(tab => {
                tab.classList.remove('active');
                tab.classList.add('hidden'); // Ensure inactive tabs are hidden
            });

            // Activate the clicked button and corresponding tab
            button.classList.add('active');
            const tabName = button.dataset.tab;
            const targetTab = document.getElementById(`${tabName}-tab`);
            if (targetTab) {
                targetTab.classList.add('active');
                targetTab.classList.remove('hidden'); // Show the active tab
            }
        });
    });
}

function initializeIteration() {
    const iterateButton = document.getElementById('iterate-button');
    if (iterateButton) {
        iterateButton.addEventListener('click', () => iterateElementContent(iterateButton));
    }
}

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns();
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeGeneration();
    initializeIteration();
    initializeSaveContentButton();
    initializeSavePromptButton();
    initializeLoadButton();
    initializeNewButton();
    initializeElementTabs();
});
