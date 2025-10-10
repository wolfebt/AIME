/*
    File: global-ui.js
    Reference: Handles global UI components like the settings modal
    Creator: Wolfe.BT, TangentLLC
*/

// --- API Key Status Check ---
function checkApiKeyStatus() {
    const settingsBtn = document.getElementById('settings-btn');
    if (!settingsBtn) return;

    const savedKey = localStorage.getItem('AIME_API_KEY');
    if (savedKey) {
        settingsBtn.classList.remove('needs-key');
    } else {
        settingsBtn.classList.add('needs-key');
    }
}

// --- Settings Modal Logic ---
function initializeSettingsModal() {
    const settingsBtn = document.getElementById('settings-btn');
    const modalOverlay = document.getElementById('settings-modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');
    const saveBtn = document.getElementById('modal-save-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const viewKeyBtn = document.getElementById('view-api-key');

    if (!settingsBtn || !modalOverlay || !closeBtn || !saveBtn || !apiKeyInput) return;

    const openModal = () => {
        const savedKey = localStorage.getItem('AIME_API_KEY');
        if (savedKey) {
            apiKeyInput.value = savedKey;
        } else {
            apiKeyInput.value = '';
        }
        apiKeyInput.type = 'password';
        modalOverlay.classList.remove('hidden');
    };

    const closeModal = () => {
        modalOverlay.classList.add('hidden');
    };

    settingsBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeModal();
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
        checkApiKeyStatus(); // Re-check status after saving/clearing
        closeModal();
    });

    viewKeyBtn.addEventListener('click', () => {
        apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    });
}

// --- DOMContentLoaded Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    initializeSettingsModal();
    checkApiKeyStatus(); // Initial check on page load
});