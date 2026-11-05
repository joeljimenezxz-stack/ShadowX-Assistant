import React, { useState, useEffect, useRef } from 'react';
import { Conversation, ChatMessage as ChatMessageType, ImageAttachment } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeView } from './components/WelcomeView';
import { StudioGuideModal } from './components/StudioGuideModal';
import { Loader2, Terminal, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'shadowx_conversations_v1';
const ACTIVE_CHAT_KEY = 'shadowx_active_chat_id';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading conversations from localStorage:', e);
    }
    return [];
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_CHAT_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations:', e);
    }
  }, [conversations]);

  useEffect(() => {
    try {
      if (activeChatId) {
        localStorage.setItem(ACTIVE_CHAT_KEY, activeChatId);
      } else {
        localStorage.removeItem(ACTIVE_CHAT_KEY);
      }
    } catch (e) {
      console.error('Failed to save active chat ID:', e);
    }
  }, [activeChatId]);

  const activeConversation = conversations.find((c) => c.id === activeChatId) || null;

  // Auto-scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [activeConversation?.messages.length, isLoading]);

  const handleNewChat = () => {
    const newChatId = `chat_${Date.now()}`;
    const newChat: Conversation = {
      id: newChatId,
      title: 'Nueva Consulta Luau',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
    setGeneralError(null);
  };

  const handleDeleteChat = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeChatId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleSendMessage = async (userText: string, image?: ImageAttachment) => {
    setGeneralError(null);

    let currentId = activeChatId;
    let targetConversation = conversations.find((c) => c.id === currentId);

    // If no active chat exists, create one
    if (!currentId || !targetConversation) {
      const newChatId = `chat_${Date.now()}`;
      const title = userText.trim().slice(0, 36) || (image ? 'Análisis de Captura Studio' : 'Consulta Luau');
      const newChat: Conversation = {
        id: newChatId,
        title: title,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setConversations((prev) => [newChat, ...prev]);
      setActiveChatId(newChatId);
      currentId = newChatId;
      targetConversation = newChat;
    }

    const userMessage: ChatMessageType = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: userText,
      image: image,
      timestamp: Date.now(),
    };

    // If it's the first message, update chat title intelligently
    if (targetConversation.messages.length === 0) {
      const autoTitle = userText
        ? userText.slice(0, 35) + (userText.length > 35 ? '...' : '')
        : 'Análisis de Captura Roblox';
      handleRenameChat(currentId, autoTitle);
    }

    // Add user message to conversation
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentId
          ? {
              ...c,
              messages: [...c.messages, userMessage],
              updatedAt: Date.now(),
            }
          : c
      )
    );

    // Prepare assistant placeholder message
    const assistantMessageId = `msg_asst_${Date.now()}`;
    const assistantPlaceholder: ChatMessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentId
          ? {
              ...c,
              messages: [...c.messages, assistantPlaceholder],
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsLoading(true);

    // Build context history for backend
    const historyPayload = (targetConversation.messages || []).map((m) => ({
      role: m.role,
      content: m.content,
      image: m.image
        ? {
            mimeType: m.image.mimeType,
            data: m.image.data,
          }
        : undefined,
    }));

    try {
      // Try streaming endpoint first
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          image: image
            ? {
                mimeType: image.mimeType,
                data: image.data,
              }
            : undefined,
          history: historyPayload,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor (${response.status})`);
      }

      if (!response.body) {
        throw new Error('La respuesta del servidor no tiene flujo de datos.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.text) {
                accumulatedText += data.text;
                // Update assistant message in state
                setConversations((prev) =>
                  prev.map((c) =>
                    c.id === currentId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantMessageId
                              ? { ...m, content: accumulatedText }
                              : m
                          ),
                        }
                      : c
                  )
                );
              }
            } catch (err) {
              console.warn('Could not parse SSE chunk:', dataStr, err);
            }
          }
        }
      }

      // If streaming ended with empty response, fallback
      if (!accumulatedText.trim()) {
        throw new Error('La IA no devolvió contenido.');
      }
    } catch (err: any) {
      console.error('Streaming error, falling back to standard endpoint:', err);

      try {
        // Fallback to non-streaming endpoint
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            image: image
              ? {
                  mimeType: image.mimeType,
                  data: image.data,
                }
              : undefined,
            history: historyPayload,
          }),
        });

        if (!fallbackRes.ok) {
          const errBody = await fallbackRes.json().catch(() => ({}));
          throw new Error(errBody.error || `Error HTTP ${fallbackRes.status}`);
        }

        const data = await fallbackRes.json();
        const reply = data.reply || 'No se recibió respuesta.';

        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: reply } : m
                  ),
                }
              : c
          )
        );
      } catch (fallbackErr: any) {
        console.error('Fallback endpoint also failed:', fallbackErr);
        const errorText = `⚠️ **Error de ShadowX Assistant:**\n${fallbackErr.message || 'No se pudo conectar con el servicio de IA de Gemini. Verifica tu clave de API en Settings > Secrets.'}`;

        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === assistantMessageId ? { ...m, content: errorText } : m
                  ),
                }
              : c
          )
        );
        setGeneralError(fallbackErr.message || 'Error de conexión con la IA');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070709] text-zinc-100 font-sans">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeChatId={activeChatId}
        onSelectChat={(id) => setActiveChatId(id)}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenGuide={() => setGuideModalOpen(true)}
        onSelectQuickPrompt={(prompt) => handleSendMessage(prompt)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onNewChat={handleNewChat}
          onOpenGuide={() => setGuideModalOpen(true)}
          activeChatTitle={activeConversation?.title}
        />

        {generalError && (
          <div className="bg-red-950/90 border-b border-red-800 px-4 py-2 text-xs text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{generalError}</span>
            </div>
            <button
              onClick={() => setGeneralError(null)}
              className="text-red-400 hover:text-white underline text-xs"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Messages or Welcome View */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <WelcomeView
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              onOpenGuide={() => setGuideModalOpen(true)}
            />
          ) : (
            <div className="py-4 space-y-2">
              {activeConversation.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {isLoading && activeConversation.messages[activeConversation.messages.length - 1]?.role === 'assistant' && !activeConversation.messages[activeConversation.messages.length - 1]?.content && (
                <div className="py-4 px-3 sm:px-5 bg-[#08080c]/60">
                  <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center border border-red-500/40">
                      <span className="font-mono font-black text-white text-xs">SX</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                      <span>ShadowX Assistant está analizando y redactando en Luau...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0 bg-gradient-to-t from-[#070709] via-[#070709] to-transparent pt-2">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>

      {/* Roblox Studio Explorer & Architecture Guide Modal */}
      <StudioGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onSelectPrompt={(prompt) => handleSendMessage(prompt)}
      />
    </div>
  );
}
