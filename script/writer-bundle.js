/**
 * File: writer-bundle.js
 * Reference: Story Weaver Logic
 * Creator: Wolfe.BT, TangentLLC
 */

/**
 * ==================================================================================
 * AIME Accordion Logic
 * ==================================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    // Accordion functionality
    document.querySelectorAll('.accordion .accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('active');
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                content.style.padding = '0 1.5rem';
            } else {
                content.style.padding = '1.5rem';
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});

/**
 * ==================================================================================
 * AIME Guidance Gems Logic
 * ==================================================================================
 */
const guidanceData = {
    Genre: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Horror', 'Mystery', 'Romance', 'Thriller'],
    Tone: ['Serious', 'Humorous', 'Formal', 'Informal', 'Optimistic', 'Pessimistic', 'Joyful', 'Sad', 'Hopeful', 'Cynical'],
    Pacing: ['Fast-paced', 'Slow-burn', 'Steady', 'Urgent', 'Relaxed', 'Meditative'],
    'Point of View': ['First Person', 'Third Person Limited', 'Third Person Omniscient', 'Second Person'],
    'Literary Devices': ['Metaphor', 'Simile', 'Personification', 'Alliteration', 'Symbolism', 'Irony', 'Foreshadowing'],
    Structure: ['Linear', 'Non-linear', 'Episodic', 'In Medias Res', 'Frame Story']
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('guidance-gems-container');
    if (container) {
        Object.entries(guidanceData).forEach(([title, options]) => {
            const gemElement = document.createElement('div');
            gemElement.className = 'gem';
            
            const titleElement = document.createElement('h4');
            titleElement.className = 'gem-title';
            titleElement.textContent = title;

            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'gem-options';

            options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'gem-button';
                button.textContent = option;
                button.addEventListener('click', () => {
                    optionsContainer.querySelectorAll('.gem-button').forEach(btn => {
                        if (btn !== button) btn.classList.remove('active');
                    });
                    button.classList.toggle('active');
                });
                optionsContainer.appendChild(button);
            });

            gemElement.appendChild(titleElement);
            gemElement.appendChild(optionsContainer);
            container.appendChild(gemElement);
        });
    }
});

/**
 * ==================================================================================
 * AIME Asset Import Logic (Mockup)
 * ==================================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    const importBtn = document.getElementById('import-asset-btn');
    const fileInput = document.getElementById('asset-upload');
    const assetList = document.getElementById('asset-list');

    if (importBtn && fileInput && assetList) {
        importBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (event) => {
            for (const file of event.target.files) {
                // Mockup: Just display the file name. Full implementation will read file content.
                const assetItem = document.createElement('div');
                assetItem.className = 'asset-item';
                assetItem.textContent = file.name;
                assetList.appendChild(assetItem);
            }
        });
    }
});

/**
 * ==================================================================================
 * AIME Writer Tab Logic
 * ==================================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    const writerNavButtons = document.querySelectorAll('.writer-nav-button');
    const writerTabs = document.querySelectorAll('.writer-tab');

    if(writerNavButtons.length > 0 && writerTabs.length > 0) {
        writerNavButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTabId = button.dataset.tab;

                writerNavButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                writerTabs.forEach(tab => {
                    tab.classList.toggle('active', tab.id === targetTabId);
                });
            });
        });
    }
});

/**
 * ==================================================================================
 * AIME Outline & Asset Browser Logic (Combined)
 * ==================================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    const outlineList = document.getElementById('outline-list');
    const importSceneBtn = document.getElementById('import-scene'); // Note: This button is currently removed from HTML

    // Mock data for scene assets
    const mockSceneAssets = [
        { id: 'scn001', title: 'The Standoff on the Bridge', location: 'INT. STARSHIP VENTURE - BRIDGE' },
        { id: 'scn002', title: 'A Meeting in the Shadows', location: 'EXT. NEO-TOKYO ALLEY - NIGHT' },
        { id: 'scn003', title: 'The King\'s Decree', location: 'INT. AETHELGARD THRONE ROOM - DAY' }
    ];

    if (outlineList) {
        // Drag and Drop functionality would go here if needed in future
    }
});

