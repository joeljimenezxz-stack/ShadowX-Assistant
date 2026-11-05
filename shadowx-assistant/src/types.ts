export type ScriptType = 'ServerScript' | 'LocalScript' | 'ModuleScript' | 'Generic';

export interface ImageAttachment {
  data: string; // base64 without prefix or with prefix
  mimeType: string;
  previewUrl: string;
  name?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: ImageAttachment;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface RobloxServiceGuide {
  name: string;
  iconName: string;
  scriptType: string;
  description: string;
  visibility: 'Server Only' | 'Client Only' | 'Replicated (Ambos)';
  recommendedFor: string[];
}
