import React, { useState } from 'react';
import { Copy, Check, Download, FolderTree, Terminal, Code2 } from 'lucide-react';
import { highlightLuau, detectScriptMetadata } from '../utils/luauHighlighter';

interface CodeBlockProps {
  code: string;
  language?: string;
  surroundingContext?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'luau', surroundingContext = '' }) => {
  const [copied, setCopied] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const cleanCode = code.trim();
  const metadata = detectScriptMetadata(cleanCode, surroundingContext);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar código:', err);
    }
  };

  const handleDownload = () => {
    const filename = `${metadata.type !== 'Generic' ? metadata.type : 'Script'}_${Date.now()}.luau`;
    const blob = new Blob([cleanCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lineCount = cleanCode.split('\n').length;
  const highlightedHtml = highlightLuau(cleanCode);

  return (
    <div className="my-4 rounded-xl border border-red-950/70 bg-[#0c0d12] overflow-hidden shadow-xl shadow-black/40">
      {/* Code Block Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-[#12131a] border-b border-red-950/50 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/40 border border-red-600/30 text-red-300 font-mono text-[11px]">
            <Code2 className="w-3 h-3 text-red-400" />
            <span>{language.toUpperCase() || 'LUAU'}</span>
          </div>

          {metadata.type !== 'Generic' && (
            <span
              className={`px-2 py-0.5 rounded font-mono text-[11px] font-medium border ${
                metadata.type === 'ServerScript'
                  ? 'bg-blue-950/40 text-blue-300 border-blue-600/30'
                  : metadata.type === 'LocalScript'
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/30'
                  : 'bg-purple-950/40 text-purple-300 border-purple-600/30'
              }`}
            >
              {metadata.type}
            </span>
          )}

          {metadata.locationHint && (
            <span className="hidden sm:inline-flex items-center gap-1 text-zinc-400 text-[11px]">
              <FolderTree className="w-3 h-3 text-red-500" />
              <span>{metadata.locationHint}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownload}
            title="Descargar archivo .luau"
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Descargar</span>
          </button>

          <button
            onClick={handleCopy}
            title="Copiar código al portapapeles"
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium text-xs transition-all ${
              copied
                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-600/20 hover:bg-red-600/30 text-red-200 border border-red-600/30'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code display with line numbers */}
      <div className="relative overflow-x-auto p-3 text-xs leading-5 font-mono">
        <div className="flex gap-3">
          <div className="select-none text-zinc-600 text-right pr-2 border-r border-zinc-800/80 font-mono text-[11px] leading-5 min-w-[2rem]">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <pre
            className="flex-1 overflow-x-auto text-zinc-200 text-[12px] leading-5"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      </div>
    </div>
  );
};
