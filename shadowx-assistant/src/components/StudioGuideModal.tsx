import React, { useState } from 'react';
import { X, FolderTree, Server, Monitor, Layers, Box, Cpu, ShieldCheck, Database, Zap, BookOpen } from 'lucide-react';

interface StudioGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const StudioGuideModal: React.FC<StudioGuideModalProps> = ({ isOpen, onClose, onSelectPrompt }) => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'security' | 'luau_snippets'>('hierarchy');

  if (!isOpen) return null;

  const services = [
    {
      name: 'ServerScriptService',
      icon: Server,
      type: 'Script (RunContext: Server)',
      visibility: 'Servidor Exclusivo',
      color: 'border-blue-500/30 text-blue-400 bg-blue-950/20',
      description: 'Lógica del servidor protegida. Los clientes NO pueden descargar ni ver este código.',
      examples: ['Guardado de datos (DataStores)', 'Gestión de inventario y oro', 'Cálculo de daño y recompensas', 'Sistemas anti-trampas'],
    },
    {
      name: 'StarterPlayer > StarterPlayerScripts',
      icon: Monitor,
      type: 'LocalScript',
      visibility: 'Cliente Exclusivo',
      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
      description: 'Scripts que se ejecutan una sola vez cuando el jugador entra al juego.',
      examples: ['Sistemas de cámaras personalizadas', 'Control de música local y ambiente', 'Detección de teclas (UserInputService)', 'Sistemas de sprint / agacharse'],
    },
    {
      name: 'StarterPlayer > StarterCharacterScripts',
      icon: Cpu,
      type: 'LocalScript o Script',
      visibility: 'Se clona en cada reaparición',
      color: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
      description: 'Scripts que se colocan dentro del modelo Character cada vez que el jugador reaparece (respawn).',
      examples: ['Regeneración de vida custom', 'Animaciones de pasos o partículas de salto', 'Efectos de estado (aturdimiento, congelamiento)'],
    },
    {
      name: 'ReplicatedStorage',
      icon: Layers,
      type: 'ModuleScripts, RemoteEvents, Folders',
      visibility: 'Compartido (Servidor + Cliente)',
      color: 'border-purple-500/30 text-purple-400 bg-purple-950/20',
      description: 'Almacén visible tanto por el servidor como por todos los clientes.',
      examples: ['RemoteEvents y RemoteFunctions para comunicación', 'Módulos compartidos (fórmulas, configuración, items)', 'Animaciones y modelos cosméticos replicados'],
    },
    {
      name: 'ServerStorage',
      icon: ShieldCheck,
      type: 'Modelos, Herramientas, Folders',
      visibility: 'Servidor Exclusivo (Oculto)',
      color: 'border-red-500/30 text-red-400 bg-red-950/20',
      description: 'Almacena objetos que los clientes no deben inspeccionar ni precargar antes de tiempo.',
      examples: ['Mapas que se cargan por rondas', 'Herramientas (Tools) que se otorgan al comprar', 'NPCs y enemigos antes de spawnear'],
    },
    {
      name: 'StarterGui',
      icon: Box,
      type: 'ScreenGui con LocalScripts',
      visibility: 'Se clona a PlayerGui',
      color: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20',
      description: 'Interfaces de usuario visuales (HUD, tiendas, barras de vida).',
      examples: ['Botones interactivos y menús de pausa', 'Barras de vida y stamina con TweenService', 'Diálogos con NPCs'],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[88vh] bg-[#0c0d13] border border-red-950/80 rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-[#101118]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950/60 border border-red-800/40 flex items-center justify-center text-red-400">
              <FolderTree className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                Guía de Arquitectura de Roblox Studio
              </h2>
              <p className="text-xs text-zinc-400">
                Dónde colocar cada tipo de script y cómo estructurar tu juego en Luau
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-zinc-800/80 bg-[#09090d] text-xs">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'hierarchy'
                ? 'bg-red-600/20 text-red-300 border border-red-600/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Jerarquía del Explorer
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-red-600/20 text-red-300 border border-red-600/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Seguridad Servidor / Cliente
          </button>
          <button
            onClick={() => setActiveTab('luau_snippets')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'luau_snippets'
                ? 'bg-red-600/20 text-red-300 border border-red-600/40'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Snippets Esenciales
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'hierarchy' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {services.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.name}
                    className="p-4 rounded-xl border border-zinc-800/80 bg-[#11121a] hover:border-red-900/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-red-400" />
                        <h3 className="font-semibold text-sm text-zinc-100 font-mono">
                          {item.name}
                        </h3>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${item.color}`}>
                        {item.visibility}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400 mb-2.5 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="text-[11px] text-zinc-500 font-mono mb-1.5">
                      Tipo de Script recomendado: <span className="text-zinc-300">{item.type}</span>
                    </div>

                    <div className="space-y-1 mt-2 pt-2 border-t border-zinc-800/60">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                        Casos de uso:
                      </span>
                      {item.examples.map((ex, i) => (
                        <div key={i} className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                          <span className="text-red-500">•</span>
                          <span>{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 text-xs leading-relaxed text-zinc-300">
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/40">
                <h3 className="text-sm font-bold text-red-300 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  Regla de Oro: "Never Trust the Client"
                </h3>
                <p className="text-zinc-300 mb-2">
                  Los jugadores pueden modificar cualquier LocalScript, cambiar variables en memoria o invocar
                  RemoteEvents con valores falsificados.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="p-3 rounded-lg bg-black/40 border border-red-900/40">
                    <span className="text-red-400 font-bold block mb-1">❌ Inseguro (Exploitable)</span>
                    <code className="text-[11px] font-mono text-zinc-400">
                      -- El cliente le dice al server cuánto daño hizo<br />
                      DamageEvent:FireServer(1000000)
                    </code>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-emerald-900/40">
                    <span className="text-emerald-400 font-bold block mb-1">✅ Seguro (ShadowX Standard)</span>
                    <code className="text-[11px] font-mono text-zinc-400">
                      -- El cliente solo pide atacar.<br />
                      -- El Server valida distancia, arma y cooldown.
                    </code>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#11121a] border border-zinc-800">
                <h4 className="font-semibold text-zinc-200 text-sm mb-2 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Protección de DataStores con pcall
                </h4>
                <p className="text-zinc-400 mb-2">
                  Las llamadas a DataStore pueden fallar por problemas de conectividad con los servidores de Roblox.
                  Nunca invoques GetAsync o SetAsync sin un bloque <code className="text-red-400 font-mono">pcall</code>:
                </p>
                <pre className="p-3 rounded-lg bg-black/60 font-mono text-[11px] text-zinc-300 border border-zinc-800/80 overflow-x-auto">
{`local success, data = pcall(function()
    return myDataStore:GetAsync("Player_" .. player.UserId)
end)

if success then
    print("Datos cargados correctamente:", data)
else
    warn("Error al cargar datos:", data)
end`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'luau_snippets' && (
            <div className="space-y-3">
              {[
                {
                  title: 'DataStore con Leaderstats',
                  desc: 'Genera el script completo del servidor con guardado de monedas y nivel.',
                  prompt: 'Crea un script completo de Leaderstats con DataStoreService en ServerScriptService para guardar Monedas y Nivel del jugador de forma segura con pcall.',
                },
                {
                  title: 'Sprint con Animación y Stamina',
                  desc: 'LocalScript para correr con Shift, limitar stamina y reproducir animación.',
                  prompt: 'Genera un LocalScript en StarterPlayerScripts para sistema de Sprint con Shift, barra de estamina y aumento de WalkSpeed.',
                },
                {
                  title: 'Puerta Interactiva con ProximityPrompt',
                  desc: 'Abre y cierra una puerta con TweenService al presionar la tecla E.',
                  prompt: 'Crea un Script para una puerta que se abre suavemente con TweenService al activar un ProximityPrompt.',
                },
                {
                  title: 'Sistema de Tienda con RemoteEvents',
                  desc: 'Arquitectura completa cliente-servidor para comprar espadas u objetos.',
                  prompt: 'Explica y crea el código cliente y servidor para una tienda de armas usando RemoteEvents en ReplicatedStorage de forma 100% segura.',
                },
              ].map((snippet, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-800 bg-[#11121a] hover:border-red-900/60 transition-colors"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">{snippet.title}</h4>
                    <p className="text-xs text-zinc-400">{snippet.desc}</p>
                  </div>
                  {onSelectPrompt && (
                    <button
                      onClick={() => {
                        onSelectPrompt(snippet.prompt);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-200 border border-red-600/30 text-xs font-medium whitespace-nowrap ml-3"
                    >
                      Preguntar a la IA
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
