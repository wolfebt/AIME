/*
    File: settings.js
    Reference: Global Settings Modal Logic
    Creator: Wolfe.BT, TangentLLC
*/

document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    const modalOverlay = document.getElementById('settings-modal-overlay');

    // If the settings button doesn't exist on this page, do nothing.
    if (!settingsBtn || !modalOverlay) {
        return;
    }

    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const apiKeyInput = document.getElementById('api-key-input');

    function checkApiKeyStatus() {
        const savedKey = localStorage.getItem('gemini_api_key');
        if (!savedKey) {
            settingsBtn.classList.add('no-key');
        } else {
            settingsBtn.classList.remove('no-key');
        }
    }

    // --- Event Listeners ---
    settingsBtn.addEventListener('click', () => {
        // Load existing API key into the input field when the modal is opened
        const savedKey = localStorage.getItem('gemini_api_key');
        if (savedKey) {
            apiKeyInput.value = savedKey;
        }
        modalOverlay.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    // Close modal if user clicks on the overlay
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });

    // Save the API Key
    saveSettingsBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('gemini_api_key', apiKey);
            checkApiKeyStatus(); // Re-check status to remove border
            alert('API Key saved successfully!');
            modalOverlay.classList.remove('active');
        } else {
            alert('Please enter a valid API Key.');
        }
    });

    // Initial check when the page loads
    checkApiKeyStatus();
});