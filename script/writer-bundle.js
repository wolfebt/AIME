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

        // Enforce 20% to 80% constraints
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
                if (!content.style.padding || content.style.padding === '0px 1.5rem' || content.style.padding === '0px 24px') {
                   content.style.padding = '1.5rem';
                }
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
                if (content.style.padding === '1.5rem' || content.style.padding === '24px') {
                    content.style.padding = '0 1.5rem';
                }
            }
        });
    });
}


// --- Guidance Gems ---
function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;
    const gemsData = {
        "Genre": ["Science Fiction", "Fantasy", "Mystery", "Horror", "Thriller", "Romance", "Historical"],
        "Tone": ["Serious", "Humorous", "Dark", "Whimsical", "Gritty", "Optimistic", "Satirical"],
        "Pacing": ["Fast-Paced", "Slow-Burn", "Leisurely", "Action-Packed"],
        "Narrative Style": ["First-Person", "Third-Person Limited", "Third-Person Omniscient", "Epistolary"]
    };
    let gemHTML = '';
    for (const title in gemsData) {
        gemHTML += `<div class="gem-category"><h4 class="gem-title">${title}</h4><div class="gem-options">`;
        gemsData[title].forEach(option => {
            gemHTML += `<button class="gem-button">${option}</button>`;
        });
        gemHTML += `</div></div>`;
    }
    container.innerHTML = gemHTML;
    container.querySelectorAll('.gem-button').forEach(button => {
        button.addEventListener('click', () => {
            const parentOptions = button.closest('.gem-options');
            parentOptions.querySelectorAll('.gem-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

// --- Asset Hub ---
function initializeAssetImporter() {
    const importBtn = document.getElementById('import-asset-btn');
    const fileInput = document.getElementById('asset-upload');
    const assetList = document.getElementById('asset-list');
    if (importBtn && fileInput && assetList) {
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (event) => {
            for (const file of event.target.files) {
                addAssetToList(file, assetList);
            }
        });
    }
}
function addAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    assetItem.innerHTML = `<div class="asset-info"><span class="asset-name">${file.name}</span><button class="remove-asset-btn">&times;</button></div>`;
    assetList.appendChild(assetItem);
    assetItem.querySelector('.remove-asset-btn').addEventListener('click', () => assetItem.remove());
}

// --- Writer State & Workflow ---
let writerState = {
    concepts: [],
    outline: [],
    treatment: '',
    manuscript: ''
};

function createBrainstormCard(title, description) {
    const card = document.createElement('div');
    card.className = 'brainstorm-card';
    card.innerHTML = `
        <h3 contenteditable="true">${title}</h3>
        <p contenteditable="true">${description}</p>
        <div class="card-actions">
            <button class="action-btn" data-action="develop-outline">Develop Outline</button>
        </div>
    `;
    return card;
}

function initializeWorkflow() {
    const brainstormResponseArea = document.getElementById('brainstorm-response-area');
    const outlineList = document.getElementById('outline-list');
    const treatmentResponseArea = document.getElementById('treatment-response-area');
    const writingCanvas = document.getElementById('writing-canvas');

    // Event delegation for "Develop Outline" buttons
    brainstormResponseArea.addEventListener('click', e => {
        if (e.target && e.target.dataset.action === 'develop-outline') {
            const card = e.target.closest('.brainstorm-card');
            const title = card.querySelector('h3').textContent;
            
            outlineList.innerHTML = '';
            outlineList.appendChild(createSceneCard('Inciting Incident', `Based on the concept: "${title}"`));
            outlineList.appendChild(createSceneCard('Rising Action', 'A key challenge or discovery.'));
            outlineList.appendChild(createSceneCard('Climax', 'The turning point of the story.'));
            outlineList.appendChild(createSceneCard('Resolution', 'The aftermath and conclusion.'));
            
            document.querySelector('.writer-nav-button[data-tab="outline"]').click();
        }
    });

    document.getElementById('generate-treatment-from-outline')?.addEventListener('click', () => {
        const plotPoints = Array.from(outlineList.querySelectorAll('.scene-card')).map(card => ({
            title: card.querySelector('.scene-card-title').textContent,
            description: card.querySelector('.scene-card-subtitle').textContent
        }));
        writerState.outline = plotPoints;

        let treatmentText = `<strong>Generated Treatment:</strong><br><br>The story begins with the <em>${plotPoints[0]?.title || 'opening event'}</em>, where ${plotPoints[0]?.description || '...'}. This leads into a period of rising tension, marked by the event <em>'${plotPoints[1]?.title || 'a central conflict'}'</em>. The narrative culminates in the <em>${plotPoints[2]?.title || 'climax'}</em>, ultimately resolving with <em>'${plotPoints[3]?.title || 'the final outcome'}'</em>.`;
        treatmentResponseArea.innerHTML = treatmentText;
        document.querySelector('.writer-nav-button[data-tab="treatment"]').click();
    });

    document.getElementById('begin-writing-from-treatment')?.addEventListener('click', () => {
        writerState.treatment = treatmentResponseArea.innerText;
        writingCanvas.innerHTML = `<p>${treatmentResponseArea.innerHTML.replace(/<br>/g, '</p><p>')}</p>`;
        document.querySelector('.writer-nav-button[data-tab="write"]').click();
    });

    // Save buttons
    document.querySelectorAll('.action-btn[data-action="save"]').forEach(button => {
        button.addEventListener('click', () => {
            const activeTab = document.querySelector('.writer-tab.active');
            saveContent(activeTab.id);
        });
    });

    document.querySelectorAll('.action-btn[data-action="save-prompt"]').forEach(button => {
        button.addEventListener('click', () => {
            savePromptInfo();
        });
    });
}

function saveContent(tabId) {
    let content, fileName, mimeType;
    switch (tabId) {
        case 'brainstorm-tab':
            content = document.getElementById('brainstorm-response-area').innerText;
            fileName = 'AIME_Concepts.txt';
            mimeType = 'text/plain';
            break;
        case 'outline-tab':
            const plotPoints = Array.from(document.querySelectorAll('#outline-list .scene-card')).map(card => ({
                title: card.querySelector('.scene-card-title').textContent,
                description: card.querySelector('.scene-card-subtitle').textContent
            }));
            content = JSON.stringify(plotPoints, null, 2);
            fileName = 'AIME_Outline.json';
            mimeType = 'application/json';
            break;
        case 'treatment-tab':
            content = document.getElementById('treatment-response-area').innerText;
            fileName = 'AIME_Treatment.txt';
            mimeType = 'text/plain';
            break;
        case 'write-tab':
            content = document.getElementById('writing-canvas').innerText;
            fileName = 'AIME_Manuscript.txt';
            mimeType = 'text/plain';
            break;
        default:
            return;
    }
    downloadFile(content, fileName, mimeType);
}

function savePromptInfo() {
    const promptInput = document.getElementById('prompt-input').value;
    
    const selectedGems = Array.from(document.querySelectorAll('.gem-button.active')).map(gem => {
        const category = gem.closest('.gem-category').querySelector('.gem-title').textContent;
        return `${category}: ${gem.textContent}`;
    });

    const importedAssets = Array.from(document.querySelectorAll('.asset-name')).map(asset => asset.textContent);

    let content = `--- AIME Prompt Info ---\n\n`;
    content += `[Main Prompt]\n${promptInput || 'N/A'}\n\n`;
    content += `[Guidance Gems]\n${selectedGems.length > 0 ? selectedGems.join('\n') : 'None Selected'}\n\n`;
    content += `[Imported Assets]\n${importedAssets.length > 0 ? importedAssets.join('\n') : 'None'}\n`;

    downloadFile(content, 'AIME_Prompt_Info.txt', 'text/plain');
}


function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


// --- Writer Page Logic ---
function initializeWriterTabs() {
    const navButtons = document.querySelectorAll('.writer-nav-button');
    const tabs = document.querySelectorAll('.writer-tab');
    const generateButton = document.getElementById('generate-button');
    const brainstormResponseArea = document.getElementById('brainstorm-response-area');
    
    if (navButtons.length === 0 || tabs.length === 0) return;

    const updateGenerateButton = () => {
        const currentTab = document.querySelector('.writer-nav-button.active')?.dataset.tab;
        if(!currentTab) return;
        switch (currentTab) {
            case 'brainstorm': generateButton.textContent = 'Brainstorm Concepts'; break;
            case 'outline': generateButton.textContent = 'Suggest Plot Point'; break;
            case 'treatment': generateButton.textContent = 'Regenerate Treatment'; break;
            case 'write': generateButton.textContent = 'Continue Writing'; break;
        }
    };

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const targetTabId = button.dataset.tab + '-tab';
            tabs.forEach(tab => tab.classList.toggle('active', tab.id === targetTabId));
            updateGenerateButton();
        });
    });

    if (generateButton) {
        generateButton.addEventListener('click', () => {
             const activeId = document.querySelector('.writer-tab.active')?.id;
             if (!activeId) return;

             if (activeId === 'brainstorm-tab') {
                brainstormResponseArea.innerHTML = ''; 
                brainstormResponseArea.appendChild(createBrainstormCard('Concept 1: The Last Archivist', 'In a future where all digital data has been wiped...'));
                brainstormResponseArea.appendChild(createBrainstormCard('Concept 2: Echoes of the Void', 'A deep-space mining crew answers a distress call...'));
            } else if (activeId === 'outline-tab') {
                document.getElementById('outline-list')?.appendChild(createSceneCard('Suggested: The Discovery', '...'));
            } else if (activeId === 'treatment-tab') {
                 document.getElementById('generate-treatment-from-outline')?.click(); 
            } else if (activeId === 'write-tab') {
                const canvas = document.getElementById('writing-canvas');
                canvas.innerHTML += '<p>...a new paragraph appears, continuing the story.</p>';
            }
        });
    }
        
    updateGenerateButton();
}


