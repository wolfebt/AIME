/*
    File: writer-bundle.js
    Reference: Story Weaver Logic
    Creator: Wolfe.BT, TangentLLC
*/

let loadedAssets = []; // NEW: Data store for asset content
let selectedGems = {}; // Data store for all selected guidance options

// MODIFICATION: Move gemsData to global scope for persistence
const gemsData = {
    "Genre": ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Horror", "Mystery", "Romance", "Thriller", "Whimsical", "Gritty", "Noir"],
    "Tone": ["Serious", "Humorous", "Formal", "Informal", "Optimistic", "Pessimistic", "Joyful", "Sad", "Hopeful", "Cynical", "Dark", "Uplifting"],
    "Pacing": ["Fast-paced", "Slow-burn", "Steady", "Urgent", "Relaxed", "Meditative", "Action-Packed"],
    "Point of View": ["First Person", "Third Person Limited", "Third Person Omniscient", "Second Person", "Alternating POV"],
    "Literary Devices": ["Metaphor", "Simile", "Personification", "Alliteration", "Symbolism", "Irony", "Foreshadowing", "Satire"],
    "Structure": ["Linear", "Non-linear", "Episodic", "In Medias Res", "Frame Story"],
    "Themes": ["Redemption", "Betrayal", "Discovery", "Survival", "Love", "Hate", "Power", "Corruption", "Nature vs. Nurture"]
};

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

        mainColumn.style.width = `calc(${newLeftPercent}% - 6px)`;
        sideColumn.style.width = `calc(${100 - newLeftPercent}% - 6px)`;
    }
}

// --- Accordion Logic ---
function initializeAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    let alreadyOpenOnLoad = false; // Flag to ensure only one accordion opens on load

    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        const content = accordion.querySelector('.accordion-content');
        const chevron = header.querySelector('.accordion-chevron');
        if (!header || !content || !chevron) return;

        header.addEventListener('click', () => {
            const wasActive = header.classList.contains('active');

            // Close all accordions
            accordions.forEach(acc => {
                const h = acc.querySelector('.accordion-header');
                const c = acc.querySelector('.accordion-content');
                const v = h.querySelector('.accordion-chevron');
                if (h.classList.contains('active')) {
                    acc.classList.remove('open'); // NEW: Remove open class from container
                    h.classList.remove('active');
                    v.style.transform = 'rotate(0deg)';
                    c.style.maxHeight = null;
                    c.style.padding = '0 1.5rem';
                }
            });

            // If the clicked accordion wasn't already open, open it
            if (!wasActive) {
                accordion.classList.add('open'); // NEW: Add open class to container
                header.classList.add('active');
                chevron.style.transform = 'rotate(180deg)';
                content.style.padding = '1.5rem';
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });

        // Handle initially active accordions, ensuring only one is open
        if (header.classList.contains('active')) {
            if (!alreadyOpenOnLoad) {
                accordion.classList.add('open'); // NEW: Add open class to container
                content.style.padding = '1.5rem';
                content.style.maxHeight = content.scrollHeight + "px";
                chevron.style.transform = 'rotate(180deg)';
                alreadyOpenOnLoad = true;
            } else {
                // If one is already open, force subsequent 'active' ones to be closed.
                header.classList.remove('active');
                 accordion.classList.remove('open'); // NEW: Remove open class
            }
        }
    });
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

// --- Guidance Gems ---
// REFACTORED: This entire section has been rewritten to use a modal for multi-selection.
function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;

    // Modal elements
    const modalOverlay = document.getElementById('gem-selection-modal-overlay');
    const modalTitle = document.getElementById('gem-modal-title');
    const modalOptionsContainer = document.getElementById('gem-modal-options-container');
    const modalSaveBtn = document.getElementById('gem-modal-save-btn');
    const modalCloseBtn = document.getElementById('gem-modal-close-btn');
    const customGemInput = document.getElementById('custom-gem-input');
    const addCustomGemBtn = document.getElementById('add-custom-gem-btn');

    if (!modalOverlay || !modalTitle || !modalOptionsContainer || !modalSaveBtn || !modalCloseBtn || !customGemInput || !addCustomGemBtn) {
        console.error("Guidance modal elements not found!");
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


// --- Asset Hub Importer ---
// MODIFIED: This section has been completely rewritten to correctly read files.
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
                    content: e.target.result
                };

                if (file.type.startsWith('image/')) {
                    assetData.type = 'image';
                } else if (file.name.endsWith('.json')) {
                    assetData.type = 'json';
                    try {
                        // Pre-parse JSON to ensure it's valid
                        assetData.content = JSON.parse(e.target.result);
                    } catch (err) {
                        alert(`Error parsing JSON file ${file.name}. It will be treated as plain text.`);
                        assetData.type = 'text';
                        assetData.content = e.target.result; // Revert to text if parsing fails
                    }
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
        // Reset file input to allow re-uploading the same file
        event.target.value = null;
    });
}

