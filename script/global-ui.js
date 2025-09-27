/*
    File: global-ui.js
    Reference: Handles global UI components like the settings modal
    Creator: Wolfe.BT, TangentLLC
*/

function initializeSettingsModal() {
    const settingsBtn = document.getElementById('settings-btn');
    const modalOverlay = document.getElementById('settings-modal-overlay');
    const closeBtn = document.getElementById('modal-close-btn');
    const saveBtn = document.getElementById('modal-save-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    const viewKeyBtn = document.getElementById('view-api-key');

    if (!settingsBtn || !modalOverlay || !closeBtn || !saveBtn || !apiKeyInput) return;

    // Load saved key on modal open
    const openModal = () => {
        const savedKey = localStorage.getItem('AIME_API_KEY');
        if (savedKey) {
            apiKeyInput.value = savedKey;
        } else {
            apiKeyInput.value = '';
        }
        apiKeyInput.type = 'password'; // Ensure it's always masked on open
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
            // Using a custom, non-blocking notification would be better in a real app
            alert('API Key saved successfully!');
        } else {
            localStorage.removeItem('AIME_API_KEY');
            alert('API Key cleared.');
        }
        closeModal();
    });

    // Toggle visibility of the API key
    viewKeyBtn.addEventListener('click', () => {
        if (apiKeyInput.type === 'password') {
            apiKeyInput.type = 'text';
        } else {
            apiKeyInput.type = 'password';
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeSettingsModal();
});

