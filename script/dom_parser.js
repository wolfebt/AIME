/**
 * ==================================================================================
 * AIME DOM Parser
 * ==================================================================================
 * This script is responsible for reading the current state of the user's inputs
 * from the HTML forms and structuring that data into a JavaScript object.
 * ==================================================================================
 */

function parseAllElementData(elementType) {
    return {
        primaryElementType: elementType.toUpperCase(),
        guidance: parseGuidanceGems(),
        traits: parseTraitsData(),
        assets: parseAssetHub()
    };
}

function parseGuidanceGems() {
    const guidance = {};
    const gemButtons = document.querySelectorAll('.gem-button.active');
    gemButtons.forEach(button => {
        const gemType = button.closest('.gem').dataset.gemType;
        const optionValue = button.textContent.trim();
        guidance[gemType] = optionValue;
    });
    return guidance;
}

function parseTraitsData() {
    const traits = {};
    const inputs = document.querySelectorAll('#traits-form .input-field');
    inputs.forEach(input => {
        const key = input.id;
        traits[key] = input.value.trim();
    });
    return traits;
}

function parseAssetHub() {
    const assets = [];
    const assetItems = document.querySelectorAll('#asset-list .asset-item');
    assetItems.forEach(item => {
        const mockContent = item.dataset.mockContent ? JSON.parse(item.dataset.mockContent) : {};
        assets.push({
            fileName: item.querySelector('.asset-name').textContent.trim(),
            elementType: item.dataset.elementType,
            importance: item.querySelector('.importance-select').value,
            note: item.querySelector('.note-input').value.trim(),
            content: mockContent
        });
    });
    return assets;
}
