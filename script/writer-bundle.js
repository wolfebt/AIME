/*
    File: writer-bundle.js
    Reference: Story Weaver Logic
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
        "Genre": ["Science Fiction", "Fantasy", "Mystery", "Thriller", "Horror", "Romance"],
        "Tone": ["Serious", "Humorous", "Dark", "Whimsical", "Gritty"],
        "Pacing": ["Fast-paced", "Slow-burn", "Action-Packed"],
        "Themes": ["Redemption", "Betrayal", "Discovery", "Survival"]
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

// --- Story Weaver Tabs & Workflow ---
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.writer-nav-button');
    const tabs = document.querySelectorAll('.writer-tab');
    const generateBtn = document.getElementById('generate-button');

    const buttonTextMap = {
        brainstorm: "Brainstorm Concepts",
        outline: "Suggest Plot Point",
        treatment: "Generate Treatment",
        write: "Continue Writing"
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));
            button.classList.add('active');
            const tabName = button.dataset.tab;
            document.getElementById(`${tabName}-tab`).classList.add('active');

            if (generateBtn && buttonTextMap[tabName]) {
                generateBtn.textContent = buttonTextMap[tabName];
            }
        });
    });
}

// --- AI Generation Logic ---

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

function craftSuperPrompt(promptText) {
    let promptData = {
        prompt: promptText,
        gems: [],
        assets: []
    };
    const activeGems = document.querySelectorAll('#guidance-gems-container .gem-option.active');
    activeGems.forEach(gem => promptData.gems.push(gem.textContent));

    const assetItems = document.querySelectorAll('#asset-list .asset-name');
    assetItems.forEach(item => promptData.assets.push(item.textContent));
    
    let formattedPrompt = `You are AIME, an AI creative partner specializing in storytelling.\n\n--- STORY BRAINSTORM REQUEST ---\n`;
    formattedPrompt += `USER'S CORE IDEA: "${promptData.prompt}"\n\n`;

    if (promptData.gems.length > 0) {
        formattedPrompt += `--- GUIDANCE GEMS (GENRE, TONE, THEMES) ---\n`;
        formattedPrompt += `Incorporate these elements: ${promptData.gems.join(', ')}\n`;
    }
    if (promptData.assets.length > 0) {
        formattedPrompt += `\n--- CONTEXTUAL ASSETS (REFERENCE THESE) ---\n`;
        formattedPrompt += `Use the following as context: ${promptData.assets.join(', ')}\n`;
    }
    formattedPrompt += `\n--- TASK ---\nBased on all the information above, generate three distinct and creative story concepts. For each concept, you MUST provide a "Title:", a one-sentence "Logline:", and a "Concept:" paragraph. Separate each of the three concepts with '---'.`;
    
    return formattedPrompt;
}

// New parser function for the AI response
function parseBrainstormResponse(responseText) {
    const concepts = [];
    const rawConcepts = responseText.split('---').filter(c => c.trim().length > 10);

    rawConcepts.forEach(rawConcept => {
        const titleMatch = rawConcept.match(/Title:\s*(.*)/);
        const loglineMatch = rawConcept.match(/Logline:\s*(.*)/);
        const conceptMatch = rawConcept.match(/Concept:\s*([\s\S]*)/);

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
        <h4 class="card-title">${data.title}</h4>
        <p class="brainstorm-logline"><em>${data.logline}</em></p>
        <p class="brainstorm-concept">${data.concept}</p>
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
    console.log("--- Generated Super-Prompt for Brainstorm ---");
    console.log(superPrompt);

    responseArea.innerHTML = '<p class="loading-text">AIME is brainstorming concepts...</p>';
    generateBtn.disabled = true;

    const aiResponse = await generateContent(superPrompt);
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
        
        if (activeTab === 'brainstorm') {
            generateBrainstormConcepts();
        } else {
            console.log(`Generation for "${activeTab}" tab not yet implemented.`);
            const responseArea = document.querySelector(`#${activeTab}-tab .response-area-cards, #${activeTab}-tab .writing-canvas`);
            if(responseArea) {
                responseArea.innerHTML = `<p>Generation for ${activeTab} is not yet active.</p>`;
            }
        }
    });
}

// Stubs for other functions from previous implementation for completeness
function initializeOutline() {}
function initializeTreatment() {}
function initializeWritingCanvas() {}
function initializeWorkflowButtons() {}
function initializeSaveButtons() {}


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // initializeResizableColumns(); // Disabled for now
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeTabs();
    initializeGeneration();
    
    // Initialize other modules as placeholders
    initializeOutline();
    initializeTreatment();
    initializeWritingCanvas();
    initializeWorkflowButtons();
    initializeSaveButtons();
});

