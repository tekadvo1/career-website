export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "failed";
}

export interface AssistantContextData {
  type: "general" | "roadmap" | "project" | "lesson";
  topicId?: string;
  topicName?: string;
  projectId?: string;
  projectTitle?: string;
  currentTask?: string;
}
