import React from 'react';
import { Terminal, Database, Zap, ShieldAlert, Sparkles, FolderTree, Upload } from 'lucide-react';
import shadowxLogo from '../assets/images/shadowx_logo_1793906633158.jpg';

interface WelcomeViewProps {
  onSelectPrompt: (prompt: string) => void;
  onOpenGuide: () => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onSelectPrompt, onOpenGuide }) => {
  const promptCards = [
    {
      title: 'Sistema de Leaderstats & DataStore',
      tag: 'ServerScriptService',
      desc: 'Script completo para guardar Oro, Nivel y Estadísticas con DataStoreService y pcall.',
      prompt: 'Genera un script completo de Leaderstats con guardado automático y al salir usando DataStoreService en ServerScriptService para guardar Oro y Nivel del jugador de forma segura.',
      icon: Database,
      accent: 'border-blue-900/40 hover:border-blue-500/50 text-blue-400',
    },
    {
      title: 'Sprint con Barra de Estamina & Animación',
      tag: 'StarterPlayerScripts',
      desc: 'LocalScript con UserInputService, cambio de WalkSpeed y animación suave de correr.',
      prompt: 'Crea un LocalScript en StarterPlayerScripts para un sistema de Sprint con Shift, que consuma estamina progresivamente y restaure la velocidad normal al agotarse.',
      icon: Zap,
      accent: 'border-amber-900/40 hover:border-amber-500/50 text-amber-400',
    },
    {
      title: 'Diagnosticar Error de Roblox Studio',
      tag: 'Output / Debugging',
      desc: 'Sube una captura de pantalla del Output o describe el error (nil value, Infinite yield, etc.).',
      prompt: 'Tengo un error en Roblox Studio: "attempt to index nil with \'Character\'" en mi script. ¿Por qué ocurre y cómo lo soluciono paso a paso?',
      icon: ShieldAlert,
      accent: 'border-red-900/40 hover:border-red-500/50 text-red-400',
    },
    {
      title: 'Tienda Segura con RemoteEvents',
      tag: 'ReplicatedStorage',
      desc: 'Arquitectura cliente-servidor para comprar items protegiendo el juego contra exploiters.',
      prompt: 'Crea la arquitectura completa de una tienda de espadas en Roblox Studio: LocalScript para la UI, RemoteEvent en ReplicatedStorage y Script en ServerScriptService con verificación de dinero.',
      icon: Terminal,
      accent: 'border-purple-900/40 hover:border-purple-500/50 text-purple-400',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full my-auto text-center">
      {/* Brand Hero */}
      <div className="relative mb-5 group">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-red-600/40 shadow-2xl shadow-red-950/60 bg-black flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-105">
          <img
            src={shadowxLogo}
            alt="ShadowX Studios Emblem"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded bg-red-950 border border-red-600 text-[10px] font-mono font-bold text-red-200">
          PRO LUAU
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
        SHADOWX ASSISTANT
      </h1>
      <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto mb-6 leading-relaxed">
        IA especializada en <span className="text-red-400 font-semibold">Roblox Studio</span>, programación <span className="text-red-400 font-semibold">Luau</span> y desarrollo de videojuegos por <span className="text-zinc-200 font-medium">ShadowX Studios</span>.
      </p>

      {/* Guide quick banner */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14151f] hover:bg-[#1a1b28] border border-red-950 hover:border-red-800/60 text-zinc-300 hover:text-white text-xs transition-colors"
        >
          <FolderTree className="w-3.5 h-3.5 text-red-500" />
          <span>Ver Guía de Jerarquía del Explorer</span>
        </button>
      </div>

      {/* Prompt suggestions grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
        {promptCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(card.prompt)}
              className={`p-4 rounded-xl border bg-[#0d0e14] hover:bg-[#12131c] transition-all flex flex-col justify-between group cursor-pointer ${card.accent}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="font-semibold text-xs text-zinc-100 group-hover:text-red-300 transition-colors">
                      {card.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {card.tag}
                  </span>
                </div>
                <p className="text-[12px] text-zinc-400 leading-snug">
                  {card.desc}
                </p>
              </div>
              <div className="mt-3 text-[11px] font-medium text-red-400/80 group-hover:text-red-400 flex items-center gap-1">
                <span>Generar solución</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
