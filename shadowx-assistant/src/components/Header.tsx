import React from 'react';
import { Menu, Plus, FolderTree, Sparkles, Terminal } from 'lucide-react';
import shadowxLogo from '../assets/images/shadowx_logo_1793906633158.jpg';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  onOpenGuide: () => void;
  activeChatTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  onOpenGuide,
  activeChatTitle,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800/80 bg-[#08080c]/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 shrink-0 z-30">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors md:hidden"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md overflow-hidden border border-red-600/50 bg-black shrink-0">
            <img
              src={shadowxLogo}
              alt="ShadowX Studios"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-white tracking-tight whitespace-nowrap">
              ShadowX Assistant
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-950/80 text-red-300 border border-red-800/40">
              Roblox Studio & Luau
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Active Chat Title (hidden on small screens) */}
      {activeChatTitle && (
        <div className="hidden lg:flex items-center gap-2 text-xs text-zinc-400 max-w-sm truncate font-mono">
          <Terminal className="w-3.5 h-3.5 text-red-500 shrink-0" />
          <span className="truncate">{activeChatTitle}</span>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-[#14151f] hover:bg-[#1a1b28] border border-zinc-800 hover:border-red-900/60 transition-colors whitespace-nowrap"
          title="Guía de Explorer y Servicios"
        >
          <FolderTree className="w-3.5 h-3.5 text-red-500" />
          <span className="hidden sm:inline">Guía Explorer</span>
        </button>

        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-950/40 transition-colors whitespace-nowrap"
          title="Iniciar nuevo chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nuevo Chat</span>
        </button>
      </div>
    </header>
  );
};
