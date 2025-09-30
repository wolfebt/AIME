/*
    File: writer-bundle.js
    Reference: Story Weaver Logic - Refactored
    Creator: Wolfe.BT, TangentLLC
*/

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // Core UI Initializers
    initializeResizableColumns();
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();

    // Story Weaver App Initializers
    initializeTabs();
    initializeActionListeners();
    initializeWorkflowDelegation();
    initializeOutlineDragAndDrop();
});


// --- Accordion Logic ---
function initializeAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        if (!header) return;
        header.addEventListener('click', () => {
            const content = accordion.querySelector('.accordion-content');
            const chevron = header.querySelector('.accordion-chevron');
            if (!content || !chevron) return;

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
        // Ensure initially active accordions are open
        if (header.classList.contains('active')) {
            const content = accordion.querySelector('.accordion-content');
            const chevron = header.querySelector('.accordion-chevron');
            if(content && chevron) {
                content.style.padding = '1.5rem';
                content.style.maxHeight = content.scrollHeight + "px";
                chevron.style.transform = 'rotate(180deg)';
            }
        }
    });
}

// --- Resizable Columns ---
function initializeResizableColumns() {
    const resizeHandle = document.querySelector('.resize-handle');
    if (!resizeHandle) return;

    const mainColumn = document.querySelector('.main-column');
    const sideColumn = document.querySelector('.side-column');
    const workspace = document.querySelector('.workspace-layout');

    if (!mainColumn || !sideColumn || !workspace) return;

    let isResizing = false;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
            document.body.style.cursor = 'default';
        });
        document.body.style.cursor = 'col-resize';
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


// --- Story Weaver Tabs & UI Management ---
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.writer-nav-button');
    const tabs = document.querySelectorAll('.writer-tab');

    const buttonTextMap = {
        brainstorm: "Brainstorm Concepts",
        outline: "Suggest Plot Point",
        treatment: "Generate Treatment",
        refine: "Continue Writing"
    };

    const saveButtonHTMLMap = {
        brainstorm: `<button class="action-btn" data-save-type="brainstorm">Save Brainstorm</button>`,
        outline: `<button class="action-btn" data-save-type="outline">Save Outline</button>`,
        treatment: `<button class="action-btn" data-save-type="treatment">Save Treatment</button>`,
        refine: `<button class="action-btn" data-save-type="refine">Save Manuscript</button>`
    };

    const updateUIForTab = (tabName) => {
        const generateBtn = document.getElementById('generate-button');
        const refineTools = document.getElementById('refine-tools-container');
        const saveButtonsContainer = document.getElementById('save-buttons-container');

        // Update Generate Button Text and Visibility
        if (generateBtn) {
            generateBtn.textContent = buttonTextMap[tabName] || "Generate";
            generateBtn.style.display = (tabName === 'refine') ? 'none' : 'block';
        }

        // Update Refine Tools Visibility
        if (refineTools) {
            refineTools.style.display = (tabName === 'refine') ? 'block' : 'none';
        }

        // Update Save Buttons
        if (saveButtonsContainer && saveButtonHTMLMap[tabName]) {
            saveButtonsContainer.innerHTML = saveButtonHTMLMap[tabName];
        }

        // Switch active tab content
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.id === `${tabName}-tab`);
        });
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const tabName = button.dataset.tab;
            updateUIForTab(tabName);
        });
    });

    // Initialize UI for the default active tab on load
    const initialActiveTab = document.querySelector('.writer-nav-button.active');
    if (initialActiveTab) {
        updateUIForTab(initialActiveTab.dataset.tab);
    }
}


// --- Centralized Action Event Listeners ---
function initializeActionListeners() {
    const sideColumn = document.querySelector('.side-column');
    if (!sideColumn) return;

    sideColumn.addEventListener('click', (e) => {
        const target = e.target;

        // Generate Button Click
        if (target.id === 'generate-button') {
            const activeTabName = document.querySelector('.writer-nav-button.active')?.dataset.tab;
            handleGeneration(activeTabName);
        }
        // Refine Tools Click
        else if (target.closest('#refine-tools-container')) {
            const actionButton = target.closest('.action-btn');
            if (actionButton) {
                const action = actionButton.dataset.action;
                handleRefineAction(action);
            }
        }
        // Save Button Click
        else if (target.closest('#save-buttons-container')) {
             const saveButton = target.closest('.action-btn');
             if(saveButton) {
                const saveType = saveButton.dataset.saveType;
                handleSaveAction(saveType);
             }
        }
    });
}


