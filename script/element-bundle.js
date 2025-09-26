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
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', stopResizing);
    });

    function stopResizing() {
        isResizing = false;
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', stopResizing);
    }

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
    document.querySelectorAll('.accordion .accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const chevron = header.querySelector('.accordion-chevron');
            const isOpen = header.classList.toggle('active');

            if (chevron) {
                chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            }
            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + 48 + "px";
                content.style.padding = '1.5rem';
            } else {
                content.style.maxHeight = null;
                content.style.padding = '0 1.5rem';
            }
        });
    });
}

// --- Asset Hub (REWRITTEN & STABLE) ---
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
        fileInput.value = ''; // Reset input
    });
}

function addAssetToList(file, assetList) {
    const assetItem = document.createElement('div');
    assetItem.className = 'asset-item';
    assetItem.dataset.filename = file.name; // Store filename

    const assetInfo = document.createElement('div');
    assetInfo.className = 'asset-info';

    if (file.type.startsWith('image/')) {
        const thumbnail = document.createElement('img');
        const imageURL = URL.createObjectURL(file);
        thumbnail.src = imageURL;
        thumbnail.className = 'asset-thumbnail';
        // Revoke the URL after the image is loaded to free up memory,
        // but the browser will still display the cached image.
        thumbnail.onload = () => URL.revokeObjectURL(imageURL);
        assetInfo.prepend(thumbnail);
    } else {
        const textIcon = document.createElement('div');
        textIcon.className = 'asset-icon-text';
        textIcon.textContent = 'TXT';
        assetInfo.prepend(textIcon);

        if (file.type.startsWith('text/') || file.type === "application/json") {
            const reader = new FileReader();
            reader.onload = (e) => {
                assetItem.dataset.content = e.target.result;
                console.log(`Content of ${file.name} stored.`);
            };
            reader.onerror = () => console.error(`Error reading ${file.name}`);
            reader.readAsText(file);
        }
    }

    const assetName = document.createElement('span');
    assetName.className = 'asset-name';
    assetName.textContent = file.name;
    assetInfo.appendChild(assetName);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-asset-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.onclick = () => {
        // Before removing, check for and revoke any object URLs to prevent memory leaks
        const thumbnail = assetItem.querySelector('.asset-thumbnail');
        if (thumbnail && thumbnail.src.startsWith('blob:')) {
            URL.revokeObjectURL(thumbnail.src);
        }
        assetItem.remove();
    };

    assetItem.appendChild(assetInfo);
    assetItem.appendChild(removeBtn);
    assetList.appendChild(assetItem);
}


// --- Guidance Gems (Placeholder for Element Pages) ---
function initializeGuidanceGems() {
    const container = document.getElementById('guidance-gems-container');
    if (container) {
        container.innerHTML = '<p style="padding: 1.5rem; color: var(--medium-text);">Guidance Gem options will be available here.</p>';
    }
}

// --- AI Pipeline ---

function craftSuperPrompt() {
    const form = document.getElementById('traits-form');
    if (!form) {
        console.error("Could not find the 'traits-form'.");
        return null;
    }

    let prompt = "## Persona Profile\n\n";

    const inputs = form.querySelectorAll('.input-field');
    inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (input.value.trim() !== '') {
            prompt += `**${label ? label.textContent : input.id}:** ${input.value}\n`;
        }
    });

    const assetItems = document.querySelectorAll('#asset-list .asset-item');
    if (assetItems.length > 0) {
        prompt += "\n## Contextual Assets\n\n";
        assetItems.forEach(item => {
            if (item.dataset.content) {
                prompt += `### Asset: ${item.dataset.filename}\n`;
                prompt += `${item.dataset.content}\n\n`;
            }
        });
    }

    return prompt;
}

function runGenerator(prompt) {
    console.log("--- Running Generator with Super-Prompt ---");
    console.log(prompt);

    // --- Mock AI Response ---
    // This section simulates a call to an external AI service.
    // To implement a real AI, replace this mock logic with an actual API call.
    /*
    try {
        const response = await fetch('YOUR_AI_API_ENDPOINT', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.choices[0].text; // Adjust based on your API's response structure
    } catch (error) {
        console.error("AI Generation Failed:", error);
        return `<p style="color:var(--error-text);">Error: AI generation failed.</p>`;
    }
    */

    const mockResponse = `
        <p><strong>Analysis Complete.</strong> Based on the provided Persona Profile and contextual assets, here is a generated narrative scene:</p>
        <p>Captain Eva Rostova stood on the bridge of the *Wanderer*, the star-dusted abyss reflected in her cybernetic eye. The ship groaned, a familiar complaint from a vessel that, like her, had seen too many battles. Her hand instinctively went to the worn photo she kept tucked in her jacket, a relic of a life before the K'tharr invasion—a life she had failed to protect. The incoming transmission from the Rebel outpost crackled, their plea echoing the same desperation she felt all those years ago. This time, however, would be different. This time, she wouldn't fail.</p>
    `;

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockResponse);
        }, 1200); // Simulate network latency
    });
}

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    initializeResizableColumns();
    initializeAccordions();
    initializeAssetImporter();
    initializeGuidanceGems();

    const generateButton = document.getElementById('generate-button');
    const responseContainer = document.getElementById('response-container');
    const assetList = document.getElementById('asset-list');

    if (generateButton && responseContainer) {
        generateButton.addEventListener('click', async () => {
            responseContainer.innerHTML = '<p style="padding: 1rem;">Generating response...</p>';

            const prompt = craftSuperPrompt();
            if (prompt) {
                const result = await runGenerator(prompt);
                responseContainer.innerHTML = result;
            } else {
                responseContainer.innerHTML = '<p style="padding: 1rem; color: var(--error-text);">Could not generate prompt. Please fill out some fields.</p>';
            }
        });
    }

    const clearButton = document.getElementById('clear-fields-button');
    if(clearButton) {
        clearButton.addEventListener('click', () => {
            // Clear all form inputs
            document.querySelectorAll('.main-column .input-field').forEach(input => input.value = '');

            // Clear the response container
            if(responseContainer) {
                responseContainer.innerHTML = '';
            }

            // Clear the asset hub and revoke any object URLs to prevent memory leaks
            if (assetList) {
                assetList.querySelectorAll('.asset-thumbnail').forEach(thumb => {
                    if (thumb.src.startsWith('blob:')) {
                        URL.revokeObjectURL(thumb.src);
                    }
                });
                assetList.innerHTML = '';
            }
        });
    }
});