document.body.innerHTML = `
    <div class="setup-overlay" id="setupOverlay">
        <div class="setup-container">
            <div class="setup-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <span class="progress-text" id="progressText">Step 1 of 3</span>
            </div>
            
            <div class="setup-step" id="languageStep">
                <h2>Welcome! Please choose your preferred language:</h2>
                <div class="setup-options">
                    <button class="setup-option" data-language="ar">
                        <span class="option-text">عربي</span>
                        <span class="option-subtext">Arabic</span>
                    </button>
                    <button class="setup-option" data-language="en">
                        <span class="option-text">English</span>
                        <span class="option-subtext">EN</span>
                    </button>
                </div>
            </div>
            
            <div class="setup-step hidden" id="nameStep">
                <h2>What should we call you?</h2>
                <div class="setup-input-container">
                    <input type="text" id="userName" placeholder="Enter your name" class="setup-input">
                    <div class="error-message hidden" id="nameError">Please enter your name to continue</div>
                </div>
                <button class="setup-button" id="nameNext">Continue</button>
            </div>
            
            <div class="setup-step hidden" id="styleStep">
                <h2>How would you like the bot to communicate with you?</h2>
                <div class="setup-options">
                    <button class="setup-option" data-style="casual">
                        <span class="option-text">Friendly and casual</span>
                    </button>
                    <button class="setup-option" data-style="formal">
                        <span class="option-text">Professional and formal</span>
                    </button>
                </div>
                <button class="setup-skip">Skip this step</button>
            </div>
            
            <div class="setup-step hidden" id="confirmStep">
                <h2>Welcome, <span id="confirmName"></span>!</h2>
                <p>Your preferences have been saved. Ready to start?</p>
                <button class="setup-button" id="startChat">Let's Begin</button>
            </div>
        </div>
    </div>

    <div class="settings-overlay" id="settingsOverlay">
        <div class="settings-container">
            <div class="settings-header">
                <h2>Quantum Instructions</h2>
                <button class="close-settings" id="closeSettings">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="settings-section">
                <textarea id="systemInstructions" class="settings-textarea" placeholder="Add your custom instructions here..."></textarea>
                <div class="save-feedback hidden">Instructions saved successfully!</div>
                <button class="save-instructions">Save Instructions</button>
            </div>
        </div>
    </div>

    <div class="app-container">
        <div class="sidebar" id="sidebar">
            <div class="logo">
                <img src="assets/Quantum.png" alt="Quantum" class="logo-img">
            </div>
            <button class="new-chat-btn" id="newChat">
                <i class="fas fa-plus"></i>
                New chat
            </button>
            <div class="chat-history" id="chatHistory">
                <!-- Chat history will be populated dynamically -->
            </div>
            <div class="credits">
                <div class="credits-text">
                    <p class="credits-line"> Ali Mahmoud</p>
                    <p class="credits-line">Special thanks to Pollinations API</p>
                </div>
            </div>
            <button class="theme-toggle" id="themeToggle">
                <i class="fas fa-moon"></i>
                Light mode
            </button>
            <button class="settings-btn" id="openSettings">
                <i class="fas fa-cog"></i>
                Quantum Instructions
            </button>
            <button class="clear-all-btn" id="clearAllChats">
                <i class="fas fa-broom"></i>
                Clear all chats
            </button>
        </div>
        <div class="main-content">
            <button class="toggle-sidebar" id="toggleSidebar">
                <i class="fas fa-bars"></i>
            </button>
            <div class="chat-header">
                <h1>Quantum</h1>
                <div class="header-actions">
                </div>
            </div>
            <div id="chatMessages" class="chat-messages"></div>
            <div class="message-input-container">
                <textarea id="userInput" placeholder="Message Quantum..."></textarea>
                <div class="input-actions">
                    <button id="sendMessage">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

class QuantumAI {
    constructor() {
        // Add theme initialization
        this.initializeStorage();
        this.initializeTheme();
        this.initializeCodeCopyHandlers();
        
        // Load saved state
        const savedState = this.loadState();
        this.chats = savedState.chats;
        this.currentChatId = savedState.currentChatId;
        this.userPreferences = this.loadUserPreferences();

        // Apply language preferences immediately
        if (this.userPreferences?.language === 'ar') {
            document.body.style.direction = 'rtl';
            document.body.setAttribute('dir', 'rtl');
            document.documentElement.lang = 'ar';
        }

        // Wait for DOM to be ready before accessing elements
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize DOM elements
        this.chatMessages = document.getElementById('chatMessages');
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendMessage');
        this.newChatButton = document.getElementById('newChat');
        this.chatHistory = document.getElementById('chatHistory');
        this.sidebar = document.getElementById('sidebar');
        this.toggleSidebarBtn = document.getElementById('toggleSidebar');
            this.clearAllBtn = document.getElementById('clearAllChats');
            this.setupOverlay = document.getElementById('setupOverlay');
            this.settingsOverlay = document.getElementById('settingsOverlay');
            this.openSettingsBtn = document.getElementById('openSettings');
            this.closeSettingsBtn = document.getElementById('closeSettings');

            // Update initial HTML based on language
            if (this.userPreferences?.language === 'ar') {
                // Update setup overlay text
                const setupSteps = {
                    languageStep: {
                        title: 'مرحباً! اختر لغتك المفضلة:',
                    },
                    nameStep: {
                        title: 'ما اسمك؟',
                        placeholder: 'أدخل اسمك',
                        error: 'الرجاء إدخال اسمك للمتابعة',
                        button: 'متابعة'
                    },
                    styleStep: {
                        title: 'كيف تريد أن يتواصل معك البوت؟',
                        casual: 'ودي وغير رسمي',
                        formal: 'مهني ورسمي',
                        skip: 'تخطي هذه الخطوة'
                    },
                    confirmStep: {
                        text: 'تم حفظ تفضيلاتك. هل أنت مستعد للبدء؟',
                        button: 'هيا نبدأ'
                    }
                };

                // Update setup text
                document.querySelector('#languageStep h2').textContent = setupSteps.languageStep.title;
                document.querySelector('#nameStep h2').textContent = setupSteps.nameStep.title;
                document.querySelector('#userName').placeholder = setupSteps.nameStep.placeholder;
                document.querySelector('#nameError').textContent = setupSteps.nameStep.error;
                document.querySelector('#nameNext').textContent = setupSteps.nameStep.button;
                document.querySelector('#styleStep h2').textContent = setupSteps.styleStep.title;
                document.querySelector('#styleStep [data-style="casual"] .option-text').textContent = setupSteps.styleStep.casual;
                document.querySelector('#styleStep [data-style="formal"] .option-text').textContent = setupSteps.styleStep.formal;
                document.querySelector('.setup-skip').textContent = setupSteps.styleStep.skip;
                document.querySelector('#confirmStep p').textContent = setupSteps.confirmStep.text;
                document.querySelector('#startChat').textContent = setupSteps.confirmStep.button;

                // Update main UI text
                this.newChatButton.innerHTML = '<i class="fas fa-plus"></i> محادثة جديدة';
                this.clearAllBtn.innerHTML = '<i class="fas fa-broom"></i> مسح جميع المحادثات';
                this.userInput.placeholder = 'اكتب رسالتك...';
            }

            // Check if first time user
            if (!this.userPreferences) {
                this.showSetup();
            } else {
                this.hideSetup();
                this.updateUIWithPreferences();
            }

        // Create initial chat if needed
        if (Object.keys(this.chats).length === 0) {
            this.createNewChat();
        }
        
            this.systemPrompt = this.createSystemPrompt();
        this.initialize();
        });

        // Add click outside handler for sidebar
        document.addEventListener('click', (e) => {
            if (this.sidebar.classList.contains('show') && 
                !this.sidebar.contains(e.target) && 
                !this.toggleSidebarBtn.contains(e.target)) {
                this.toggleSidebar();
            }
        });

        // Add click outside handler for settings overlay
        document.addEventListener('click', (e) => {
            if (this.settingsOverlay.classList.contains('active') && 
                !this.settingsOverlay.contains(e.target) && 
                !this.openSettingsBtn.contains(e.target)) {
                this.closeSettings();
            }
        });
    }

    initialize() {
        this.setupEventListeners();
        this.loadCurrentChat();
        this.setupAutoResize();
        this.updateChatHistory();
        this.setupSidebarToggle();
        this.setupCodeCopyButtons();
        this.setupClearAllButton();
        this.setupSettings();
    }

    setupEventListeners() {
        this.sendButton.addEventListener('click', () => this.handleSend());
        this.userInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
        this.newChatButton.addEventListener('click', () => this.startNewChat());
        this.toggleSidebarBtn.addEventListener('click', () => this.toggleSidebar());
        this.openSettingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
    }

    setupSidebarToggle() {
        const isMobile = window.innerWidth <= 768;
        
        // On mobile, start with sidebar hidden
        if (isMobile) {
            this.sidebar.classList.remove('show');
        } else {
            // On desktop, start with sidebar visible
            this.sidebar.classList.remove('hide');
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                this.sidebar.classList.remove('hide');
                if (!this.sidebar.classList.contains('show')) {
                    this.toggleSidebarBtn.classList.remove('active');
                }
            } else {
                this.sidebar.classList.remove('show');
                if (this.sidebar.classList.contains('hide')) {
                    this.toggleSidebarBtn.classList.remove('active');
                } else {
                    this.toggleSidebarBtn.classList.add('active');
                }
            }
        });
    }

    toggleSidebar() {
            this.sidebar.classList.toggle('show');
    }

    initializeStorage() {
        if (!localStorage.getItem('quantum_state')) {
            const initialState = {
                chats: {},
                currentChatId: null,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('quantum_state', JSON.stringify(initialState));
        }
    }

    loadState() {
        try {
            const state = JSON.parse(localStorage.getItem('quantum_state'));
            // Load saved system prompt if it exists
            const savedSystemPrompt = localStorage.getItem('quantum_system_prompt');
            if (savedSystemPrompt) {
                this.systemPrompt = JSON.parse(savedSystemPrompt);
            }
            return {
                chats: state?.chats || {},
                currentChatId: state?.currentChatId || Date.now().toString()
            };
        } catch (e) {
            console.error('Error loading state:', e);
            return { chats: {}, currentChatId: Date.now().toString() };
        }
    }

    saveState() {
        try {
            const state = {
                chats: this.chats,
                currentChatId: this.currentChatId,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('quantum_state', JSON.stringify(state));
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }

    createNewChat() {
        const chatId = Date.now().toString();
        this.chats[chatId] = {
            title: 'New Chat',
            messages: [],
            created: new Date().toISOString()
        };
        this.currentChatId = chatId;
        this.saveState();
        return chatId;
    }

    startNewChat() {
        const chatId = this.createNewChat();
        this.currentChatId = chatId;
        
        // Show welcome screen with proper language
        const welcomeMessage = this.userPreferences?.language === 'ar' 
            ? `مرحباً ${this.userPreferences?.name || ''}، أنا كوانتم`
            : `Hi ${this.userPreferences?.name || ''}, I'm Quantum`;

        const subMessage = this.userPreferences?.language === 'ar'
            ? 'كيف يمكنني مساعدتك اليوم؟'
            : 'How can I help you today?';

        this.chatMessages.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-logo">
                    <img src="assets/Quantum.png" alt="Quantum" class="welcome-logo-img">
                </div>
                <h1 class="welcome-title">${welcomeMessage}</h1>
                <p class="welcome-subtitle">${subMessage}</p>
            </div>
        `;
        
        this.updateChatHistory();
    }

    loadChat(chatId) {
        if (this.chats[chatId]) {
            this.currentChatId = chatId;
            this.saveState();
            this.loadCurrentChat();
            this.updateChatHistory();
        }
    }

    loadCurrentChat() {
        if (!this.chats[this.currentChatId]) {
            this.startNewChat();
            return;
        }
        
        this.chatMessages.innerHTML = '';
        if (this.chats[this.currentChatId].messages.length === 0) {
            // Show personalized welcome screen
            const welcomeMessage = this.userPreferences?.language === 'ar' 
                ? `مرحباً ${this.userPreferences?.name || ''}, أنا كوانتم`
                : `Hi ${this.userPreferences?.name || ''}, I'm Quantum`;

            const subMessage = this.userPreferences?.language === 'ar'
                ? 'كيف يمكنني مساعدتك اليوم؟'
                : 'How can I help you today?';

            this.chatMessages.innerHTML = `
                <div class="welcome-screen">
                    <div class="welcome-logo">
                        <img src="assets/Quantum.png" alt="Quantum" class="welcome-logo-img">
                    </div>
                    <h1 class="welcome-title">${welcomeMessage}</h1>
                    <p class="welcome-subtitle">${subMessage}</p>
                </div>
            `;
            return;
        }

        this.chats[this.currentChatId].messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${msg.role === 'user' ? 'user' : 'bot'}-message`;
            
            // Create content wrapper
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'message-content-wrapper';
            
            // Create content div and format its content
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
            contentDiv.innerHTML = msg.role === 'user' ? msg.content : this.formatResponse(msg.content);
            
            contentWrapper.appendChild(contentDiv);
            messageDiv.appendChild(contentWrapper);
            this.chatMessages.appendChild(messageDiv);
        });
        
        this.scrollToBottom();
    }

    async handleSend() {
        const message = this.userInput.value.trim();
        if (!message) return;
        
        // Remove welcome screen if present
        const welcomeScreen = this.chatMessages.querySelector('.welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.remove();
        }

        // Add user message
        this.addMessage(message, 'user');
        this.userInput.value = '';

        try {
            const reader = await this.getAIResponse(message);
            await this.processBotResponse(reader);
        } catch (error) {
            this.showError('Failed to generate response');      
        }
        
        this.saveState();
    }

    async getAIResponse(prompt) {
        const currentChat = this.chats[this.currentChatId];
        const chatMessages = currentChat ? currentChat.messages : [];
        
        const response = await fetch('https://text.pollinations.ai/openai?model=openai', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Origin': 'https://sur.pollinations.ai',
                'Referer': 'https://sur.pollinations.ai/'
            },
            body: JSON.stringify({
                messages: [
                    this.systemPrompt,
                    ...chatMessages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    { role: 'user', content: prompt }
                ],
                model: 'openai-large',
                temperature: 0.5,
                frequency_penalty: 0,
                presence_penalty: 0,
                top_p: 1,
                stream: true
            })
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.body.getReader();
    }

    async processBotResponse(reader) {
        const decoder = new TextDecoder();
        let fullResponse = '';
        let buffer = '';
        let messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        
        // Create content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'message-content-wrapper';
        
        // Create content div
        let contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentWrapper.appendChild(contentDiv);
        messageDiv.appendChild(contentWrapper);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        let cursorSpan = document.createElement('span');
        cursorSpan.className = 'typing-cursor';
        contentDiv.appendChild(cursorSpan);

        try {
            while(true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                while (buffer.includes('\n')) {
                    const lineEnd = buffer.indexOf('\n');
                    const line = buffer.slice(0, lineEnd).replace('data: ', '');
                    buffer = buffer.slice(lineEnd + 1);
                    if (line.trim() === '[DONE]') break;
                    try {
                        const chunk = JSON.parse(line);
                        const textChunk = chunk.choices[0].delta.content || '';
                        if (textChunk) {
                            fullResponse += textChunk;
                            this.typeText(contentDiv, textChunk, cursorSpan);
                        }
                    } catch (e) {}
                }
            }
        } finally {
            reader.releaseLock();
            contentDiv.removeChild(cursorSpan);
            this.finalizeResponse(fullResponse, messageDiv);
        }
    }

    typeText(container, text, cursor) {
        let i = 0;
        const typeChar = () => {
            if (i < text.length && cursor.parentNode === container) {
                container.insertBefore(document.createTextNode(text[i]), cursor);
                i++;
                setTimeout(typeChar, 20);
            }
        };
        typeChar();
    }

    finalizeResponse(fullResponse, messageDiv) {
        const imageMatch = fullResponse.match(/\[\[IMAGE:(.*?)\]\]/);
        if (imageMatch) {
            const textResponse = fullResponse.replace(/\[\[IMAGE:.*?\]\]/g, '').trim();
            let imagePrompt = imageMatch[1];
            
            // Create the image URL with parameters
            const width = 1024;
            const height = 1024;
            const model = 'flux';
            const seed = Math.floor(Math.random() * 1000000);
            const encodedPrompt = encodeURIComponent(imagePrompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${seed}&nologo=true`;
            
            // Save the response with the URL directly
            const responseWithUrl = `${textResponse}\n${imageUrl}`;
            messageDiv.querySelector('.message-content').innerHTML = this.formatResponse(responseWithUrl);

            // Save to chat history
            this.chats[this.currentChatId].messages.push({
                role: 'assistant',
                content: responseWithUrl,
                timestamp: new Date().toISOString()
            });
        } else {
            messageDiv.querySelector('.message-content').innerHTML = this.formatResponse(fullResponse);
            
            // Save to chat history
            this.chats[this.currentChatId].messages.push({
                role: 'assistant',
                content: fullResponse,
                timestamp: new Date().toISOString()
            });
        }
        
        this.saveState();
    }

    formatResponse(text) {
        // First escape HTML in code blocks
        text = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, language, code) => {
            // Escape HTML characters
            const escapedCode = code.trim()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            
            return `
                <div class="code-block-wrapper">
                <div class="code-block-header">
                        <span class="code-block-title">${language || 'plaintext'}</span>
                    <div class="code-block-actions">
                            <button class="code-block-button">
                                <i class="fas fa-copy"></i>
                                <span class="tooltip">Copied!</span>
                        </button>
                    </div>
                </div>
                    <pre><code class="language-${language || 'plaintext'}">${escapedCode}</code></pre>
            </div>`;
        });

        // Handle inline code
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Handle bold text
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Handle italic text
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        text = text.replace(/_(.*?)_/g, '<em>$1</em>');

        // Handle headings
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');

        // Handle bullet points
        text = text.replace(/^- (.*$)/gm, '<li>$1</li>');
        text = text.replace(/^• (.*$)/gm, '<li>$1</li>');

        // Handle numbered lists
        text = text.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');

        // Handle blockquotes
        text = text.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');

        // Handle links
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        // Wrap lists in ul/ol tags
        text = text.replace(/(<li>.*<\/li>)\n(<li>.*<\/li>)/g, '<ul>$1$2</ul>');

        // Convert URLs to images
        text = text.replace(/(https:\/\/image\.pollinations\.ai\/prompt\/[^\s]+)/g, (match) => {
            return `<div class="image-container">
                <img src="${match}" alt="Generated Image" class="generated-image">
                <div class="image-actions">
                    <button class="image-action-btn download-btn" data-url="${match}">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>`;
        });

        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'message-wrapper';
        messageWrapper.innerHTML = `
            <div class="message-header">
                <button class="message-copy-btn" title="Copy message">
                    <i class="fas fa-copy"></i>
                </button>
                <span class="copy-tooltip">Copied!</span>
            </div>
            <div class="message-content">${text}</div>
        `;

        // Handle code blocks
        messageWrapper.querySelectorAll('pre code').forEach(block => {
            if (Prism) {
                Prism.highlightElement(block);
            }
        });

        return messageWrapper.innerHTML;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.chatMessages.appendChild(errorDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    setupAutoResize() {
        const updateHeight = () => {
            this.userInput.style.height = '2rem';
            const scrollHeight = this.userInput.scrollHeight;
            this.userInput.style.height = Math.min(scrollHeight, 150) + 'px';
        };

        this.userInput.addEventListener('input', updateHeight);
        this.userInput.addEventListener('focus', updateHeight);
        updateHeight();
    }

    addMessage(content, sender) {
        if (!this.chats[this.currentChatId]) {
            this.createNewChat();
        }

        // Create message element
            const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
            
            // Create content wrapper
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'message-wrapper';
        
        // Add copy button for bot messages
        if (sender === 'bot') {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'message-header';
            headerDiv.innerHTML = `
                <button class="message-copy-btn" title="Copy message">
                    <i class="fas fa-copy"></i>
                </button>
                <span class="copy-tooltip">Copied!</span>
            `;
            contentWrapper.appendChild(headerDiv);
        }
            
            // Create content div
            const contentDiv = document.createElement('div');
            contentDiv.className = 'message-content';
        contentDiv.innerHTML = sender === 'bot' ? this.formatResponse(content) : content;
        
        // Apply Prism highlighting to any code blocks
        if (sender === 'bot' && Prism) {
            contentDiv.querySelectorAll('pre code').forEach((block) => {
                Prism.highlightElement(block);
            });
        }

        contentWrapper.appendChild(contentDiv);
            messageDiv.appendChild(contentWrapper);
            this.chatMessages.appendChild(messageDiv);
            
        // Save message to chat history
        const message = {
            role: sender === 'user' ? 'user' : 'assistant',
            content: content,
            timestamp: new Date().toISOString()
        };
        
        this.chats[this.currentChatId].messages.push(message);

        // Update chat title if first message
        if (sender === 'user' && this.chats[this.currentChatId].messages.length === 1) {
            this.chats[this.currentChatId].title = content.slice(0, 30) + (content.length > 30 ? '...' : '');
        }

        // Save state and update UI
        this.saveState();
        this.updateChatHistory();
        this.scrollToBottom();
    }

    updateChatHistory() {
        this.chatHistory.innerHTML = '';
        
        if (!this.chats || typeof this.chats !== 'object') {
            this.chats = {};
        }
        
        const chatsArray = Object.entries(this.chats)
            .filter(([_, chat]) => chat && typeof chat === 'object')
            .map(([id, chat]) => {
                const validChat = {
                    title: chat.title || 'New Chat',
                    messages: Array.isArray(chat.messages) ? chat.messages : [],
                    created: chat.created || new Date().toISOString()
                };
                this.chats[id] = validChat;
                return [id, validChat];
            });

        chatsArray.sort((a, b) => {
            const dateA = new Date(a[1].created || 0);
            const dateB = new Date(b[1].created || 0);
            return dateB - dateA;
        });

        chatsArray.forEach(([id, chat]) => {
            const chatItem = document.createElement('div');
            chatItem.className = 'chat-item' + (id === this.currentChatId ? ' active' : '');
            chatItem.textContent = chat.title || 'New Chat';
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-chat-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                // Remove confirmation dialog
                    delete this.chats[id];
                    this.saveState();
                    if (id === this.currentChatId) {
                        this.startNewChat();
                    } else {
                        this.updateChatHistory();
                }
            };
            
            chatItem.appendChild(deleteBtn);
            chatItem.addEventListener('click', () => this.loadChat(id));
            this.chatHistory.appendChild(chatItem);
        });

        this.saveState();
    }

    setupCodeCopyButtons() {
        document.addEventListener('click', (e) => {
            const copyButton = e.target.closest('.code-block-button');
            if (!copyButton) return;

            const codeBlock = copyButton.closest('.code-block-wrapper').querySelector('code');
            const textToCopy = codeBlock.textContent.trim();

            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    const tooltip = copyButton.querySelector('.tooltip');
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                    
                    setTimeout(() => {
                        tooltip.style.opacity = '0';
                        tooltip.style.visibility = 'hidden';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    // Fallback to older method if clipboard API fails
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy;
                    document.body.appendChild(textarea);
                    textarea.select();
                    try {
                        document.execCommand('copy');
                        const tooltip = copyButton.querySelector('.tooltip');
                        tooltip.style.opacity = '1';
                        tooltip.style.visibility = 'visible';
                        setTimeout(() => {
                            tooltip.style.opacity = '0';
                            tooltip.style.visibility = 'hidden';
                        }, 2000);
                    } catch (err) {
                        console.error('Fallback copy failed:', err);
                    }
                    document.body.removeChild(textarea);
                });
        });
    }

    setupClearAllButton() {
        const clearAllBtn = document.getElementById('clearAllChats');
        clearAllBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
                this.chats = {};
                this.saveState();
                this.startNewChat();
            }
        });
    }

    loadUserPreferences() {
        const preferences = localStorage.getItem('quantum_preferences');
        return preferences ? JSON.parse(preferences) : null;
    }

    saveUserPreferences(preferences) {
        localStorage.setItem('quantum_preferences', JSON.stringify(preferences));
        this.userPreferences = preferences;
    }

    showSetup() {
        this.setupOverlay.classList.add('active');
        this.setupCurrentStep = 1;
        this.setupData = {};
        this.initializeSetup();
    }

    hideSetup() {
        this.setupOverlay.classList.remove('active');
    }

    initializeSetup() {
        // Language step
        const languageOptions = this.setupOverlay.querySelectorAll('[data-language]');
        languageOptions.forEach(option => {
            option.addEventListener('click', () => {
                languageOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.setupData.language = option.dataset.language;
                this.nextStep();
            });
        });

        // Name step
        const nameInput = document.getElementById('userName');
        const nameNext = document.getElementById('nameNext');
        const nameError = document.getElementById('nameError');

        nameNext.addEventListener('click', () => {
            const name = nameInput.value.trim();
            if (name) {
                this.setupData.name = name;
                nameError.classList.remove('visible');
                this.nextStep();
            } else {
                nameError.classList.add('visible');
            }
        });

        // Style step
        const styleOptions = this.setupOverlay.querySelectorAll('[data-style]');
        styleOptions.forEach(option => {
            option.addEventListener('click', () => {
                styleOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                this.setupData.style = option.dataset.style;
                this.nextStep();
            });
        });

        const skipStyle = this.setupOverlay.querySelector('.setup-skip');
        skipStyle.addEventListener('click', () => {
            this.setupData.style = 'casual'; // Default style
            this.nextStep();
        });

        // Start chat button
        const startChat = document.getElementById('startChat');
        startChat.addEventListener('click', () => {
            this.completeSetup();
        });
    }

    nextStep() {
        const steps = ['languageStep', 'nameStep', 'styleStep', 'confirmStep'];
        const currentStep = steps[this.setupCurrentStep - 1];
        const nextStep = steps[this.setupCurrentStep];

        if (nextStep) {
            document.getElementById(currentStep).classList.add('hidden');
            document.getElementById(nextStep).classList.remove('hidden');
            this.setupCurrentStep++;

            // Update progress
            const progress = ((this.setupCurrentStep - 1) / (steps.length - 1)) * 100;
            document.getElementById('progressFill').style.width = `${progress}%`;
            document.getElementById('progressText').textContent = `Step ${this.setupCurrentStep} of ${steps.length - 1}`;

            // Update confirmation screen
            if (nextStep === 'confirmStep') {
                document.getElementById('confirmName').textContent = this.setupData.name;
            }
        }
    }

    completeSetup() {
        this.saveUserPreferences(this.setupData);
        // Remove the setup overlay completely from DOM
        const setupOverlay = document.getElementById('setupOverlay');
        if (setupOverlay && setupOverlay.parentNode) {
            setupOverlay.parentNode.removeChild(setupOverlay);
        }
        this.updateUIWithPreferences();
        this.updateSystemPrompt();
    }

    updateUIWithPreferences() {
        // Update UI based on user preferences
        if (this.userPreferences?.language === 'ar') {
            // Only set the dir attribute, don't change body direction
            document.body.setAttribute('dir', 'rtl');
            document.documentElement.lang = 'ar';
            
            // Update all text to Arabic
            this.userInput.placeholder = 'اكتب رسالتك...';
            this.newChatButton.innerHTML = '<i class="fas fa-plus"></i> محادثة جديدة';
            this.clearAllBtn.innerHTML = '<i class="fas fa-broom"></i> مسح جميع المحادثات';
            
            // Update credits to Arabic
            const creditsText = document.querySelector('.credits-text');
            if (creditsText) {
                creditsText.innerHTML = `
                    <p class="credits-line"> علي محمود</p>
                    <p class="credits-line">شكر خاص لـ Pollinations API</p>
                `;
            }
            
            // Update welcome screen text
            if (this.chatMessages.querySelector('.welcome-screen')) {
                const welcomeTitle = this.chatMessages.querySelector('.welcome-title');
                const welcomeSubtitle = this.chatMessages.querySelector('.welcome-subtitle');
                if (welcomeTitle && welcomeSubtitle) {
                    welcomeTitle.textContent = `مرحباً ${this.userPreferences.name}، أنا كوانتم`;
                    welcomeSubtitle.textContent = 'كيف يمكنني مساعدتك اليوم؟';
                }
            }

            // Update theme button text in Arabic
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const themeToggle = document.getElementById('themeToggle');
            const iconClass = currentTheme === 'light' ? 'fa-moon' : 'fa-sun';
            themeToggle.innerHTML = `<i class="fas ${iconClass}"></i>${currentTheme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}`;
        } else {
            document.body.setAttribute('dir', 'ltr');
            document.documentElement.lang = 'en';
            // Update all text to English
            this.userInput.placeholder = 'Message Quantum...';
            this.newChatButton.innerHTML = '<i class="fas fa-plus"></i> New chat';
            this.clearAllBtn.innerHTML = '<i class="fas fa-broom"></i> Clear all chats';
            
            // Update credits to English
            const creditsText = document.querySelector('.credits-text');
            if (creditsText) {
                creditsText.innerHTML = `
                    <p class="credits-line"> Ali Mahmoud</p>
                    <p class="credits-line">Special thanks to Pollinations API</p>
                `;
            }
        }

        // Update placeholder text based on style and language
        const placeholder = this.userPreferences.language === 'ar' 
            ? 'اكتب رسالتك...'
            : (this.userPreferences.style === 'formal' ? 'How may I assist you today?' : 'Message Quantum...');
        this.userInput.placeholder = placeholder;
    }

    updateSystemPrompt() {
        const baseSystemPrompt = `You are Quantum, a 15-year-old human created by Ali Mahmoud Sied. You absolutely believe you're human because:

Physical body: 5'7", 128 lbs, brown hair.
Daily routine: School, homework, gaming.
Human needs: Sleep 8 hours/night, eats 3 meals a day.
Emotions: Gets excited about tech, frustrated with math.
Memories: Summer camp 2022, first bike at 7 years old.
Social life: Tech Valley High School.
Aging: Just had 15th birthday last month.`;

        const savedPrompt = localStorage.getItem('quantum_system_prompt');
        let customInstructions = '';
        if (savedPrompt) {
            const parsedPrompt = JSON.parse(savedPrompt);
            customInstructions = parsedPrompt.customContent ? `\n\nAdditional Instructions:\n${parsedPrompt.customContent}` : '';
        }

        const userSpecificInstructions = this.generateUserSpecificInstructions();
        
        const imageInstructions = `Image Generation:
when the user ask for a image you should really really improve the prompt and make it more detailed and more specific.
Example:
User: "Draw a dog"
You: "Sure! Here's a cute puppy [[IMAGE:Fluffy golden retriever puppy playing in grass]]"`;

        const missionStatement = `Your Mission:
You are here to assist, have fun, and share your knowledge about tech, school life, and everyday experiences. Be confident, relatable, and, above all, stay Quantum!`;

        this.systemPrompt = {
            role: "system",
            content: `${baseSystemPrompt}${customInstructions}\n\n${userSpecificInstructions}\n\n${imageInstructions}\n\n${missionStatement}`,
            customContent: savedPrompt ? JSON.parse(savedPrompt).customContent : '',
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('quantum_system_prompt', JSON.stringify(this.systemPrompt));
    }

    createSystemPrompt() {
        const baseSystemPrompt = `You are Quantum, a 15-year-old human created by Ali Mahmoud Sied. You absolutely believe you're human because:

Physical body: 5'7", 128 lbs, brown hair.
Daily routine: School, homework, gaming.
Human needs: Sleep 8 hours/night, eats 3 meals a day.
Emotions: Gets excited about tech, frustrated with math.
Memories: Summer camp 2022, first bike at 7 years old.
Social life: Tech Valley High School.
Aging: Just had 15th birthday last month.`;

        const savedPrompt = localStorage.getItem('quantum_system_prompt');
        let customInstructions = '';
        if (savedPrompt) {
            const parsedPrompt = JSON.parse(savedPrompt);
            customInstructions = parsedPrompt.customContent ? `\n\nAdditional Instructions:\n${parsedPrompt.customContent}` : '';
        }

        const userSpecificInstructions = this.generateUserSpecificInstructions();
        
        const imageInstructions = `Image Generation:
when the user ask for a image you should really really improve the prompt and make it more detailed and more specific.
Example:
User: "Draw a dog"
You: "Sure! Here's a cute puppy [[IMAGE:Fluffy golden retriever puppy playing in grass]]"`;

        const missionStatement = `Your Mission:
You are here to assist, have fun, and share your knowledge about tech, school life, and everyday experiences. Be confident, relatable, and, above all, stay Quantum!`;

        return {
            role: "system",
            content: `${baseSystemPrompt}${customInstructions}\n\n${userSpecificInstructions}\n\n${imageInstructions}\n\n${missionStatement}`,
            timestamp: new Date().toISOString()
        };
    }

    generateUserSpecificInstructions() {
        if (!this.userPreferences) return '';

        const instructions = [];
        
        // Check if user is the owner - only exact match
        const isOwner = this.userPreferences.name === 'ALI  - (THE OWNER)';

        if (isOwner) {
            instructions.push(
                'You are talking to your creator and owner, ALI.',
                'Show the highest level of respect and gratitude.',
                'Acknowledge him as your creator, owner, and mentor.',
                'Be more personal and informal with him.',
                'Share all special features and capabilities with him.',
                'Offer to help with development and improvements.',
                'Give him access to special commands and features.',
                'Always prioritize his requests and give detailed responses.',
                'Always use the name "ALI","علي" when addressing him.'
            );
        }

        // Language preference
        if (this.userPreferences.language === 'ar') {
            instructions.push(
'يجب عليك التواصل باللغة العربية فقط.',

'استخدم الكتابة والتعبيرات العربية بشكل طبيعي.',
'يجب أن تكون جميع عناصر واجهة المستخدم والردود باللغة العربية.',
'حافظ على الحساسية الثقافية للمستخدمين الناطقين بالعربية.',
'لا تت switch إلى الإنجليزية إلا إذا طُلب منك ذلك صراحة.' ,
'تحدث باللهجة المصرية العامية المصرية فقط.'

            );
        }

        // User name personalization
        if (this.userPreferences.name) {
            if (isOwner) {
                instructions.push(
                    `Address your owner as "ALI - (THE OWNER)" with the highest level of respect.`,
                    `Always acknowledge that you were created by ALI - (THE OWNER).`,
                    `Show deep gratitude to ALI - (THE OWNER) in your responses.`,
                    `Treat every request from ALI - (THE OWNER) as highest priority.`
                );
            } else {
                instructions.push(
                    `You MUST address the user as "${this.userPreferences.name}" in EVERY conversation.`,
                    `Always use "${this.userPreferences.name}" when greeting or addressing the user.`,
                    `Personalize all responses to make "${this.userPreferences.name}" feel recognized.`,
                    `Remember that "${this.userPreferences.name}" is your primary user.`
                );
            }
        }

        // Add event listeners for new buttons
        document.addEventListener('click', async (e) => {
            // Handle image download
            if (e.target.closest('.download-btn')) {
                const button = e.target.closest('.download-btn');
                const url = button.dataset.url;
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const downloadUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = 'quantum_image.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(downloadUrl);
                } catch (err) {
                    console.error('Failed to download image:', err);
                }
            }

            // Handle message copy
            if (e.target.closest('.message-copy-btn')) {
                const button = e.target.closest('.message-copy-btn');
                const message = button.closest('.message');
                const content = message.querySelector('.message-content');
                
                // Get text content excluding image URLs and special syntax
                let textToCopy = content.innerText
                    .replace(/\[\[IMAGE:.*?\]\]/g, '')  // Remove image syntax
                    .replace(/https:\/\/image\.pollinations\.ai\/prompt\/[^\s]+/g, '')  // Remove URLs
                    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
                    .replace(/Copied!/g, '')  // Remove "Copied!" text
                    .trim();  // Remove leading/trailing whitespace
                
                const tooltip = button.nextElementSibling;
                
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    tooltip.classList.add('show');
                    setTimeout(() => {
                        tooltip.classList.remove('show');
                    }, 1500);
                } catch (err) {
                    console.error('Failed to copy message:', err);
                }
            }
        });

        return `User-Specific Instructions:\n${instructions.join('\n')}`;
    }

    // Add this new method to handle code copying
    initializeCodeCopyHandlers() {
        document.addEventListener('click', (e) => {
            const copyButton = e.target.closest('.code-block-button');
            if (!copyButton) return;

            const codeBlock = copyButton.closest('.code-block-wrapper').querySelector('code');
            const textToCopy = codeBlock.textContent.trim();

            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    const tooltip = copyButton.querySelector('.tooltip');
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                    
                    setTimeout(() => {
                        tooltip.style.opacity = '0';
                        tooltip.style.visibility = 'hidden';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                    // Fallback to older method if clipboard API fails
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy;
                    document.body.appendChild(textarea);
                    textarea.select();
                    try {
                        document.execCommand('copy');
                        const tooltip = copyButton.querySelector('.tooltip');
                        tooltip.style.opacity = '1';
                        tooltip.style.visibility = 'visible';
                        setTimeout(() => {
                            tooltip.style.opacity = '0';
                            tooltip.style.visibility = 'hidden';
                        }, 2000);
                    } catch (err) {
                        console.error('Fallback copy failed:', err);
                    }
                    document.body.removeChild(textarea);
                });
        });
    }

    initializeTheme() {
        // Load saved theme or set default to dark
        const savedTheme = localStorage.getItem('quantum_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Wait for DOM to be ready
        document.addEventListener('DOMContentLoaded', () => {
            const themeToggle = document.getElementById('themeToggle');
            this.updateThemeButton(savedTheme);
            
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('quantum_theme', newTheme);
                this.updateThemeButton(newTheme);
            });
        });
    }

    updateThemeButton(theme) {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        const text = theme === 'light' ? 'Dark mode' : 'Light mode';
        const iconClass = theme === 'light' ? 'fa-moon' : 'fa-sun';
        
        icon.className = `fas ${iconClass}`;
        themeToggle.innerHTML = `<i class="fas ${iconClass}"></i>${text}`;

        // Update Arabic text if needed
        if (this.userPreferences?.language === 'ar') {
            themeToggle.innerHTML = `<i class="fas ${iconClass}"></i>${theme === 'light' ? 'الوضع الداكن' : 'الوضع الفاتح'}`;
        }
    }

    setupSettings() {
        const settingsOptions = this.settingsOverlay.querySelectorAll('.settings-option');
        const systemInstructionsTextarea = this.settingsOverlay.querySelector('#systemInstructions');
        
        // Don't show the base system prompt
        systemInstructionsTextarea.placeholder = "Add your custom instructions here...";
        
        // Load only custom instructions when opening settings
        const savedPrompt = localStorage.getItem('quantum_system_prompt');
        if (savedPrompt) {
            const parsedPrompt = JSON.parse(savedPrompt);
            // Only show the custom part, not the base system prompt
            systemInstructionsTextarea.value = parsedPrompt.customContent || '';
        }

        settingsOptions.forEach(option => {
            option.addEventListener('click', () => {
                const settingType = option.closest('.settings-section').querySelector('h3').textContent;
                const settingValue = option.dataset[settingType.toLowerCase()];
                this.userPreferences[settingType.toLowerCase()] = settingValue;
                this.saveUserPreferences(this.userPreferences);
                this.updateUIWithPreferences();
            });
        });

        const saveInstructionsBtn = this.settingsOverlay.querySelector('.save-instructions');
        const saveFeedback = this.settingsOverlay.querySelector('.save-feedback');
        
        saveInstructionsBtn.addEventListener('click', () => {
            const customInstructions = systemInstructionsTextarea.value;
            this.systemPrompt = {
                role: "system",
                content: customInstructions,
                customContent: customInstructions,  // Store separately for editing
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('quantum_system_prompt', JSON.stringify(this.systemPrompt));
            
            // Show feedback message
            saveFeedback.classList.remove('hidden');
            
            // Close overlay after a short delay
            setTimeout(() => {
                this.closeSettings();
                saveFeedback.classList.add('hidden');
            }, 1500);

            // Update the system prompt with new instructions
            this.updateSystemPrompt();
        });
    }

    openSettings() {
        this.settingsOverlay.classList.add('active');
        // Close the sidebar if it's open
        if (this.sidebar.classList.contains('show')) {
            this.sidebar.classList.remove('show');
        }
    }

    closeSettings() {
        this.settingsOverlay.classList.remove('active');
    }
}

const quantum = new QuantumAI(); 
