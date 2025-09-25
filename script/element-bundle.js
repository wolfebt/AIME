/**
 * File: element-bundle.js
 * Reference: Element Pages Logic
 * Creator: Wolfe.BT, TangentLLC
 */

/**
 * ==================================================================================
 * AIME Accordion Logic
 * ==================================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
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
 * AIME DOM Parser, Prompt Crafter, and Generator Logic (Simplified for Mockup)
 * ==================================================================================
 */
function parseAllElementData(elementType) {
    // This is a placeholder for parsing data from the form fields.
    console.log(`Parsing data for element type: ${elementType}`);
    return { elementType, traits: {}, guidance: {}, assets: [] };
}

function craftSuperPrompt(elementData) {
    // This is a placeholder for crafting the AI prompt.
    console.log('Crafting super prompt with data:', elementData);
    return `This is a mocked prompt for a ${elementData.elementType}.`;
}

async function handleGenerationRequest(elementType) {
    console.log(`[Generator] Initiating request for ${elementType}`);
    const generateButton = document.getElementById('generate-button');
    const responseContainer = document.getElementById('response-container');

    if (generateButton) generateButton.disabled = true;
    if (responseContainer) {
        responseContainer.innerHTML = '<em>Generating...</em>';
        responseContainer.style.display = 'block';
    }

    // Mock API call
    setTimeout(() => {
        const elementData = parseAllElementData(elementType);
        const prompt = craftSuperPrompt(elementData);
        const mockResponse = `This is a mock AI response for a ${elementType} based on the prompt:\n"${prompt}"`;
        
        if (responseContainer) {
            responseContainer.innerHTML = `<div class="response-content">${mockResponse}</div>`;
        }
        if (generateButton) generateButton.disabled = false;
        console.log('[Generator] Mock response displayed.');
    }, 1500);
}


/**
 * ==================================================================================
 * AIME Event Handlers & Persistence (Simplified)
 * ==================================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    // Generate button handler
    const generateButton = document.getElementById('generate-button');
    if (generateButton) {
        generateButton.addEventListener('click', () => {
            const elementType = generateButton.dataset.elementType;
            if (elementType) {
                handleGenerationRequest(elementType);
            }
        });
    }

    // Clear button handler
    const clearButton = document.getElementById('clear-fields-button');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            const form = document.getElementById('traits-form');
            if (form) form.reset();
            document.querySelectorAll('.gem-button.active').forEach(btn => btn.classList.remove('active'));
            console.log('Fields cleared.');
        });
    }
});

