export interface SynapseNode {
  id: string;
  word: string;
  role: string; // e.g., Subject, Predicate, Object
  weight: number; // 0.0 to 1.0 probability
  group: number;
}

export interface SynapseLink {
  source: string;
  target: string;
  value: number;
}

export interface SyntaxGraph {
  nodes: SynapseNode[];
  links: SynapseLink[];
}

export interface AIResponse {
  text: string;
  graph: SyntaxGraph;
}

export interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  graphData?: SyntaxGraph; // Only for AI messages
  timestamp: number;
}

export enum ConnectionStatus {
  IDLE = 'IDLE',
  THINKING = 'THINKING',
  ERROR = 'ERROR',
}