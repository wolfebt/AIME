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

        // Ensure initially active accordions are open
        if (header.classList.contains('active')) {
            content.style.padding = '1.5rem';
            content.style.maxHeight = content.scrollHeight + "px";
            chevron.style.transform = 'rotate(180deg)';
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
    const saveBtn = document.getElementById('save-button');
    const refineTools = document.getElementById('refine-tools-container');

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

            if (generateBtn && buttonTextMap[tabName]) {
                generateBtn.textContent = buttonTextMap[tabName];
            }
            if (saveBtn && saveButtonTextMap[tabName]) {
                saveBtn.textContent = saveButtonTextMap[tabName];
            }

            if (generateBtn && refineTools) {
                refineTools.style.display = (tabName === 'treatment') ? 'block' : 'none';
                generateBtn.style.display = (tabName === 'treatment') ? 'none' : 'block';
            }
        });
    });
}

// --- AI Generation Logic ---

async function generateContent(prompt) {
    const apiKey = localStorage.getItem('AIME_API_KEY');
    if (!apiKey) {
        alert("API Key not found. Please set it in the settings (the ⚙️ icon).");
        return "Error: API Key not set. Please click the settings icon (⚙️) to enter your Gemini API key.";
    }
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-preview-0514:generateContent?key=${apiKey}`;

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
            const errorBody = await response.text();
            console.error("API Error Response:", errorBody);
            throw new Error(`API request failed with status ${response.status}`);
        }

        const result = await response.json();
        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            return candidate.content.parts[0].text;
        } else {
            console.warn("Invalid response format from API.", result);
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
        <h4 class="card-title editable-content" contenteditable="true">${data.title}</h4>
        <p class="brainstorm-logline editable-content" contenteditable="true"><em>${data.logline}</em></p>
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
    
    const prompt = `You are AIME, an AI creative partner. Based on the following plot points, suggest ONE new, logical plot point that could happen next.

--- EXISTING PLOT ---
${existingOutlineText}

--- TASK ---
Generate ONE new plot point. You MUST provide a short, punchy "Title:" and a "Description:" paragraph. Do not use '---' in your response.`;

    const aiResponse = await generateContent(prompt);
     if (aiResponse.startsWith("Error:")) {
        alert(aiResponse); // Use an alert for this since we are appending
        return;
    }
    const newPoint = parseOutlineResponse(aiResponse); // Will return array with one item
    if (newPoint.length > 0) {
        const li = createPlotPointListItem(newPoint[0]);
        outlineList.appendChild(li);
    } else {
        alert("AIME had trouble generating a new plot point. Please try again.");
    }
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
        if (e.target.classList.contains('develop-outline-btn')) {
            e.target.textContent = 'Developing...';
            e.target.disabled = true;

            const card = e.target.closest('.brainstorm-card');
            if (!card) return;
            
            // Get EDITED content from the card
            const title = card.querySelector('.card-title').textContent;
            const logline = card.querySelector('.brainstorm-logline').textContent;
            const concept = card.querySelector('.brainstorm-concept').textContent;
            const fullConcept = `Title: ${title}\nLogline: ${logline}\nConcept: ${concept}`;

            const outlineTabButton = document.querySelector('.writer-nav-button[data-tab="outline"]');
            if (outlineTabButton) {
                outlineTabButton.click();
            }

            await generateOutline(fullConcept);
            e.target.textContent = 'Develop Outline';
            e.target.disabled = false;
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
        const title = item.querySelector('.outline-item-title').textContent;
        const description = item.querySelector('.outline-item-description').textContent;
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

async function handleTextTool(action, selection) {
    const selectedText = selection.toString().trim();
    if (selectedText === '') {
        alert("Please select some text to modify.");
        return;
    }

    const refineButtons = document.querySelectorAll('#refine-tools-container .action-btn');
    refineButtons.forEach(btn => btn.disabled = true);

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
        default:
             refineButtons.forEach(btn => btn.disabled = false);
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
    
    refineButtons.forEach(btn => btn.disabled = false);
}

function initializeRefinementTools() {
    const refineContainer = document.getElementById('refine-tools-container');
    const canvas = document.getElementById('treatment-canvas');
    if (!refineContainer || !canvas) return;

    refineContainer.addEventListener('click', (e) => {
        const button = e.target.closest('.action-btn');
        if (!button) return;

        const selection = window.getSelection();
        
        if (selection && !selection.isCollapsed && canvas.contains(selection.anchorNode)) {
            const action = button.dataset.action;
            handleTextTool(action, selection);
        } else {
            alert("Please select some text within the draft canvas to refine.");
        }
    });
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
        } else if (activeTab === 'outline') {
            const outlineItems = document.querySelectorAll('#outline-list .outline-item');
            if (outlineItems.length === 0) {
                alert("Please generate an outline first before adding new plot points.");
                return;
            }
            let fullOutline = "";
            outlineItems.forEach((item, index) => {
                const title = item.querySelector('.outline-item-title').textContent;
                const description = item.querySelector('.outline-item-description').textContent;
                fullOutline += `${index + 1}. ${title}: ${description}\n`;
            });
            generatePlotPoint(fullOutline);
        } else if (activeTab === 'treatment') {
             generateTreatment();
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
        let filename = 'AIME_Story_Weaver_Export.txt';

        switch (activeTab) {
            case 'brainstorm':
                const cards = document.querySelectorAll('.brainstorm-card');
                if (cards.length === 0) {
                    alert("Nothing to save!");
                    return;
                }
                filename = 'AIME_Brainstorm_Concepts.txt';
                content = "--- AIME Brainstorm Session ---\n\n";
                cards.forEach((card, index) => {
                    const title = card.querySelector('.card-title').textContent;
                    const logline = card.querySelector('.brainstorm-logline').textContent;
                    const concept = card.querySelector('.brainstorm-concept').textContent;
                    content += `Concept ${index + 1}:\nTitle: ${title}\nLogline: ${logline}\n\n${concept}\n\n---\n\n`;
                });
                break;

            case 'outline':
                const outlineItems = document.querySelectorAll('.outline-item');
                 if (outlineItems.length === 0) {
                    alert("Nothing to save!");
                    return;
                }
                filename = 'AIME_Story_Outline.txt';
                content = "--- AIME Story Outline ---\n\n";
                outlineItems.forEach((item, index) => {
                    const title = item.querySelector('.outline-item-title').textContent;
                    const description = item.querySelector('.outline-item-description').textContent;
                    content += `${index + 1}. ${title}\n   - ${description}\n\n`;
                });
                break;

            case 'treatment':
                const treatmentCanvas = document.getElementById('treatment-canvas');
                content = treatmentCanvas.innerText;
                 if (content.trim() === '' || treatmentCanvas.querySelector('.placeholder-text')) {
                    alert("Nothing to save!");
                    return;
                }
                filename = 'AIME_Story_Draft.txt';
                break;
        }

        downloadFile(filename, content);
    });
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


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // Core UI Initializers
    initializeResizableColumns();
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeTabs();

    // Workflow and Generation Initializers
    initializeGeneration();
    initializeWorkflowButtons();
    initializeOutline();
    initializeRefinementTools();
    initializeSaveButton();
});

