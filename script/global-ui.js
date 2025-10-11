/*
    File: global-ui.js
    Reference: Handles global UI components like the settings modal
    Creator: Wolfe.BT, TangentLLC
*/

// --- Toast Notification Function ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000); // Toast disappears after 3 seconds
}


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
            showToast('API Key saved successfully!');
        } else {
            localStorage.removeItem('AIME_API_KEY');
            showToast('API Key cleared.', 'error');
        }
        checkApiKeyStatus();
        modalOverlay.classList.add('hidden');
    });

    viewKeyBtn.addEventListener('click', () => {
        apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    });
}

// --- AIME Guide Modal ---
function createGuideButton() {
    const headerLeft = document.querySelector('.main-header .header-left');
    if (!headerLeft) return;

    const guideBtn = document.createElement('button');
    guideBtn.id = 'guide-btn';
    guideBtn.className = 'guide-btn settings-btn'; // Reuse settings-btn style
    guideBtn.title = 'AIME User Manual & AI Crafting Guide';
    guideBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        headerLeft.insertBefore(guideBtn, settingsBtn);
    } else {
        headerLeft.appendChild(guideBtn);
    }
}


function initializeGuideModal() {
    const guideContent = `
        <h2>Our Mission: Elevating the Human Creator</h2>
        <p>Welcome to AIME (Artificial Intellect Musoikos Environ). Our philosophy is simple: <strong>we champion the human creator.</strong> AI should be a powerful instrument to amplify your ingenuity, not a substitute for it.</p>
        <p>In the current landscape, there are two paths for AI creation:</p>
        <ol>
            <li><strong>AI Slop:</strong> Raw, unedited, and often soulless output from a single, generic prompt. It is a product of automation, not creation. It's generic, lacks coherence, and is devoid of a unique authorial voice.</li>
            <li><strong>AI Craft:</strong> An intentional, collaborative process where a human creator directs the AI with skill and a clear vision. The result is not just more content, but <em>better stories</em> that remain uniquely and powerfully human.</li>
        </ol>
        <p>AIME is designed exclusively for <strong>AI Craft</strong>. It provides a structured environment where you, the creator, define the truth of your world, and the AI acts as your co-author, consistently adhering to your vision.</p>
        
        <h2>The AIME Ecosystem: An Overview</h2>
        <p>AIME is built on a core principle: <strong>context is everything</strong>. To achieve narrative consistency, the AI must understand the rules of your world. This is accomplished through two main components: the <strong>Element Forge</strong> and the <strong>Creative Hubs</strong>.</p>
        
        <h3>1. The Element Forge: Your Single Source of Truth</h3>
        <p>The <strong>Element Forge</strong> is where you build the foundational blocks of your universe. Each "Element" is a structured document that defines a specific part of your world. Think of this as creating a detailed "lore bible" that AIME will use as its reference for every creative task.</p>
        <p>By defining these Elements upfront, you ensure that every piece of content AIME generates—from a character's dialogue to a description of a city—is consistent with the rules you've established.</p>
        
        <h3>2. The Creative Hubs: Where Crafting Happens</h3>
        <p>The <strong>Creative Hubs</strong> are the workshops where you use your Elements to build your narrative. The primary hub for writers is the <strong>Story Weaver</strong>. Here, you don't just give the AI a simple prompt; you provide it with the relevant Elements from your Forge. This rich context is the secret to consistent and believable AI-assisted creation.</p>
        
        <h2>Deep Dive: The Element Forge Modules</h2>
        <p>The Element Forge is your starting point. Each module is designed to capture a different facet of your world.</p>
        <ul>
            <li><strong>Universe Crucible:</strong> The highest-level framework. Define the fundamental laws of reality, core genres, cosmic scope, and the nature of magic or power in your story. This is the "constitution" for your universe.</li>
            <li><strong>World Anvil:</strong> Forge a specific planet or realm. Detail its history, dominant cultures, societal structures, and major historical conflicts.</li>
            <li><strong>Setting Architect:</strong> Zoom in on a specific location within a World, like a city, a building, or a natural landmark. Describe its architecture, atmosphere, and key features.</li>
            <li><strong>Philosophy Scribe:</strong> Define the religions, belief systems, and societal creeds that shape your cultures and motivate your characters.</li>
            <li><strong>Faction Shaper:</strong> Create the organizations—governments, corporations, rebel groups, guilds—that drive conflict and cooperation.</li>
            <li><strong>Technology Forge:</strong> Design specific technologies, from magical artifacts to advanced AI, and define their function and societal impact.</li>
            <li><strong>Species Creator:</strong> Detail the biology, culture, and unique abilities of the various species that inhabit your world.</li>
            <li><strong>Persona Maker:</strong> Craft your individual characters. This is one of the most crucial elements. Define their personality, backstory, motivations, fears, and relationships.</li>
            <li><strong>Scene Builder:</strong> Construct the smallest narrative unit—a single event at a specific time and place, detailing the characters involved, the core conflict, and sensory details.</li>
        </ul>
        
        <h2>Deep Dive: The Story Weaver Workflow</h2>
        <p>The Story Weaver is a three-stage tool designed to guide your narrative from a fledgling idea to a polished draft. The key to its power is the <strong>Asset Hub</strong>, where you import your previously created Elements to serve as context for the AI.</p>
        
        <h3>Stage 1: Brainstorm</h3>
        <ul>
            <li><strong>Purpose:</strong> To generate high-level story concepts.</li>
            <li><strong>Your Action:</strong>
                <ol>
                    <li>Write a simple core idea in the prompt box (e.g., "a detective story on a generation ship").</li>
                    <li>In the <strong>Asset Hub</strong>, import high-level Elements like your <code>.universe</code> or <code>.world</code> files. These provide thematic and tonal guidance.</li>
                    <li>Select relevant <strong>Guidance Gems</strong> (e.g., Genre: "Noir", Tone: "Gritty").</li>
                </ol>
            </li>
            <li><strong>AIME's Role:</strong> AIME generates several distinct story concepts, each with a Title, Logline, and a summary paragraph, all tailored to the context you've provided.</li>
        </ul>

        <h3>Stage 2: Outline</h3>
         <ul>
            <li><strong>Purpose:</strong> To structure your narrative and define the key plot points.</li>
            <li><strong>Your Action:</strong>
                <ol>
                    <li>Select your favorite concept from the Brainstorm stage by clicking "Develop Outline."</li>
                    <li>Import more specific Elements into the <strong>Asset Hub</strong>: the <code>.persona</code> files for your main characters, the <code>.faction</code> they belong to, and the <code>.setting</code> where the story takes place.</li>
                    <li>Review the generated outline. You are in full control: <strong>drag and drop</strong> to reorder plot points, edit the text directly, or delete beats that don't work.</li>
                </ol>
            </li>
            <li><strong>AIME's Role:</strong> AIME generates a detailed, structured plot outline based on the chosen concept and the rich context of your imported Elements. You can also click "Suggest Plot Point" to have AIME intelligently propose the next logical step in your narrative.</li>
        </ul>

        <h3>Stage 3: Draft (Treatment)</h3>
         <ul>
            <li><strong>Purpose:</strong> To generate the full prose of your story.</li>
            <li><strong>Your Action:</strong>
                <ol>
                    <li>Once you are satisfied with your outline, click "Create Treatment."</li>
                    <li>The full, ordered outline now serves as the master prompt for the AI.</li>
                    <li>Once the draft is generated, you become the sculptor. Select any piece of text to use the floating toolbar to <strong>Rephrase, Shorten, Expand,</strong> or apply a custom instruction, refining the prose to match your authorial voice.</li>
                </ol>
            </li>
            <li><strong>AIME's Role:</strong> AIME writes a complete narrative draft by expanding on each plot point from your outline. Because it still has access to all your imported Elements, the characters' actions will align with their defined personalities, and descriptions will match your established world details.</li>
        </ul>
    `;

    const modalContainer = document.createElement('div');
    modalContainer.id = 'guide-modal-overlay';
    modalContainer.className = 'modal-overlay hidden';
    modalContainer.innerHTML = `
        <div class="modal-content glass-panel guide-modal-content">
            <div class="modal-header">
                <h3>AIME User Manual & The Art of AI Crafting</h3>
                <button id="guide-modal-close-btn" class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body guide-modal-body">
                ${guideContent}
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);

    const guideBtn = document.getElementById('guide-btn');
    const modalOverlay = document.getElementById('guide-modal-overlay');
    const closeBtn = document.getElementById('guide-modal-close-btn');

    if (guideBtn && modalOverlay && closeBtn) {
        guideBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('hidden');
        });
        closeBtn.addEventListener('click', () => {
            modalOverlay.classList.add('hidden');
        });
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.add('hidden');
            }
        });
    }
}


// --- Auto-Expanding Textareas ---
function initializeAutoExpandingTextareas() {
    // Use event delegation on the document body to catch input events on any textarea
    document.body.addEventListener('input', event => {
        if (event.target.tagName.toLowerCase() === 'textarea') {
            const textarea = event.target;
            // Temporarily reset height to auto to get the correct scrollHeight
            textarea.style.height = 'auto';
            // Set the height to the scrollHeight to fit the content
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    });

    // Initial resize for any textareas that might have content on page load
    document.querySelectorAll('textarea').forEach(textarea => {
        // Only resize if there is actual content, not just a placeholder
        if (textarea.value) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    });
}

// --- AIME Chatbot ---

// 1. Function to create and inject the AIME button
function createAimeButton() {
    const header = document.querySelector('.main-header .header-left');
    if (!header) return;

    const aimeBtn = document.createElement('button');
    aimeBtn.id = 'aime-chat-btn';
    aimeBtn.className = 'aime-chat-btn';
    aimeBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sparkles"><path d="M12 3a6 6 0 0 0-6 6v6a6 6 0 0 0 6 6Z"/><path d="M12 3a6 6 0 0 1 6 6v6a6 6 0 0 1-6 6Z"/><path d="M12 3v18"/></svg>
        <span>AIME</span>
    `;

    // Insert it after the logo
    const logo = header.querySelector('.logo-title');
    if (logo && logo.nextSibling) {
        header.insertBefore(aimeBtn, logo.nextSibling);
    } else {
        header.appendChild(aimeBtn);
    }
}


