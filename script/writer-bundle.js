/*
    File: writer-bundle.js
    Reference: Story Weaver Logic (Adapted from element-bundle.js)
    Creator: Wolfe.BT, TangentLLC
*/

let loadedAssets = [];
let selectedGems = {};

const gemsData = {
    "Genre": ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Horror", "Mystery", "Romance", "Thriller", "Whimsical", "Gritty", "Noir"],
    "Tone": ["Serious", "Humorous", "Formal", "Informal", "Optimistic", "Pessimistic", "Joyful", "Sad", "Hopeful", "Cynical", "Dark", "Uplifting"],
    "Pacing": ["Fast-paced", "Slow-burn", "Steady", "Urgent", "Relaxed", "Meditative", "Action-Packed"],
    "Point of View": ["First Person", "Third Person Limited", "Third Person Omniscient", "Second Person", "Alternating POV"],
    "Literary Devices": ["Metaphor", "Simile", "Personification", "Alliteration", "Symbolism", "Irony", "Foreshadowing", "Satire"],
    "Structure": ["Linear", "Non-linear", "Episodic", "In Medias Res", "Frame Story"],
    "Themes": ["Redemption", "Betrayal", "Discovery", "Survival", "Love", "Hate", "Power", "Corruption", "Nature vs. Nurture"]
};

function initializeResizableColumns() {
    const workspace = document.querySelector('.workspace-layout');
    if (!workspace) return;
    const mainColumn = workspace.querySelector('.main-column');
    const sideColumn = workspace.querySelector('.side-column');
    const resizeHandle = workspace.querySelector('.resize-handle');
    if (!mainColumn || !sideColumn || !resizeHandle) return;
    let isResizing = false;
    resizeHandle.addEventListener('mousedown', () => {
        isResizing = true;
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', () => {
            isResizing = false;
            document.removeEventListener('mousemove', handleMouseMove);
        });
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

function initializeAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        const content = accordion.querySelector('.accordion-content');
        if (!header || !content) return;

        header.addEventListener('click', () => {
            header.classList.toggle('active');
            content.classList.toggle('active');
        });
    });
}

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

    if (!modalOverlay || !modalTitle || !modalOptionsContainer || !modalSaveBtn || !modalCloseBtn || !customGemInput || !addCustomGemBtn) return;

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

    container.innerHTML = '';
    for (const category of Object.keys(gemsData)) {
        selectedGems[category] = [];
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'gem-category-container';
        categoryContainer.dataset.category = category;
        categoryContainer.innerHTML = `<button class="gem-category-button">${category}</button><div class="gem-pill-container"><span class="gem-selected-placeholder">None selected</span></div>`;
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

function initializeAssetImporter() {
    const importBtn = document.getElementById('import-asset-btn');
    const fileInput = document.getElementById('asset-upload');
    if (!importBtn || !fileInput) return;
    importBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (event) => {
        for (const file of event.target.files) {
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
                        assetData.content = JSON.parse(e.target.result);
                    } catch (err) {
                        assetData.type = 'text';
                        assetData.content = e.target.result;
                    }
                } else {
                    assetData.type = 'text';
                }
                loadedAssets.push(assetData);
                renderAssetList();
            };
            if (file.type.startsWith('image/')) reader.readAsDataURL(file);
            else reader.readAsText(file);
        }
        event.target.value = null;
    });
}

function renderAssetList() {
    const assetList = document.getElementById('asset-list');
    if (!assetList) return;
    assetList.innerHTML = '';
    loadedAssets.forEach(asset => {
        const assetItem = document.createElement('div');
        assetItem.className = 'asset-item';
        let assetInfoHtml = '';
        if (asset.type === 'image') {
            assetInfoHtml = `<div class="asset-info"><img src="${asset.content}" alt="${asset.fileName}" class="asset-thumbnail"><span class="asset-name">${asset.fileName}</span></div>`;
        } else {
            const icon = asset.type === 'json' ? 'JSON' : 'TXT';
            assetInfoHtml = `<div class="asset-info"><span class="asset-icon-text">${icon}</span><span class="asset-name">${asset.fileName}</span></div>`;
        }
        assetItem.innerHTML = `${assetInfoHtml}<button class="remove-asset-btn" data-asset-id="${asset.id}">&times;</button>`;
        assetList.appendChild(assetItem);
    });
}

