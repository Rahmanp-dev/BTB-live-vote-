
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
import { Star, HelpCircle } from 'lucide-react';
import { useState, useContext, useEffect } from 'react';
import { RatingDialog } from '@/components/rating-dialog';
import { PitchContext } from '@/context/PitchContext';
import { Badge } from '@/components/ui/badge';

interface PitchCardProps {
  pitch: Pitch;
}

export function PitchCard({ pitch }: PitchCardProps) {
  const [isRating, setIsRating] = useState(false);
  const { updatePitchRating, isLiveMode, userRatings } = useContext(PitchContext);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setHasVoted(!!userRatings[pitch._id]);
  }, [pitch._id, userRatings]);

  const handleRatingSubmit = (rating: number) => {
    updatePitchRating(pitch._id, rating);
    setHasVoted(true);
  };

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
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
         {hasVoted && userRatings[pitch._id] ? (
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">You rated:</span>
                <Star className="text-primary fill-primary h-5 w-5" />
                <span className="font-bold text-lg">{userRatings[pitch._id]?.toFixed(1)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <HelpCircle className="h-5 w-5" />
              <span className="font-bold text-lg">?</span>
            </div>
          )}
          {isLiveMode && (
            <Button onClick={() => setIsRating(true)} disabled={hasVoted}>
              {hasVoted ? 'Rated' : 'Rate Now'}
            </Button>
          )}
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