// 2. Function to create and inject the AIME modal HTML
function createAimeModal() {
    const modalHtml = `
        <div id="aime-chat-modal" class="aime-chat-modal hidden">
            <div class="under-construction-banner">UNDER CONSTRUCTION</div>
            <div id="aime-chat-header" class="aime-chat-header">
                <span class="aime-chat-title">AIME Co-Author</span>
                <button id="aime-chat-close-btn" class="aime-chat-close-btn">&times;</button>
            </div>
            <div id="aime-chat-body" class="aime-chat-body">
                <div id="aime-chat-messages" class="aime-chat-messages">
                    <!-- Messages will be injected here -->
                </div>
                <div class="aime-chat-input-area">
                    <textarea id="aime-chat-input" class="aime-chat-input" placeholder="Ask AIME anything..." rows="1"></textarea>
                    <button id="aime-chat-send-btn" class="aime-chat-send-btn">Send</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// 3. Main function to initialize all chatbot functionality
function initializeAimeChatbot() {
    const chatBtn = document.getElementById('aime-chat-btn');
    const modal = document.getElementById('aime-chat-modal');
    const closeBtn = document.getElementById('aime-chat-close-btn');
    const sendBtn = document.getElementById('aime-chat-send-btn');
    const input = document.getElementById('aime-chat-input');
    const messagesContainer = document.getElementById('aime-chat-messages');

    if (!chatBtn || !modal || !closeBtn || !sendBtn || !input || !messagesContainer) {
        return;
    }

    // --- Modal Visibility ---
    chatBtn.addEventListener('click', () => modal.classList.remove('hidden'));
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

    // --- Draggable Modal ---
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    const modalHeader = document.getElementById('aime-chat-header');

    modalHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        offset.x = e.clientX - modal.offsetLeft;
        offset.y = e.clientY - modal.offsetTop;
        modalHeader.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        modal.style.left = `${e.clientX - offset.x}px`;
        modal.style.top = `${e.clientY - offset.y}px`;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        modalHeader.style.cursor = 'grab';
    });

    // --- Send Message ---
    const sendMessage = async () => {
        const message = input.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        input.value = '';
        input.style.height = 'auto'; // Reset height
        setLoadingState(true);

        const context = gatherPageContext();
        const apiKey = localStorage.getItem('AIME_API_KEY');

        try {
            const response = await fetch('http://127.0.0.1:5001/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-AIME-API-Key': apiKey || '',
                },
                body: JSON.stringify({ message, context }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get a response.');
            }

            const data = await response.json();
            addMessage(data.reply, 'aime');

        } catch (error) {
            // Check for a specific API key error message from the server
            if (error.message && error.message.toLowerCase().includes('api key')) {
                addMessage('Error: API Key is missing, invalid, or not configured on the server. Please add a valid key in the Settings menu.', 'error');
            } else {
                addMessage(`Error: ${error.message}`, 'error');
            }
        } finally {
            setLoadingState(false);
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // --- Helper Functions ---
    function addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `aime-chat-message ${sender}`;
        // Basic markdown-to-HTML conversion
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
        formattedText = formattedText.replace(/\*([^\*]+)\*/g, '<em>$1</em>');     // Italics
        formattedText = formattedText.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>'); // Code blocks
        formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>'); // Inline code
        messageElement.innerHTML = formattedText;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto-scroll
    }

    function setLoadingState(isLoading) {
        sendBtn.disabled = isLoading;
        input.disabled = isLoading;
        if (isLoading) {
            addMessage('AIME is thinking...', 'loading');
        } else {
            const loadingMessage = messagesContainer.querySelector('.loading');
            if (loadingMessage) {
                loadingMessage.remove();
            }
        }
    }

    function gatherPageContext() {
        // This is a simple context gathering function. It can be made more sophisticated.
        const title = document.title || 'No title';
        const h1 = document.querySelector('h1')?.textContent || '';
        const elementTitle = document.querySelector('.element-title')?.textContent || '';
        const activeTab = document.querySelector('.writer-nav-button.active')?.textContent || document.querySelector('.element-nav-button.active')?.textContent || '';

        let context = `Page Title: ${title}\n`;
        if (h1) context += `Main Heading: ${h1}\n`;
        if (elementTitle) context += `Element: ${elementTitle}\n`;
        if (activeTab) context += `Active Tab: ${activeTab}\n`;

        // Gather content from input fields
        const inputs = document.querySelectorAll('.input-field, .writing-canvas');
        inputs.forEach(input => {
            if(input.value && input.id !== 'aime-chat-input') {
                const label = input.previousElementSibling?.textContent || input.placeholder || input.id;
                context += `${label}: ${input.value.substring(0, 200)}\n`; // Limit length
            }
        });

        return context;
    }
}


// --- Global Mobile Menu ---
function initializeGlobalMobileMenu() {
    const headerLeft = document.querySelector('.main-header .header-left');
    const sideColumn = document.querySelector('.side-column');
    const mainColumn = document.querySelector('.main-column');

    // Only run on pages that have the workspace layout
    if (!headerLeft || !sideColumn || !mainColumn) return;

    // 1. Create the button
    const toggleButton = document.createElement('button');
    toggleButton.id = 'mobile-menu-toggle';
    toggleButton.className = 'mobile-menu-toggle-btn';
    // Use a standard hamburger icon SVG
    toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;

    // 2. Inject the button as the first item in the header's left container
    headerLeft.insertBefore(toggleButton, headerLeft.firstChild);

    // 3. Event Listeners
    toggleButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from bubbling to other elements
        sideColumn.classList.toggle('is-open');
    });

    // Close menu if clicking on the main content area
    mainColumn.addEventListener('click', () => {
        if (sideColumn.classList.contains('is-open')) {
            sideColumn.classList.remove('is-open');
        }
    });

    // Close menu if a major action button is clicked within the side column for better UX
    sideColumn.addEventListener('click', (e) => {
        if (e.target.matches('.action-btn, .generate-btn-large, .save-btn-large, .import-btn, .gem-category-button')) {
            sideColumn.classList.remove('is-open');
        }
    });
}


// Initialize all global UI components when the page content is loaded.
document.addEventListener('DOMContentLoaded', () => {
    initializeSettingsModal();
    checkApiKeyStatus();
    initializeAutoExpandingTextareas();
    initializeGlobalMobileMenu(); // Add mobile menu initialization

    // Initialize Guide Modal
    createGuideButton();
    initializeGuideModal();

    // Initialize Chatbot
    // createAimeButton();
    createAimeModal();
    initializeAimeChatbot();
});