document.addEventListener('click', (e) => {
    if (e.target.matches('.remove-asset-btn')) {
        loadedAssets = loadedAssets.filter(asset => asset.id !== e.target.dataset.assetId);
        renderAssetList();
    }
});

function initializeTabs() {
    const tabButtons = document.querySelectorAll('.writer-nav-button');
    const tabs = document.querySelectorAll('.writer-tab');
    if (!tabButtons.length || !tabs.length) return;
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabs.forEach(tab => tab.classList.remove('active'));
            button.classList.add('active');
            const tabName = button.dataset.tab;
            document.getElementById(`${tabName}-tab`).classList.add('active');
            document.getElementById('generate-button').classList.remove('hidden');
            document.getElementById('iterate-button').classList.add('hidden');
            document.getElementById('update-field-container').classList.add('hidden');
        });
    });
}

async function generateContent(prompt) {
    const userApiKey = localStorage.getItem('AIME_API_KEY');
    if (!userApiKey) {
        alert("API key not found. Please set it in the settings modal.");
        return "Error: API key not found.";
    }
    const model = 'gemini-2.5-flash-lite';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${userApiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const result = await response.json();
        if (!response.ok) {
            const errorDetails = result.error || { message: `API request failed with status ${response.status}` };
            throw new Error(`API Error: ${errorDetails.message}`);
        }
        const candidate = result.candidates?.[0];
        if (candidate && candidate.content?.parts?.[0]?.text) {
            return candidate.content.parts[0].text;
        } else {
            return `Error: The AI model returned an empty response. Finish Reason: ${candidate?.finishReason || 'N/A'}`;
        }
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

function craftSuperPrompt(activeTab, iterationData = null) {
    const promptText = document.getElementById('main-prompt').value;
    let prompt = `You are AIME, an AI creative partner specializing in storytelling.\n\n`;

    if (iterationData) {
        prompt += `You are in an iteration loop. Revise the following content based *only* on the new instructions.\n\n--- PREVIOUS CONTENT ---\n${iterationData.existingContent}\n\n--- USER'S UPDATE INSTRUCTIONS ---\n${iterationData.updateInstructions}\n\n`;
    } else {
        const instructions = {
            'brainstorm': 'Generate three distinct and creative story concepts based on the user\'s core idea. For each, provide a "Title:", a "Logline:", and a "Concept:" paragraph. Separate concepts with "---".',
            'outline': 'Generate a single, new plot point that follows from the existing ones. Provide a short, punchy "Title:" and a "Description:" paragraph. Do not use "---" separators.',
            'treatment': 'Write a detailed story treatment based on the provided plot points. Expand on them, connect scenes, and describe character emotions and motivations.'
        };
        prompt += `--- TASK ---\n${instructions[activeTab]}\n\n--- USER'S CORE IDEA ---\n"${promptText}"\n\n`;
        if (activeTab === 'outline') {
            const existingOutline = Array.from(document.querySelectorAll('#outline-list .outline-item')).map(item => item.innerText).join('\n');
            prompt += `--- EXISTING PLOT ---\n${existingOutline}\n\n`;
        } else if (activeTab === 'treatment') {
            const fullOutline = Array.from(document.querySelectorAll('#outline-list .outline-item')).map((item, index) => `${index + 1}. ${item.innerText}`).join('\n');
            prompt += `--- PLOT OUTLINE ---\n${fullOutline}\n\n`;
        }
    }

    const allSelectedGems = Object.values(selectedGems).flat();
    if (allSelectedGems.length > 0) {
        prompt += `--- GUIDANCE GEMS ---\n${allSelectedGems.join(', ')}\n`;
    }

    const contextualAssets = loadedAssets.filter(asset => asset.type === 'text' || asset.type === 'json');
    if (contextualAssets.length > 0) {
        prompt += `\n--- CONTEXTUAL ASSETS ---\n`;
        contextualAssets.forEach(asset => {
            prompt += `\n[ASSET: ${asset.fileName}]\n${asset.type === 'json' ? JSON.stringify(asset.content, null, 2) : asset.content}\n[END ASSET]\n`;
        });
    }
    return prompt;
}

function showGenerationControls(showIterate) {
    document.getElementById('generate-button').classList.toggle('hidden', showIterate);
    document.getElementById('iterate-button').classList.toggle('hidden', !showIterate);
    document.getElementById('update-field-container').classList.toggle('hidden', !showIterate);
}

async function handleGeneration(activeTab) {
    const generateBtn = document.getElementById('generate-button');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';

    let responseContainer, superPrompt;
    switch (activeTab) {
        case 'brainstorm':
            responseContainer = document.getElementById('brainstorm-response-area');
            responseContainer.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div></div>';
            superPrompt = craftSuperPrompt(activeTab);
            break;
        case 'outline':
            responseContainer = document.getElementById('outline-list');
            superPrompt = craftSuperPrompt(activeTab);
            break;
        case 'treatment':
            responseContainer = document.getElementById('treatment-canvas');
            responseContainer.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div></div>';
            superPrompt = craftSuperPrompt(activeTab);
            break;
    }

    const aiResponse = await generateContent(superPrompt);

    if (aiResponse.startsWith("Error:")) {
        responseContainer.innerHTML = `<p class="error-text">${aiResponse}</p>`;
        showGenerationControls(false);
    } else {
        if (activeTab === 'brainstorm') {
            const concepts = aiResponse.split('---').filter(c => c.trim().length > 10);
            responseContainer.innerHTML = '';
            concepts.forEach(rawConcept => {
                const titleMatch = rawConcept.match(/Title:\s*(.*)/);
                const loglineMatch = rawConcept.match(/Logline:\s*(.*)/);
                const conceptMatch = rawConcept.match(/Concept:\s*([\s\S]*)/);
                if (titleMatch && loglineMatch && conceptMatch) {
                    const card = document.createElement('div');
                    card.className = 'brainstorm-card glass-panel';
                    card.innerHTML = `<h4 class="card-title editable-content">${titleMatch[1].trim()}</h4><p class="brainstorm-logline editable-content">${loglineMatch[1].trim()}</p><p class="brainstorm-concept editable-content">${conceptMatch[1].trim().replace(/\n/g, '<br>')}</p><div class="card-actions"><button class="action-btn develop-outline-btn">Develop Outline</button></div>`;
                    responseContainer.appendChild(card);
                }
            });
        } else if (activeTab === 'outline') {
            const titleMatch = aiResponse.match(/Title:\s*(.*)/);
            const descriptionMatch = aiResponse.match(/Description:\s*([\s\S]*)/);
            if (titleMatch && descriptionMatch) {
                if(responseContainer.querySelector('.placeholder-text')) responseContainer.innerHTML = '';
                const li = document.createElement('li');
                li.className = 'outline-item glass-panel';
                li.innerHTML = `<div class="outline-item-header"><span class="outline-item-title editable-content">${titleMatch[1].trim()}</span><button class="remove-item-btn">&times;</button></div><p class="outline-item-description editable-content">${descriptionMatch[1].trim().replace(/\n/g, '<br>')}</p>`;
                responseContainer.appendChild(li);
            }
        } else {
            responseContainer.innerHTML = `<p>${aiResponse.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
        }
        showGenerationControls(true);
    }
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate';
}

function initializeGeneration() {
    document.getElementById('generate-button').addEventListener('click', () => {
        const activeTab = document.querySelector('.writer-nav-button.active')?.dataset.tab;
        if (activeTab) handleGeneration(activeTab);
    });
}

function initializeIteration() {
    document.getElementById('iterate-button').addEventListener('click', async () => {
        const activeTab = document.querySelector('.writer-nav-button.active')?.dataset.tab;
        const updateInstructions = document.getElementById('update-instructions').value;
        if (!activeTab || !updateInstructions) return;

        let existingContent = '';
        let responseContainer;

        switch(activeTab) {
            case 'brainstorm':
                responseContainer = document.getElementById('brainstorm-response-area');
                existingContent = Array.from(responseContainer.querySelectorAll('.brainstorm-card')).map(c => c.innerText).join('\n---\n');
                break;
            case 'outline':
                responseContainer = document.getElementById('outline-list');
                existingContent = Array.from(responseContainer.querySelectorAll('.outline-item')).map(i => i.innerText).join('\n');
                break;
            case 'treatment':
                responseContainer = document.getElementById('treatment-canvas');
                existingContent = responseContainer.innerText;
                break;
        }

        const superPrompt = craftSuperPrompt(activeTab, { existingContent, updateInstructions });
        const aiResponse = await generateContent(superPrompt);

        if (!aiResponse.startsWith("Error:")) {
            if (activeTab === 'treatment') {
                 responseContainer.innerHTML = `<p>${aiResponse.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
            } else {
                // For brainstorm and outline, we re-run the original generation logic on the new response
                handleGeneration(activeTab); // This is a simplified approach
            }
        } else {
            showToast(aiResponse, "error");
        }
    });
}

async function generateOutline(concept) {
    const outlineList = document.getElementById('outline-list');
    if (!outlineList) return;
    outlineList.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div></div>';
    const prompt = `You are AIME, a master storyteller. Based on the following concept, generate a detailed 5-step plot outline. For each step, provide a "Title:" and a "Description:".\n\n--- CONCEPT ---\n${concept}`;
    const aiResponse = await generateContent(prompt);
    if (aiResponse.startsWith("Error:")) {
        outlineList.innerHTML = `<p class="error-text">${aiResponse}</p>`;
    } else {
        outlineList.innerHTML = ''; // Clear loading
        const plotPoints = aiResponse.split(/Title:/).filter(p => p.trim());
        plotPoints.forEach(pointText => {
            const descriptionMatch = pointText.match(/Description:\s*([\s\S]*)/);
            if (descriptionMatch) {
                const title = pointText.replace(/Description:[\s\S]*/, '').trim();
                const description = descriptionMatch[1].trim();
                const li = document.createElement('li');
                li.className = 'outline-item glass-panel';
                li.innerHTML = `<div class="outline-item-header"><span class="outline-item-title editable-content">${title}</span><button class="remove-item-btn">&times;</button></div><p class="outline-item-description editable-content">${description.replace(/\n/g, '<br>')}</p>`;
                outlineList.appendChild(li);
            }
        });
    }
}

async function generateTreatment() {
    const treatmentCanvas = document.getElementById('treatment-canvas');
    if (!treatmentCanvas) return;
    treatmentCanvas.innerHTML = '<div class="loading-indicator"><div class="loading-spinner"></div></div>';
    const outlineItems = Array.from(document.querySelectorAll('#outline-list .outline-item')).map(item => item.innerText).join('\n\n');
    const prompt = `You are AIME, a master storyteller. Based on the following outline, write a detailed story treatment. Expand on the plot points, describe character emotions, and flesh out the scenes.\n\n--- OUTLINE ---\n${outlineItems}`;
    const aiResponse = await generateContent(prompt);
    if (aiResponse.startsWith("Error:")) {
        treatmentCanvas.innerHTML = `<p class="error-text">${aiResponse}</p>`;
    } else {
        treatmentCanvas.innerHTML = `<p>${aiResponse.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns();
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeTabs();
    initializeGeneration();
    initializeIteration();
    initializeSaveButtons();
    initializeLoadButton();
    initializeNewButton();
    initializeFloatingToolbar();
    initializeWorkflowButtons();
    initializeOutline();
});

function initializeWorkflowButtons() {
    const mainColumn = document.querySelector('.main-column');
    if (!mainColumn) return;

    mainColumn.addEventListener('click', async (e) => {
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
            if (outlineTabButton) outlineTabButton.click();
            await generateOutline(fullConcept);
            e.target.textContent = 'Develop Outline';
            e.target.disabled = false;
        }
        if (e.target.id === 'create-treatment-from-outline-btn') {
            e.target.textContent = 'Creating...';
            e.target.disabled = true;
            const treatmentTabButton = document.querySelector('.writer-nav-button[data-tab="treatment"]');
            if (treatmentTabButton) treatmentTabButton.click();
            await generateTreatment();
            const btn = document.getElementById('create-treatment-from-outline-btn');
            if(btn) {
                btn.textContent = 'Create Draft';
                btn.disabled = false;
            }
        }
    });
}

function initializeOutline() {
    const outlineList = document.getElementById('outline-list');
    if (!outlineList) return;
    let draggingItem = null;
    outlineList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('outline-item')) {
            draggingItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        }
    });
    outlineList.addEventListener('dragend', () => {
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

function initializeFloatingToolbar() {
    const toolbar = document.getElementById('text-toolbar');
    const customPromptContainer = document.getElementById('custom-prompt-container');
    const customPromptInput = document.getElementById('custom-prompt-input');
    if (!toolbar || !customPromptContainer || !customPromptInput) return;
    let currentSelection = null;
    document.addEventListener('mouseup', (e) => {
        setTimeout(() => {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) {
                const editableElement = (selection.anchorNode.nodeType === Node.TEXT_NODE ? selection.anchorNode.parentElement : selection.anchorNode).closest('[contenteditable="true"]');
                if (editableElement) {
                    currentSelection = selection;
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    toolbar.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (toolbar.offsetWidth / 2)}px`;
                    toolbar.style.top = `${rect.top + window.scrollY - toolbar.offsetHeight - 10}px`;
                    toolbar.classList.remove('hidden');
                    return;
                }
            }
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
            if (!customPromptContainer.classList.contains('hidden')) customPromptInput.focus();
            return;
        }
        if (currentSelection) {
            if (button.id === 'custom-prompt-submit') handleTextTool('custom', currentSelection, customPromptInput.value);
            else if (action) handleTextTool(action, currentSelection);
        }
    });
}

