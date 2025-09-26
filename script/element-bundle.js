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

async function runGenerator(prompt) {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
        return '<p style="padding: 1rem; color: var(--error-text);">Error: API Key not found. Please set your Google Gemini API key in the settings.</p>';
    }

    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    const requestBody = {
        contents: [{
            parts: [{ "text": prompt }]
        }]
    };

    try {
        const response = await fetch(`${API_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            return `<p style="padding: 1rem; color: var(--error-text);">API Error: ${errorData.error.message}</p>`;
        }

        const data = await response.json();

        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            // Using a simple regex to format the text for better readability
            let formattedText = data.candidates[0].content.parts[0].text;
            formattedText = formattedText.replace(/\n/g, '<br>');
            return `<div style="padding: 1rem;">${formattedText}</div>`;
        } else {
            console.error("Invalid response structure:", data);
            return '<p style="padding: 1rem; color: var(--error-text);">Error: Received an invalid response from the AI. Check the console for details.</p>';
        }

    } catch (error) {
        console.error("Network or other error:", error);
        return `<p style="padding: 1rem; color: var(--error-text);">Error: Could not connect to the AI service. Check your network connection and console for details.</p>`;
    }
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