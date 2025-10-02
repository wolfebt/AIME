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


// Initialize all global UI components when the page content is loaded.
document.addEventListener('DOMContentLoaded', () => {
    initializeSettingsModal();
    checkApiKeyStatus();
    initializeAutoExpandingTextareas();

    // Initialize Chatbot
    createAimeButton();
    createAimeModal();
    initializeAimeChatbot();
});

