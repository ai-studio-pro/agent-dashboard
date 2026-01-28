import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  taskId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
}

interface TaskUpdate {
  taskId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  agent?: string;
}

interface StreamEvent {
  type: 'message' | 'task_update' | 'state_change' | 'error';
  data: any;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const queryClient = useQueryClient();

  // 🔌 Connect to SSE stream for real-time updates
  useEffect(() => {
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/sse/state');
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          console.log('SSE connected');
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            // Invalidate queries to refresh UI with latest state
            queryClient.invalidateQueries({ queryKey: ['agents'] });
            queryClient.invalidateQueries({ queryKey: ['tasks'] });

            // Handle different event types
            if (data.tasks) {
              // Update task status in messages
              data.tasks.forEach((task: any) => {
                setMessages(prev => prev.map(msg => 
                  msg.taskId === task.id 
                    ? { ...msg, status: task.status }
                    : msg
                ));
              });
            }
          } catch (err) {
            console.error('Error parsing SSE data:', err);
          }
        };

        eventSource.onerror = () => {
          setIsConnected(false);
          console.error('SSE connection error');
          eventSource.close();

          // Reconnect after 5 seconds
          setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.error('Failed to establish SSE connection:', err);
      }
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [queryClient]);

  // 📨 Send message to Dispatcher
  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Detect intent and route to appropriate agent
      const response = await fetch('https://paint-farming-rocky-street.trycloudflare.com/webhook-test/maya/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content,
          userId: 'user-123', // TODO: Get from auth context
          timestamp: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response || data.message || 'מעבד את הבקשה...',
        timestamp: new Date(),
        taskId: data.taskId,
        status: data.taskId ? 'pending' : 'completed',
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (data.taskId) {
        setCurrentTaskId(data.taskId);
        // Track task lifecycle
        await trackTask(data.taskId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: 'שגיאה בשליחת ההודעה. נסה שוב.',
        timestamp: new Date(),
        status: 'failed',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 📊 Track task lifecycle
  const trackTask = async (taskId: string) => {
    try {
      // Poll task status
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/tasks/${taskId}`);
          if (!response.ok) {
            clearInterval(pollInterval);
            return;
          }

          const task = await response.json();

          // Update message with task status
          setMessages(prev => prev.map(msg => 
            msg.taskId === taskId
              ? { 
                  ...msg, 
                  status: task.status,
                  content: task.result 
                    ? `${msg.content}\n\n✅ ${JSON.stringify(task.result, null, 2)}`
                    : msg.content
                }
              : msg
          ));

          // Stop polling if task is complete
          if (task.status === 'completed' || task.status === 'failed') {
            clearInterval(pollInterval);
            setCurrentTaskId(null);
          }
        } catch (err) {
          console.error('Error polling task:', err);
        }
      }, 2000);

      // Stop polling after 5 minutes
      setTimeout(() => clearInterval(pollInterval), 5 * 60 * 1000);
    } catch (err) {
      console.error('Error tracking task:', err);
    }
  };

  // 🗑️ Clear chat history
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentTaskId(null);
  }, []);

  // 🔄 Retry failed message
  const retryMessage = useCallback((messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.role === 'user') {
      sendMessage(message.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isConnected,
    isLoading,
    currentTaskId,
    sendMessage,
    clearMessages,
    retryMessage,
  };
}