function initializeSaveButtons() {
    document.getElementById('save-prompt-button').addEventListener('click', saveWriterPrompt);
    document.getElementById('save-content-button').addEventListener('click', saveWriterContent);
}

function initializeLoadButton() {
    const loadButton = document.getElementById('load-button');
    if (!loadButton) return;

    loadButton.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.writerprompt,.brainstorm,.outline,.draft';
        fileInput.style.display = 'none';

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const extension = '.' + file.name.split('.').pop();
            if (extension === '.writerprompt') {
                loadWriterPrompt(file);
            } else {
                const tabMap = {
                    '.brainstorm': 'brainstorm',
                    '.outline': 'outline',
                    '.draft': 'treatment'
                };
                const targetTab = tabMap[extension];
                if (targetTab) {
                    document.querySelector(`.writer-nav-button[data-tab="${targetTab}"]`)?.click();
                    loadFileContent(file, targetTab);
                } else {
                    showToast(`Unsupported file type: ${extension}`, 'error');
                }
            }
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
}

function loadWriterPrompt(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.fields && data.fields['main-prompt']) {
                document.getElementById('main-prompt').value = data.fields['main-prompt'];
                showToast('Prompt loaded successfully!', 'success');
            } else {
                throw new Error("Invalid writer prompt file format.");
            }
        } catch (error) {
            showToast(`Error: Could not parse prompt file. ${error.message}`, 'error');
        }
    };
    reader.onerror = () => showToast('Error reading file.', 'error');
    reader.readAsText(file);
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
                if (treatmentCanvas) treatmentCanvas.innerText = content;
                break;
        }
        showToast(`Loaded ${file.name} successfully!`, 'success');
    };
    reader.onerror = () => showToast(`Error reading file: ${file.name}`, 'error');
    reader.readAsText(file);
}

