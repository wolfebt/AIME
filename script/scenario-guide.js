// --- STATE MANAGEMENT ---
let project = {};
let nextId = 1;
let activeComponentId = null;
let historyStack = [];
let draggingItemId = null;
let confirmCallback = null;
let isFullViewActive = false;
let loadedProjectData = null;
let isPinning = false;
let pinComponentId = null;
let activeEditorForAI = null;
let geminiApiKey = "";

// --- DOM ELEMENTS (initialized in initializeDOMElements) ---
let mainApp, mainContent, projectHeader, mainPanelHeader, loadFileInput, componentImageInput,
    tocPanel, tocList, tocFilterInput, projectTitleDisplay, undoButton, settingsButton,
    confirmModal, confirmMessage, confirmOkButton, confirmCancelButton, gmViewButton,
    quickRefList, importModal, importOptionsList, importCancelButton, importConfirmButton,
    helpModal, helpContent, helpCloseButton, mapModal, mapModalContent, mapModalCloseButton,
    handoutModal, handoutModalTitle, handoutModalContent, handoutPrintButton, handoutCloseButton,
    addComponentModal, addComponentButton, modalAddComponentList, addComponentModalCloseButton,
    backButton, aiModal, aiModalCloseButton, aiPrompt, aiGenerateButton, aiGenerateButtonText,
    aiLoadingSpinner, settingsModal, settingsModalCloseButton, geminiApiKeyInput,
    settingsSaveButton;

function initializeDOMElements() {
    mainApp = document.getElementById('app-container');
    mainContent = document.getElementById('mainContent');
    projectHeader = document.getElementById('projectHeader');
    mainPanelHeader = document.getElementById('main-panel-header');
    loadFileInput = document.getElementById('loadFileInput');
    componentImageInput = document.getElementById('componentImageInput');
    tocPanel = document.getElementById('toc-panel');
    tocList = document.getElementById('toc-list');
    tocFilterInput = document.getElementById('toc-filter');
    projectTitleDisplay = document.getElementById('project-title-display');
    undoButton = document.getElementById('undoButton');
    settingsButton = document.getElementById('settings-btn'); // Corrected for AIME
    confirmModal = document.getElementById('confirmModal');
    confirmMessage = document.getElementById('confirmMessage');
    confirmOkButton = document.getElementById('confirmOkButton');
    confirmCancelButton = document.getElementById('confirmCancelButton');
    gmViewButton = document.getElementById('gmViewButton');
    quickRefList = document.getElementById('quick-ref-list');
    importModal = document.getElementById('importModal');
    importOptionsList = document.getElementById('import-options-list');
    importCancelButton = document.getElementById('importCancelButton');
    importConfirmButton = document.getElementById('importConfirmButton');
    helpModal = document.getElementById('helpModal');
    helpContent = document.getElementById('help-content');
    helpCloseButton = document.getElementById('helpCloseButton');
    mapModal = document.getElementById('mapModal');
    mapModalContent = document.getElementById('mapModalContent');
    mapModalCloseButton = document.getElementById('mapModalCloseButton');
    handoutModal = document.getElementById('handoutModal');
    handoutModalTitle = document.getElementById('handoutModalTitle');
    handoutModalContent = document.getElementById('handoutModalContent');
    handoutPrintButton = document.getElementById('handoutPrintButton');
    handoutCloseButton = document.getElementById('handoutCloseButton');
    addComponentModal = document.getElementById('addComponentModal');
    addComponentButton = document.getElementById('addComponentButton');
    modalAddComponentList = document.getElementById('modal-add-component-list');
    addComponentModalCloseButton = document.getElementById('addComponentModalCloseButton');
    backButton = document.getElementById('backButton');
    aiModal = document.getElementById('aiModal');
    aiModalCloseButton = document.getElementById('aiModalCloseButton');
    aiPrompt = document.getElementById('aiPrompt');
    aiGenerateButton = document.getElementById('aiGenerateButton');
    aiGenerateButtonText = document.getElementById('aiGenerateButtonText');
    aiLoadingSpinner = document.getElementById('aiLoadingSpinner');
    settingsModal = document.getElementById('settings-modal-overlay'); // Corrected for AIME
}

// --- HELPER FUNCTIONS ---
const isMobile = () => window.innerWidth <= 1024;

const showMainView = () => {
    if (!isMobile()) return;
    mainApp.classList.add('mobile-view-main');
    backButton.classList.remove('hidden');
};

const showTocView = () => {
    if (!isMobile()) return;
    mainApp.classList.remove('mobile-view-main');
    backButton.classList.add('hidden');
};

const findComponentAndParent = (id, components = project.components, parent = null) => {
    for (let i = 0; i < components.length; i++) {
        const component = components[i];
        if (component.id === id) {
            return { component, parent, index: i };
        }
        if (component.children) {
            const found = findComponentAndParent(id, component.children, component);
            if (found) return found;
        }
    }
    return null;
};

const getAllComponents = (components) => {
    return components.reduce((acc, comp) => {
        acc.push(comp);
        if (comp.children) {
            acc.push(...getAllComponents(comp.children));
        }
        return acc;
    }, []);
};

const findComponent = (id) => {
    const result = findComponentAndParent(id);
    return result ? result.component : null;
};

const processTextForDisplay = (html) => {
    if (typeof html !== 'string') return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const internalLinks = tempDiv.querySelectorAll('.internal-link');
    const allComponents = getAllComponents(project.components);

    internalLinks.forEach(link => {
        const componentName = link.textContent;
        const target = allComponents.find(c => c.data.name && c.data.name.toLowerCase() === componentName.toLowerCase());
        const newLink = document.createElement('a');
        newLink.href = '#';
        if (target) {
            newLink.className = 'component-link';
            newLink.dataset.linkId = target.id;
        } else {
            newLink.className = 'component-link-broken';
            newLink.title = 'Component not found';
        }
        newLink.textContent = componentName;
        link.replaceWith(newLink);
    });

    return tempDiv.innerHTML;
};

// --- LOCAL STORAGE ---
const saveProjectToLocalStorage = () => {
    try {
        localStorage.setItem('rpgProject', JSON.stringify(project));
    } catch (e) {
        console.error("Could not save project to local storage.", e);
    }
};

const loadProjectFromLocalStorage = () => {
    try {
        const savedProject = localStorage.getItem('rpgProject');
        if (savedProject) {
            project = JSON.parse(savedProject);
            nextId = Math.max(0, ...getAllComponents(project.components).map(c => c.id)) + 1 || 1;
        } else {
                    resetProject();
                }
    } catch (e) {
        console.error("Could not load project from local storage.", e);
        resetProject();
    }
};

