/**
 * ==================================================================================
 * AIME Form Persistence Logic
 * ==================================================================================
 * This script handles saving form data to localStorage to prevent data loss.
 * ==================================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const pageKey = `aime-data-${window.location.pathname}`;
    const form = document.querySelector('.element-form');
    const clearButton = document.getElementById('clear-fields-button');

    if (form) {
        loadFormData(pageKey);
        form.addEventListener('input', () => saveFormData(pageKey));
        const guidanceContainer = document.getElementById('guidance-gems-container');
        if (guidanceContainer) {
            guidanceContainer.addEventListener('click', () => setTimeout(() => saveFormData(pageKey), 100));
        }
    }

    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm("Are you sure you want to clear all fields on this page? This cannot be undone.")) {
                clearFormData(pageKey);
            }
        });
    }
});

function saveFormData(key) {
    try {
        const dataToSave = {
            guidance: parseGuidanceGems(),
            traits: parseTraitsData(),
        };
        localStorage.setItem(key, JSON.stringify(dataToSave));
        console.log(`[Persistence] Data saved for key: ${key}`);
    } catch (error) {
        console.error("[Persistence] Error saving data:", error);
    }
}

function loadFormData(key) {
    try {
        const savedData = localStorage.getItem(key);
        if (savedData) {
            const data = JSON.parse(savedData);
            console.log(`[Persistence] Loading data for key: ${key}`, data);

            if (data.traits) {
                for (const [id, value] of Object.entries(data.traits)) {
                    const input = document.getElementById(id);
                    if (input) input.value = value;
                }
            }

            if (data.guidance) {
                for (const [gemType, optionValue] of Object.entries(data.guidance)) {
                     const gem = document.querySelector(`.gem[data-gem-type="${gemType}"]`);
                     if (gem) {
                         const optionButton = Array.from(gem.querySelectorAll('.gem-button')).find(btn => btn.textContent.trim() === optionValue);
                         if (optionButton) {
                             gem.querySelectorAll('.gem-button.active').forEach(b => b.classList.remove('active'));
                             optionButton.classList.add('active');
                         }
                     }
                }
            }
             console.log("[Persistence] Form data successfully loaded.");
        }
    } catch (error) {
        console.error("[Persistence] Error loading data:", error);
    }
}

function clearFormData(key) {
    try {
        const form = document.querySelector('.element-form');
        if (form) {
            form.reset();
            form.querySelectorAll('textarea').forEach(ta => ta.value = '');
        }
        document.querySelectorAll('.gem-button.active').forEach(button => button.classList.remove('active'));
        localStorage.removeItem(key);
        
        const responseContainer = document.getElementById('response-container');
        if(responseContainer) {
            responseContainer.innerHTML = '';
            responseContainer.style.display = 'none';
        }
        alert("All fields for this element have been cleared.");
        console.log(`[Persistence] Data cleared for key: ${key}`);
    } catch (error) {
        console.error("[Persistence] Error clearing data:", error);
    }
}