function initializeOutlineDragAndDrop() {
    const outlineList = document.getElementById('outline-list');
    const addPlotPointBtn = document.getElementById('add-plot-point');

    if (!outlineList || !addPlotPointBtn) return;

    outlineList.addEventListener('dragstart', e => {
        if (e.target.classList.contains('scene-card')) e.target.classList.add('dragging');
    });
    outlineList.addEventListener('dragend', e => {
        if (e.target.classList.contains('scene-card')) e.target.classList.remove('dragging');
    });
    outlineList.addEventListener('dragover', e => {
        e.preventDefault();
        const afterElement = getDragAfterElement(outlineList, e.clientY);
        const dragging = document.querySelector('.dragging');
        if (afterElement == null) {
            outlineList.appendChild(dragging);
        } else {
            outlineList.insertBefore(dragging, afterElement);
        }
    });

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.scene-card:not(.dragging)')];
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

    addPlotPointBtn.addEventListener('click', () => {
        outlineList.appendChild(createSceneCard('New Plot Point', 'Describe the location or event...'));
    });
}

function createSceneCard(title, subtitle) {
    const card = document.createElement('li');
    card.className = 'scene-card';
    card.draggable = true;
    card.innerHTML = `
        <div class="scene-card-handle">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
        </div>
        <div class="scene-card-details">
            <h4 class="scene-card-title" contenteditable="true">${title}</h4>
            <p class="scene-card-subtitle" contenteditable="true">${subtitle}</p>
        </div>`;
    return card;
}

