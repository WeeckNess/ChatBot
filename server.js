import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Mistral } from '@mistralai/mistralai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Initialisation du client Mistral
const client = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY,
    baseURL: 'https://api.mistral.ai/v1'
});

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour logger les requêtes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Servir les fichiers statiques
app.use(express.static('public'));

// Route API pour le chat
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Format de messages invalide' });
        }

        console.log('Messages reçus:', messages);
        console.log('Agent ID:', process.env.MISTRAL_AGENT_ID);

        const response = await client.agents.complete({
            agentId: process.env.MISTRAL_AGENT_ID,
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000
        });

        console.log('Réponse reçue de l\'agent Mistral');
        res.json({
            choices: [{
                message: response.choices[0].message
            }]
        });
    } catch (error) {
        console.error('Erreur détaillée:', error);
        res.status(500).json({ 
            error: 'Erreur lors de la communication avec l\'API',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
    console.log(`API Key chargée: ${process.env.MISTRAL_API_KEY ? 'Oui' : 'Non'}`);
    console.log(`Agent ID chargé: ${process.env.MISTRAL_AGENT_ID ? 'Oui' : 'Non'}`);
}); 