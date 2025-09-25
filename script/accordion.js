/**
 * ==================================================================================
 * AIME Accordion Logic
 * ==================================================================================
 * Handles the expand/collapse functionality for all accordion components.
 * ==================================================================================
 */
document.addEventListener('DOMContentLoaded', () => {
    const accordions = document.querySelectorAll('.accordion');

    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        const content = accordion.querySelector('.accordion-content');

        header.addEventListener('click', () => {
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
