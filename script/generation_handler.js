/**
 * ==================================================================================
 * AIME Generation Event Handler
 * ==================================================================================
 * This script attaches the necessary event listeners to the "Generate" button.
 * ==================================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const generateButton = document.getElementById('generate-button');
    if (generateButton) {
        generateButton.addEventListener('click', () => {
            const elementType = generateButton.dataset.elementType;
            if (elementType) {
                handleGenerationRequest(elementType);
            } else {
                console.error('[Handler] Generate button is missing data-element-type attribute.');
            }
        });
    }
});