// --- Action Handlers ---

function handleGeneration(tabName) {
    switch (tabName) {
        case 'brainstorm':
            generateBrainstormConcepts();
            break;
        case 'outline':
            // This can be built out further.
            alert("Suggesting a plot point for the current outline...");
            break;
        case 'treatment':
            generateTreatment();
            break;
        default:
            console.warn("No generation action for tab:", tabName);
    }
}

function handleRefineAction(action) {
    const selection = window.getSelection();
    const canvas = document.getElementById('writing-canvas-main');
    const isSelectionInCanvas = selection && selection.rangeCount > 0 && !selection.isCollapsed && canvas.contains(selection.anchorNode);

    if (isSelectionInCanvas) {
        handleTextTool(action, selection);
    } else {
        alert("Please select text in the editor to refine.");
    }
}

function handleSaveAction(saveType) {
    switch(saveType) {
        case 'brainstorm':
            saveBrainstormContent();
            break;
        case 'outline':
            saveOutlineContent();
            break;
        case 'treatment':
            saveTreatmentContent();
            break;
        case 'refine':
            saveRefineContent();
            break;
        default:
            console.warn("Unknown save type:", saveType);
    }
}

// --- AI Generation & API Call ---
async function generateContent(prompt) {
    const apiKey = localStorage.getItem('AIME_API_KEY');
    if (!apiKey) {
        return { error: "API Key not found. Please set it in the settings (the ⚙️ icon)." };
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-preview-0514:generateContent?key=${apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { text };
        throw new Error("Invalid response format from API.");
    } catch (error) {
        console.error("Error generating content:", error);
        return { error: "An error occurred while generating content. Please check the console for details." };
    }
}


// --- Brainstorm Logic ---
function craftSuperPrompt(promptText) {
    let gems = Array.from(document.querySelectorAll('#guidance-gems-container .gem-option.active')).map(g => g.textContent);
    let assets = Array.from(document.querySelectorAll('#asset-list .asset-name')).map(item => item.textContent);
    let formattedPrompt = `You are AIME, an AI creative partner specializing in storytelling.\n\nUSER'S CORE IDEA: "${promptText}"\n`;
    if (gems.length > 0) formattedPrompt += `\nGUIDANCE GEMS (Incorporate these): ${gems.join(', ')}\n`;
    if (assets.length > 0) formattedPrompt += `\nCONTEXTUAL ASSETS (Reference these): ${assets.join(', ')}\n`;
    formattedPrompt += `\nTASK: Generate three distinct story concepts. For each, provide a "Title:", a one-sentence "Logline:", and a "Concept:" paragraph. Separate each concept with '---'.`;
    return formattedPrompt;
}

async function generateBrainstormConcepts() {
    const promptInput = document.getElementById('main-prompt');
    const responseArea = document.getElementById('brainstorm-response-area');
    const generateBtn = document.getElementById('generate-button');
    if (!promptInput || !responseArea || !generateBtn) return;

    responseArea.innerHTML = '<p class="loading-text">AIME is brainstorming...</p>';
    generateBtn.disabled = true;

    const superPrompt = craftSuperPrompt(promptInput.value);
    const { text, error } = await generateContent(superPrompt);

    if (error) {
        responseArea.innerHTML = `<p class="error-text">${error}</p>`;
    } else {
        const concepts = parseBrainstormResponse(text);
        responseArea.innerHTML = '';
        if (concepts.length > 0) {
            concepts.forEach(concept => responseArea.appendChild(createBrainstormCard(concept)));
        } else {
            responseArea.innerHTML = `<p class="error-text">AIME had trouble formatting the response. Try a different prompt.</p>`;
        }
    }
    generateBtn.disabled = false;
}

function parseBrainstormResponse(responseText) {
    return responseText.split('---').map(rawConcept => {
        const titleMatch = rawConcept.match(/Title:\s*(.*)/);
        const loglineMatch = rawConcept.match(/Logline:\s*(.*)/);
        const conceptMatch = rawConcept.match(/Concept:\s*([\s\S]*)/);
        if (titleMatch && loglineMatch && conceptMatch) {
            return {
                title: titleMatch[1].trim(),
                logline: loglineMatch[1].trim(),
                concept: conceptMatch[1].trim()
            };
        }
        return null;
    }).filter(Boolean);
}

function createBrainstormCard(data) {
    const card = document.createElement('div');
    card.className = 'brainstorm-card glass-panel';
    card.innerHTML = `
        <h4 class="card-title">${data.title}</h4>
        <p class="brainstorm-logline"><em>${data.logline}</em></p>
        <p class="brainstorm-concept">${data.concept.replace(/\n/g, '<br>')}</p>
        <div class="card-actions">
            <button class="action-btn develop-outline-btn">Develop Outline</button>
        </div>`;
    return card;
}


// --- Outline Logic ---
function initializeWorkflowDelegation() {
    const mainColumn = document.querySelector('.main-column');
    if (!mainColumn) return;

    mainColumn.addEventListener('click', async (e) => {
        if (e.target.classList.contains('develop-outline-btn')) {
            const card = e.target.closest('.brainstorm-card');
            if (!card) return;
            e.target.textContent = 'Developing...';
            e.target.disabled = true;

            const fullConcept = `Title: ${card.querySelector('.card-title').textContent}\nLogline: ${card.querySelector('.brainstorm-logline').textContent}\nConcept: ${card.querySelector('.brainstorm-concept').textContent}`;
            document.querySelector('.writer-nav-button[data-tab="outline"]')?.click();
            await generateOutline(fullConcept);
            e.target.textContent = 'Develop Outline';
            e.target.disabled = false;
        }
    });
}

async function generateOutline(conceptText) {
    const outlineList = document.getElementById('outline-list');
    if (!outlineList) return;
    outlineList.innerHTML = `<li class="loading-text">AIME is building your outline...</li>`;
    const prompt = `Based on the following story concept, generate 7-10 key plot points for a narrative arc.\n\n--- STORY CONCEPT ---\n${conceptText}\n\n--- TASK ---\nFor each plot point, provide a "Title:" and a "Description:" paragraph. Separate each plot point with '---'.`;
    const { text, error } = await generateContent(prompt);
    if (error) {
        outlineList.innerHTML = `<li class="error-text">${error}</li>`;
        return;
    }
    const plotPoints = parseOutlineResponse(text);
    outlineList.innerHTML = '';
    if (plotPoints.length > 0) {
        plotPoints.forEach(point => outlineList.appendChild(createPlotPointListItem(point)));
    } else {
        outlineList.innerHTML = `<li class="error-text">AIME had trouble generating the outline.</li>`;
    }
}

function parseOutlineResponse(responseText) {
    return responseText.split('---').map(p => {
        const titleMatch = p.match(/Title:\s*(.*)/);
        const descriptionMatch = p.match(/Description:\s*([\s\S]*)/);
        if (titleMatch && descriptionMatch) {
            return { title: titleMatch[1].trim(), description: descriptionMatch[1].trim() };
        }
        return null;
    }).filter(Boolean);
}

function createPlotPointListItem(data) {
    const li = document.createElement('li');
    li.className = 'outline-item glass-panel';
    li.setAttribute('draggable', 'true');
    li.innerHTML = `
        <div class="outline-item-header">
            <span class="outline-item-title">${data.title}</span>
            <button class="remove-item-btn">&times;</button>
        </div>
        <p class="outline-item-description">${data.description.replace(/\n/g, '<br>')}</p>`;
    li.querySelector('.remove-item-btn').addEventListener('click', () => li.remove());
    return li;
}

function initializeOutlineDragAndDrop() {
    const outlineList = document.getElementById('outline-list');
    if (!outlineList) return;
    let draggingItem = null;
    outlineList.addEventListener('dragstart', e => {
        if (e.target.classList.contains('outline-item')) {
            draggingItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        }
    });
    outlineList.addEventListener('dragend', () => {
        if(draggingItem) draggingItem.classList.remove('dragging');
        draggingItem = null;
    });
    outlineList.addEventListener('dragover', e => {
        e.preventDefault();
        if (!draggingItem) return;
        const afterElement = [...outlineList.querySelectorAll('.outline-item:not(.dragging)')].reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            return (offset < 0 && offset > closest.offset) ? { offset, element: child } : closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
        if (afterElement == null) {
            outlineList.appendChild(draggingItem);
        } else {
            outlineList.insertBefore(draggingItem, afterElement);
        }
    });
}


// --- Treatment Logic ---
async function generateTreatment() {
    const outlineItems = document.querySelectorAll('#outline-list .outline-item');
    const treatmentCanvas = document.getElementById('treatment-canvas');
    if (outlineItems.length === 0 || !treatmentCanvas) {
        alert("Please generate an outline first.");
        return;
    }
    treatmentCanvas.innerHTML = '<p class="loading-text">AIME is crafting your treatment...</p>';
    let fullOutline = "Write a detailed story treatment based on these ordered plot points:\n\n";
    outlineItems.forEach((item, index) => {
        fullOutline += `${index + 1}. ${item.querySelector('.outline-item-title').textContent}: ${item.querySelector('.outline-item-description').textContent}\n`;
    });
    fullOutline += "\nExpand on the plot points, connect the scenes, and describe character emotions. The treatment should flow like a short story.";
    const { text, error } = await generateContent(fullOutline);
    if (error) {
        treatmentCanvas.innerHTML = `<p class="error-text">${error}</p>`;
    } else {
        treatmentCanvas.innerHTML = `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    }
}


// --- Refine Logic ---
async function handleTextTool(action, selection) {
    const selectedText = selection.toString();
    let prompt = '';
    switch (action) {
        case 'rephrase': prompt = `Rephrase the following text to be clearer and more engaging:\n\n"${selectedText}"`; break;
        case 'shorten': prompt = `Shorten the following text, keeping the core meaning concise:\n\n"${selectedText}"`; break;
        case 'expand': prompt = `Expand upon the following text, adding more detail and description:\n\n"${selectedText}"`; break;
        default: return;
    }
    const { text, error } = await generateContent(prompt);
    if (error) {
        alert(error);
        return;
    }
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
}


// --- Save Logic ---
function saveBrainstormContent() {
    const cards = document.querySelectorAll('.brainstorm-card');
    if (cards.length === 0) return alert("Nothing to save!");
    let content = "--- AIME Brainstorm Session ---\n\n";
    cards.forEach((card, index) => {
        content += `Concept ${index + 1}:\nTitle: ${card.querySelector('.card-title').textContent}\nLogline: ${card.querySelector('.brainstorm-logline').textContent}\n\n${card.querySelector('.brainstorm-concept').textContent}\n\n---\n\n`;
    });
    downloadFile('AIME_Brainstorm.txt', content);
}
function saveOutlineContent() {
    const items = document.querySelectorAll('#outline-list .outline-item');
    if (items.length === 0) return alert("Nothing to save!");
    let content = "--- AIME Story Outline ---\n\n";
    items.forEach((item, index) => {
        content += `${index + 1}. ${item.querySelector('.outline-item-title').textContent}\n   ${item.querySelector('.outline-item-description').textContent}\n\n`;
    });
    downloadFile('AIME_Outline.txt', content);
}
function saveTreatmentContent() {
    const content = document.getElementById('treatment-canvas').innerText;
    if (!content || content.trim() === '') return alert("Nothing to save!");
    downloadFile('AIME_Treatment.txt', content);
}
function saveRefineContent() {
    const content = document.getElementById('writing-canvas-main').innerText;
    if (!content || content.trim() === '') return alert("Nothing to save!");
    downloadFile('AIME_Manuscript.txt', content);
}
function downloadFile(filename, text) {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
        options.forEach(option => html += `<button class="gem-option">${option}</button>`);
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
        for (const file of event.target.files) addAssetToList(file, assetList);
    });
}
function addAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    const fileURL = URL.createObjectURL(file);
    let assetInfoHtml = file.type.startsWith('image/')
        ? `<div class="asset-info"><img src="${fileURL}" class="asset-thumbnail"><span class="asset-name">${file.name}</span></div>`
        : `<div class="asset-info"><span class="asset-icon-text">TXT</span><span class="asset-name">${file.name}</span></div>`;
    assetItem.innerHTML = `${assetInfoHtml}<button class="remove-asset-btn">&times;</button>`;
    assetList.appendChild(assetItem);
    assetItem.querySelector('.remove-asset-btn').addEventListener('click', () => {
        URL.revokeObjectURL(fileURL);
        assetItem.remove();
    });
}

