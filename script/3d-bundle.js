/**
 * File: 3d-bundle.js
 * Reference: 3D Workshop Logic
 * Creator: Wolfe.BT, TangentLLC
 */

/**
 * ==================================================================================
 * AIME Accordion Logic
 * ==================================================================================
 * Handles the expand/collapse functionality for all accordion components.
 * ==================================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.accordion .accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('active');
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                 content.style.padding = '0 1.5rem';
            } else {
                content.style.padding = '1.5rem';
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});

