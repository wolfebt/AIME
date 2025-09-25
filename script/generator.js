/**
 * ==================================================================================
 * AIME Generation Orchestrator
 * ==================================================================================
 * This script is the central hub for handling content generation requests. It
 * now handles both initial generation and refinement requests.
 * ==================================================================================
 */

let lastSuperPrompt = '';

async function handleGenerationRequest(elementType, refinementData = null) {
    console.log(`[Generator] Initiating request. Type: ${refinementData ? 'Refinement' : 'Initial Generation'}`);
    const generateButton = document.getElementById('generate-button');
    const responseContainer = document.getElementById('response-container');

    if (generateButton) generateButton.disabled = true;
    if (refinementData) {
        responseContainer.style.opacity = '0.5';
    } else {
        if (generateButton) generateButton.textContent = 'Crafting...';
        responseContainer.innerHTML = '<div class="loading-spinner"></div>';
        responseContainer.style.display = 'block';
    }

    try {
        let promptForApi;
        if (refinementData) {
            if (!lastSuperPrompt) throw new Error("Cannot refine without a successful initial generation.");
            promptForApi = craftRefinementPrompt(lastSuperPrompt, refinementData);
        } else {
            const elementData = parseAllElementData(elementType);
            promptForApi = craftSuperPrompt(elementData);
            lastSuperPrompt = promptForApi;
        }
        console.log('[Generator] Prompt crafted successfully:\n---PROMPT START---\n', promptForApi, '\n---PROMPT END---');

        const aiResponse = await mockCallToGeminiAPI(promptForApi, refinementData);
        console.log('[Generator] Response received.');

        if (refinementData) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                selection.getRangeAt(0).deleteContents();
                selection.getRangeAt(0).insertNode(document.createTextNode(aiResponse));
            }
        } else {
            responseContainer.innerHTML = `<div class="response-content" contenteditable="true">${aiResponse}</div>`;
        }

    } catch (error) {
        console.error('[Generator] An error occurred during the generation process:', error);
        if (!refinementData) {
            responseContainer.innerHTML = `<div class="error-message">Failed to generate content. Please check console.</div>`;
        }
    } finally {
        if (generateButton) generateButton.disabled = false;
        if (!refinementData && generateButton) generateButton.textContent = 'Generate';
        responseContainer.style.opacity = '1';
    }
}

function mockCallToGeminiAPI(prompt, refinementData = null) {
    return new Promise(resolve => {
        setTimeout(() => {
            if (refinementData) {
                resolve(`~*${refinementData.command.toUpperCase()}*~ ${refinementData.selectedText} ~*REFINED*~`);
            } else if (prompt.includes('<PRIMARY_ELEMENT TYPE="SCENE">')) {
                resolve(`The low hum of the Starship Venture's engines was the only sound on the bridge. Captain Eva Rostova stood motionless, her reflection staring back from the dark viewport. The silence was broken by the hiss of the door and the heavy footsteps of Admiral Thorne. He didn't look at her, his eyes fixed on the data slate glowing ominously on the main console. Inside that slate was Project Chimera, the secret that had shattered a lifelong friendship.`);
            } else {
                resolve(`Based on the detailed context you provided, here is the generated narrative content. This text is now editable. You can select any portion of it to access the refinement tools.`);
            }
        }, 1500);
    });
}
