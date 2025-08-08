
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/app/(auth)/context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Send } from 'lucide-react';
import { runAssistant } from '@/ai/flows/assistant-flow';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantResponse = await runAssistant({
        userId: user.uid,
        message: input,
      });

      const assistantMessage: Message = { role: 'assistant', content: assistantResponse };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Assistant error:", error);
      const errorMessage: Message = { role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (role: 'user' | 'assistant') => {
    if (role === 'user') {
      return (user?.email?.substring(0, 2) || 'U').toUpperCase();
    }
    return 'AI';
  };

  return (
    <div className="flex flex-col h-full p-4 md:p-8">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle className="font-headline">AI Assistant</CardTitle>
          <CardDescription>Chat with the AI to manage your tasks. Try "What are my urgent tasks?" or "Add 'buy milk' to my list."</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col gap-4">
          <ScrollArea className="flex-grow border rounded-lg p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-muted-foreground">Start the conversation...</div>
                )}
                {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                        <Avatar className="w-8 h-8">
                            <AvatarFallback className='bg-primary text-primary-foreground'>{getInitials(message.role)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={`rounded-lg px-4 py-2 max-w-[80%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                        <Avatar className="w-8 h-8">
                            <AvatarFallback>{getInitials(message.role)}</AvatarFallback>
                        </Avatar>
                    )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              autoComplete='off'
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
