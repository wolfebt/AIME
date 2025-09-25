/**
 * ==================================================================================
 * AIME Writer Tab Logic
 * ==================================================================================
 * Handles the tab switching for the "Story Weaver" interface.
 * ==================================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    const writerNavButtons = document.querySelectorAll('.writer-nav-button');
    const writerTabs = document.querySelectorAll('.writer-tab');

    writerNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            writerNavButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            writerTabs.forEach(tab => {
                tab.classList.toggle('active', tab.id === targetTab);
            });
        });
    });
});
