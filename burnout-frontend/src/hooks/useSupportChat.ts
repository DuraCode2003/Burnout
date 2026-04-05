"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import SockJS from "sockjs-client";
import { Client, IMessage, Stomp } from "@stomp/stompjs";
import { ChatMessage } from "@/types/support";
import { supportService } from "@/services/supportService";

const SOCKET_URL = "http://localhost:8080/ws-support";

export function useSupportChat(sessionId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!sessionId) return;
    try {
      const history = await supportService.getChatHistory(sessionId);
      setMessages(history);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    fetchHistory();

    const socket = new SockJS(SOCKET_URL);
    const client = Stomp.over(() => socket);
    
    // Disable logging for production-grade feel
    client.debug = () => {};

    client.onConnect = () => {
      setIsConnected(true);
      client.subscribe(`/topic/support/${sessionId}`, (message: IMessage) => {
        const newMessage = JSON.parse(message.body) as ChatMessage;
        setMessages((prev) => {
          // Avoid duplicates if REST and WS overlap
          if (prev.some(m => m.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.activate();
    stompClient.current = client;

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [sessionId, fetchHistory]);

  const sendMessage = useCallback((content: string) => {
    if (stompClient.current && isConnected && sessionId) {
      // In a real app, we might want to send via STOMP for speed, 
      // but sending via REST ensures persistence and validation first.
      // We'll use the service which both saves and broadcasts.
      supportService.sendMessage(sessionId, content);
    }
  }, [isConnected, sessionId]);

  return {
    messages,
    isConnected,
    sendMessage,
    refreshHistory: fetchHistory
  };
}
