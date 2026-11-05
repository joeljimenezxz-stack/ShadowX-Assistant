import React, { useState } from 'react';
import { Copy, Check, Terminal, User, Sparkles, Maximize2, X } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../types';
import { MarkdownContent } from './MarkdownContent';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group w-full py-4 px-3 sm:px-5 transition-colors ${
        isAssistant ? 'bg-[#08080c]/60' : 'bg-transparent'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-start gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center border border-red-500/40 shadow-lg shadow-red-950/50">
              <span className="font-mono font-black text-white text-xs tracking-tighter">SX</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 text-zinc-300">
              <User className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="flex-1 min-w-0">
          {/* Header info */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-200">
                {isAssistant ? 'ShadowX Assistant' : 'Tú'}
              </span>
              {isAssistant && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950/60 text-red-300 border border-red-800/40">
                  Roblox / Luau AI
                </span>
              )}
              <span className="text-[11px] text-zinc-500 font-mono">{formattedTime}</span>
            </div>

            <button
              onClick={handleCopyText}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-zinc-200 rounded hover:bg-zinc-800/60 text-xs flex items-center gap-1"
              title="Copiar texto completo"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Attached Image if present */}
          {message.image && (
            <div className="mb-3">
              <div
                onClick={() => setShowImageModal(true)}
                className="relative inline-block cursor-pointer group/img rounded-lg overflow-hidden border border-zinc-800 bg-[#0d0e14] max-w-sm hover:border-red-600/50 transition-colors"
              >
                <img
                  src={message.image.previewUrl}
                  alt={message.image.name || 'Captura de Roblox Studio'}
                  className="max-h-56 rounded-lg object-contain w-auto"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium">
                  <Maximize2 className="w-4 h-4 text-red-400" />
                  <span>Ampliar captura</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                Captura analizada: {message.image.name || 'Captura de Roblox Studio'}
              </p>
            </div>
          )}

          {/* Body Content */}
          <div className="text-zinc-200 text-sm leading-relaxed">
            {isAssistant ? (
              <MarkdownContent content={message.content} />
            ) : (
              <div className="whitespace-pre-wrap font-sans text-[13.5px] text-zinc-100">
                {message.content}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal Lightbox */}
      {showImageModal && message.image && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div
            className="relative max-w-5xl max-h-[90vh] bg-zinc-950 rounded-xl border border-zinc-800 p-2 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-2 border-b border-zinc-800 mb-2">
              <span className="text-xs font-mono text-zinc-300">
                {message.image.name || 'Captura de Roblox Studio'}
              </span>
              <button
                onClick={() => setShowImageModal(false)}
                className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={message.image.previewUrl}
              alt="Captura ampliada"
              className="max-h-[80vh] w-auto object-contain mx-auto rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
};