// NEW: Renders the asset list UI based on the loadedAssets data store.
function renderAssetList() {
    const assetList = document.getElementById('asset-list');
    if (!assetList) return;
    
    assetList.innerHTML = ''; // Clear the list

    loadedAssets.forEach(asset => {
        const assetItem = document.createElement('div');
        assetItem.className = 'asset-item';
        
        let assetInfoHtml = '';
        if (asset.type === 'image') {
            assetInfoHtml = `
                <div class="asset-info">
                    <img src="${asset.content}" alt="${asset.fileName}" class="asset-thumbnail">
                    <span class="asset-name">${asset.fileName}</span>
                </div>`;
        } else {
            const icon = asset.type === 'json' ? 'JSON' : 'TXT';
            assetInfoHtml = `
                 <div class="asset-info">
                    <span class="asset-icon-text">${icon}</span>
                    <span class="asset-name">${asset.fileName}</span>
                </div>`;
        }

        assetItem.innerHTML = `${assetInfoHtml}<button class="remove-asset-btn" data-asset-id="${asset.id}">&times;</button>`;
        assetList.appendChild(assetItem);
    });
}

// NEW: Global event listener to handle removing assets from the data store and UI.
document.addEventListener('click', (e) => {
    if (e.target.matches('.remove-asset-btn')) {
        const assetId = e.target.dataset.assetId;
        loadedAssets = loadedAssets.filter(asset => asset.id !== assetId);
        renderAssetList();
    }
});

// REMOVED: The old addAssetToList function is no longer needed.

// --- Story Weaver Tabs & Workflow ---
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.writer-nav-button');
    const tabs = document.querySelectorAll('.writer-tab');
    const generateBtn = document.getElementById('generate-button');
    const saveBtn = document.getElementById('save-button');

    const buttonTextMap = {
        brainstorm: "Brainstorm Concepts",
        outline: "Suggest Plot Point",
        treatment: "Generate Treatment"
    };

    const saveButtonTextMap = {
        brainstorm: "Save Concepts",
        outline: "Save Outline",
        treatment: "Save Draft"
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));
            button.classList.add('active');
            const tabName = button.dataset.tab;
            document.getElementById(`${tabName}-tab`).classList.add('active');

            // Update button text
            if (generateBtn && buttonTextMap[tabName]) {
                generateBtn.textContent = buttonTextMap[tabName];
            }
            if (saveBtn && saveButtonTextMap[tabName]) {
                saveBtn.textContent = saveButtonTextMap[tabName];
            }

            // Show/hide the main generate button
            if (generateBtn) {
                generateBtn.style.display = (tabName === 'treatment') ? 'none' : 'block';
            }
        });
    });
}

// --- AI Generation Logic ---