function loadBrainstormContent(content) {
    const responseArea = document.getElementById('brainstorm-response-area');
    if (!responseArea) return;
    responseArea.innerHTML = '';
    const concepts = content.split('---').filter(c => c.trim().length > 5);
    concepts.forEach(rawConcept => {
        const lines = rawConcept.trim().split('\n').filter(line => line.trim() !== '');
        if (lines.length < 3) return;
        const titleLine = lines.find(l => l.startsWith('## '));
        const loglineLine = lines.find(l => l.startsWith('**Logline:**'));
        if (titleLine && loglineLine) {
            const title = titleLine.replace('## ', '').trim();
            const logline = loglineLine.replace('**Logline:**', '').trim();
            const loglineIndex = lines.indexOf(loglineLine);
            const concept = lines.slice(loglineIndex + 1).join('\n').trim();
            if (concept) {
                const card = document.createElement('div');
                card.className = 'brainstorm-card glass-panel';
                card.innerHTML = `<h4 class="card-title editable-content">${title}</h4><p class="brainstorm-logline editable-content">${logline}</p><p class="brainstorm-concept editable-content">${concept.replace(/\n/g, '<br>')}</p><div class="card-actions"><button class="action-btn develop-outline-btn">Develop Outline</button></div>`;
                responseArea.appendChild(card);
            }
        }
    });
}

