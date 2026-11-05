// Luau syntax highlighter and parser for Roblox Studio code

export function highlightLuau(code: string): string {
  // Escape HTML entities first
  const escapeHtml = (text: string) =>
    text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const lines = code.split('\n');

  return lines
    .map((line) => {
      // Check for whole line comments
      const trimmed = line.trimStart();
      if (trimmed.startsWith('--')) {
        return `<span class="text-zinc-500 italic">${escapeHtml(line)}</span>`;
      }

      let parsed = escapeHtml(line);

      // Strings (double quotes, single quotes, backticks)
      parsed = parsed.replace(
        /(&quot;.*?&quot;|&#039;.*?&#039;|`.*?`)/g,
        '<span class="text-emerald-400">$1</span>'
      );

      // Comments after code
      parsed = parsed.replace(
        /(--.*)$/g,
        '<span class="text-zinc-500 italic">$1</span>'
      );

      // Numbers
      parsed = parsed.replace(
        /\b(\d+(\.\d+)?)\b(?![^<]*>)/g,
        '<span class="text-amber-400">$1</span>'
      );

      // Luau Keywords
      const keywords = [
        'local', 'function', 'end', 'if', 'then', 'else', 'elseif',
        'return', 'for', 'in', 'do', 'while', 'repeat', 'until',
        'break', 'continue', 'and', 'or', 'not', 'true', 'false',
        'nil', 'type', 'export'
      ];
      const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b(?![^<]*>)`, 'g');
      parsed = parsed.replace(keywordRegex, '<span class="text-rose-400 font-semibold">$1</span>');

      // Roblox Core Classes & Services
      const builtins = [
        'game', 'workspace', 'script', 'Enum', 'Vector3', 'CFrame',
        'Color3', 'ColorSequence', 'NumberSequence', 'UDim2', 'UDim',
        'Instance', 'task', 'math', 'string', 'table', 'coroutine',
        'pcall', 'xpcall', 'print', 'warn', 'error', 'typeof',
        'TweenInfo', 'RaycastParams', 'BrickColor'
      ];
      const builtinsRegex = new RegExp(`\\b(${builtins.join('|')})\\b(?![^<]*>)`, 'g');
      parsed = parsed.replace(builtinsRegex, '<span class="text-cyan-400">$1</span>');

      // Common Roblox methods
      parsed = parsed.replace(
        /(:[a-zA-Z0-9_]+)/g,
        '<span class="text-red-300">$1</span>'
      );

      return parsed;
    })
    .join('\n');
}

export function detectScriptMetadata(code: string, surroundingText: string = ''): {
  type: 'ServerScript' | 'LocalScript' | 'ModuleScript' | 'Generic';
  locationHint?: string;
} {
  const combined = (surroundingText + '\n' + code).toLowerCase();

  let type: 'ServerScript' | 'LocalScript' | 'ModuleScript' | 'Generic' = 'Generic';
  let locationHint: string | undefined = undefined;

  if (combined.includes('localscript') || combined.includes('local script') || combined.includes('starterplayerscripts') || combined.includes('startergui') || combined.includes('userinputservice')) {
    type = 'LocalScript';
    if (combined.includes('startergui')) {
      locationHint = 'StarterGui > ScreenGui';
    } else if (combined.includes('startercharacter')) {
      locationHint = 'StarterPlayer > StarterCharacterScripts';
    } else {
      locationHint = 'StarterPlayer > StarterPlayerScripts';
    }
  } else if (combined.includes('modulescript') || combined.includes('module script') || combined.includes('return module') || combined.includes('return ') && code.includes('{}')) {
    type = 'ModuleScript';
    locationHint = 'ReplicatedStorage (o ServerStorage)';
  } else if (combined.includes('serverscriptservice') || combined.includes('datastore') || combined.includes('leaderstats') || combined.includes('onserverevent')) {
    type = 'ServerScript';
    locationHint = 'ServerScriptService';
  }

  return { type, locationHint };
}