async function generateContent(prompt) {
    const userApiKey = localStorage.getItem('AIME_API_KEY');
    const model = 'gemini-2.5-flash-lite';

    if (!userApiKey) {
        alert("API key not found. Please set it in the settings modal (the gear icon).");
        return "Error: API key not found.";
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userApiKey}`;

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
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            const errorDetails = result.error || { message: `API request failed with status ${response.status}` };
            console.error("API Error Response:", errorDetails);
            throw new Error(`API Error: ${errorDetails.message} (Code: ${errorDetails.code || 'N/A'})`);
        }

        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            return candidate.content.parts[0].text;
        } else {
            console.warn("Invalid or empty response from API.", result);
            const finishReason = candidate?.finishReason || 'N/A';
            const safetyRatings = candidate?.safetyRatings ? JSON.stringify(candidate.safetyRatings, null, 2) : 'N/A';
            return `Error: The AI model returned an empty response. This may be due to the safety filter. Finish Reason: ${finishReason}. Safety Ratings: ${safetyRatings}`;
        }
    } catch (error) {
        console.error("Error generating content:", error);
        if (error instanceof TypeError) { // Network or CORS errors
            return "Error: A network error occurred. Please check your internet connection and ensure you can access the Google API.";
        }
        return `Error: ${error.message}`;
    }
}

function craftSuperPrompt(promptText) {
    let allSelectedGems = [];
    for (const category in selectedGems) {
        allSelectedGems.push(...selectedGems[category]);
    }

    // MODIFIED: Use the loadedAssets array for rich context from file content
    const contextualAssets = loadedAssets.filter(asset => asset.type === 'text' || asset.type === 'json');

    let formattedPrompt = `You are AIME, an AI creative partner specializing in storytelling.\n\n--- STORY BRAINSTORM REQUEST ---\n`;
    formattedPrompt += `USER'S CORE IDEA: "${promptText}"\n\n`;

    if (allSelectedGems.length > 0) {
        formattedPrompt += `--- GUIDANCE GEMS (GENRE, TONE, THEMES) ---\n`;
        formattedPrompt += `Incorporate these elements: ${allSelectedGems.join(', ')}\n`;
    }
    
    // MODIFIED: Build a more detailed context block from actual asset content
    if (contextualAssets.length > 0) {
        formattedPrompt += `\n--- CONTEXTUAL ASSETS (REFERENCE THESE) ---\n`;
        contextualAssets.forEach(asset => {
            formattedPrompt += `\n[ASSET: ${asset.fileName}]\n`;
            if (asset.type === 'json') {
                // Stringify the pre-parsed JSON content
                formattedPrompt += JSON.stringify(asset.content, null, 2);
            } else {
                formattedPrompt += asset.content;
            }
            formattedPrompt += `\n[END ASSET: ${asset.fileName}]\n`;
        });
    }

    formattedPrompt += `\n--- TASK ---\nBased on all the information above, generate three distinct and creative story concepts. For each concept, you MUST provide a "Title:", a one-sentence "Logline:", and a "Concept:" paragraph. Separate each of the three concepts with '---'.`;

    return formattedPrompt;
}

function parseBrainstormResponse(responseText) {
    const concepts = [];
    const rawConcepts = responseText.split('---').filter(c => c.trim().length > 10);

    rawConcepts.forEach(rawConcept => {
        const trimmedConcept = rawConcept.trim(); // Trim whitespace from the chunk
        const titleMatch = trimmedConcept.match(/Title:\s*(.*)/);
        const loglineMatch = trimmedConcept.match(/Logline:\s*(.*)/);
        const conceptMatch = trimmedConcept.match(/Concept:\s*([\s\S]*)/);

        if (titleMatch && loglineMatch && conceptMatch) {
            concepts.push({
                title: titleMatch[1].trim(),
                logline: loglineMatch[1].trim(),
                concept: conceptMatch[1].trim()
            });
        }
    });
    return concepts;
}


function createBrainstormCard(data) {
    const card = document.createElement('div');
    card.className = 'brainstorm-card glass-panel';
    card.innerHTML = `
        <h4 class="card-title editable-content" contenteditable="true">${data.title}</h4>
        <p class="brainstorm-logline editable-content" contenteditable="true">${data.logline}</p>
        <p class="brainstorm-concept editable-content" contenteditable="true">${data.concept.replace(/\n/g, '<br>')}</p>
        <div class="card-actions">
            <button class="action-btn develop-outline-btn">Develop Outline</button>
        </div>
    `;
    return card;
}

