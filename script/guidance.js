/**
 * ==================================================================================
 * AIME Guidance Gems Logic
 * ==================================================================================
 * This script dynamically creates and manages the interactive "Guidance Gems".
 * ==================================================================================
 */

const guidanceData = {
    Genre: ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Horror', 'Mystery', 'Romance', 'Thriller'],
    Tone: ['Serious', 'Humorous', 'Formal', 'Informal', 'Optimistic', 'Pessimistic', 'Joyful', 'Sad', 'Hopeful', 'Cynical'],
    Pacing: ['Fast-paced', 'Slow-burn', 'Steady', 'Urgent', 'Relaxed', 'Meditative'],
    'Point of View': ['First Person', 'Third Person Limited', 'Third Person Omniscient', 'Second Person'],
    'Literary Devices': ['Metaphor', 'Simile', 'Personification', 'Alliteration', 'Symbolism', 'Irony', 'Foreshadowing'],
    Structure: ['Linear', 'Non-linear', 'Episodic', 'In Medias Res', 'Frame Story']
};

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('guidance-gems-container');
    if (container) {
        Object.entries(guidanceData).forEach(([title, options]) => {
            const gemType = title.replace(/\s+/g, '-').toLowerCase();
            const gemElement = document.createElement('div');
            gemElement.className = 'gem';
            gemElement.dataset.gemType = title;

            const titleElement = document.createElement('h4');
            titleElement.className = 'gem-title';
            titleElement.textContent = title;

            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'gem-options';

            options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'gem-button';
                button.textContent = option;
                button.addEventListener('click', () => {
                    const siblings = optionsContainer.querySelectorAll('.gem-button');
                    siblings.forEach(sib => {
                        if (sib !== button) sib.classList.remove('active');
                    });
                    button.classList.toggle('active');
                });
                optionsContainer.appendChild(button);
            });

            gemElement.appendChild(titleElement);
            gemElement.appendChild(optionsContainer);
            container.appendChild(gemElement);
        });
    }
});