// --- INITIALIZATION ---
function initializeApp() {
    initializeDOMElements();
    loadSettings();
    loadProjectFromLocalStorage();
    renderAddComponentModal();
    renderAll();
    setupEventListeners();
}

document.addEventListener('DOMContentLoaded', initializeApp);

    // --- MODAL & HISTORY MANAGEMENT ---
    const showConfirm = (message, callback) => {
        confirmMessage.textContent = message;
        confirmCallback = callback;
        confirmModal.classList.remove('hidden');
        confirmModal.classList.add('flex');
    };

    const closeConfirm = () => {
        confirmModal.classList.add('hidden');
        confirmModal.classList.remove('flex');
        confirmCallback = null;
    };

    const closeHelpModal = () => {
        helpModal.classList.add('hidden');
        helpModal.classList.remove('flex');
    };

    const closeAddComponentModal = () => {
        addComponentModal.classList.add('hidden');
        addComponentModal.classList.remove('flex');
    };

    const openAiModal = (editorElement) => {
        if (!geminiApiKey) {
            // AIME's global UI will handle opening the settings modal
            return;
        }
        activeEditorForAI = editorElement;
        aiModal.classList.remove('hidden');
        aiModal.classList.add('flex');
        aiPrompt.focus();
    };

    const closeAiModal = () => {
        aiModal.classList.add('hidden');
        aiModal.classList.remove('flex');
        activeEditorForAI = null;
        aiPrompt.value = '';
    };

    const openMapModal = (mapComponent) => {
        if (!mapComponent || !mapComponent.data.imageUrl) return;

        let pinsHTML = '';
        if (mapComponent.data.pins) {
            mapComponent.data.pins.forEach((pin, index) => {
                pinsHTML += `<div class="map-pin component-link" style="left: ${pin.x}%; top: ${pin.y}%;" data-link-id="${pin.componentId}" title="${pin.name}">
                                   <span class="map-pin-label">${index + 1}</span>
                               </div>`;
            });
        }

        mapModalContent.innerHTML = `
            <div class="relative">
                <img src="${mapComponent.data.imageUrl}" class="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl">
                <div class="absolute inset-0">${pinsHTML}</div>
            </div>
        `;

        mapModal.classList.remove('hidden');
        mapModal.classList.add('flex');
    };

    const closeMapModal = () => {
        mapModal.classList.add('hidden');
        mapModal.classList.remove('flex');
        mapModalContent.innerHTML = '';
    };

    const openHandoutModal = (handoutComponent) => {
        if (!handoutComponent) return;
        handoutModalTitle.textContent = handoutComponent.data.title || 'Handout';
        let contentHTML = '';
        if (handoutComponent.data.imageUrl) {
            contentHTML += `<img src="${handoutComponent.data.imageUrl}" class="max-w-full h-auto rounded-md mb-4 shadow-md">`;
        }
        contentHTML += `<div class="prose prose-lg max-w-none">${processTextForDisplay(handoutComponent.data.content)}</div>`;
        handoutModalContent.innerHTML = contentHTML;
        handoutModal.classList.remove('hidden');
        handoutModal.classList.add('flex');
    };

    const closeHandoutModal = () => {
         handoutModal.classList.add('hidden');
        handoutModal.classList.remove('flex');
    };

    const saveStateToHistory = () => {
        historyStack.push(structuredClone(project));
        if (historyStack.length > 20) historyStack.shift();
        updateUndoButtonState();
    };

    const undoLastAction = () => {
        if (historyStack.length > 0) {
            project = historyStack.pop();
            nextId = Math.max(0, ...getAllComponents(project.components).map(c => c.id)) + 1 || 1;
            if (!getAllComponents(project.components).some(c => c.id === activeComponentId)) {
                activeComponentId = project.components.length > 0 ? project.components[0].id : null;
            }
            renderAll();
                    saveProjectToLocalStorage();
        }
    };

    const updateUndoButtonState = () => {
        if (undoButton) undoButton.disabled = historyStack.length === 0;
    };

    // --- SETTINGS & API KEY ---
    const loadSettings = () => {
        const savedKey = localStorage.getItem('geminiApiKey');
        if (savedKey) {
            geminiApiKey = savedKey;
        }
    };

    // --- PROJECT & COMPONENT LOGIC ---
    const resetProject = () => {
        project = {
            title: 'New Project',
            pitch: 'A brief, one-paragraph pitch for the campaign or adventure.',
            components: []
        };
        nextId = 1;
        activeComponentId = null;
        historyStack = [];
        isFullViewActive = false;
        renderAll();
    };

    const addComponent = (type) => {
        saveStateToHistory();
        const newComponent = { id: nextId++, type, data: getTemplateForType(type), children: [] };
        project.components.push(newComponent);
        activeComponentId = newComponent.id;
        isFullViewActive = false;
        renderAll();
                saveProjectToLocalStorage();
    };

    const deleteComponent = (id) => {
        saveStateToHistory();

        const removeRecursively = (components, targetId) => {
            for (let i = components.length - 1; i >= 0; i--) {
                if (components[i].id === targetId) {
                    components.splice(i, 1);
                    return true;
                }
                if (components[i].children && removeRecursively(components[i].children, targetId)) {
                    return true;
                }
            }
            return false;
        };

        removeRecursively(project.components, id);

        if (activeComponentId === id) {
            activeComponentId = project.components.length > 0 ? project.components[0].id : null;
            isFullViewActive = false;
        }
        renderAll();
                saveProjectToLocalStorage();
    };

    const getTemplateForType = (type) => {
        const baseTemplate = {
            description: '',
            notes: '',
            tags: ''
        };

        const specificTemplates = {
            'Story Arc': { name: 'New Story Arc', summary: '', goal: '', 'Key Antagonist': '', resolution: '' },
            'Adventure': { name: 'New Adventure', hook: '', goal: '', stakes: '', resolution: '' },
            'NPC': { name: 'New NPC', role: 'Quest Giver', appearance: '', motivation: 'To acquire wealth.', secrets: '', 'plot_hooks': '', stats: '' },
            'Location': { name: 'New Location', type: 'City', atmosphere: '', 'key_sights': '', 'sounds_and_smells': '', 'potential_encounters': '', secrets: '' },
            'Faction': { name: 'New Faction', goals: 'Gain political control.', ideology: '', key_members: '', resources: '' },
            'Encounter': { name: 'New Encounter', type: 'Combat', setup: '', resolution: '', mechanic: '' },
            'Item': { name: 'New Item', rarity: 'Uncommon', attunement: 'No', properties: '', history: '', mechanic: '' },
            'Clue': { name: 'New Clue', information: '', location_found: '', conclusion: '' },
            'Map': { name: 'New Map', imageUrl: null, pins: [] },
            'Handout': { title: 'New Handout', content: 'Information for the players...', imageUrl: null, notes: 'GM notes about this handout...' },
        };

        const specificTemplate = specificTemplates[type] || { name: `New ${type}` };
         if (type === 'Map' || type === 'Handout') {
            return specificTemplate;
        }
        const nameKey = Object.keys(specificTemplate).find(k => k === 'name' || k === 'title') || 'name';
        const finalTemplate = { ...baseTemplate, ...specificTemplate };
        if(!finalTemplate[nameKey]) finalTemplate[nameKey] = `New ${type}`;
        return finalTemplate;
    };

    // --- RENDER FUNCTIONS ---
    const renderAll = () => {
        updateUndoButtonState();
        renderProjectHeader();
        renderTableOfContents();
        renderActiveComponent();
        gmViewButton.textContent = isFullViewActive ? 'Edit View' : 'GM View';
        mainApp.classList.toggle('gm-mode', isFullViewActive);
        mainApp.classList.toggle('writer-mode', !isFullViewActive);
    };

    const renderProjectHeader = () => {
        const headerContent = `
            <div class="editable-content">
                <input type="text" data-key="title" value="${project.title}" placeholder="Project Title" class="text-4xl w-full bg-transparent border-b-2 border-transparent focus:border-gray-600 outline-none pb-2 transition-colors">
                <div data-key="pitch" class="wysiwyg-editor mt-4" contenteditable="true">${project.pitch}</div>
            </div>
            <div class="viewable-content">
                <h1 class="text-4xl mb-4">${project.title}</h1>
                <div class="italic text-gray-400 book-prose">${processTextForDisplay(project.pitch)}</div>
            </div>
        `;
        projectHeader.innerHTML = headerContent;
    };

    const renderTableOfContents = () => {
        tocList.innerHTML = '';
        const filterText = tocFilterInput.value.toLowerCase();

        const filterAndBuild = (components) => {
            const filtered = [];
            for(const component of components) {
                const nameKey = Object.keys(component.data).find(k => k === 'name' || k === 'title') || 'name';
                const name = component.data[nameKey] || `Untitled ${component.type}`;
                const selfMatch = name.toLowerCase().includes(filterText) ||
                                (component.data.tags && component.data.tags.toLowerCase().includes(filterText));
                const children = component.children ? filterAndBuild(component.children) : [];

                if(selfMatch || children.length > 0) {
                    filtered.push({
                        ...component,
                        children: children
                    });
                }
            }
            return filtered;
        }

        const componentsToRender = filterText ? filterAndBuild(project.components) : project.components;

        if (componentsToRender.length === 0) {
            tocList.innerHTML = `<p class="text-sm text-gray-400 px-1">No matching components.</p>`;
            return;
        }

        const renderItems = (components, level = 0) => {
            components.forEach((component) => {
                const nameKey = Object.keys(component.data).find(k => k === 'name' || k === 'title') || 'name';
                const name = component.data[nameKey] || `Untitled ${component.type}`;
                const itemContainer = document.createElement('div');
                itemContainer.className = 'toc-item-container';

                const item = document.createElement('div');
                item.className = `toc-item ${component.id === activeComponentId && !isFullViewActive ? 'active' : ''}`;
                item.dataset.id = component.id;
                item.draggable = true;

                const itemContent = document.createElement('div');
                itemContent.className = 'toc-item-content';
                itemContent.style.setProperty('--level', level);
                itemContent.innerHTML = `
                            <span class="handle text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                                    <path fill-rule="evenodd" d="M10 3a.75.75 0 01.75.75v12.5a.75.75 0 01-1.5 0V3.75A.75.75 0 0110 3zM3.75 9.25a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H3.75z" clip-rule="evenodd" />
                                </svg>
                            </span>
                    <span class="truncate">${name}</span>
                `;

                item.appendChild(itemContent);
                itemContainer.appendChild(item);
                tocList.appendChild(itemContainer);

                if (component.children && component.children.length > 0) {
                    const childrenContainer = document.createElement('div');
                    childrenContainer.className = 'toc-children-container relative';
                    const line = document.createElement('div');
                    line.className = 'nesting-line';
                    childrenContainer.appendChild(line);
                    renderItems(component.children, level + 1).forEach(childEl => childrenContainer.appendChild(childEl));
                    itemContainer.appendChild(childrenContainer);
                }
            });
            return components.map(c => tocList.querySelector(`[data-id='${c.id}']`).parentElement);
        };
        renderItems(componentsToRender);
    };

    const renderAddComponentModal = () => {
        const componentTypes = ['Story Arc', 'Adventure', 'NPC', 'Location', 'Faction', 'Encounter', 'Item', 'Clue', 'Map', 'Handout'];
        modalAddComponentList.innerHTML = componentTypes.map(type => `
            <button class="add-component-btn" data-type="${type}">${type}</button>
        `).join('');
    };

    const renderActiveComponent = () => {
        mainContent.innerHTML = '';
        if (isFullViewActive) {
            renderAllComponentsView();
            renderQuickReferencePanel();
            return;
        }

        const activeInfo = findComponentAndParent(activeComponentId);
        if (!activeInfo) {
            mainContent.innerHTML = `<div class="text-center text-gray-500 py-16">Select a component from the Table of Contents to begin.</div>`;
            return;
        }
        const { component, parent, index } = activeInfo;
        const nameKey = Object.keys(component.data).find(k => k === 'name' || k === 'title') || 'name';
        const name = component.data[nameKey] || `Untitled ${component.type}`;

        const card = document.createElement('div');
        card.className = 'component-card';
        card.dataset.id = component.id;

        let fieldsHTML = '';
        for (const key in component.data) {
            if (key === 'imageUrl' || key === 'pins' || key === nameKey) continue;
            const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
            const value = component.data[key] || '';
            const isTextArea = ['summary', 'description', 'pitch', 'hook', 'stakes', 'resolution', 'motivation', 'appearance', 'secrets', 'goals', 'ideology', 'key_members', 'setup', 'properties', 'information', 'conclusion', 'plot_hooks', 'key_sights', 'sounds_and_smells', 'potential_encounters', 'history', 'mechanic', 'notes', 'content'].includes(key);

            if (isTextArea) {
                fieldsHTML += `
                    <div class="mb-6">
                        <label class="component-label block text-sm mb-1">${label}</label>
                        <div class="editable-content">
                            <div class="editor-toolbar">
                                <button data-command="bold" class="bold" title="Bold (Ctrl+B)">B</button>
                                <button data-command="italic" class="italic" title="Italic (Ctrl+I)">I</button>
                                <button data-command="underline" class="underline" title="Underline (Ctrl+U)">U</button>
                                <button data-command="createLink" title="Create Internal Link (Ctrl+L)">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 pointer-events-none" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd" /></svg>
                                </button>
                                <button data-command="ai" title="Generate with AI">AI</button>
                            </div>
                            <div data-key="${key}" class="wysiwyg-editor" contenteditable="true">${value}</div>
                        </div>
                        <div class="viewable-content book-prose mt-1">${processTextForDisplay(value)}</div>
                    </div>
                `;
            } else {
                 fieldsHTML += `
                    <div class="mb-6">
                        <label class="component-label block text-sm mb-1">${label}</label>
                        <div class="editable-content">
                            <input type="text" data-key="${key}" value="${value}" class="w-full p-2 bg-transparent border-b-2 border-gray-700 focus:border-gray-400 outline-none transition">
                        </div>
                        <div class="viewable-content book-prose mt-1">${processTextForDisplay(value)}</div>
                    </div>
                `;
            }
        }

        if (component.type === 'Handout') {
            fieldsHTML += `
                <div class="mt-6">
                     <div class="editable-content">
                        <div class="mb-2">
                            <button data-action="uploadComponentImage" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white">Upload Image</button>
                        </div>
                     </div>
                     ${component.data.imageUrl ? `<div class="mt-4 w-1/2"><img src="${component.data.imageUrl}" class="rounded-lg shadow-lg"></div>` : ''}
                </div>
            `;
        }

        if (component.type === 'Map') {
            const allComponents = getAllComponents(project.components).filter(c => c.id !== component.id);
            const options = allComponents.map(c => `<option value="${c.id}">${c.data.name} (${c.type})</option>`).join('');

            let pinsHTML = '';
            if (component.data.pins) {
                component.data.pins.forEach((pin, index) => {
                     pinsHTML += `<div class="map-pin" style="left: ${pin.x}%; top: ${pin.y}%;" data-pin-id="${pin.id}" title="${pin.name}">
                        <span class="map-pin-label">${index + 1}</span>
                        <div class="map-pin-delete editable-control" data-action="deletePin" data-pin-id="${pin.id}">&times;</div>
                    </div>`;
                });
            }

            fieldsHTML += `
                <div class="mt-6">
                     <div class="editable-content">
                        <div class="mb-2">
                            <button data-action="uploadComponentImage" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md text-white">Upload Map Image</button>
                        </div>
                        <div class="p-4 border border-gray-700 rounded-md mt-4">
                            <label class="component-label block text-sm mb-2">Place Pin</label>
                            <div class="flex gap-2">
                                <select id="pin-component-selector" class="flex-grow p-2 bg-gray-900 border border-gray-600 rounded-md">
                                    <option value="">Select a component to pin...</option>
                                    ${options}
                                </select>
                                <button data-action="addPin" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-white">Add</button>
                            </div>
                            <p class="text-xs text-gray-400 mt-2">Select a component, click "Add", then click on the map to place the pin.</p>
                        </div>
                     </div>
                     <div class="mt-4 map-container ${isPinning ? 'pinning' : ''}">
                        ${component.data.imageUrl ? `<img src="${component.data.imageUrl}" alt="Map">` : '<div class="text-center p-16 bg-gray-800 rounded-md">No map image uploaded.</div>'}
                        ${pinsHTML}
                    </div>
                </div>
            `;
        }

        const parentArray = parent ? parent.children : project.components;
        const canIndent = index > 0;
        const canOutdent = parent !== null;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-8">
                <div>
                    <div class="editable-content">
                        <input type="text" data-key="${nameKey}" value="${name}" placeholder="Component Name" class="text-3xl w-full bg-transparent border-b-2 border-transparent focus:border-gray-600 outline-none pb-2 transition-colors">
                    </div>
                    <div class="viewable-content">
                        <h2 class="text-3xl">${name}</h2>
                    </div>
                    <div class="editable-control flex items-center gap-2 mt-2">
                        <button data-action="outdent" title="Outdent Component" class="nest-control-button p-1 hover:bg-gray-700 rounded-md" ${!canOutdent ? 'disabled' : ''}>
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        <button data-action="indent" title="Indent Component" class="nest-control-button p-1 hover:bg-gray-700 rounded-md" ${!canIndent ? 'disabled' : ''}>
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </button>
                        ${component.type === 'Handout' ? `<button data-action="showPlayerView" title="Show Player View" class="p-1 hover:bg-gray-700 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" /></svg></button>` : ''}
                    </div>
                </div>
                <button data-action="deleteComponent" class="editable-control text-sm text-red-500 hover:text-red-400 transition-colors">Delete Component</button>
            </div>
            ${fieldsHTML}
        `;
        mainContent.appendChild(card);
    };

    const renderAllComponentsView = () => {
        let html = '';
        const traverseAndRender = (components, level = 0) => {
            components.forEach(component => {
                const nameKey = Object.keys(component.data).find(k => k === 'name' || k === 'title') || 'name';
                const name = component.data[nameKey] || `Untitled ${component.type}`;
                let fieldsHTML = '';
                for (const key in component.data) {
                    if (key === nameKey || key === 'imageUrl' || key === 'pins' || !component.data[key]) continue;
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                    const value = component.data[key];
                    fieldsHTML += `<div class="mb-4"><h4 class="font-bold text-gray-400">${label}</h4><div class="book-prose">${processTextForDisplay(value)}</div></div>`;
                }

                if (component.type === 'Handout' && component.data.imageUrl) {
                    fieldsHTML += `<div class="mt-4 w-1/3"><img src="${component.data.imageUrl}" class="rounded-lg shadow-lg"></div>`;
                }

                if (component.type === 'Map' && component.data.imageUrl) {
                    let pinsHTML = '';
                    if (component.data.pins) {
                        component.data.pins.forEach((pin, index) => {
                            pinsHTML += `<div class="map-pin component-link" style="left: ${pin.x}%; top: ${pin.y}%;" data-link-id="${pin.componentId}" title="${pin.name}"><span class="map-pin-label">${index + 1}</span></div>`;
                        });
                    }
                    fieldsHTML += `<div class="mt-4 map-container"><img src="${component.data.imageUrl}">${pinsHTML}</div>`;
                }

                html += `
                    <div class="component-card mb-8" id="component-card-${component.id}" style="margin-left: ${level * 2}rem;">
                        <h2 class="text-3xl mb-4 border-b border-gray-700 pb-2">${name}</h2>
                        ${fieldsHTML}
                    </div>
                `;

                if (component.children && component.children.length > 0) {
                    traverseAndRender(component.children, level + 1);
                }
            });
        };
        traverseAndRender(project.components);
        mainContent.innerHTML = html;
    };

    const renderQuickReferencePanel = () => {
        quickRefList.innerHTML = '';
        const keyComponents = getAllComponents(project.components).filter(c => c.type === 'NPC' || c.type === 'Location' || c.type === 'Handout');
        if (keyComponents.length === 0) {
            quickRefList.innerHTML = `<p class="text-sm text-gray-400">No key components found.</p>`;
            return;
        }

        let listHtml = '<div class="space-y-4">';

        const handouts = keyComponents.filter(c => c.type === 'Handout');
        if (handouts.length > 0) {
            listHtml += '<div><h3 class="font-bold text-lg">Handouts</h3><div class="space-y-1 mt-1">';
            handouts.forEach(c => {
                listHtml += `<div><a href="#" class="quick-ref-link" data-scroll-to-id="${c.id}">${c.data.title}</a></div>`;
            });
            listHtml += '</div></div>';
        }

        const npcs = keyComponents.filter(c => c.type === 'NPC');
        if (npcs.length > 0) {
            listHtml += '<div><h3 class="font-bold text-lg">NPCs</h3><div class="space-y-1 mt-1">';
            npcs.forEach(c => {
                listHtml += `<div><a href="#" class="quick-ref-link" data-scroll-to-id="${c.id}">${c.data.name}</a></div>`;
            });
            listHtml += '</div></div>';
        }

        const locations = keyComponents.filter(c => c.type === 'Location');
         if (locations.length > 0) {
            listHtml += '<div><h3 class="font-bold text-lg">Locations</h3><div class="space-y-1 mt-1">';
            locations.forEach(c => {
                listHtml += `<div><a href="#" class="quick-ref-link" data-scroll-to-id="${c.id}">${c.data.name}</a></div>`;
            });
            listHtml += '</div></div>';
        }

        listHtml += '</div>';
        quickRefList.innerHTML = listHtml;
    };

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        window.addEventListener('resize', () => {
            if (!isMobile()) {
                mainApp.classList.remove('mobile-view-main');
                backButton.classList.add('hidden');
            }
        });
        undoButton.addEventListener('click', undoLastAction);

        tocPanel.addEventListener('click', (e) => {
            const actionTarget = e.target.closest('[data-action]');
            if (!actionTarget) return;
            const action = actionTarget.dataset.action;

            if (action === 'save') {
                const dataStr = JSON.stringify(project, null, 2);
                const blob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${project.title.replace(/[^a-z0-9]/gi, '_') || 'rpg-project'}.json`;
                a.click();
                URL.revokeObjectURL(url);
            } else if (action === 'load') {
                loadFileInput.click();
                    } else if (action === 'new') {
                        showConfirm('Are you sure you want to start a new project? Any unsaved changes will be lost.', () => {
                            localStorage.removeItem('rpgProject');
                            resetProject();
                        });
            } else if (action === 'print') {
                const printArea = document.createElement('div');
                printArea.id = 'print-area';
                printArea.innerHTML = `<div class="gm-print-view">${document.getElementById('main-scroll-area').innerHTML}</div>`;
                document.body.appendChild(printArea);
                window.print();
                document.body.removeChild(printArea);
            } else if (action === 'help') {
                openHelpModal();
            }
        });

        mainPanelHeader.addEventListener('click', (e) => {
            const actionTarget = e.target.closest('[data-action]');
            if (!actionTarget) return;
            const action = actionTarget.dataset.action;

            if (action === 'back') {
                showTocView();
            }
        });

        const openHelpModal = () => {
            helpModal.classList.remove('hidden');
            helpModal.classList.add('flex');
            helpContent.innerHTML = `
            <h3>Welcome to the RPG Scenario Guide!</h3>
            <p>This guide is designed to be your all-in-one digital binder for creating and running your roleplaying game adventures. Here's how to get the most out of it.</p>
            <h4>The Core Idea: Your Digital Binder</h4>
            <p>Think of your entire adventure as a single <strong>Project</strong>. This project holds everything:</p>
            <ul>
                <li>A <strong>Title</strong> and a short <strong>Pitch</strong> to summarize your story.</li>
                <li>A collection of <strong>Components</strong>, which are the building blocks of your adventure (like NPCs, Locations, Items, and Encounters).</li>
            </ul>
            <p>You can organize these components into a detailed outline by nesting them. For example, you can place an "Encounter" page inside a "Dungeon Room" page, which itself is inside a "Dungeon" location.</p>
            <h4>The Three-Panel Workspace</h4>
            <p>The application is split into three main areas to keep your workflow smooth and organized.</p>
            <ul>
                <li><strong>Left Panel (Table of Contents):</strong> This is your adventure's interactive outline.
                    <ul>
                        <li><strong>Navigate:</strong> Click any item to view and edit its details in the center panel.</li>
                        <li><strong>Organize:</strong> Drag and drop items to reorder them. Use the indent/outdent buttons in the editor to create a nested hierarchy.</li>
                        <li><strong>Find:</strong> Use the filter bar at the top to instantly search for any component by its name or tags.</li>
                        <li><strong>Fix Mistakes:</strong> The <strong>Undo</strong> button lets you reverse your last major action, like deleting or moving a component.</li>
                    </ul>
                </li>
                <li><strong>Center Panel (The Workspace):</strong> This is where you'll do all your writing and editing. It shows the full details of the component you've selected from the Table of Contents.</li>
                <li><strong>Right Panel (The Toolbox):</strong> This is where you add new content. Click any button here to add a pre-made template for an NPC, Location, Faction, and more to your project.</li>
            </ul>
            <h4>The Editor: What You See Is What You Get</h4>
            <p>The text editor works just like a modern word processor. There's no code to learn; the text in the editor looks exactly how it will in the final view.</p>
            <ul>
                <li><strong>Toolbar & Shortcuts:</strong> To format text, simply highlight it and use either the toolbar buttons or familiar keyboard shortcuts:
                    <ul>
                        <li><strong>Bold:</strong> <code>Ctrl+B</code></li>
                        <li><strong>Italic:</strong> <code>Ctrl+I</code></li>
                        <li><strong>Underline:</strong> <code>Ctrl+U</code></li>
                    </ul>
                </li>
                <li><strong>Internal Links (Wiki-Style):</strong> This is a powerful feature for connecting your notes.
                    <ul>
                        <li>Highlight a piece of text (like an NPC's name) and press <code>Ctrl+L</code> or click the <strong>Link</strong> button on the toolbar.</li>
                        <li>This creates a special link. In the "GM View," you can click this link to instantly jump to that component's page.</li>
                    </ul>
                </li>
                <li><strong>Automatic Saving:</strong> All your changes are saved automatically as you type and when you click away from an editor.</li>
            </ul>
            <h4>Key Features</h4>
            <ul>
                <li><strong>Writer Mode vs. GM View:</strong> The application has two modes.
                    <ul>
                        <li><strong>Writer Mode:</strong> The default view, where you have access to all editing tools to prepare your adventure.</li>
                        <li><strong>GM View:</strong> A streamlined, read-only mode designed for use while running your game. It hides all the toolbars and presents your notes in a clean, easy-to-read format. Click the "GM View" button to switch.</li>
                    </ul>
                </li>
                <li><strong>Saving and Loading Your Work:</strong>
                    <ul>
                        <li><strong>Save:</strong> Click the "Save" icon to download your entire project as a single <code>.json</code> file. This is perfect for making backups or sharing your adventure.</li>
                        <li><strong>Load:</strong> Click the "Load" icon to open a project file. A window will appear allowing you to choose exactly which components from the file you want to import into your current project.</li>
                    </ul>
                </li>
            </ul>
        `;
        }

        loadFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    loadedProjectData = JSON.parse(event.target.result);
                    if (loadedProjectData && loadedProjectData.title && loadedProjectData.components) {
                       renderImportModal(loadedProjectData);
                    } else {
                        alert('Invalid project file.');
                    }
                } catch {
                    alert('Error reading file.');
                }
            };
            reader.readAsText(file);
            e.target.value = '';
        });

        addComponentButton.addEventListener('click', () => {
            addComponentModal.classList.remove('hidden');
            addComponentModal.classList.add('flex');
        });

        modalAddComponentList.addEventListener('click', (e) => {
            if (e.target.matches('.add-component-btn')) {
                addComponent(e.target.dataset.type);
                closeAddComponentModal();
            }
        });

        tocList.addEventListener('click', (e) => {
            const tocItem = e.target.closest('.toc-item');
            if (tocItem) {
                activeComponentId = parseInt(tocItem.dataset.id);
                isFullViewActive = false;
                mainApp.classList.remove('gm-mode');
                mainApp.classList.add('writer-mode');
                renderAll();
                showMainView();
            }
        });

        gmViewButton.addEventListener('click', () => {
            isFullViewActive = !isFullViewActive;
            if(isFullViewActive) {
                activeComponentId = null;
                mainApp.classList.add('gm-mode');
                mainApp.classList.remove('writer-mode');
            } else {
                activeComponentId = project.components.length > 0 ? project.components[0].id : null;
                mainApp.classList.remove('gm-mode');
                mainApp.classList.add('writer-mode');
            }
            renderAll();
            if (isFullViewActive) {
                showMainView();
            }
        });

        confirmOkButton.addEventListener('click', () => {
            if (typeof confirmCallback === 'function') {
                confirmCallback();
            }
            closeConfirm();
        });
        confirmCancelButton.addEventListener('click', closeConfirm);

        mainContent.addEventListener('input', (e) => {
            const target = e.target;
            if (target.matches('[data-key]')) {
                const component = findComponent(activeComponentId);
                if (component) {
                    const key = target.dataset.key;
                    const value = target.isContentEditable ? target.innerHTML : target.value;
                    component.data[key] = value;

                    if(key === 'name' || key === 'title') {
                        renderTableOfContents();
                    }
                            saveProjectToLocalStorage();
                }
            }
        });
        mainContent.addEventListener('focusout', (e) => { if (e.target.matches('[data-key]')) saveStateToHistory(); });

        projectHeader.addEventListener('input', (e) => {
            const target = e.target;
            if (target.matches('[data-key]')) {
                 const key = target.dataset.key;
                 const value = target.isContentEditable ? target.innerHTML : target.value;
                 project[key] = value;
                 if(key === 'title') {
                     projectTitleDisplay.textContent = value;
                }
                        saveProjectToLocalStorage();
            }
        });
        projectHeader.addEventListener('focusout', (e) => { if (e.target.matches('[data-key]')) saveStateToHistory(); });

        mainContent.addEventListener('click', (e) => {
            const actionTarget = e.target.closest('[data-action]');
            const commandTarget = e.target.closest('[data-command]');
            const mapContainer = e.target.closest('.map-container');

            if (isPinning && mapContainer) {
                const mapImage = mapContainer.querySelector('img');
                if (!mapImage) return;
                const rect = mapImage.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                const mapComponent = findComponent(activeComponentId);
                const linkedComponent = findComponent(pinComponentId);
                if (mapComponent && linkedComponent) {
                    saveStateToHistory();
                    if (!mapComponent.data.pins) mapComponent.data.pins = [];
                    mapComponent.data.pins.push({
                        id: Date.now(),
                        componentId: pinComponentId,
                        name: linkedComponent.data.name,
                        x: x,
                        y: y
                    });
                    isPinning = false;
                    pinComponentId = null;
                    renderActiveComponent();
                            saveProjectToLocalStorage();
                }
                return;
            }

            if (mapContainer && !e.target.closest('.map-pin-delete') && !e.target.closest('.editable-content')) {
                const componentCard = mapContainer.closest('.component-card');
                if (componentCard) {
                    const componentId = parseInt(componentCard.dataset.id);
                    const mapComponent = findComponent(componentId);
                    if (mapComponent) {
                        openMapModal(mapComponent);
                        return;
                    }
                }
            }

            if (commandTarget) {
                const command = commandTarget.dataset.command;
                const editor = commandTarget.closest('.editable-content').querySelector('.wysiwyg-editor');

                if (command === 'ai') {
                    openAiModal(editor);
                    return;
                }

                editor.focus();

                if (command === 'createLink') {
                    const selection = document.getSelection();
                    if (!selection.rangeCount || selection.isCollapsed) return;

                    const range = selection.getRangeAt(0);
                    const span = document.createElement('span');
                    span.className = 'internal-link';
                    span.appendChild(range.extractContents());
                    range.insertNode(span);

                    editor.dispatchEvent(new Event('input', { bubbles: true }));

                } else {
                    document.execCommand(command, false, null);
                }
            }
            else if (actionTarget) {
                const action = actionTarget.dataset.action;

                if (action === 'deleteComponent') {
                    showConfirm('Are you sure you want to delete this component and all its sub-components?', () => {
                        deleteComponent(activeComponentId);
                    });
                } else if (action === 'uploadComponentImage') {
                    componentImageInput.click();
                } else if(action === 'indent') {
                    indentComponent(activeComponentId);
                } else if(action === 'outdent') {
                    outdentComponent(activeComponentId);
                } else if (action === 'addPin') {
                    const selector = document.getElementById('pin-component-selector');
                    if (selector.value) {
                        isPinning = true;
                        pinComponentId = parseInt(selector.value);
                        renderActiveComponent(); // Re-render to apply the 'pinning' cursor
                    } else {
                        alert('Please select a component to pin first.');
                    }
                } else if (action === 'deletePin') {
                    const pinIdToDelete = parseInt(actionTarget.dataset.pinId);
                    const mapComponent = findComponent(activeComponentId);
                    if (mapComponent && mapComponent.data.pins) {
                        saveStateToHistory();
                        mapComponent.data.pins = mapComponent.data.pins.filter(p => p.id !== pinIdToDelete);
                        renderActiveComponent();
                                saveProjectToLocalStorage();
                    }
                } else if (action === 'showPlayerView') {
                    const component = findComponent(activeComponentId);
                    if (component && component.type === 'Handout') {
                        openHandoutModal(component);
                    }
                }
            } else {
                const linkTarget = e.target.closest('.component-link');
                if(linkTarget) {
                    e.preventDefault();
                    const linkId = parseInt(linkTarget.dataset.linkId);

                    if (isFullViewActive) {
                         const targetElement = document.getElementById(`component-card-${linkId}`);
                         if(targetElement) {
                             targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                             targetElement.style.transition = 'background-color 0.5s';
                             targetElement.style.backgroundColor = 'rgba(147, 197, 253, 0.2)';
                             setTimeout(() => {
                                 targetElement.style.backgroundColor = '';
                             }, 1500);
                         }
                    } else {
                        activeComponentId = linkId;
                        mainApp.classList.remove('gm-mode');
                        mainApp.classList.add('writer-mode');
                        renderAll();
                        showMainView();
                    }
                }
            }
        });

        // --- RTF SHORTCUTS ---
        mainContent.addEventListener('keydown', (e) => {
            if (!e.ctrlKey || !e.target.isContentEditable) {
                return;
            }

            const key = e.key.toLowerCase();
            if (['b', 'i', 'u', 'l'].includes(key)) {
                e.preventDefault();
                let command;
                switch (key) {
                    case 'b': command = 'bold'; break;
                    case 'i': command = 'italic'; break;
                    case 'u': command = 'underline'; break;
                    case 'l': command = 'createLink'; break;
                }

                if (command === 'createLink') {
                    const selection = document.getSelection();
                    if (!selection.rangeCount || selection.isCollapsed) return;

                    const range = selection.getRangeAt(0);
                    const span = document.createElement('span');
                    span.className = 'internal-link';
                    span.appendChild(range.extractContents());
                    range.insertNode(span);

                    e.target.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    document.execCommand(command, false, null);
                }
            }
        });

        quickRefList.addEventListener('click', (e) => {
            if(e.target.matches('.quick-ref-link')) {
                e.preventDefault();
                const targetId = e.target.dataset.scrollToId;
                const targetElement = document.getElementById(`component-card-${targetId}`);
                if(targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        componentImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const component = findComponent(activeComponentId);
                if (component && (component.type === 'Map' || component.type === 'Handout')) {
                    saveStateToHistory();
                    component.data.imageUrl = event.target.result;
                    renderActiveComponent();
                            saveProjectToLocalStorage();
                }
            };
            reader.readAsDataURL(file);
            e.target.value = '';
        });

        tocFilterInput.addEventListener('input', renderTableOfContents);

        // --- HIERARCHY AND DRAG/DROP LOGIC ---
        const indentComponent = (id) => {
            const info = findComponentAndParent(id);
            if (!info || info.index === 0) return;

            const parentArray = info.parent ? info.parent.children : project.components;
            const newParent = parentArray[info.index - 1];
            if (!newParent) return;

            saveStateToHistory();
            const [itemToIndent] = parentArray.splice(info.index, 1);
            newParent.children.push(itemToIndent);
            renderAll();
                    saveProjectToLocalStorage();
        };

        const outdentComponent = (id) => {
            const info = findComponentAndParent(id);
            if (!info || !info.parent) return;

            const grandParentInfo = findComponentAndParent(info.parent.id);
            if (!grandParentInfo) {
                return;
            }

            saveStateToHistory();
            const sourceArray = info.parent.children;
            const [itemToOutdent] = sourceArray.splice(info.index, 1);

            const destinationArray = grandParentInfo.parent ? grandParentInfo.parent.children : project.components;
            destinationArray.splice(grandParentInfo.index + 1, 0, itemToOutdent);
            renderAll();
                    saveProjectToLocalStorage();
        };

        const moveComponent = (draggedId, targetId) => {
            if (draggedId === targetId) return;
            saveStateToHistory();

            const draggedInfo = findComponentAndParent(draggedId);
            if (!draggedInfo) return;

            const sourceArray = draggedInfo.parent ? draggedInfo.parent.children : project.components;
            const [draggedItem] = sourceArray.splice(draggedInfo.index, 1);

            const targetInfo = findComponentAndParent(targetId);
            if (!targetInfo) {
                project.components.push(draggedItem);
            } else {
                const targetArray = targetInfo.parent ? targetInfo.parent.children : project.components;
                targetArray.splice(targetInfo.index, 0, draggedItem);
            }

            renderAll();
                    saveProjectToLocalStorage();
        };

        tocList.addEventListener('dragstart', e => {
            const target = e.target.closest('.toc-item');
            if (target) {
                draggingItemId = parseInt(target.dataset.id);
                e.dataTransfer.effectAllowed = 'move';
                setTimeout(() => target.classList.add('dragging'), 0);
            }
        });

        tocList.addEventListener('dragend', e => {
            draggingItemId = null;
            document.querySelectorAll('.toc-item').forEach(el => {
                el.classList.remove('dragging', 'drop-target');
            });
        });

        tocList.addEventListener('dragover', e => {
            e.preventDefault();
            const dropTargetElement = e.target.closest('.toc-item');
            if (!dropTargetElement) return;

            document.querySelectorAll('.toc-item').forEach(el => {
                el.classList.remove('drop-target');
            });

            dropTargetElement.classList.add('drop-target');
        });

        tocList.addEventListener('drop', e => {
            e.preventDefault();
            const dropTargetElement = e.target.closest('.toc-item');
            document.querySelectorAll('.toc-item').forEach(el => el.classList.remove('drop-target'));
            if (!dropTargetElement || draggingItemId === null) return;

            const dropTargetId = parseInt(dropTargetElement.dataset.id);
            moveComponent(draggingItemId, dropTargetId);
        });

        // --- IMPORT LOGIC ---
        const renderImportModal = (data) => {
            let html = `
                <label class="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-md">
                    <input type="checkbox" data-import-key="title" checked class="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500">
                    <span class="font-bold">Project Title: ${data.title}</span>
                </label>
                <label class="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-md">
                    <input type="checkbox" data-import-key="pitch" checked class="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500">
                    <span class="font-bold">Project Pitch</span>
                </label>
                <hr class="border-gray-600 my-4">
            `;

            const renderImportItems = (components, level = 0) => {
                components.forEach(component => {
                    const nameKey = Object.keys(component.data).find(k => k === 'name' || k === 'title') || 'name';
                    const name = component.data[nameKey] || `Untitled ${component.type}`;
                    html += `
                        <label class="flex items-center space-x-3 p-2 hover:bg-gray-700 rounded-md" style="padding-left: ${1 + level * 1.5}rem;">
                            <input type="checkbox" data-import-id="${component.id}" checked class="h-4 w-4 rounded border-gray-600 text-blue-500 focus:ring-blue-500">
                            <span>${name} <span class="text-sm text-gray-400">(${component.type})</span></span>
                        </label>
                    `;
                    if (component.children && component.children.length > 0) {
                        renderImportItems(component.children, level + 1);
                    }
                });
            };
            renderImportItems(data.components);
            importOptionsList.innerHTML = html;
            importModal.classList.remove('hidden');
            importModal.classList.add('flex');
        };

        importCancelButton.addEventListener('click', () => {
            importModal.classList.add('hidden');
            importModal.classList.remove('flex');
            loadedProjectData = null;
        });

        importConfirmButton.addEventListener('click', () => {
            if (!loadedProjectData) return;
            saveStateToHistory();

            const importTitle = document.querySelector('[data-import-key="title"]').checked;
            const importPitch = document.querySelector('[data-import-key="pitch"]').checked;

            if (importTitle) project.title = loadedProjectData.title;
            if (importPitch) project.pitch = loadedProjectData.pitch;

            const remapIdsAndFilter = (components) => {
                const newComponents = [];
                components.forEach(comp => {
                    const checkbox = document.querySelector(`[data-import-id="${comp.id}"]`);
                    if (checkbox && checkbox.checked) {
                        const newComp = structuredClone(comp);
                        newComp.id = nextId++;
                        if (newComp.children) {
                            newComp.children = remapIdsAndFilter(newComp.children);
                        }
                        newComponents.push(newComp);
                    }
                });
                return newComponents;
            };

            const componentsToImport = remapIdsAndFilter(loadedProjectData.components);
            project.components.push(...componentsToImport);

            importModal.classList.add('hidden');
            importModal.classList.remove('flex');
            loadedProjectData = null;
            renderAll();
                    saveProjectToLocalStorage();
        });

        // --- MODAL CLOSE LISTENERS ---
        addComponentModalCloseButton.addEventListener('click', closeAddComponentModal);
        addComponentModal.addEventListener('click', (e) => { if (e.target === addComponentModal) closeAddComponentModal(); });
        aiModalCloseButton.addEventListener('click', closeAiModal);
        aiModal.addEventListener('click', (e) => { if (e.target === aiModal) closeAiModal(); });
        helpCloseButton.addEventListener('click', closeHelpModal);
        helpModal.addEventListener('click', (e) => { if(e.target === helpModal) closeHelpModal(); });
        importModal.addEventListener('click', (e) => { if(e.target === importModal) importCancelButton.click(); });
        confirmModal.addEventListener('click', (e) => { if(e.target === confirmModal) closeConfirm(); });
        mapModalCloseButton.addEventListener('click', closeMapModal);
        mapModal.addEventListener('click', (e) => {
            if (e.target === mapModal) {
                closeMapModal();
            }
            const linkTarget = e.target.closest('.component-link');
            if (linkTarget) {
                e.preventDefault();
                const linkId = parseInt(linkTarget.dataset.linkId);
                activeComponentId = linkId;
                isFullViewActive = false;
                mainApp.classList.remove('gm-mode');
                mainApp.classList.add('writer-mode');
                closeMapModal();
                renderAll();
                showMainView();
            }
        });
        handoutCloseButton.addEventListener('click', closeHandoutModal);
        handoutPrintButton.addEventListener('click', () => {
            const printContent = handoutModalContent.innerHTML;
            const printArea = document.createElement('div');
            printArea.id = 'print-area';
            printArea.innerHTML = `<div class="handout-print-content"><h2>${handoutModalTitle.textContent}</h2>${printContent}</div>`;
            document.body.appendChild(printArea);
            window.print();
            document.body.removeChild(printArea);
        });

        aiGenerateButton.addEventListener('click', async () => {
            const prompt = aiPrompt.value;
            if (!prompt || !activeEditorForAI) return;

            loadSettings(); // Ensure we have the latest key
            if (!geminiApiKey) {
                // The global UI should handle the modal opening.
                // We can add a toast message here if needed.
                return;
            }

            aiGenerateButtonText.classList.add('hidden');
            aiLoadingSpinner.classList.remove('hidden');
            aiGenerateButton.disabled = true;

            try {
                let chatHistory = [];
                chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                const payload = { contents: chatHistory };
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();

                if (result.candidates && result.candidates.length > 0 &&
                    result.candidates[0].content && result.candidates[0].content.parts &&
                    result.candidates[0].content.parts.length > 0) {
                    const text = result.candidates[0].content.parts[0].text;
                    activeEditorForAI.innerHTML = text;
                    // Dispatch an input event to ensure the change is saved
                    activeEditorForAI.dispatchEvent(new Event('input', { bubbles: true }));
                    closeAiModal();
                            saveProjectToLocalStorage();
                } else {
                    console.error("AI response format was unexpected:", result);
                    alert("Could not get a valid response from the AI. Check your API key and prompt.");
                }
            } catch (error) {
                console.error("Error calling AI:", error);
                alert("An error occurred while generating content.");
            } finally {
                aiGenerateButtonText.classList.remove('hidden');
                aiLoadingSpinner.classList.add('hidden');
                aiGenerateButton.disabled = false;
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (!helpModal.classList.contains('hidden')) closeHelpModal();
                if (!importModal.classList.contains('hidden')) importCancelButton.click();
                if (!confirmModal.classList.contains('hidden')) closeConfirm();
                if (!mapModal.classList.contains('hidden')) closeMapModal();
                if (!handoutModal.classList.contains('hidden')) closeHandoutModal();
                if (!addComponentModal.classList.contains('hidden')) closeAddComponentModal();
                if (!aiModal.classList.contains('hidden')) closeAiModal();
                 if (isPinning) {
                    isPinning = false;
                    pinComponentId = null;
                    renderActiveComponent();
                }
            }
        });
    }
