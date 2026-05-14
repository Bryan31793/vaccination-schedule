import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  text: '¡Hola! 👋 Soy tu asistente de vacunación con IA. Puedo responder preguntas sobre esquemas de vacunación, efectos secundarios, pacientes registrados y más. ¿En qué puedo ayudarte?',
  isUser: false,
};

interface ChatContextValue {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, addMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextValue => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
};
