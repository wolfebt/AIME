/*
    File: global-ui.js
    Reference: Handles global UI components like the settings modal
    Creator: Wolfe.BT, TangentLLC
*/

// This function checks for the API key and updates the settings button's class for styling.
function checkApiKeyStatus() {
    const settingsBtn = document.getElementById('settings-btn');
    if (!settingsBtn) return; // Exit if the button isn't on the page

    const savedKey = localStorage.getItem('AIME_API_KEY');
    if (savedKey) {
        settingsBtn.classList.add('has-key');
        settingsBtn.classList.remove('needs-key');
    } else {
        settingsBtn.classList.add('needs-key');
        settingsBtn.classList.remove('has-key');
    }
}

// This function handles opening, closing, and saving data for the settings modal.
function initializeSettingsModal() {
    const settingsBtn = document.getElementById('settings-btn');
    const modalOverlay = document.getElementById('settings-modal-overlay');
    
    // Robustly check if all required modal elements exist before proceeding.
    if (!settingsBtn || !modalOverlay) return;

    const closeBtn = document.getElementById('modal-close-btn');
    const saveBtn = document.getElementById('modal-save-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const viewKeyBtn = document.getElementById('view-api-key');

    if (!closeBtn || !saveBtn || !apiKeyInput || !viewKeyBtn) return;

    // Event Listeners
    settingsBtn.addEventListener('click', () => {
        const savedKey = localStorage.getItem('AIME_API_KEY');
        apiKeyInput.value = savedKey || '';
        apiKeyInput.type = 'password';
        modalOverlay.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => modalOverlay.classList.add('hidden'));

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.add('hidden');
        }
    });

    saveBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem('AIME_API_KEY', key);
            alert('API Key saved successfully!');
        } else {
            localStorage.removeItem('AIME_API_KEY');
            alert('API Key cleared.');
        }
        checkApiKeyStatus();
        modalOverlay.classList.add('hidden');
    });

    viewKeyBtn.addEventListener('click', () => {
        apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    });
}

// Initialize all global UI components when the page content is loaded.
document.addEventListener('DOMContentLoaded', () => {
    initializeSettingsModal();
    checkApiKeyStatus();
});
