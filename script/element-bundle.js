/*
    File: element-bundle.js
    Reference: Element Pages Logic
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

        header.addEventListener('click', () => {
            const isOpen = header.classList.toggle('active');
            chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + "px";
                content.style.padding = '1.5rem';
            } else {
                content.style.maxHeight = null;
                content.style.padding = '0 1.5rem';
            }
        });
    });
}

// --- Guidance Gems Logic ---
const guidanceData = {
    Genre: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Horror', 'Mystery', 'Romance', 'Thriller'],
    Tone: ['Serious', 'Humorous', 'Formal', 'Informal', 'Optimistic', 'Pessimistic', 'Joyful', 'Sad', 'Hopeful', 'Cynical'],
    Pacing: ['Fast-paced', 'Slow-burn', 'Steady', 'Urgent', 'Relaxed', 'Meditative'],
    'Point of View': ['First Person', 'Third Person Limited', 'Third Person Omniscient', 'Second Person'],
    'Literary Devices': ['Metaphor', 'Simile', 'Personification', 'Alliteration', 'Symbolism', 'Irony', 'Foreshadowing'],
    Structure: ['Linear', 'Non-linear', 'Episodic', 'In Medias Res', 'Frame Story']
};

function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (!container) return;

    Object.entries(guidanceData).forEach(([title, options]) => {
        const gemElement = document.createElement('div');
        gemElement.className = 'gem';
        gemElement.innerHTML = `<h4 class="gem-title">${title}</h4>`;

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'gem-options';

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'gem-button';
            button.textContent = option;
            button.addEventListener('click', () => {
                const siblings = optionsContainer.querySelectorAll('.gem-button');
                siblings.forEach(sib => {
                    if (sib !== button) sib.classList.remove('active');
                });
                button.classList.toggle('active');
            });
            optionsContainer.appendChild(button);
        });

        gemElement.appendChild(optionsContainer);
        container.appendChild(gemElement);
    });
}

// --- Asset Import Logic (Mockup) ---
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
    assetItem.innerHTML = `
        <div class="asset-info">
            <span class="asset-name">${file.name}</span>
            <button class="remove-asset-btn">&times;</button>
        </div>
    `;
    assetList.appendChild(assetItem);
    assetItem.querySelector('.remove-asset-btn').addEventListener('click', () => {
        assetItem.remove();
    });
}

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns();
    initializeAccordions();
    initializeGuidanceGems();
    initializeAssetImporter();
    
    // Placeholder for future generation logic
    const generateButton = document.getElementById('generate-button');
    if (generateButton) {
        generateButton.addEventListener('click', () => {
            const responseContainer = document.getElementById('response-container');
            responseContainer.innerHTML = '<p>Generation logic not yet implemented.</p>';
        });
    }
});

