/**
 * ==================================================================================
 * AIME Refinement Canvas Logic
 * ==================================================================================
 * This script handles user interaction with the AI-generated text.
 * ==================================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const responseContainer = document.getElementById('response-container');
    const refinementMenu = document.getElementById('refinement-menu');

    if (responseContainer && refinementMenu) {
        responseContainer.addEventListener('mouseup', handleTextSelection);
        document.addEventListener('mousedown', (e) => {
            if (!refinementMenu.contains(e.target)) {
                refinementMenu.style.display = 'none';
            }
        });
        setupRefinementButtonListeners();
    }
});

function handleTextSelection(event) {
    const selection = window.getSelection();
    if (selection.toString().trim().length > 0 && event.target.classList.contains('response-content')) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const menu = document.getElementById('refinement-menu');
        menu.style.display = 'flex';
        menu.style.left = `${rect.left + window.scrollX}px`;
        menu.style.top = `${rect.bottom + window.scrollY + 8}px`;
    }
}

function setupRefinementButtonListeners() {
    const menu = document.getElementById('refinement-menu');
    if (!menu) return;

    const actions = ['rewrite', 'expand', 'shorten'];
    actions.forEach(action => {
        const button = menu.querySelector(`[data-action="${action}"]`);
        button.addEventListener('click', () => {
            triggerRefinement(action);
            menu.style.display = 'none';
        });
    });

    const toneOptions = menu.querySelectorAll('.tone-option-button');
    toneOptions.forEach(button => {
        button.addEventListener('click', () => {
            const tone = button.dataset.tone;
            triggerRefinement('change_tone', tone);
            menu.style.display = 'none';
        });
    });
}

function triggerRefinement(command, detail = null) {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    const fullText = document.querySelector('.response-content').textContent;

    if (selectedText.length === 0) return;

    const refinementData = { command, detail, fullText, selectedText };
    const elementType = document.getElementById('generate-button').dataset.elementType;
    handleGenerationRequest(elementType, refinementData);
}
