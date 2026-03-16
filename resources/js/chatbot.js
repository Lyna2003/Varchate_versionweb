document.addEventListener('DOMContentLoaded', () => {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotDelete = document.getElementById('chatbot-delete');

    if (!chatbotToggle) return;

    // Estado global del chatbot
    window.varchateChat = {
        context: 'General',
        history: [],
        
        // Función para cambiar visibilidad (activar/desactivar)
        setVisibility(visible) {
            if (visible) {
                chatbotToggle.classList.remove('chatbot-hidden');
            } else {
                chatbotToggle.classList.add('chatbot-hidden');
                chatbotWindow.style.display = 'none';
            }
        },
        
        // Función para actualizar el tema/contexto
        setContext(newContext) {
            this.context = newContext;
            console.log('Chatbot context updated to:', newContext);
        }
    };

    // Cargar historial
    const savedHistory = localStorage.getItem('varchate_chat_history');
    if (savedHistory && JSON.parse(savedHistory).length > 0) {
        window.varchateChat.history = JSON.parse(savedHistory);
        renderHistory();
    } else {
        // Saludo inicial solo si está vacío el historial COMPLETAMENTE
        const welcomeMsg = '¡Hola! Soy Varchate Cat. 🐾 ¿En qué puedo ayudarte hoy?';
        addMessage(welcomeMsg, 'bot', true);
    }

    // Abrir/Cerrar
    chatbotToggle.addEventListener('click', () => {
        const isVisible = chatbotWindow.style.display === 'flex';
        chatbotWindow.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) chatbotInput.focus();
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.style.display = 'none';
    });

    // Enviar mensaje
    async function sendMessage() {
        const message = chatbotInput.value.trim();
        if (!message) return;

        addMessage(message, 'user');
        chatbotInput.value = '';

        const thinkingPhrases = [
            'Varchate Cat está pensando...',
            'Buscando en mis archivos gatunos...',
            'Espera un miau-mento...',
            'Preparando una respuesta ronroneante...',
            'Afilando las garras del conocimiento...'
        ];
        const randomPhrase = thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)];

        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing';
        typingDiv.textContent = randomPhrase;
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        try {
            const context = window.varchateChat.context; // Changed from currentContext to context to match existing structure
            const response = await fetch('/api/chatbot/chat', { // Kept original endpoint /api/chatbot/chat
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify({ message, context })
            });

            const data = await response.json();
            chatbotMessages.removeChild(typingDiv);

            if (data.reply) {
                addMessage(data.reply, 'bot');
            } else {
                addMessage('Lo siento, tuve un problema con mi conexión gatuna. Inténtalo más tarde.', 'bot');
            }
        } catch (error) {
            if (typingDiv.parentNode) chatbotMessages.removeChild(typingDiv); // Ensure typingDiv exists before removing
            addMessage('¡Miau! Algo salió mal. Inténtalo de nuevo más tarde.', 'bot');
        }
    }

    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Borrar chat
    if (chatbotDelete) {
        chatbotDelete.addEventListener('click', () => {
            if (confirm('¿Quieres borrar toda la conversación con Varchate Cat?')) {
                window.varchateChat.history = [];
                localStorage.removeItem('varchate_chat_history');
                chatbotMessages.innerHTML = '';
                addMessage('Chat borrado. ¡Empecemos de nuevo! 🐾', 'bot', false);
            }
        });
    }

    function addMessage(text, sender, save = true) {
        const container = document.createElement('div');
        container.className = `msg-container ${sender}`;
        
        if (sender === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'msg-avatar';
            const iconUrl = window.varchateIcon || '/images/chatbot-icon.svg';
            avatar.innerHTML = `<img src="${iconUrl}" alt="Cat">`;
            container.appendChild(avatar);
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;
        
        // Formateo: **texto** -> <strong> e ![alt](url) -> <div class="img-wrapper"><img ...></div>
        let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Expresión regular para capturar imágenes de Markdown
        const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
        let match;
        const imagesToLoad = [];

        // Reemplazamos las imágenes por un marcador de posición con skeleton
        formattedText = formattedText.replace(imgRegex, (match, alt, url) => {
            const id = 'img-' + Math.random().toString(36).substr(2, 9);
            imagesToLoad.push({ id, url, alt });
            return `<div class="image-wrapper skeleton" id="${id}">
                        <div class="image-loading-text">Generando imagen...</div>
                    </div>`;
        });
        
        msgDiv.innerHTML = formattedText;
        container.appendChild(msgDiv);
        chatbotMessages.appendChild(container);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

        // Cargar las imágenes de forma asíncrona
        imagesToLoad.forEach(imgData => {
            const wrapper = document.getElementById(imgData.id);
            const img = new Image();
            img.src = imgData.url;
            img.alt = imgData.alt;
            
            img.onload = () => {
                wrapper.classList.remove('skeleton');
                wrapper.innerHTML = ''; // Limpiar mensaje de carga
                wrapper.appendChild(img);
                img.style.opacity = '0';
                setTimeout(() => {
                    img.style.transition = 'opacity 0.5s ease';
                    img.style.opacity = '1';
                }, 10);
                chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            };

            img.onerror = () => {
                wrapper.classList.remove('skeleton');
                wrapper.innerHTML = `<div class="image-error"><span>⚠️ Error al cargar imagen</span></div>`;
            };

            // Hacer clic para ver en grande
            wrapper.addEventListener('click', () => {
                if (!wrapper.classList.contains('skeleton') && img.src) {
                    window.open(img.src, '_blank');
                }
            });
        });

        if (save) {
            window.varchateChat.history.push({ text, sender });
            localStorage.setItem('varchate_chat_history', JSON.stringify(window.varchateChat.history));
        }
    }

    function renderHistory() {
        chatbotMessages.innerHTML = '';
        window.varchateChat.history.forEach(msg => {
            addMessage(msg.text, msg.sender, false);
        });
    }
});
