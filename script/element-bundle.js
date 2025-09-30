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
function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;

    const gemsData = {
        "Genre": ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Horror", "Mystery", "Romance", "Thriller", "Whimsical", "Gritty", "Noir"],
        "Tone": ["Serious", "Humorous", "Formal", "Informal", "Optimistic", "Pessimistic", "Joyful", "Sad", "Hopeful", "Cynical", "Dark", "Uplifting"],
        "Pacing": ["Fast-paced", "Slow-burn", "Steady", "Urgent", "Relaxed", "Meditative", "Action-Packed"],
        "Point of View": ["First Person", "Third Person Limited", "Third Person Omniscient", "Second Person", "Alternating POV"],
        "Literary Devices": ["Metaphor", "Simile", "Personification", "Alliteration", "Symbolism", "Irony", "Foreshadowing", "Satire"],
        "Structure": ["Linear", "Non-linear", "Episodic", "In Medias Res", "Frame Story"],
        "Themes": ["Redemption", "Betrayal", "Discovery", "Survival", "Love", "Hate", "Power", "Corruption", "Nature vs. Nurture"]
    };

    container.innerHTML = ''; // Clear existing content

    for (const [title, options] of Object.entries(gemsData)) {
        // Create main dropdown container
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'gem-dropdown-container';
        dropdownContainer.dataset.category = title;

        // Create the header button
        const header = document.createElement('button');
        header.className = 'gem-dropdown-header';
        header.innerHTML = `
            <span class="gem-category-title">${title}</span>
            <div class="gem-selected-list-container">
                <span class="gem-selected-placeholder">Select...</span>
                <div class="gem-selected-list"></div>
            </div>
            <svg class="gem-dropdown-chevron" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
        `;

        // Create the dropdown panel
        const panel = document.createElement('div');
        panel.className = 'gem-dropdown-panel';

        // Create options container
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'gem-dropdown-options';
        options.forEach(optionText => {
            const button = document.createElement('button');
            button.className = 'gem-option';
            button.textContent = optionText;
            button.dataset.value = optionText;
            optionsDiv.appendChild(button);
        });

        // Create custom input container
        const customInputContainer = document.createElement('div');
        customInputContainer.className = 'custom-gem-input-container';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Add custom ${title}...`;
        input.className = 'input-field custom-gem-input';
        const addButton = document.createElement('button');
        addButton.textContent = 'Add';
        addButton.className = 'add-gem-btn';

        customInputContainer.appendChild(input);
        customInputContainer.appendChild(addButton);

        // Assemble the panel
        panel.appendChild(optionsDiv);
        panel.appendChild(customInputContainer);

        // Assemble the full dropdown
        dropdownContainer.appendChild(header);
        dropdownContainer.appendChild(panel);
        container.appendChild(dropdownContainer);
    }

    // --- Event Delegation for the entire container ---

    // Handle clicks on headers, options, and add buttons
    container.addEventListener('click', (e) => {
        const dropdownHeader = e.target.closest('.gem-dropdown-header');
        const gemOption = e.target.closest('.gem-option');
        const addBtn = e.target.closest('.add-gem-btn');
        const dropdownContainer = e.target.closest('.gem-dropdown-container');

        // Toggle dropdown panel
        if (dropdownHeader) {
            const container = dropdownHeader.closest('.gem-dropdown-container');
            container.classList.toggle('open');
            return; // Exit after handling header click
        }

        // Toggle a gem option
        if (gemOption) {
            gemOption.classList.toggle('active');
            updateSelectedDisplay(gemOption.closest('.gem-dropdown-container'));
            return;
        }

        // Add a custom gem
        if (addBtn) {
            const container = addBtn.closest('.gem-dropdown-container');
            const input = addBtn.previousElementSibling;
            const optionsDiv = container.querySelector('.gem-dropdown-options');
            const value = input.value.trim();

            if (value && !container.querySelector(`.gem-option[data-value="${value}"]`)) {
                const newGem = document.createElement('button');
                newGem.className = 'gem-option active';
                newGem.textContent = value;
                newGem.dataset.value = value;
                optionsDiv.appendChild(newGem);
                updateSelectedDisplay(container);
                input.value = ''; // Clear input
            }
        }
    });

    // Handle 'Enter' key for custom input
    container.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.matches('.custom-gem-input')) {
            e.preventDefault();
            e.target.nextElementSibling.click(); // Trigger the 'Add' button click
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#guidance-gems-container')) {
            document.querySelectorAll('.gem-dropdown-container.open').forEach(container => {
                container.classList.remove('open');
            });
        }
    });
}

function updateSelectedDisplay(dropdownContainer) {
    if (!dropdownContainer) return;

    const placeholder = dropdownContainer.querySelector('.gem-selected-placeholder');
    const list = dropdownContainer.querySelector('.gem-selected-list');
    const activeGems = dropdownContainer.querySelectorAll('.gem-option.active');

    list.innerHTML = ''; // Clear current list

    if (activeGems.length > 0) {
        placeholder.style.display = 'none';
        list.style.display = 'flex';
        activeGems.forEach(gem => {
            const pill = document.createElement('span');
            pill.className = 'gem-selected-pill';
            pill.textContent = gem.textContent;
            list.appendChild(pill);
        });
    } else {
        placeholder.style.display = 'block';
        list.style.display = 'none';
    }
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
    let prompt = `You are AIME, an AI world-building assistant. The user wants to generate details for a "${elementType}" Element. Use the provided information to create a rich, detailed, and creative description.\n\n`;

    // --- 1. Current Element's Traits ---
    prompt += "--- PRIMARY ELEMENT: " + elementType + " ---\n";
    const inputs = document.querySelectorAll('.form-section .input-field');
    let hasPrimaryTraits = false;
    inputs.forEach(input => {
        if (!input.closest('#custom-fields-container')) {
            const label = input.previousElementSibling ? input.previousElementSibling.textContent : input.id;
            if (input.value.trim()) {
                prompt += `${label}: ${input.value.trim()}\n`;
                hasPrimaryTraits = true;
            }
        }
    });
    if (!hasPrimaryTraits) {
        prompt += "No specific traits provided for this element. Please generate creatively.\n";
    }

    // --- 1.5. Custom User Fields ---
    const customFieldGroups = document.querySelectorAll('#custom-fields-container .custom-field-group');
    let hasCustomFields = false;
    let customFieldsPrompt = '';
    customFieldGroups.forEach(group => {
        const key = group.querySelector('.custom-field-key').value.trim();
        const value = group.querySelector('.custom-field-value').value.trim();
        if (key && value) {
            customFieldsPrompt += `${key}: ${value}\n`;
            hasCustomFields = true;
        }
    });

    if (hasCustomFields) {
        prompt += "\n--- CUSTOM USER FIELDS ---\n";
        prompt += customFieldsPrompt;
    }

    // --- 2. Guidance Gems ---
    const activeGems = document.querySelectorAll('#guidance-gems-container .gem-option.active');
    if (activeGems.length > 0) {
        prompt += "\n--- GUIDANCE GEMS (STYLISTIC DIRECTION) ---\n";
        activeGems.forEach(gem => prompt += `- ${gem.textContent.trim()}\n`);
    }

    // --- 3. Contextual Assets (from loadedAssets array) ---
    const contextualAssets = loadedAssets.filter(asset => asset.type === 'text' || asset.type === 'json');
    if (contextualAssets.length > 0) {
        prompt += "\n--- CONTEXTUAL ASSETS (REFERENCE LORE) ---\n";
        contextualAssets.forEach(asset => {
            if (asset.importance === 'Non-Informative') return; // Skip non-informative assets

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
                    return; // Skip this asset if it's invalid
                }
            } else { // Plain text asset
                assetEntry += `\n[Reference Asset: Text File | Importance: ${asset.importance}]\n`;
                assetEntry += `- Filename: ${asset.fileName}\n`;
                if (asset.annotation) assetEntry += `  - Director's Note: ${asset.annotation}\n`;
                assetEntry += `--- Text Content ---\n${asset.content}\n--- End Content ---\n`;
            }
            prompt += assetEntry;
        });
    }

    prompt += `\n--- TASK ---\nGenerate the content for the primary "${elementType}" Element. Use the Guidance Gems for style. Critically, use the Contextual Assets for lore, background, and specific direction, paying close attention to their specified Importance and Director's Notes. Be descriptive, imaginative, and ensure the output is consistent with all provided data. Format the output clearly with headings.`;

    console.log("Super Prompt:", prompt);
    return prompt;
}

