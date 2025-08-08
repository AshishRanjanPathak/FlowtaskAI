
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Flame, Frown, Meh, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

type MoodLoggerProps = {
  mood: string;
  setMood: (mood: string) => void;
  energy: number;
  setEnergy: (energy: number) => void;
};

const moods = [
  { name: 'Happy', icon: Smile },
  { name: 'Neutral', icon: Meh },
  { name: 'Sad', icon: Frown },
  { name: 'Focused', icon: Flame },
];

export function MoodLogger({ mood, setMood, energy, setEnergy }: MoodLoggerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">How are you doing?</CardTitle>
        <CardDescription>Your mood and energy help prioritize tasks.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="mb-3 block font-semibold">Your Mood</Label>
          <TooltipProvider>
            <div className="flex justify-around">
              {moods.map((m) => {
                const isSelected = mood === m.name;
                const Icon = m.icon;
                return (
                    <Tooltip key={m.name}>
                    <TooltipTrigger asChild>
                        <Button
                        variant={isSelected ? 'default' : 'ghost'}
                        size="icon"
                        onClick={() => setMood(m.name)}
                        className={cn(
                            'rounded-full h-16 w-16 transition-all duration-300 ease-in-out transform hover:scale-125 hover:-rotate-12',
                            isSelected && 'scale-125 -rotate-12 ring-2 ring-ring'
                        )}
                        >
                        <Icon className={cn('h-8 w-8', isSelected ? 'text-white' : 'text-muted-foreground')} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{m.name}</p>
                    </TooltipContent>
                    </Tooltip>
                )
            })}
            </div>
          </TooltipProvider>
        </div>
        <div>
          <Label htmlFor="energy-slider" className="mb-3 block font-semibold">
            Energy Level: <span className="font-bold text-primary">{energy}</span>/5
          </Label>
          <Slider
            id="energy-slider"
            value={[energy]}
            onValueChange={([val]) => setEnergy(val)}
            min={1}
            max={5}
            step={1}
          />
        </div>
      </CardContent>
    </Card>
  );
}