function initializeWritingToolbar() {
    const mainColumn = document.querySelector('.main-column');
    const toolbar = document.getElementById('writing-toolbar');
    if (!mainColumn || !toolbar) return;

    mainColumn.addEventListener('selectionchange', () => {
        const activeCanvas = mainColumn.querySelector('.writer-tab.active [contenteditable="true"]');
        if (!activeCanvas) {
             toolbar.style.display = 'none';
             return;
        }

        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !selection.getRangeAt(0).collapsed && activeCanvas.contains(selection.anchorNode)) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            const canvasRect = activeCanvas.getBoundingClientRect();

            toolbar.style.top = `${rect.top - canvasRect.top - toolbar.offsetHeight - 5 + activeCanvas.scrollTop}px`;
            toolbar.style.left = `${rect.left - canvasRect.left + rect.width / 2}px`;
            toolbar.style.display = 'flex';
        } else {
            toolbar.style.display = 'none';
        }
    });

    toolbar.querySelector('#rephrase-btn').addEventListener('click', () => console.log('Rephrase clicked'));
    toolbar.querySelector('#shorten-btn').addEventListener('click', () => console.log('Shorten clicked'));
    toolbar.querySelector('#expand-btn').addEventListener('click', () => console.log('Expand clicked'));
}


// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns();
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    initializeWriterTabs();
    initializeOutlineDragAndDrop();
    initializeWritingToolbar();
    initializeWorkflow(); 
});