async function generateBrainstormConcepts() {
    const promptInput = document.getElementById('main-prompt');
    const responseArea = document.getElementById('brainstorm-response-area');
    const generateBtn = document.getElementById('generate-button');

    if (!promptInput || !responseArea || !generateBtn) return;

    const superPrompt = craftSuperPrompt(promptInput.value);

    responseArea.innerHTML = '<p class="loading-text">AIME is brainstorming concepts...</p>';
    generateBtn.disabled = true;

    const aiResponse = await generateContent(superPrompt);

    if (aiResponse.startsWith("Error:")) {
         responseArea.innerHTML = `<p class="error-text">${aiResponse}</p>`;
         generateBtn.disabled = false;
         return;
    }

    const concepts = parseBrainstormResponse(aiResponse);

    responseArea.innerHTML = ''; // Clear loading text
    if (concepts.length > 0) {
        concepts.forEach(concept => {
            const card = createBrainstormCard(concept);
            responseArea.appendChild(card);
        });
    } else {
        responseArea.innerHTML = `<p class="error-text">AIME had trouble formatting the response. Please try a different prompt.</p><p style="font-size: 0.8rem; color: var(--medium-text);">${aiResponse.replace(/\n/g, '<br>')}</p>`;
    }

    generateBtn.disabled = false;
}


function initializeGeneration() {
    const generateBtn = document.getElementById('generate-button');
    if (!generateBtn) return;

    generateBtn.addEventListener('click', () => {
        const activeTabButton = document.querySelector('.writer-nav-button.active');
        if (!activeTabButton) return;

        const activeTab = activeTabButton.dataset.tab;

        switch (activeTab) {
            case 'brainstorm':
                generateBrainstormConcepts();
                break;
            case 'outline':
                const outlineList = document.getElementById('outline-list');
                const existingText = outlineList.innerText; // Use innerText to get the current, potentially edited content
                generatePlotPoint(existingText);
                break;
            case 'treatment':
                generateTreatment();
                break;
        }
    });
}

// --- Outline, Treatment, and Writing Canvas Logic ---

function parseOutlineResponse(responseText) {
    const points = [];
    const rawPoints = responseText.split('---').filter(p => p.trim().length > 10);

    rawPoints.forEach(rawPoint => {
        const titleMatch = rawPoint.match(/Title:\s*(.*)/);
        const descriptionMatch = rawPoint.match(/Description:\s*([\s\S]*)/);

        if (titleMatch && descriptionMatch) {
            points.push({
                title: titleMatch[1].trim(),
                description: descriptionMatch[1].trim()
            });
        }
    });
    return points;
}

function createPlotPointListItem(data) {
    const li = document.createElement('li');
    li.className = 'outline-item glass-panel';
    li.setAttribute('draggable', 'true');
    li.innerHTML = `
        <div class="outline-item-header">
            <span class="outline-item-title editable-content" contenteditable="true">${data.title}</span>
            <button class="remove-item-btn">&times;</button>
        </div>
        <p class="outline-item-description editable-content" contenteditable="true">${data.description.replace(/\n/g, '<br>')}</p>
    `;
    li.querySelector('.remove-item-btn').addEventListener('click', () => {
        li.remove();
    });
    return li;
}

async function generatePlotPoint(existingOutlineText) {
    const outlineList = document.getElementById('outline-list');
    if (!outlineList) return;

    const generateBtn = document.getElementById('generate-button');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Suggesting...';

    const prompt = `You are AIME, an AI creative partner. Based on the following plot points, suggest the next logical plot point to continue the narrative.

--- EXISTING PLOT ---
${existingOutlineText}

--- TASK ---
Generate a single, new plot point that follows from the existing ones. Provide a short, punchy "Title:" and a "Description:" paragraph. Do not use '---' separators.`;

    const aiResponse = await generateContent(prompt);

    if (!aiResponse.startsWith("Error:")) {
        const plotPoints = parseOutlineResponse(aiResponse); // This can still parse a single point
        if (plotPoints.length > 0) {
            const li = createPlotPointListItem(plotPoints[0]);
            outlineList.appendChild(li);
        } else {
            alert("AIME had trouble formatting the suggestion. Please try again.");
        }
    } else {
        alert(aiResponse);
    }

    generateBtn.disabled = false;
    generateBtn.textContent = 'Suggest Plot Point';
}


