import type { Pitch } from '@/lib/types';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

interface PitchCardProps {
  pitch: Pitch;
}

export function PitchCard({ pitch }: PitchCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="aspect-video relative overflow-hidden rounded-t-lg -mt-6 -mx-6 mb-4">
          <Image
            src={pitch.imageUrl}
            alt={pitch.title}
            fill
            className="object-cover"
            data-ai-hint="product photo"
          />
        </div>
        <CardTitle>{pitch.title}</CardTitle>
        <CardDescription>Presented by {pitch.presenter}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-muted-foreground">{pitch.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Star className="text-primary fill-primary" />
          <span className="font-bold text-lg">{pitch.rating.toFixed(1)}</span>
        </div>
        <Button>Rate Now</Button>
      </CardFooter>
    </Card>
  );
}
