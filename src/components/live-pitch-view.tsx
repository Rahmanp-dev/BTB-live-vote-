'use client';

import type { Pitch } from '@/lib/types';
import { Header } from '@/components/header';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { useState, useContext } from 'react';
import { RatingDialog } from '@/components/rating-dialog';
import { PitchContext } from '@/context/PitchContext';
import { Badge } from '@/components/ui/badge';

interface LivePitchViewProps {
  pitch: Pitch | undefined;
}

export function LivePitchView({ pitch }: LivePitchViewProps) {
  const [isRating, setIsRating] = useState(false);
  const { updatePitchRating } = useContext(PitchContext);

  const handleRatingSubmit = (rating: number) => {
    if (pitch) {
      updatePitchRating(pitch._id, rating);
    }
  };

  // Check for a valid image URL. If it's HTML or missing, use a placeholder.
  const imageUrl = pitch?.imageUrl && pitch.imageUrl.startsWith('http') 
    ? pitch.imageUrl 
    : 'https://picsum.photos/600/400';


  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          {!pitch ? (
            <div className="text-center">
              <h2 className="text-3xl font-bold">Waiting for the next pitch...</h2>
              <p className="text-muted-foreground mt-2">The presentation will begin shortly.</p>
            </div>
          ) : (
            <div className="container max-w-4xl mx-auto grid md:grid-cols-2 gap-8 items-center">
              <div className="aspect-video relative rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={pitch.title}
                  fill
                  className="object-cover"
                  data-ai-hint="product photo"
                />
              </div>
              <div className="space-y-4">
                <Badge variant="outline">{pitch.category}</Badge>
                <h1 className="text-4xl font-bold">{pitch.title}</h1>
                <p className="text-lg text-muted-foreground">
                  Presented by <span className="font-semibold">{pitch.presenter}</span>
                </p>
                <p>{pitch.description}</p>
                <div className='flex justify-between items-center pt-4'>
                   <div className="flex items-center gap-2">
                    <Star className="text-primary fill-primary h-6 w-6" />
                    <span className="font-bold text-2xl">{pitch.rating.toFixed(1)}</span>
                  </div>
                  <Button size="lg" onClick={() => setIsRating(true)}>Rate Now</Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
       {pitch && <RatingDialog
        pitch={pitch}
        isOpen={isRating}
        onClose={() => setIsRating(false)}
        onSubmit={handleRatingSubmit}
      />}
    </>
  );
}
