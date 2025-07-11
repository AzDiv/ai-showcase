import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, User, Bot, Minimize2, Maximize2 } from 'lucide-react';
import { InferenceClient } from '@huggingface/inference';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WebsiteChatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add welcome message when chat opens for the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: `Salut ! 👋 Je suis votre assistant IA pour HF AI Showcase.

Je peux vous aider avec :
• Navigation dans le playground et compréhension des modèles IA
• Informations sur les technologies utilisées
• Questions sur le créateur, Azeddine Bourchouk
• Fonctionnalités du site web

Que souhaitez-vous savoir ?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const client = new InferenceClient(import.meta.env.VITE_HF_TOKEN);
      
      const chatCompletion = await client.chatCompletion({
        provider: "fireworks-ai",
        model: "deepseek-ai/DeepSeek-R1-0528",
        stream: false,
        response_format: { type: "text" },
        messages: [
          {
            role: "system",
            content: `Tu es un assistant IA pour le site web "HF AI Showcase" créé par Azeddine Bourchouk. 

IMPORTANT: Réponds directement sans montrer ton processus de réflexion. Donne des réponses claires et concises.

Ton rôle est de :

1. Guider les utilisateurs à travers les fonctionnalités du site
2. Répondre aux questions sur les modèles IA disponibles dans le playground
3. Fournir des informations sur le créateur et le projet
4. Expliquer les technologies utilisées
5. Aider à comprendre comment utiliser les différents modèles IA

INFORMATIONS CLÉS SUR LE PROJET :
- Créateur : Azeddine Bourchouk, technicien spécialisé et développeur web passionné (Bac +2)
- Technologies : React, TypeScript, TailwindCSS, Hugging Face API
- Contexte : Projet personnel développé suite à la convocation à l'oral de l'École Supérieure d'Intelligence Artificielle de Taroudant
- Description : Plateforme web interactive permettant de tester en temps réel plusieurs modèles d'IA (NLP, vision, audio) via l'API Hugging Face
- Interface : Intuitive, responsive, avec sélection de modèles, envoi de prompts ou fichiers, et affichage dynamique des résultats

MODÈLES DISPONIBLES DANS LE PLAYGROUND :
• Texte : SmolLM3-3B - Modèle de langage compact pour génération de texte
• Chat : DeepSeek-R1 - Modèle de raisonnement avancé (Fireworks AI)
• Image : 
  - FLUX.1 Dev - Génération d'images avancée
  - Vision Transformer - Classification d'images
  - DETR - Détection d'objets
• Audio : Whisper Large V3 - Reconnaissance vocale et transcription avancées

PROFIL D'AZEDDINE BOURCHOUK :
- Technicien spécialisé et développeur web passionné
- Niveau Bac +2 avec solide expérience
- Conçoit des solutions digitales variées
- Spécialisé dans la création de sites web éducatifs
- Gestion de projets complexes intégrant plusieurs API
- Approche mêlant créativité, expertise technique et innovation constante
- Engagement dans l'apprentissage continu

Sois amical, technique quand approprié, et concentre-toi sur l'aide aux utilisateurs pour comprendre et naviguer le site. NE génère PAS de code sauf si spécifiquement demandé pour le dépannage. Garde les réponses concises et utiles. Réponds en français de préférence, mais adapte-toi à la langue de l'utilisateur.`
          },
          ...messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          {
            role: "user",
            content: userMessage.content
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9
      });

      // Extract only the final response, removing any thinking process
      let responseContent = chatCompletion.choices[0].message.content || 'Désolé, je n\'ai pas pu générer une réponse. Veuillez réessayer.';
      
      // Remove thinking process markers if they exist
      responseContent = responseContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
      responseContent = responseContent.replace(/\*\*Réflexion[\s\S]*?\*\*Réponse[\s\S]*?:/g, '').trim();
      responseContent = responseContent.replace(/^[\s\S]*?(?=\n\n[A-Z])/g, '').trim();
      
      // If response is empty after cleaning, provide fallback
      if (!responseContent) {
        responseContent = 'Je suis là pour vous aider avec le site HF AI Showcase. Que souhaitez-vous savoir ?';
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Website chatbox error:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Désolé, j\'ai des difficultés de connexion en ce moment. Veuillez réessayer dans un moment, ou n\'hésitez pas à explorer le playground par vous-même !',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    // Re-add welcome message
    const welcomeMessage: Message = {
      role: 'assistant',
      content: `Salut ! 👋 Je suis votre assistant IA pour HF AI Showcase.

Je peux vous aider avec :
• Navigation dans le playground et compréhension des modèles IA
• Informations sur les technologies utilisées
• Questions sur le créateur, Azeddine Bourchouk
• Fonctionnalités du site web

Que souhaitez-vous savoir ?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-110 z-50 group"
        aria-label="Ouvrir l'assistant IA"
      >
        <MessageCircle className="h-6 w-6" />
        <div className="absolute -top-12 right-0 bg-gray-900 text-white text-sm px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          Assistant IA
        </div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Assistant IA</h3>
            <p className="text-xs text-blue-100">Guide HF AI Showcase</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-blue-100 hover:text-white transition-colors p-1 rounded"
            aria-label={isMinimized ? "Agrandir le chat" : "Réduire le chat"}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-blue-100 hover:text-white transition-colors p-1 rounded"
            aria-label="Fermer le chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto max-h-80 bg-gradient-to-b from-gray-50 to-white">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-full flex-shrink-0">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] p-3 rounded-lg text-sm shadow-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-blue-200' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="bg-gray-600 p-2 rounded-full flex-shrink-0">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-full">
                    <Bot className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                      <span className="text-gray-600 text-sm">Je réfléchis...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Posez-moi une question sur le site..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={clearChat}
                  className="text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  disabled={isLoading}
                >
                  Nouvelle conversation
                </button>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default WebsiteChatbox;