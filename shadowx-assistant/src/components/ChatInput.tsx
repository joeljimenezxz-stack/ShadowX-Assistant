import React, { useRef, useState, useEffect } from 'react';
import { Send, Image as ImageIcon, X, AlertCircle, ArrowUp, Loader2 } from 'lucide-react';
import { ImageAttachment } from '../types';

interface ChatInputProps {
  onSendMessage: (message: string, image?: ImageAttachment) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [attachedImage, setAttachedImage] = useState<ImageAttachment | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  // Handle paste events (e.g., pasting screenshots directly from clipboard)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const processImageFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('La imagen no debe superar los 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setAttachedImage({
        data: base64Data,
        mimeType: file.type,
        previewUrl: result,
        name: file.name || 'captura_roblox.png',
      });
    };
    reader.onerror = () => {
      setErrorMsg('Error al leer el archivo de imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // reset input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    if (!text.trim() && !attachedImage) return;

    onSendMessage(text.trim(), attachedImage || undefined);
    setText('');
    setAttachedImage(null);
    setErrorMsg(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 pb-4">
      {errorMsg && (
        <div className="mb-2 flex items-center gap-2 p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
          <button
            onClick={() => setErrorMsg(null)}
            className="ml-auto text-xs text-red-400 hover:text-red-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image Preview if attached */}
      {attachedImage && (
        <div className="mb-2 relative inline-flex items-center gap-3 p-2 bg-[#12131a] rounded-lg border border-red-900/60 shadow-lg">
          <div className="relative group">
            <img
              src={attachedImage.previewUrl}
              alt="Adjunto"
              className="w-14 h-14 object-cover rounded border border-zinc-700"
            />
          </div>
          <div className="flex flex-col text-xs">
            <span className="font-medium text-zinc-200 truncate max-w-[200px]">
              {attachedImage.name}
            </span>
            <span className="text-[11px] text-red-400 font-mono">
              Captura lista para analizar
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            className="p-1 rounded-full bg-zinc-800 hover:bg-red-900/80 text-zinc-300 hover:text-white transition-colors ml-2"
            title="Quitar imagen"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Input Form */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-[#0c0d12] border border-zinc-800 focus-within:border-red-600/70 rounded-2xl p-2 sm:p-2.5 transition-colors shadow-xl shadow-black/60"
      >
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
        />

        {/* Upload Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          title="Subir captura de Roblox Studio (o presiona Ctrl+V)"
          className="p-2 sm:p-2.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800/60 rounded-xl transition-colors shrink-0 disabled:opacity-40"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Escribe tu consulta sobre Luau o describe el script de Roblox Studio que necesitas..."
          rows={1}
          className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none resize-none py-1.5 px-1 max-h-44 min-h-[38px] leading-relaxed"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || (!text.trim() && !attachedImage)}
          className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-center transition-all shrink-0 ${
            text.trim() || attachedImage
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
          title="Enviar mensaje (Enter)"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-red-200" />
          ) : (
            <ArrowUp className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Helper caption */}
      <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-zinc-500">
        <span className="hidden sm:inline">
          Presiona <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Enter</kbd> para enviar, <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Shift+Enter</kbd> para nueva línea
        </span>
        <span className="flex items-center gap-1.5 text-zinc-500">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
          <span>Soporta pegar capturas con <kbd className="px-1 py-0.2 bg-zinc-800 rounded text-zinc-400 font-mono text-[10px]">Ctrl+V</kbd></span>
        </span>
      </div>
    </div>
  );
};
