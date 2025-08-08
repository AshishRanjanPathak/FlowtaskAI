'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Mic, MicOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type TaskInputProps = {
  onAddTask: (text: string) => void;
  isLoading: boolean;
};

let SpeechRecognition: any = null;

export function TaskInput({ onAddTask, isLoading }: TaskInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechApiAvailable, setSpeechApiAvailable] = useState(false);
  const recognition = useRef<any>(null);
  const { toast } = useToast();
  const finalTranscriptRef = useRef('');

  useEffect(() => {
    SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
        setSpeechApiAvailable(true);
    } else {
        console.warn("Browser does not support SpeechRecognition.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognition.current) {
      recognition.current.stop();
    }
    setIsRecording(false);
  }, []);

  useEffect(() => {
    if (!speechApiAvailable) {
      return;
    }

    if (!recognition.current) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;

        rec.onresult = (event: any) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscriptRef.current += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setText(finalTranscriptRef.current + interimTranscript);
        };
    
        rec.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            return;
          }
          
          console.error('Speech recognition error:', event.error);
          toast({
            variant: 'destructive',
            title: 'Speech Recognition Error',
            description: `There was an error with speech recognition: ${event.error}`,
          });
          stopRecording();
        };
        
        rec.onend = () => {
          // The `onend` event can be triggered by calling `stop()` or by the API itself.
          // We only want to update `isRecording` state if it was not triggered by our `stopRecording` function.
          // However, determining the cause is tricky. The simplest robust solution is to just ensure the state is correct.
          setIsRecording(false);
        };
        
        recognition.current = rec;
    }
  }, [speechApiAvailable, toast, stopRecording]);


  const toggleRecording = () => {
    if (!speechApiAvailable) return;
    if (isRecording) {
      stopRecording();
    } else {
      finalTranscriptRef.current = '';
      setText('');
      recognition.current?.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(isRecording) {
        stopRecording();
    }
    onAddTask(text);
    setText('');
    finalTranscriptRef.current = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Brain Dump</CardTitle>
        <CardDescription>
          Type or speak your tasks. Let AI handle the organization. e.g., "Remind me to call mom tomorrow at 5pm, it's high priority"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isRecording ? "Listening..." : "Just start typing..."}
              rows={4}
              disabled={isLoading}
              className="text-base"
            />
            {speechApiAvailable && (
                <Button 
                    type="button" 
                    variant={isRecording ? "destructive" : "ghost"} 
                    size="icon" 
                    className="absolute bottom-2 right-2 rounded-full h-10 w-10"
                    onClick={toggleRecording}
                    disabled={isLoading}
                >
                    {isRecording ? <MicOff /> : <Mic />}
                    <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
                </Button>
            )}
          </div>
          <Button type="submit" className="w-full text-lg py-6" disabled={isLoading || !text.trim()}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-5 w-5" />
            )}
            Add Task with AI
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
