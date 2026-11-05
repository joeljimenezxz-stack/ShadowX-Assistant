import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  FolderTree,
  Terminal,
  X,
  Edit2,
  Check,
  Code,
  ShieldAlert,
  Database,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Conversation } from '../types';
import shadowxLogo from '../assets/images/shadowx_logo_1793906633158.jpg';

interface SidebarProps {
  conversations: Conversation[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenGuide: () => void;
  onSelectQuickPrompt: (prompt: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onClose,
  onOpenGuide,
  onSelectQuickPrompt,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const quickTools = [
    {
      title: 'Sistema de Guardado (DataStore)',
      prompt: 'Genera un script completo de DataStoreService con pcall y guardado automático para Roblox Studio.',
      icon: Database,
    },
    {
      title: 'Combate & Hitbox Cuerpo a Cuerpo',
      prompt: '¿Cómo implementar un sistema de combate cuerpo a cuerpo (melee combo) en Roblox Studio con animaciones y hitbox segura en el servidor?',
      icon: Code,
    },
    {
      title: 'Corregir Error de Nil Index',
      prompt: '¿Cómo solucionar el error típico "attempt to index nil with..." en Roblox Studio cuando un jugador o Character aún no ha cargado?',
      icon: ShieldAlert,
    },
    {
      title: 'Comunicación con RemoteEvents',
      prompt: 'Explica con código cliente y servidor cómo disparar y escuchar RemoteEvents en ReplicatedStorage de forma segura.',
      icon: Layers,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 sm:w-80 bg-[#08080c] border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between bg-[#0b0c12]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-red-600/40 bg-black flex items-center justify-center shrink-0">
              <img
                src={shadowxLogo}
                alt="ShadowX Studios"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">
                  SHADOWX
                </span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-red-950 text-red-400 border border-red-800/50">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                ShadowX Studios
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Primary Button */}
        <div className="p-3 border-b border-zinc-800/60">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Chat</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="px-2 py-1 text-[11px] font-mono text-zinc-500 uppercase tracking-wider flex items-center justify-between">
            <span>Historial ({conversations.length})</span>
          </div>

          {conversations.length === 0 ? (
            <div className="py-8 px-4 text-center text-xs text-zinc-500">
              <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-50" />
              <span>No hay conversaciones aún. ¡Inicia una nueva consulta!</span>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.id === activeChatId;
              const isEditing = editingId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectChat(conv.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={`group relative flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-red-950/40 text-red-200 border border-red-900/50'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? 'text-red-400' : 'text-zinc-600 group-hover:text-zinc-400'
                      }`}
                    />

                    {isEditing ? (
                      <form
                        onSubmit={(e) => saveRename(conv.id, e)}
                        className="flex-1 flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          autoFocus
                          onBlur={() => saveRename(conv.id)}
                          className="bg-black/60 border border-red-700/60 rounded px-1.5 py-0.5 text-xs text-white w-full focus:outline-none"
                        />
                        <button
                          type="submit"
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startRename(conv, e)}
                        className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                        title="Renombrar conversación"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(conv.id);
                        }}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800"
                        title="Eliminar conversación"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Quick Roblox Tools Section */}
          <div className="pt-4 mt-4 border-t border-zinc-800/60">
            <div className="px-2 pb-1 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Herramientas Rápidas
            </div>
            <div className="space-y-1">
              {quickTools.map((tool, idx) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectQuickPrompt(tool.prompt);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className="w-full flex items-center justify-between text-left px-2.5 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 transition-colors group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 text-red-500/80 group-hover:text-red-400 shrink-0" />
                      <span className="truncate">{tool.title}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Explorer Guide Link & Footer */}
        <div className="p-3 border-t border-zinc-800/80 bg-[#0a0a0f] space-y-2">
          <button
            onClick={() => {
              onOpenGuide();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#11121a] hover:bg-[#161722] border border-red-950/80 text-zinc-300 hover:text-white text-xs transition-colors"
          >
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-red-500" />
              <span>Guía del Explorer</span>
            </div>
            <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-1.5 py-0.2 rounded border border-red-900/40">
              DOCS
            </span>
          </button>

          <div className="px-2 pt-1 flex items-center justify-between text-[10px] text-zinc-600 font-mono">
            <span>© ShadowX Studios</span>
            <span>Luau 5.1 Engine</span>
          </div>
        </div>
      </aside>
    </>
  );
};