async function generateOutline(conceptText) {
    const outlineList = document.getElementById('outline-list');
    if (!outlineList) return;

    outlineList.innerHTML = `<li class="loading-text">AIME is building your outline...</li>`;

    const prompt = `You are AIME, an AI creative partner. Based on the following story concept, generate a list of 7-10 key plot points that form a coherent narrative arc (e.g., Inciting Incident, Rising Action, Climax, Falling Action, Resolution).

--- STORY CONCEPT ---
${conceptText}

--- TASK ---
Generate a list of plot points. For each plot point, you MUST provide a short, punchy "Title:" and a "Description:" paragraph. Separate each plot point with '---'.`;

    const aiResponse = await generateContent(prompt);
    if (aiResponse.startsWith("Error:")) {
         outlineList.innerHTML = `<li class="error-text">${aiResponse}</li>`;
         return;
    }

    const plotPoints = parseOutlineResponse(aiResponse);

    outlineList.innerHTML = ''; // Clear loading
    if (plotPoints.length > 0) {
        plotPoints.forEach(point => {
            const li = createPlotPointListItem(point);
            outlineList.appendChild(li);
        });
    } else {
        outlineList.innerHTML = `<li class="error-text">AIME had trouble generating the outline. Please try again.</li>`;
    }
}

function initializeOutline() {
    const outlineList = document.getElementById('outline-list');
    if (!outlineList) return;

    let draggingItem = null;

    outlineList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('outline-item')) {
            draggingItem = e.target;
            setTimeout(() => {
                e.target.classList.add('dragging');
            }, 0);
        }
    });

    outlineList.addEventListener('dragend', (e) => {
        if (draggingItem) {
            draggingItem.classList.remove('dragging');
            draggingItem = null;
        }
    });

    outlineList.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggingItem) return;

        const afterElement = getDragAfterElement(outlineList, e.clientY);
        if (afterElement == null) {
            outlineList.appendChild(draggingItem);
        } else {
            outlineList.insertBefore(draggingItem, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.outline-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

function initializeWorkflowButtons() {
    const mainColumn = document.querySelector('.main-column');
    if (!mainColumn) return;

    mainColumn.addEventListener('click', async (e) => {
        // Handle "Develop Outline" from Brainstorm card
        if (e.target.classList.contains('develop-outline-btn')) {
            e.target.textContent = 'Developing...';
            e.target.disabled = true;

            const card = e.target.closest('.brainstorm-card');
            if (!card) return;

            const title = card.querySelector('.card-title').innerText;
            const logline = card.querySelector('.brainstorm-logline').innerText;
            const concept = card.querySelector('.brainstorm-concept').innerText;
            const fullConcept = `Title: ${title}\nLogline: ${logline}\nConcept: ${concept}`;

            const outlineTabButton = document.querySelector('.writer-nav-button[data-tab="outline"]');
            if (outlineTabButton) {
                outlineTabButton.click();
            }

            await generateOutline(fullConcept);
            e.target.textContent = 'Develop Outline';
            e.target.disabled = false;
        }

        // NEW: Handle "Create Treatment" from Outline tab
        if (e.target.id === 'create-treatment-from-outline-btn') {
            e.target.textContent = 'Creating...';
            e.target.disabled = true;

            // Switch to the treatment tab to show progress
            const treatmentTabButton = document.querySelector('.writer-nav-button[data-tab="treatment"]');
            if (treatmentTabButton) {
                treatmentTabButton.click();
            }
            
            await generateTreatment();
            
            // Re-enable the button after generation is complete
            const btn = document.getElementById('create-treatment-from-outline-btn');
            if(btn) {
                btn.textContent = 'Create Treatment';
                btn.disabled = false;
            }
        }
    });
}

async function generateTreatment() {
    const outlineItems = document.querySelectorAll('#outline-list .outline-item');
    const treatmentCanvas = document.getElementById('treatment-canvas');

    if (outlineItems.length === 0 || !treatmentCanvas) {
        alert("Please generate an outline first.");
        return;
    }

    treatmentCanvas.innerHTML = '<p class="loading-text">AIME is crafting your treatment...</p>';

    let fullOutline = "Please write a detailed story treatment based on the following ordered plot points:\n\n";
    outlineItems.forEach((item, index) => {
        const title = item.querySelector('.outline-item-title').innerText;
        const description = item.querySelector('.outline-item-description').innerText;
        fullOutline += `${index + 1}. ${title}: ${description}\n`;
    });

    fullOutline += "\nWrite the treatment in a clear, narrative style. Expand on the plot points, connect the scenes, and describe the key character emotions and motivations. The treatment should flow like a short story.";

    const aiResponse = await generateContent(fullOutline);
    if (aiResponse.startsWith("Error:")) {
         treatmentCanvas.innerHTML = `<p class="error-text">${aiResponse}</p>`;
         return;
    }

    let formattedHtml = aiResponse
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    treatmentCanvas.innerHTML = `<p>${formattedHtml}</p>`;
}

async function handleTextTool(action, selection, customPrompt = '') {
    const selectedText = selection.toString().trim();
    if (selectedText === '') {
        alert("Please select some text to modify.");
        return;
    }

    const toolbar = document.getElementById('text-toolbar');
    toolbar.classList.add('hidden'); // Hide toolbar during processing

    let prompt = '';
    switch (action) {
        case 'rephrase':
            prompt = `Rephrase the following text to be clearer and more engaging, while maintaining the original meaning:\n\n"${selectedText}"`;
            break;
        case 'shorten':
            prompt = `Shorten the following text, keeping the core meaning concise:\n\n"${selectedText}"`;
            break;
        case 'expand':
            prompt = `Expand upon the following text, adding more detail and description:\n\n"${selectedText}"`;
            break;
        case 'custom':
            if (customPrompt.trim() === '') {
                alert("Please enter a custom instruction.");
                return;
            }
            prompt = `Apply the following instruction to the text below:\n\nInstruction: "${customPrompt}"\n\nText: "${selectedText}"`;
            break;
        default:
             return;
    }

    const aiResponse = await generateContent(prompt);

    if (aiResponse.startsWith("Error:")) {
        alert(aiResponse);
    } else {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(aiResponse));
    }
}

function initializeFloatingToolbar() {
    const toolbar = document.getElementById('text-toolbar');
    const customPromptContainer = document.getElementById('custom-prompt-container');
    const customPromptInput = document.getElementById('custom-prompt-input');

    if (!toolbar || !customPromptContainer || !customPromptInput) return;

    let currentSelection = null;

    // Show/hide toolbar on text selection
    document.addEventListener('mouseup', (e) => {
        // A brief delay allows click events on the toolbar to register before it's hidden
        setTimeout(() => {
            const selection = window.getSelection();

            if (selection && !selection.isCollapsed) {
                const node = selection.anchorNode;
                // Find the closest ancestor (or self) that is editable. This makes the toolbar work for any editable area.
                const editableElement = (node.nodeType === Node.TEXT_NODE ? node.parentElement : node).closest('[contenteditable="true"]');

                if (editableElement) {
                    currentSelection = selection;
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();

                    // Position the toolbar above the selection
                    toolbar.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (toolbar.offsetWidth / 2)}px`;
                    toolbar.style.top = `${rect.top + window.scrollY - toolbar.offsetHeight - 10}px`;
                    toolbar.classList.remove('hidden');
                    return; // Exit early since we found an editable area
                }
            }

            // If no selection or not in an editable area, hide the toolbar
            // (unless the user is clicking inside the toolbar itself)
            if (!toolbar.contains(e.target)) {
                toolbar.classList.add('hidden');
                customPromptContainer.classList.add('hidden');
            }
        }, 100);
    });

    toolbar.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.dataset.action;

        if (action === 'custom') {
            customPromptContainer.classList.toggle('hidden');
            if (!customPromptContainer.classList.contains('hidden')) {
                customPromptInput.focus();
            }
            return;
        }

        if (currentSelection) {
            if (button.id === 'custom-prompt-submit') {
                handleTextTool('custom', currentSelection, customPromptInput.value);
            } else if (action) {
                handleTextTool(action, currentSelection);
            }
        }
    });
}

function initializeSaveButton() {
    const saveBtn = document.getElementById('save-button');
    if (!saveBtn) return;

    saveBtn.addEventListener('click', () => {
        const activeTab = document.querySelector('.writer-nav-button.active')?.dataset.tab;
        if (!activeTab) return;

        let content = '';
        let filename = '';
        let extension = '';
        let assetName = 'untitled';

        switch (activeTab) {
            case 'brainstorm':
                const cards = document.querySelectorAll('.brainstorm-card');
                if (cards.length === 0) {
                    showToast("Nothing to save!", "error");
                    return;
                }
                extension = '.brainstorm';
                content = "# Brainstorm Session\n\n";
                cards.forEach((card, index) => {
                    const title = card.querySelector('.card-title').textContent.trim();
                    if (index === 0 && title) assetName = title;
                    const logline = card.querySelector('.brainstorm-logline').textContent.trim();
                    const concept = card.querySelector('.brainstorm-concept').innerText.trim(); // Use innerText to preserve paragraph breaks
                    content += `## ${title}\n\n**Logline:** ${logline}\n\n${concept}\n\n---\n\n`;
                });
                break;

            case 'outline':
                const outlineItems = document.querySelectorAll('.outline-item');
                if (outlineItems.length === 0) {
                    showToast("Nothing to save!", "error");
                    return;
                }
                extension = '.outline';
                content = "# Story Outline\n\n";
                outlineItems.forEach((item, index) => {
                    const title = item.querySelector('.outline-item-title').textContent.trim();
                    if (index === 0 && title) assetName = title;
                    const description = item.querySelector('.outline-item-description').innerText.trim();
                    content += `## ${index + 1}. ${title}\n\n${description}\n\n`;
                });
                break;

            case 'treatment':
                const treatmentCanvas = document.getElementById('treatment-canvas');
                content = treatmentCanvas.innerText.trim();
                if (content === '' || treatmentCanvas.querySelector('.placeholder-text')) {
                    showToast("Nothing to save!", "error");
                    return;
                }
                extension = '.draft';
                assetName = content.split('\n')[0].trim() || 'draft';
                break;
        }

        filename = `${assetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${extension}`;

        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", url);
        downloadAnchorNode.setAttribute("download", filename);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        document.body.removeChild(downloadAnchorNode);

        URL.revokeObjectURL(url);
        showToast('Content saved successfully!', 'success');
    });
}


function initializeNewButton() {
    const newButton = document.getElementById('new-button');
    if (!newButton) return;

    newButton.addEventListener('click', () => {
        // 1. Clear main prompt
        const mainPrompt = document.getElementById('main-prompt');
        if (mainPrompt) {
            mainPrompt.value = '';
        }

        // 2. Clear loaded assets
        loadedAssets = [];
        renderAssetList();

        // 3. Clear selected gems and re-render the UI
        selectedGems = {};
        initializeGuidanceGems();

        // 4. Clear the content of the active tab
        const activeTab = document.querySelector('.writer-nav-button.active')?.dataset.tab;
        if (activeTab) {
            switch (activeTab) {
                case 'brainstorm':
                    const responseArea = document.getElementById('brainstorm-response-area');
                    if (responseArea) {
                        responseArea.innerHTML = '<p class="placeholder-text">Enter a core idea in the prompt box and click "Brainstorm Concepts" to generate story ideas.</p>';
                    }
                    break;
                case 'outline':
                    const outlineList = document.getElementById('outline-list');
                    if (outlineList) {
                        outlineList.innerHTML = '<p class="placeholder-text">Click "Develop Outline" on a concept card to generate an outline here.</p>';
                    }
                    break;
                case 'treatment':
                    const treatmentCanvas = document.getElementById('treatment-canvas');
                    if (treatmentCanvas) {
                        treatmentCanvas.innerHTML = '<p class="placeholder-text">Generate an outline, then click "Generate Treatment" to create a story treatment here.</p>';
                    }
                    break;
            }
        }

        showToast('Workspace cleared.', 'success');
    });
}

function initializeLoadButton() {
    const loadButton = document.getElementById('load-button');
    if (loadButton) {
        loadButton.addEventListener('click', () => {
            const activeTab = document.querySelector('.writer-nav-button.active')?.dataset.tab;
            if (!activeTab) return;

            const fileInput = document.createElement('input');
            fileInput.type = 'file';

            const extensions = {
                brainstorm: '.brainstorm',
                outline: '.outline',
                treatment: '.draft'
            };
            fileInput.accept = extensions[activeTab] || '.txt,.md,.brainstorm,.outline,.draft';

            fileInput.style.display = 'none';

            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    loadFileContent(file, activeTab);
                }
            });

            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });
    }
}

