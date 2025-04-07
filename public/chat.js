class ChatBot {
    constructor() {
        this.chatLog = document.getElementById('chat-log');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.conversationHistory = [];
        this.maxHistoryLength = 10; // Limite l'historique à 10 messages

        // Ajouter les event listeners
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Message de bienvenue
        this.appendMessage("Bonjour ! Je suis Eliza, votre assistant IA. Comment puis-je vous aider aujourd'hui ?");
    }

    appendMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = message;
        this.chatLog.appendChild(messageDiv);
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'message error-message';
        errorDiv.textContent = message;
        this.chatLog.appendChild(errorDiv);
        this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    updateTypingIndicator(show) {
        this.typingIndicator.style.display = show ? 'block' : 'none';
        this.userInput.disabled = show;
        this.sendButton.disabled = show;
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Afficher le message de l'utilisateur
        this.appendMessage(message, true);
        this.userInput.value = '';

        // Afficher l'indicateur de frappe
        this.updateTypingIndicator(true);

        try {
            // Ajouter le message à l'historique
            this.conversationHistory.push({
                role: 'user',
                content: message
            });

            // Limiter l'historique
            if (this.conversationHistory.length > this.maxHistoryLength) {
                this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
            }

            // Préparer le contexte du système
            const systemMessage = {
                role: 'system',
                content: 'Tu es Eliza, un assistant IA amical et serviable. Tu es spécialisé dans l\'aide aux utilisateurs. Tu dois toujours répondre en français de manière claire et concise. Tu dois être poli et professionnel. Tu dois rester dans le cadre de tes compétences et ne pas faire de promesses que tu ne peux pas tenir.'
            };

            // Créer le tableau complet des messages
            const messages = [
                systemMessage,
                ...this.conversationHistory
            ];

            // Appeler notre serveur local
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Erreur serveur: ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            // Ajouter la réponse à l'historique
            this.conversationHistory.push({
                role: 'assistant',
                content: botResponse
            });

            // Afficher la réponse
            this.updateTypingIndicator(false);
            this.appendMessage(botResponse);

        } catch (error) {
            console.error('Erreur:', error);
            this.updateTypingIndicator(false);
            this.showError(`Erreur: ${error.message}`);
        }
    }
}

// Initialiser le chatbot quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
}); 