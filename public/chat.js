class ChatBot {
    constructor() {
        this.chatLog = document.getElementById('chat-log');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.conversationHistory = [];

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

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        // Afficher le message de l'utilisateur
        this.appendMessage(message, true);
        this.userInput.value = '';

        // Afficher l'indicateur de frappe
        this.typingIndicator.style.display = 'block';

        try {
            // Ajouter le message à l'historique
            this.conversationHistory.push({
                role: 'user',
                content: message
            });

            // Préparer le contexte du système
            const systemMessage = {
                role: 'system',
                content: 'Tu es Eliza, un assistant IA amical et serviable. Réponds de manière claire et concise en français.'
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
                throw new Error(`Erreur serveur: ${response.status}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;

            // Ajouter la réponse à l'historique
            this.conversationHistory.push({
                role: 'assistant',
                content: botResponse
            });

            // Afficher la réponse
            this.typingIndicator.style.display = 'none';
            this.appendMessage(botResponse);

        } catch (error) {
            console.error('Erreur:', error);
            this.typingIndicator.style.display = 'none';
            this.appendMessage("Désolé, une erreur s'est produite. Veuillez réessayer.");
        }
    }
}

// Initialiser le chatbot quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
}); 