function loadFileContent(file, activeTab) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        switch (activeTab) {
            case 'brainstorm':
                loadBrainstormContent(content);
                break;
            case 'outline':
                loadOutlineContent(content);
                break;
            case 'treatment':
                const treatmentCanvas = document.getElementById('treatment-canvas');
                if (treatmentCanvas) {
                    treatmentCanvas.innerText = content;
                }
                break;
        }
        showToast(`Loaded ${file.name} successfully!`, 'success');
    };
    reader.onerror = () => {
        showToast(`Error reading file: ${file.name}`, 'error');
    };
    reader.readAsText(file);
}

function loadBrainstormContent(content) {
    const responseArea = document.getElementById('brainstorm-response-area');
    if (!responseArea) return;
    responseArea.innerHTML = ''; // Clear current content

    const concepts = [];
    // Split by the '---' separator, which is more reliable than complex regex.
    const rawConcepts = content.split('---').filter(c => c.trim().length > 5);

    rawConcepts.forEach(rawConcept => {
        const lines = rawConcept.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length < 3) return;

        const titleLine = lines.find(l => l.startsWith('## '));
        const loglineLine = lines.find(l => l.startsWith('**Logline:**'));

        if (titleLine && loglineLine) {
            const title = titleLine.replace('## ', '').trim();
            const logline = loglineLine.replace('**Logline:**', '').trim();

            // The rest of the lines constitute the concept.
            const loglineIndex = lines.indexOf(loglineLine);
            const concept = lines.slice(loglineIndex + 1).join('\n').trim();

            if (concept) {
                 concepts.push({ title, logline, concept });
            }
        }
    });

    if (concepts.length > 0) {
        concepts.forEach(conceptData => {
            const card = createBrainstormCard(conceptData);
            responseArea.appendChild(card);
        });
    } else {
        // Fallback for content that doesn't match the expected format
        responseArea.innerHTML = `<p class="placeholder-text">${content.replace(/\n/g, '<br>')}</p>`;
    }
}

