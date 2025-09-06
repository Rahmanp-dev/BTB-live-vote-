'use client';

import type { Pitch } from '@/lib/types';
import { Header } from './header';
import Image from 'next/image';
import { Crown, Star } from 'lucide-react';

interface WinnerDisplayProps {
  pitch: Pitch | null;
}

export function WinnerDisplay({ pitch }: WinnerDisplayProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        {!pitch ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold">Waiting for winner announcement...</h2>
            <p className="text-muted-foreground mt-2">The results will be displayed shortly.</p>
          </div>
        ) : (
          <div className="text-center relative">
             <Crown className="absolute -top-24 left-1/2 -translate-x-1/2 w-32 h-32 text-yellow-400 drop-shadow-lg" />
            <p className="text-2xl font-semibold text-primary">
              And the winner for {pitch.category} is...
            </p>
            <h1 className="my-4 text-7xl font-bold tracking-tight">
              {pitch.title}
            </h1>
            <h2 className="text-4xl text-muted-foreground">
              by {pitch.presenter}
            </h2>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Star className="text-primary fill-primary h-10 w-10" />
              <span className="font-bold text-5xl">{pitch.rating.toFixed(1)}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
