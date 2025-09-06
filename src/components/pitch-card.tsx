"use client";

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
import { useState, useContext } from 'react';
import { RatingDialog } from './rating-dialog';
import { PitchContext } from '@/context/PitchContext';
import { Badge } from './ui/badge';

interface PitchCardProps {
  pitch: Pitch;
}

export function PitchCard({ pitch }: PitchCardProps) {
  const [isRating, setIsRating] = useState(false);
  const { updatePitchRating, isLiveMode } = useContext(PitchContext);

  const handleRatingSubmit = (rating: number) => {
    updatePitchRating(pitch._id, rating);
  };

  // Check for a valid image URL. If it's HTML, use a placeholder.
  const imageUrl = pitch.imageUrl && pitch.imageUrl.startsWith('http') 
    ? pitch.imageUrl 
    : 'https://picsum.photos/600/400';

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="aspect-video relative overflow-hidden rounded-t-lg -mt-6 -mx-6 mb-4">
            <Image
              src={imageUrl}
              alt={pitch.title}
              fill
              className="object-cover"
              data-ai-hint="product photo"
              priority
            />
          </div>
          <div className='flex justify-between items-start'>
            <CardTitle>{pitch.title}</CardTitle>
            <Badge variant="outline">{pitch.category}</Badge>
          </div>
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
          {/* The "Rate Now" button is now conditionally rendered based on isLiveMode */}
          {isLiveMode && <Button onClick={() => setIsRating(true)}>Rate Now</Button>}
        </CardFooter>
      </Card>
      <RatingDialog
        pitch={pitch}
        isOpen={isRating}
        onClose={() => setIsRating(false)}
        onSubmit={handleRatingSubmit}
      />
    </>
  );
}