// --- Asset Saving Logic ---
function saveElementAsset() {
    const generateButton = document.getElementById('generate-button');
    if (!generateButton) {
        console.error('Generate button not found, cannot determine element type.');
        return;
    }
    const elementType = generateButton.dataset.elementType; // e.g., PERSONA
    const extension = elementType.toLowerCase(); // e.g., persona

    const assetData = {
        assetType: elementType,
        timestamp: new Date().toISOString(),
        traits: {},
        custom_fields: {}
    };

    // Process standard trait fields
    const inputs = document.querySelectorAll('.form-section .input-field');
    inputs.forEach(input => {
        if (!input.closest('#custom-fields-container')) {
            const fieldId = input.dataset.fieldId;
            if (fieldId && input.value.trim() !== '') {
                assetData.traits[fieldId] = input.value.trim();
            }
        }
    });

    // Process custom fields
    const customFieldGroups = document.querySelectorAll('#custom-fields-container .custom-field-group');
    customFieldGroups.forEach(group => {
        const key = group.querySelector('.custom-field-key').value.trim();
        const value = group.querySelector('.custom-field-value').value.trim();

        if (key !== '' && value !== '') {
            assetData.custom_fields[key] = value;
        }
    });

    // If no custom fields were added, remove the empty object for a cleaner output file
    if (Object.keys(assetData.custom_fields).length === 0) {
        delete assetData.custom_fields;
    }

    // Use the 'name' field for the filename, otherwise default to 'Untitled'
    const assetName = assetData.traits.name || 'Untitled';
    const filename = `${assetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(assetData, null, 2));

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}


// --- Custom Fields Logic ---
function initializeCustomFields() {
    const container = document.getElementById('custom-fields-container');
    if (!container) return;

    addCustomField(container); // Add the first field

    container.addEventListener('input', (e) => {
        // Use event delegation to handle input on dynamically added fields
        if (e.target.classList.contains('custom-field-value')) {
            const allValueInputs = container.querySelectorAll('.custom-field-value');
            const lastValueInput = allValueInputs[allValueInputs.length - 1];

            // Check if the user is typing in the *last* value field and it's not empty
            if (e.target === lastValueInput && e.target.value.trim() !== '') {
                addCustomField(container);
            }
        }
    });
}

function addCustomField(container) {
    const fieldGroup = document.createElement('div');
    fieldGroup.className = 'custom-field-group';

    const keyInput = document.createElement('input');
    keyInput.type = 'text';
    keyInput.className = 'input-field custom-field-key';
    keyInput.placeholder = 'Field Name (e.g., Diet)';

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'input-field custom-field-value';
    valueInput.placeholder = 'Field Value (e.g., Carnivorous)';

    const removeBtn = document.createElement('button');
    removeBtn.textContent = '×';
    removeBtn.className = 'remove-custom-field-btn';
    removeBtn.title = 'Remove Field';
    removeBtn.onclick = () => {
        // Prevent removing the very last field if it's the only one
        if (container.querySelectorAll('.custom-field-group').length > 1) {
            fieldGroup.remove();
        } else {
            // Clear the fields instead of removing the last one
            keyInput.value = '';
            valueInput.value = '';
        }
    };

    fieldGroup.appendChild(keyInput);
    fieldGroup.appendChild(valueInput);
    fieldGroup.appendChild(removeBtn);
    container.appendChild(fieldGroup);
}

function initializeGeneration() {
    const generateButton = document.getElementById('generate-button');
    if (generateButton) {
        generateButton.addEventListener('click', () => generateElementContent(generateButton));
    }
}

function initializeSaveButton() {
    const saveButton = document.getElementById('save-asset-button');
    if (saveButton) {
        saveButton.addEventListener('click', saveElementAsset);
    }
}

function initializeClearButton() {
    const clearButton = document.getElementById('clear-fields-button');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            // Clear standard input fields
            const inputs = document.querySelectorAll('.form-section .input-field');
            inputs.forEach(input => {
                if (!input.closest('#custom-fields-container')) {
                    input.value = '';
                }
            });

            // Clear the response container
            const responseContainer = document.getElementById('response-container');
            if (responseContainer) responseContainer.innerHTML = '';

            // Clear and reset custom fields
            const customFieldsContainer = document.getElementById('custom-fields-container');
            if (customFieldsContainer) {
                customFieldsContainer.innerHTML = '';
                addCustomField(customFieldsContainer); // Add back the initial empty field
            }
        });
    }
}

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // initializeResizableColumns(); // Intentionally disabled for stability
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeCustomFields();
    initializeGeneration();
    initializeSaveButton();
    initializeClearButton();
});