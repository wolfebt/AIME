/*
    File: element-bundle.js
    Reference: Element Pages Logic
    Creator: Wolfe.BT, TangentLLC
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
// REFACTORED: This entire section has been rewritten to use a modal for multi-selection.
let selectedGems = {}; // Data store for all selected guidance options

// MODIFICATION: Move gemsData to global scope for persistence
// This object now holds all gem configurations, keyed by element type.
const allGemsData = {
    "STORY": { // Default gems for story-related elements
        "Genre": ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Horror", "Mystery", "Romance", "Thriller", "Whimsical", "Gritty", "Noir"],
        "Tone": ["Serious", "Humorous", "Formal", "Informal", "Optimistic", "Pessimistic", "Joyful", "Sad", "Hopeful", "Cynical", "Dark", "Uplifting"],
        "Pacing": ["Fast-paced", "Slow-burn", "Steady", "Urgent", "Relaxed", "Meditative", "Action-Packed"],
        "Point of View": ["First Person", "Third Person Limited", "Third Person Omniscient", "Second Person", "Alternating POV"],
        "Literary Devices": ["Metaphor", "Simile", "Personification", "Alliteration", "Symbolism", "Irony", "Foreshadowing", "Satire"],
        "Structure": ["Linear", "Non-linear", "Episodic", "In Medias Res", "Frame Story"],
        "Themes": ["Redemption", "Betrayal", "Discovery", "Survival", "Love", "Hate", "Power", "Corruption", "Nature vs. Nurture"]
    },
    "PERSONA": { // Specific gems for the Persona element
        "Descriptive Tone": ["Heroic & Grand", "Villainous & Menacing", "Tragic & Sympathetic", "Comedic & Light", "Mysterious & Obscure"],
        "Character Complexity": ["Morally Ambiguous", "Straightforward Hero/Villain", "Complex Anti-Hero", "Innocent Idealist"],
        "Speech Pattern": ["Eloquent & Articulate", "Laconic & Terse", "Fast-Talking & Energetic", "Sarcastic & Witty", "Formal & Proper"],
        "Physicality Focus": ["Emphasize Strength/Power", "Emphasize Agility/Grace", "Emphasize Intellect/Presence", "Emphasize Frailty"],
        "Inner World Focus": ["Emotionally Reserved", "Openly Expressive", "Logically Detached", "Driven by Passion", "Riddled with Anxiety"]
    },
    "SPECIES": {
        "Origin Type": ["Natural Evolution", "Magical Creation", "Genetic Engineering", "Extra-dimensional Being", "Artificial/Mechanical"],
        "Role in World": ["Apex Predator", "Keystone Species", "Prey Animal", "Parasitic", "Symbiotic"],
        "Societal Model": ["Hive-Mind/Collective", "Solitary", "Pack-Based", "Tribal System", "Complex Civilization"],
        "Technological Aptitude": ["Technologically Advanced", "Primitive Tool-Users", "Organic Technology", "Strongly Anti-Technology"],
        "General Temperament": ["Aggressive & Territorial", "Docile & Peaceful", "Xenophobic & Insular", "Curious & Inquisitive", "Secretive"]
    },
    "SCENE": {
        "Primary Mood": ["Tense & Suspenseful", "Lighthearted & Comedic", "Intimate & Romantic", "Somber & Melancholy", "Action-Packed"],
        "Sensory Focus": ["Emphasize Visuals", "Emphasize Sounds", "Emphasize Smells & Tastes", "Emphasize Tactile Sensations"],
        "Narrative Pacing": ["Urgent & Fast-Paced", "Slow & Deliberate", "Meditative & Reflective", "Escalating Tension"],
        "Dialogue Style": ["Formal & Eloquent", "Casual & Colloquial", "Sharp & Witty", "Heavily Subtextual", "Minimalist"],
        "Point of View": ["First Person", "Third Person Limited", "Third Person Omniscient", "Second Person"]
    },
    "SETTING": {
        "Location Type": ["Dense Urban Metropolis", "Quiet Rural Village", "Untamed Wilderness", "Subterranean City", "Ethereal/Planar Realm"],
        "Architectural Style": ["Gothic & Ornate", "Brutalist & Utilitarian", "Art Deco", "Organic & Nature-Infused", "Ancient & Ruined"],
        "General Atmosphere": ["Bustling & Lively", "Eerie & Abandoned", "Opulent & Grand", "Gritty & Industrial", "Serene & Peaceful"],
        "Population Density": ["Sparsely Populated", "Crowded & Overpopulated", "Completely Uninhabited", "Seasonal Population"],
        "State of Repair": ["Pristine & New", "Well-Maintained", "Visibly Decaying", "Utterly Ruined", "Under Construction"]
    },
    "WORLD": {
        "Dominant Biome": ["Volcanic & Harsh", "Arctic & Frozen", "Lush Jungle", "Temperate & Varied", "Barren Desert", "Aquatic & Oceanic"],
        "Societal Structure": ["Feudal Kingdoms", "Imperial Empire", "Republic/Democracy", "Theocracy", "Corporate-run States"],
        "Level of Conflict": ["Widespread War", "Political Intrigue", "Cold War", "Era of Peace", "Post-Apocalyptic Survival"],
        "Historical Feel": ["Ancient & Mysterious", "Gilded Age of Progress", "Dark Age & Decline", "Rebuilding & Exploration"],
        "Cultural Flavor": ["Nomadic & Tribal", "Agrarian & Rural", "Heavily Urbanized", "Militaristic & Expansionist"]
    },
    "TECHNOLOGY": { // Updated as per user request to ensure alignment.
        "Aesthetic Style": ["Sleek & Minimalist", "Steampunk & Ornate", "Brutalist & Industrial", "Magitech & Arcane", "Organic & Bio-engineered"],
        "Descriptive Style": ["Formal Technical Manual", "In-Universe Advertisement", "Scholarly Historical Entry", "Casual User Review"],
        "Perceived Reliability": ["Flawless & Dependable", "Reliable but Outdated", "Unstable & Dangerous", "Experimental & Unpredictable"],
        "User-Friendliness": ["Highly Intuitive", "Complex & Arcane", "Requires Special Training", "Physically Demanding"]
    },
    "PHILOSOPHY": {
        "Organizational Structure": ["Strict Hierarchy", "Decentralized Cells", "Monastic Orders", "Charismatic Cult", "Academic Tradition"],
        "Public Perception": ["Widely Accepted Mainstream", "Respected Ancient Tradition", "Fringe Belief System", "Outlawed Secret Society", "State Religion"],
        "Dominant Tone": ["Dogmatic & Rigid", "Mystical & Esoteric", "Pragmatic & Secular", "Welcoming & Inclusive", "Ascetic & Disciplined"],
        "Historical Influence": ["Ancient & Fading", "Currently Dominant Cultural Force", "New & Revolutionary Movement", "Subtle & Pervasive"]
    },
    "UNIVERSE": {
        "Core Genre": ["Fantasy", "Science Fiction", "Horror", "Mystery", "Alternate History"],
        "Genre Blends": ["Cyberpunk-Noir", "Steampunk-Fantasy", "Space Opera-Western", "Cosmic Horror-Mystery"],
        "Dominant Tone": ["Grimdark", "Hopeful & Optimistic", "Satirical & Absurdist", "Whimsical & Lighthearted"],
        "Cosmic Scope": ["Single Galaxy", "Multiverse", "Contained Pocket Dimension", "Planetary System"],
        "Magic/Power System": ["Hard Magic (Rules-based)", "Soft Magic (Mysterious)", "Psionics", "No Supernatural Powers"],
        "Technological Era": ["Ancient", "Medieval", "Industrial", "Information Age", "Futuristic"]
    },
    "FACTION": {
        "Faction Type": ["Mega-corporation", "Rebel Alliance", "Research Guild", "Criminal Syndicate", "Political Party", "Religious Order"],
        "Organizational Model": ["Rigid Hierarchy", "Democratic Council", "Decentralized Cells", "Cult of Personality", "Feudal Structure"],
        "Public Face": ["Benevolent & Philanthropic", "Mysterious & Secretive", "Militant & Aggressive", "Pragmatic & Corporate", "Fanatical & Zealous"],
        "Method of Influence": ["Economic Domination", "Political Manipulation", "Military Might", "Covert Operations", "Cultural Sway"],
        "Moral Alignment": ["Lawful Good", "Chaotic Evil", "True Neutral", "Lawful Neutral", "Chaotic Good"]
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

    // Use persona-specific gems if on PERSONA page, otherwise default to STORY gems
    if (elementType && allGemsData[elementType]) {
        // Create a shallow copy to prevent custom gems from modifying the original allGemsData object
        gemsData = { ...allGemsData[elementType] };
    } else {
        // Fallback for elements that don't have a specific gem set (like WORLD, SCENE, etc.)
        // This makes the system extensible.
        gemsData = { ...allGemsData['STORY'] };
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

    // This check can be simplified as the backend will handle the key logic,
    // but it's good for immediate user feedback.
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

    // This is the model the frontend wants to use.
    const model = 'gemini-2.5-flash-lite'; // UPDATED to cost-effective model
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
            // The AI response should go into the main canvas, not the notes field.
            // Using a simple text assignment for now. If markdown parsing is needed, this is where it would go.
            responseContainer.textContent = text;
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

function craftSuperPrompt(elementType) {
    let prompt = `You are AIME, an AI world-building assistant. The user wants to generate details for a "${elementType}" Element. Use the provided information to create a rich, detailed, and creative description.\n\n`;

    // --- 1. Current Element's Traits ---
    prompt += "--- PRIMARY ELEMENT: " + elementType + " ---\n";
    const inputs = document.querySelectorAll('.form-section .input-field');
    let hasPrimaryTraits = false;
    inputs.forEach(input => {
        // Exclude the new custom notes field from this main loop
        if (input.id === 'custom-notes') return;

        const label = input.previousElementSibling ? input.previousElementSibling.textContent : input.id;
        if (input.value.trim()) {
            prompt += `${label}: ${input.value.trim()}\n`;
            hasPrimaryTraits = true;
        }
    });
    if (!hasPrimaryTraits) {
        prompt += "No specific traits provided for this element. Please generate creatively.\n";
    }

    // --- 1.5. Custom Notes ---
    const customNotes = document.getElementById('custom-notes');
    if (customNotes && customNotes.value.trim()) {
        prompt += "\n--- CUSTOM NOTES ---\n";
        prompt += customNotes.value.trim() + '\n';
    }

    // --- 2. Guidance Gems ---
    let guidancePrompt = "";
    // Flatten all selected gems from the global object into a single list for the prompt.
    Object.values(selectedGems).forEach(gemsArray => {
        gemsArray.forEach(gem => {
            guidancePrompt += `- ${gem}\n`;
        });
    });

    if (guidancePrompt) {
        prompt += "\n--- GUIDANCE GEMS (STYLISTIC DIRECTION) ---\n";
        prompt += guidancePrompt;
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
        showToast('Error: Could not determine element type.', 'error');
        return;
    }
    const elementType = generateButton.dataset.elementType; // e.g., PERSONA
    const extension = elementType.toLowerCase(); // e.g., persona

    let markdownContent = `# ${elementType.charAt(0).toUpperCase() + elementType.slice(1).toLowerCase()} Asset\n`;
    markdownContent += `> Saved on: ${new Date().toUTCString()}\n\n`;

    let assetName = 'Untitled';

    // Process standard trait fields from all tabs
    const inputs = document.querySelectorAll('.form-section .input-field');
    inputs.forEach(input => {
        // Exclude the custom notes field from this main loop
        if (input.id === 'custom-notes') return;

        const labelElement = input.previousElementSibling;
        const label = labelElement ? labelElement.textContent.trim() : 'Unknown Field';
        const value = input.value.trim();

        if (value) {
            markdownContent += `## ${label}\n${value}\n\n`;
        }

        // Check for the 'name' field to use in the filename
        if (input.dataset.fieldId === 'name' && value) {
            assetName = value;
        }
    });

    // Process custom notes separately
    const customNotesField = document.getElementById('custom-notes');
    if (customNotesField && customNotesField.value.trim()) {
        markdownContent += `## Custom Notes\n${customNotesField.value.trim()}\n\n`;
    }

    // Create filename
    const filename = `${assetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;

    // Create a Blob, which is better for handling non-ASCII characters
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode); // Required for Firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    // Clean up the URL object
    URL.revokeObjectURL(url);
    showToast('Asset saved successfully!');
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

function initializeLoadButton() {
    const loadButton = document.getElementById('load-button');
    if (loadButton) {
        loadButton.addEventListener('click', () => {
            const generateButton = document.getElementById('generate-button');
            if (!generateButton) {
                console.error('Generate button not found, cannot determine element type for loading.');
                return;
            }
            const elementType = generateButton.dataset.elementType;
            const extension = `.${elementType.toLowerCase()}`;

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = extension;
            fileInput.style.display = 'none';

            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    loadElementAsset(file);
                }
            });

            document.body.appendChild(fileInput);
            fileInput.click();
            document.body.removeChild(fileInput);
        });
    }
}

function loadElementAsset(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');

        // Clear existing fields before loading new data
        const allInputs = document.querySelectorAll('.form-section .input-field');
        allInputs.forEach(input => input.value = '');

        let currentLabel = null;
        let currentValue = '';

        lines.forEach(line => {
            const match = line.match(/^##\s+(.+)/); // Match headers like "## Core Tenets & Beliefs"
            if (match) {
                // If we have a pending field, save it
                if (currentLabel) {
                    setFieldValue(currentLabel, currentValue.trim());
                }
                // Start a new field
                currentLabel = match[1].trim();
                currentValue = '';
            } else if (currentLabel) {
                // If it's not a header, it's part of the content for the current field
                currentValue += line + '\n';
            }
        });

        // Save the last field after the loop finishes
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

    if (label === 'Custom Notes') {
        const customNotesField = document.getElementById('custom-notes');
        if (customNotesField) {
            customNotesField.value = value;
        }
        return;
    }

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

function initializeNewButton() {
    const newButton = document.getElementById('new-button');
    if (newButton) {
        newButton.addEventListener('click', () => {
            // Clear all input fields and textareas
            const inputs = document.querySelectorAll('.form-section .input-field');
            inputs.forEach(input => {
                input.value = '';
            });

            // Clear the response container
            const responseContainer = document.getElementById('response-container');
            if (responseContainer) responseContainer.innerHTML = '';

            // Clear loaded assets
            loadedAssets = [];
            renderAssetList();

            // Clear selected gems and re-render the UI for them
            selectedGems = {};
            initializeGuidanceGems();
        });
    }
}

// --- Element Page Tabs ---
function initializeElementTabs() {
    const tabButtons = document.querySelectorAll('.element-nav-button');
    const tabs = document.querySelectorAll('.element-tab');

    if (!tabButtons.length || !tabs.length) return;

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));

            // Activate the clicked button and corresponding tab
            button.classList.add('active');
            const tabName = button.dataset.tab;
            const targetTab = document.getElementById(`${tabName}-tab`);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });
}

// --- Sub-Tab Logic ---
function initializeSubTabs() {
    const containers = document.querySelectorAll('.sub-tab-container');
    containers.forEach(container => {
        const subTabButtons = container.querySelectorAll('.sub-nav-button');
        const subTabs = container.querySelectorAll('.sub-tab-content');

        if (!subTabButtons.length || !subTabs.length) return;

        subTabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Deactivate all buttons and tabs within this container
                subTabButtons.forEach(btn => btn.classList.remove('active'));
                subTabs.forEach(tab => tab.classList.remove('active'));

                // Activate the clicked button and corresponding tab
                button.classList.add('active');
                const subTabName = button.dataset.subTab;
                const targetSubTab = container.querySelector(`#${subTabName}-sub-tab`);
                if (targetSubTab) {
                    targetSubTab.classList.add('active');
                }
            });
        });
    });
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

            // Set initial state: The textarea should be disabled, and the toggle should be off.
            targetElement.disabled = true;
            toggle.checked = false;
            targetElement.classList.remove('is-editable');

            toggle.addEventListener('change', (e) => {
                const isEditable = e.target.checked;
                targetElement.disabled = !isEditable;
                if (isEditable) {
                    targetElement.classList.add('is-editable');
                    targetElement.focus();
                } else {
                    targetElement.classList.remove('is-editable');
                }
            });
        }
    });
}

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns(); // Intentionally disabled for stability
    initializeAccordions(); // Add this line
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeGeneration();
    initializeSaveButton();
    initializeLoadButton();
    initializeNewButton();
    initializeElementTabs();
    initializeSubTabs();
    initializeEditToggles();
});


