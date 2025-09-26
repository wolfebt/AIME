/*
    File: settings.js
    Reference: Settings Modal Logic
    Creator: Wolfe.BT, TangentLLC
*/

document.addEventListener('DOMContentLoaded', () => {
    const settingsBtn = document.getElementById('settings-btn');
    const modalOverlay = document.getElementById('settings-modal-overlay');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const apiKeyInput = document.getElementById('api-key-input');

    // --- Event Listeners ---
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            modalOverlay.classList.add('active');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }

    // Close modal if user clicks on the overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    // Save the API Key
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                localStorage.setItem('gemini_api_key', apiKey);
                alert('API Key saved successfully!');
                modalOverlay.classList.remove('active');
            } else {
                alert('Please enter a valid API Key.');
            }
        });
    }

    // Load existing API key into the input field when the modal is opened
    if (settingsBtn && apiKeyInput) {
        settingsBtn.addEventListener('click', () => {
            const savedKey = localStorage.getItem('gemini_api_key');
            if (savedKey) {
                apiKeyInput.value = savedKey;
            }
        });
    }
});