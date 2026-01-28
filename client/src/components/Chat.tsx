import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/use-chat';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Send, Loader2, CheckCircle2, XCircle, Wifi, WifiOff } from 'lucide-react';

export function Chat() {
  const { messages, isConnected, isLoading, currentTaskId, sendMessage, clearMessages } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <Card className="flex flex-col h-[600px] max-w-2xl mx-auto">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Maya Chat</h2>
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={clearMessages}>
          Clear
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              {msg.content}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={scrollRef} />
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading} />
          <Button type="submit" disabled={isLoading} size="icon">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </Card>
  );
}