function loadOutlineContent(content) {
    const outlineList = document.getElementById('outline-list');
    if (!outlineList) return;
    outlineList.innerHTML = ''; // Clear current content

    const plotPoints = [];
    const sections = content.split(/^## \d+\.\s+/m).filter(s => s.trim());

    sections.forEach(section => {
        const lines = section.trim().split('\n');
        const title = lines.shift().trim();
        const description = lines.join('\n').trim();
        if (title && description) {
            plotPoints.push({ title, description });
        }
    });

    if (plotPoints.length > 0) {
        plotPoints.forEach(pointData => {
            const li = createPlotPointListItem(pointData);
            outlineList.appendChild(li);
        });
    } else {
        outlineList.innerHTML = `<p class="placeholder-text">${content.replace(/\n/g, '<br>')}</p>`;
    }
}

// --- Edit Mode Toggles ---
function initializeEditToggles() {
    const toggles = document.querySelectorAll('.edit-toggle');
    toggles.forEach(toggle => {
        const targetId = toggle.dataset.target;
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            // Add the editable-area class for styling
            targetElement.classList.add('editable-area');

            // Set initial state
            const isChecked = toggle.checked;
            targetElement.contentEditable = isChecked;
            if (isChecked) {
                targetElement.classList.add('is-editable');
            } else {
                targetElement.classList.remove('is-editable');
            }

            const childEditables = targetElement.querySelectorAll('.editable-content');
            childEditables.forEach(child => {
                child.contentEditable = isChecked;
            });

            toggle.addEventListener('change', (e) => {
                const isEditable = e.target.checked;
                targetElement.contentEditable = isEditable;

                if (isEditable) {
                    targetElement.classList.add('is-editable');
                } else {
                    targetElement.classList.remove('is-editable');
                }

                const childEditables = targetElement.querySelectorAll('.editable-content');
                childEditables.forEach(child => {
                    child.contentEditable = isEditable;
                });
            });
        }
    });
}

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // Core UI Initializers
    initializeResizableColumns();
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeTabs();
    initializeEditToggles();

    // Workflow and Generation Initializers
    initializeGeneration();
    initializeWorkflowButtons();
    initializeOutline();
    initializeFloatingToolbar();
    initializeSaveButton();
    initializeNewButton();
    initializeLoadButton();
});