function loadOutlineContent(content) {
    const outlineList = document.getElementById('outline-list');
    if (!outlineList) return;
    outlineList.innerHTML = '';
    const sections = content.split(/^## \d+\.\s+/m).filter(s => s.trim());
    sections.forEach(section => {
        const lines = section.trim().split('\n');
        const title = lines.shift().trim();
        const description = lines.join('\n').trim();
        if (title && description) {
            const li = document.createElement('li');
            li.className = 'outline-item glass-panel';
            li.innerHTML = `<div class="outline-item-header"><span class="outline-item-title editable-content">${title}</span><button class="remove-item-btn">&times;</button></div><p class="outline-item-description editable-content">${description.replace(/\n/g, '<br>')}</p>`;
            outlineList.appendChild(li);
        }
    });
}

function initializeNewButton() {
    const newButton = document.getElementById('new-button');
    if (!newButton) return;
    newButton.addEventListener('click', () => {
        document.getElementById('main-prompt').value = '';
        loadedAssets = [];
        renderAssetList();
        selectedGems = {};
        initializeGuidanceGems();
        document.getElementById('brainstorm-response-area').innerHTML = '<p class="placeholder-text">Enter a core idea and click "Generate" to brainstorm concepts.</p>';
        document.getElementById('outline-list').innerHTML = '<p class="placeholder-text">Develop an outline from a concept or generate one directly.</p>';
        document.getElementById('treatment-canvas').innerHTML = '<p class="placeholder-text">Create a draft from an outline.</p>';
        showGenerationControls(false);
        document.getElementById('update-instructions').value = '';
        showToast('Workspace cleared.', 'success');
    });
}

function saveWriterPrompt() {
    const promptData = {
        assetType: 'Writer Prompt',
        savedAt: new Date().toISOString(),
        fields: {
            'main-prompt': document.getElementById('main-prompt').value.trim()
        }
    };
    if (!promptData.fields['main-prompt']) {
        showToast('Nothing to save.', 'error');
        return;
    }
    const assetName = (promptData.fields['main-prompt'].substring(0, 25) || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `${assetName}.writerprompt`;
    const blob = new Blob([JSON.stringify(promptData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Prompt saved successfully!');
}

function saveWriterContent() {
    const activeTab = document.querySelector('.writer-nav-button.active')?.dataset.tab;
    let content = '';
    let extension = '';
    let assetName = 'untitled';

    switch (activeTab) {
        case 'brainstorm':
            const cards = document.querySelectorAll('.brainstorm-card');
            if (cards.length === 0) { showToast("Nothing to save!", "error"); return; }
            extension = '.brainstorm';
            content = "# Brainstorm Session\n\n";
            cards.forEach((card, index) => {
                const title = card.querySelector('.card-title').textContent.trim();
                if (index === 0 && title) assetName = title;
                content += `## ${title}\n\n**Logline:** ${card.querySelector('.brainstorm-logline').textContent.trim()}\n\n${card.querySelector('.brainstorm-concept').innerText.trim()}\n\n---\n\n`;
            });
            break;
        case 'outline':
            const items = document.querySelectorAll('.outline-item');
            if (items.length === 0) { showToast("Nothing to save!", "error"); return; }
            extension = '.outline';
            content = "# Story Outline\n\n";
            items.forEach((item, index) => {
                const title = item.querySelector('.outline-item-title').textContent.trim();
                if (index === 0 && title) assetName = title;
                content += `## ${index + 1}. ${title}\n\n${item.querySelector('.outline-item-description').innerText.trim()}\n\n`;
            });
            break;
        case 'treatment':
            const canvas = document.getElementById('treatment-canvas');
            content = canvas.innerText.trim();
            if (content === '' || canvas.querySelector('.placeholder-text')) { showToast("Nothing to save!", "error"); return; }
            extension = '.draft';
            assetName = content.split('\n')[0].trim() || 'draft';
            break;
    }

    const filename = `${assetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${extension}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Content saved successfully!');
}